#include "build_runner.h"
#include <cstdio>
#include <cstring>
#include <chrono>
#include <algorithm>
#include <thread>

#ifdef _WIN32
#include <windows.h>
#else
#include <signal.h>
#include <sys/wait.h>
#include <unistd.h>
#endif

BuildRunner::~BuildRunner() {
    cancel();
    if (buildThread_.joinable()) buildThread_.join();
}

void BuildRunner::startBuild(const std::string& command, const std::string& label, const std::string& workingDirectory) {
    if (state_.load() == BuildState::Building) return;
    if (buildThread_.joinable()) buildThread_.join();

    label_ = label;
    workingDirectory_ = workingDirectory;
    cancelRequested_ = false;
    state_ = BuildState::Building;
    progress_ = 0.0f;

    auto now = std::chrono::steady_clock::now();
    startTime_ = std::chrono::duration<double>(now.time_since_epoch()).count();
    endTime_ = 0.0;

    addLog("=== Build Started: " + label + " ===", 1);
    addLog("Dir: " + workingDirectory, 0);
    addLog("$ " + command, 0);
    addLog("", 0);

    buildThread_ = std::thread([this, command]() { runProcess(command); });
}

void BuildRunner::addToQueue(const std::string& command, const std::string& label, const std::string& workingDirectory) {
    std::lock_guard<std::mutex> lock(queueMutex_);
    buildQueue_.push(std::make_tuple(command, label, workingDirectory));
}

void BuildRunner::processQueue() {
    std::lock_guard<std::mutex> lock(queueMutex_);
    if (buildQueue_.empty() || state_.load() == BuildState::Building) return;
    
    auto [cmd, lbl, dir] = buildQueue_.front();
    buildQueue_.pop();
    
    startBuild(cmd, lbl, dir);
}

void BuildRunner::clearQueue() {
    std::lock_guard<std::mutex> lock(queueMutex_);
    while (!buildQueue_.empty()) buildQueue_.pop();
}

void BuildRunner::cancel() {
    cancelRequested_ = true;
#ifdef _WIN32
    if (childProcess_) {
        TerminateProcess((HANDLE)childProcess_, 0);
    }
#else
    if (childPid_ > 0) {
        kill(childPid_, SIGTERM);
    }
#endif
}

std::vector<LogLine> BuildRunner::getLog() {
    std::lock_guard<std::mutex> lock(logMutex_);
    return log_;
}

void BuildRunner::clearLog() {
    std::lock_guard<std::mutex> lock(logMutex_);
    log_.clear();
}

double BuildRunner::getElapsedSeconds() const {
    auto now = std::chrono::steady_clock::now();
    double cur = std::chrono::duration<double>(now.time_since_epoch()).count();
    if (state_.load() == BuildState::Building) return cur - startTime_;
    if (endTime_ > startTime_) return endTime_ - startTime_;
    return 0.0;
}

void BuildRunner::addLog(const std::string& text, int type) {
    std::lock_guard<std::mutex> lock(logMutex_);
    log_.push_back({text, type});
}

int BuildRunner::classifyLine(const std::string& line) {
    std::string lower = line;
    std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
    if (lower.find("error") != std::string::npos || lower.find("fail") != std::string::npos) return 4;
    if (lower.find("warn") != std::string::npos) return 3;
    if (lower.find("success") != std::string::npos || lower.find("complete") != std::string::npos ||
        lower.find("done") != std::string::npos || lower.find("built") != std::string::npos) return 2;
    if (lower.find("build") != std::string::npos || lower.find("pack") != std::string::npos ||
        lower.find("install") != std::string::npos || lower.find("copy") != std::string::npos) return 1;
    return 0;
}

#ifdef _WIN32
void BuildRunner::runProcess(const std::string& command) {
    HANDLE hRead, hWrite;
    SECURITY_ATTRIBUTES sa = { sizeof(sa), NULL, TRUE };
    if (!CreatePipe(&hRead, &hWrite, &sa, 0)) {
        addLog("Failed to create pipe", 4);
        state_ = BuildState::Failed;
        return;
    }
    SetHandleInformation(hRead, HANDLE_FLAG_INHERIT, 0);

    STARTUPINFOA si = { sizeof(si) };
    si.dwFlags |= STARTF_USESTDHANDLES;
    si.hStdOutput = hWrite;
    si.hStdError = hWrite;
    PROCESS_INFORMATION pi = { 0 };

    // Need a mutable string for CreateProcessA
    char* cmdArgs = strdup((std::string("cmd.exe /c \"") + command + "\"").c_str());
    const char* workingDir = workingDirectory_.empty() ? NULL : workingDirectory_.c_str();

    if (!CreateProcessA(NULL, cmdArgs, NULL, NULL, TRUE, CREATE_NO_WINDOW, NULL, workingDir, &si, &pi)) {
        addLog("Failed to start process (error " + std::to_string(GetLastError()) + ")", 4);
        state_ = BuildState::Failed;
        CloseHandle(hRead); CloseHandle(hWrite);
        free(cmdArgs);
        return;
    }
    free(cmdArgs);
    childProcess_ = pi.hProcess;
    childThread_ = pi.hThread;
    CloseHandle(hWrite);

    char buf[4096];
    DWORD dwRead;
    std::string lineBuffer;

    while (ReadFile(hRead, buf, sizeof(buf) - 1, &dwRead, NULL) && dwRead > 0) {
        if (cancelRequested_) break;
        buf[dwRead] = '\0';
        lineBuffer += buf;
        
        size_t pos;
        while ((pos = lineBuffer.find('\n')) != std::string::npos) {
            std::string line = lineBuffer.substr(0, pos);
            lineBuffer.erase(0, pos + 1);
            while (!line.empty() && (line.back() == '\r' || line.back() == '\n')) line.pop_back();

            int type = classifyLine(line);
            addLog(line, type);

            // Progress heuristic
            std::string lower = line;
            std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
            if (lower.find("packing") != std::string::npos) progress_ = 0.3f;
            else if (lower.find("building") != std::string::npos) progress_ = 0.5f;
            else if (lower.find("compress") != std::string::npos) progress_ = 0.7f;
            else if (lower.find("artifact") != std::string::npos || lower.find("built") != std::string::npos)
                progress_ = 0.9f;
        }
    }

    if (!lineBuffer.empty()) {
        addLog(lineBuffer, classifyLine(lineBuffer));
    }

    WaitForSingleObject(pi.hProcess, INFINITE);
    DWORD exitCode;
    GetExitCodeProcess(pi.hProcess, &exitCode);
    
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);
    CloseHandle(hRead);
    childProcess_ = nullptr;
    childThread_ = nullptr;

    auto now = std::chrono::steady_clock::now();
    endTime_ = std::chrono::duration<double>(now.time_since_epoch()).count();

    if (cancelRequested_) {
        addLog("=== Build Cancelled ===", 3);
        state_ = BuildState::Cancelled;
    } else if (exitCode == 0) {
        progress_ = 1.0f;
        addLog("=== Build Completed Successfully ===", 2);
        state_ = BuildState::Success;
    } else {
        addLog("=== Build Failed (exit code: " + std::to_string(exitCode) + ") ===", 4);
        state_ = BuildState::Failed;
    }
}
#else
void BuildRunner::runProcess(const std::string& command) {
    int pipefd[2];
    if (pipe(pipefd) == -1) {
        addLog("Failed to create pipe", 4);
        state_ = BuildState::Failed;
        return;
    }

    pid_t pid = fork();
    if (pid == -1) {
        addLog("Failed to fork process", 4);
        state_ = BuildState::Failed;
        close(pipefd[0]); close(pipefd[1]);
        return;
    }

    if (pid == 0) {
        close(pipefd[0]);
        dup2(pipefd[1], STDOUT_FILENO);
        dup2(pipefd[1], STDERR_FILENO);
        close(pipefd[1]);

        if (!workingDirectory_.empty()) {
            if (chdir(workingDirectory_.c_str()) != 0) {
                fprintf(stderr, "Failed to change directory to %s\n", workingDirectory_.c_str());
                _exit(1);
            }
        }

        execl("/bin/bash", "bash", "-c", command.c_str(), nullptr);
        _exit(127);
    }

    close(pipefd[1]);
    childPid_ = pid;

    FILE* fp = fdopen(pipefd[0], "r");
    if (!fp) {
        addLog("Failed to read pipe", 4);
        state_ = BuildState::Failed;
        close(pipefd[0]);
        return;
    }

    char buf[4096];
    while (fgets(buf, sizeof(buf), fp)) {
        if (cancelRequested_) break;
        std::string line(buf);
        while (!line.empty() && (line.back() == '\n' || line.back() == '\r'))
            line.pop_back();

        int type = classifyLine(line);
        addLog(line, type);

        std::string lower = line;
        std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
        if (lower.find("packing") != std::string::npos) progress_ = 0.3f;
        else if (lower.find("building") != std::string::npos) progress_ = 0.5f;
        else if (lower.find("compress") != std::string::npos) progress_ = 0.7f;
        else if (lower.find("artifact") != std::string::npos || lower.find("built") != std::string::npos)
            progress_ = 0.9f;
    }

    fclose(fp);

    int status;
    waitpid(pid, &status, 0);
    childPid_ = -1;

    auto now = std::chrono::steady_clock::now();
    endTime_ = std::chrono::duration<double>(now.time_since_epoch()).count();

    if (cancelRequested_) {
        addLog("=== Build Cancelled ===", 3);
        state_ = BuildState::Cancelled;
    } else if (WIFEXITED(status) && WEXITSTATUS(status) == 0) {
        progress_ = 1.0f;
        addLog("=== Build Completed Successfully ===", 2);
        state_ = BuildState::Success;
    } else {
        int code = WIFEXITED(status) ? WEXITSTATUS(status) : -1;
        addLog("=== Build Failed (exit code: " + std::to_string(code) + ") ===", 4);
        state_ = BuildState::Failed;
    }
}
#endif
