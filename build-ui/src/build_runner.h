#pragma once
#include <string>
#include <vector>
#include <mutex>
#include <thread>
#include <atomic>
#include <queue>

#ifdef _WIN32
#include <windows.h>
#else
#include <sys/types.h>
#include <unistd.h>
#endif

enum class BuildState { Idle, Building, Success, Failed, Cancelled };

struct LogLine {
    std::string text;
    int type;
};

class BuildRunner {
public:
    BuildRunner() = default;
    ~BuildRunner();

    void startBuild(const std::string& command, const std::string& label, const std::string& workingDirectory);
    void cancel();
    
    void addToQueue(const std::string& command, const std::string& label, const std::string& workingDirectory);
    void processQueue();
    void clearQueue();
    int getQueueSize() const { return (int)buildQueue_.size(); }
    bool isQueueEmpty() const { return buildQueue_.empty(); }

    BuildState getState() const { return state_.load(); }
    float getProgress() const { return progress_.load(); }
    std::vector<LogLine> getLog();
    void clearLog();
    std::string getLabel() const { return label_; }
    double getElapsedSeconds() const;
    bool isBuilding() const { return state_.load() == BuildState::Building; }

private:
    std::atomic<BuildState> state_{BuildState::Idle};
    std::atomic<float> progress_{0.0f};

    std::vector<LogLine> log_;
    mutable std::mutex logMutex_;

    std::thread buildThread_;
    std::atomic<bool> cancelRequested_{false};
    
    std::queue<std::tuple<std::string, std::string, std::string>> buildQueue_;
    std::mutex queueMutex_;

#ifdef _WIN32
    void* childProcess_ = nullptr;
    void* childThread_ = nullptr;
#else
    pid_t childPid_ = -1;
#endif

    std::string label_;
    std::string workingDirectory_;
    double startTime_ = 0.0;
    double endTime_ = 0.0;

    void addLog(const std::string& text, int type = 0);
    void runProcess(const std::string& command);
    int classifyLine(const std::string& line);
};
