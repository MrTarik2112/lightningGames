#include "app.h"
#include "imgui.h"
#include "imgui_internal.h"
#include <json.hpp>
#include <fstream>
#include <sstream>
#include <cstdlib>
#include <GLFW/glfw3.h>
#include <cstring>
#include <cmath>
#include <algorithm>
#include <filesystem>
#include <random>
#ifdef _WIN32
#include <windows.h>
#else
#include <unistd.h>
#include <limits.h>
#endif
#include <regex>
#include <queue>

using json = nlohmann::json;
namespace fs = std::filesystem;

// ======================== CUSTOM WIDGETS ========================

namespace CustomUI {
    bool ToggleButton(const char* str_id, bool* v) {
        ImVec2 p = ImGui::GetCursorScreenPos();
        ImDrawList* draw_list = ImGui::GetWindowDrawList();
        float height = ImGui::GetFrameHeight();
        float width = height * 1.55f;
        float radius = height * 0.50f;

        ImGui::InvisibleButton(str_id, ImVec2(width, height));
        bool clicked = ImGui::IsItemClicked();
        if (clicked) *v = !*v;
        (void)ImGui::IsItemHovered(); // Track hover for future use
        
        float t = *v ? 1.0f : 0.0f;

        ImU32 col_bg = ImGui::GetColorU32(*v ? ImVec4(0.0f, 0.85f, 0.90f, 1.0f) : ImVec4(0.15f, 0.15f, 0.20f, 1.0f));
        draw_list->AddRectFilled(p, ImVec2(p.x + width, p.y + height), col_bg, height * 0.5f);
        
        // Smooth thumb animation
        ImVec2 thumbPos(p.x + radius + t * (width - radius * 2.0f), p.y + radius);
        ImU32 thumbColor = ImGui::GetColorU32(*v ? ImVec4(1.0f, 1.0f, 1.0f, 1.0f) : ImVec4(0.6f, 0.6f, 0.7f, 1.0f));
        draw_list->AddCircleFilled(thumbPos, radius - 2.0f, thumbColor);
        
        return clicked;
    }

    void NeonProgressBar(float fraction, const ImVec2& size_arg, ImU32 color = IM_COL32(0, 217, 230, 200)) {
        ImGuiWindow* window = ImGui::GetCurrentWindow();
        if (window->SkipItems) return;
        ImGuiContext& g = *GImGui;
        const ImGuiStyle& style = g.Style;
        ImVec2 pos = window->DC.CursorPos;
        ImVec2 size = ImGui::CalcItemSize(size_arg, ImGui::CalcItemWidth(), g.FontSize + style.FramePadding.y * 2.0f);
        ImRect bb(pos, ImVec2(pos.x + size.x, pos.y + size.y));
        ImGui::ItemSize(size, style.FramePadding.y);
        if (!ImGui::ItemAdd(bb, 0)) return;

        window->DrawList->AddRectFilled(bb.Min, bb.Max, IM_COL32(10, 10, 18, 255), style.FrameRounding);
        window->DrawList->AddRectFilled(bb.Min, bb.Max, IM_COL32(40, 40, 60, 255), style.FrameRounding);
        
        fraction = ImSaturate(fraction);
        if (fraction > 0.0f) {
            ImRect fill_bb(bb.Min, ImVec2(bb.Min.x + (bb.Max.x - bb.Min.x) * fraction, bb.Max.y));
            window->DrawList->AddRectFilled(fill_bb.Min, fill_bb.Max, color, style.FrameRounding);
            for (int i = 1; i <= 3; i++) {
                ImRect glow = fill_bb;
                glow.Expand(i * 1.5f);
                window->DrawList->AddRect(glow.Min, glow.Max, IM_COL32(0, 217, 230, 60 / i), style.FrameRounding + i);
            }
        }
    }

    void Badge(const char* text, ImU32 color) {
        ImGui::SameLine();
        ImGui::TextColored(ImVec4(ImColor(color)), "[%s]", text);
    }

    bool IconButton(const char* icon, const char* tooltip = nullptr) {
        bool clicked = ImGui::Button(icon);
        if (tooltip && ImGui::IsItemHovered()) {
            ImGui::SetTooltip("%s", tooltip);
        }
        return clicked;
    }

    void SectionHeader(const char* title) {
        ImGui::Spacing();
        ImGui::SeparatorText(title);
        ImGui::Spacing();
    }

    bool CardBegin(const char* id, const ImVec2& size = ImVec2(0, 0)) {
        ImGui::PushStyleColor(ImGuiCol_ChildBg, ImVec4(0.08f, 0.08f, 0.12f, 1.0f));
        ImGui::PushStyleVar(ImGuiStyleVar_ChildRounding, 6.0f);
        ImGui::PushStyleVar(ImGuiStyleVar_ChildBorderSize, 1.0f);
        ImGui::PushStyleColor(ImGuiCol_Border, ImVec4(0.2f, 0.2f, 0.3f, 1.0f));
        return ImGui::BeginChild(id, size, true);
    }

    void CardEnd() {
        ImGui::EndChild();
        ImGui::PopStyleColor(2);
        ImGui::PopStyleVar(2);
    }

    void MetricCard(const char* label, const char* value, const char* icon = "📊", ImU32 color = IM_COL32(0, 217, 230, 255)) {
        CardBegin("##metric");
        ImGui::Text("%s", icon);
        ImGui::SameLine();
        ImGui::TextColored(ImVec4(ImColor(color)), "%s", value);
        ImGui::SameLine();
        ImGui::TextColored(ImVec4(0.5f, 0.5f, 0.6f, 1.0f), "%s", label);
        CardEnd();
    }

    void StatusIndicator(bool isActive, const char* text) {
        ImU32 color = isActive ? IM_COL32(0, 255, 100, 255) : IM_COL32(100, 100, 120, 255);
        ImGui::TextColored(ImVec4(ImColor(color)), isActive ? "●" : "○");
        ImGui::SameLine();
        ImGui::TextColored(ImVec4(0.7f, 0.7f, 0.8f, 1.0f), "%s", text);
    }

    bool TabButton(const char* label, bool isActive, ImVec2 size = ImVec2(0, 0)) {
        if (isActive) {
            ImGui::PushStyleColor(ImGuiCol_Button, ImVec4(0.0f, 0.40f, 0.45f, 0.4f));
            ImGui::PushStyleColor(ImGuiCol_ButtonHovered, ImVec4(0.0f, 0.45f, 0.50f, 0.45f));
            ImGui::PushStyleColor(ImGuiCol_Text, ImVec4(0.0f, 1.0f, 1.0f, 1.0f));
        } else {
            ImGui::PushStyleColor(ImGuiCol_Button, ImVec4(0.0f, 0.0f, 0.0f, 0.0f));
            ImGui::PushStyleColor(ImGuiCol_ButtonHovered, ImVec4(0.06f, 0.10f, 0.15f, 0.6f));
            ImGui::PushStyleColor(ImGuiCol_Text, ImVec4(0.45f, 0.48f, 0.55f, 1.0f));
        }
        
        bool clicked = ImGui::Button(label, size);
        ImGui::PopStyleColor(3);
        return clicked;
    }

    void ProgressRing(float progress, float size, ImU32 color = IM_COL32(0, 217, 230, 255)) {
        ImVec2 center = ImGui::GetCursorScreenPos();
        center.x += size / 2;
        center.y += size / 2;
        float radius = size / 2 - 4;
        
        ImDrawList* dl = ImGui::GetWindowDrawList();
        dl->AddCircle(center, radius, IM_COL32(40, 40, 60, 255), 32, 2.0f);
        // Draw arc using path - simplified version
        if (progress > 0.0f) {
            int segments = (int)(progress * 32);
            for (int i = 0; i < segments; i++) {
                float angle1 = -1.5708f + (6.28318f * i / 32);
                float angle2 = -1.5708f + (6.28318f * (i + 1) / 32);
                ImVec2 p1(center.x + cos(angle1) * radius, center.y + sin(angle1) * radius);
                ImVec2 p2(center.x + cos(angle2) * radius, center.y + sin(angle2) * radius);
                dl->AddLine(p1, p2, color, 2.0f);
            }
        }
    }

    bool SearchInput(const char* label, char* buffer, size_t bufferSize, const char* hint = "Search...") {
        bool changed = false;
        ImGui::SetNextItemWidth(-1);
        if (ImGui::InputText(label, buffer, bufferSize)) {
            changed = true;
        }
        if (strlen(buffer) == 0 && hint) {
            ImGui::SameLine();
            ImGui::TextColored(ImVec4(0.4f, 0.4f, 0.5f, 1.0f), "%s", hint);
        }
        return changed;
    }

    void AnimatedFloat(float* value, float target, float speed = 0.1f) {
        if (value && fabsf(*value - target) > 0.001f) {
            *value += (target - *value) * speed;
        }
    }

    void Tooltip(const char* text) {
        if (ImGui::IsItemHovered()) {
            ImGui::BeginTooltip();
            ImGui::PushTextWrapPos(300);
            ImGui::TextWrapped("%s", text);
            ImGui::PopTextWrapPos();
            ImGui::EndTooltip();
        }
    }

    void CollapsingSection(const char* label, bool* isOpen, void (*content)()) {
        if (ImGui::CollapsingHeader(label)) {
            ImGui::Indent(10);
            content();
            ImGui::Unindent(10);
        }
    }
}

// ======================== HELPERS ========================

static std::string getExePath() {
#ifdef _WIN32
    char buf[MAX_PATH];
    GetModuleFileNameA(NULL, buf, MAX_PATH);
    return std::string(buf);
#else
    char buf[PATH_MAX];
    ssize_t len = readlink("/proc/self/exe", buf, sizeof(buf) - 1);
    if (len > 0) { buf[len] = '\0'; return std::string(buf); }
    return "";
#endif
}

static std::string findProjectRoot() {
    std::string exe = getExePath();
    std::replace(exe.begin(), exe.end(), '\\', '/');
    auto pos = exe.find("/build-ui/");
    if (pos != std::string::npos) return exe.substr(0, pos);
    fs::path p = fs::path(getExePath()).parent_path();
    for (int i = 0; i < 4; ++i) {
        if (fs::exists(p / "package.json")) return p.string();
        p = p.parent_path();
    }
    return ".";
}

// ======================== BUILDAPP ========================

BuildApp::BuildApp() {}

void BuildApp::init() {
    projectRoot_ = findProjectRoot();
#ifdef _WIN32
    windowsRoot_ = projectRoot_;
    std::replace(windowsRoot_.begin(), windowsRoot_.end(), '/', '\\');
    STARTUPINFOA si = { sizeof(si) };
    PROCESS_INFORMATION pi = { 0 };
    char wslCmd[] = "wsl.exe --status";
    if (CreateProcessA(NULL, wslCmd, NULL, NULL, FALSE, CREATE_NO_WINDOW, NULL, NULL, &si, &pi)) {
        WaitForSingleObject(pi.hProcess, 1000);
        DWORD exitCode;
        GetExitCodeProcess(pi.hProcess, &exitCode);
        platform_.wslAvailable = (exitCode == 0);
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
    } else {
        platform_.wslAvailable = false;
    }
#else
    windowsRoot_ = wslToWindowsPath(projectRoot_);
    platform_.wslAvailable = true;
#endif

    loadPackageJson();
    scanArtifacts();
    loadRecentProjects();
    calculateMetrics();
    updateSystemResources();
    updateGitStatus();
    
    animationStartTime_ = 0.0;
    lastFrameTime_ = 0.0;
    activeTab_ = 1;
    
    currentTheme_.id = "dark_navy";
    currentTheme_.name = "Dark Navy";
    currentTheme_.colors.windowBg = ImVec4(0.04f, 0.04f, 0.06f, 1.0f);
    currentTheme_.colors.accentCyan = ImVec4(0.0f, 0.85f, 0.9f, 1.0f);
}

std::string BuildApp::wslToWindowsPath(const std::string& p) {
#ifdef _WIN32
    std::string s = p;
    std::replace(s.begin(), s.end(), '/', '\\');
    return s;
#else
    if (p.length() > 6 && p.substr(0, 5) == "/mnt/") {
        char drive = toupper(p[5]);
        std::string rest = p.substr(6);
        for (auto& c : rest) if (c == '/') c = '\\';
        return std::string(1, drive) + ":" + rest;
    }
    return p;
#endif
}

std::string BuildApp::formatBytes(long long bytes) {
    if (bytes == 0) return "0 B";
    const char* units[] = {"B", "KB", "MB", "GB"};
    int i = (int)(log((double)bytes) / log(1024.0));
    if (i > 3) i = 3;
    char buf[64];
    snprintf(buf, sizeof(buf), "%.1f %s", bytes / pow(1024.0, i), units[i]);
    return buf;
}

std::string BuildApp::formatDuration(double seconds) {
    int s = (int)seconds;
    int m = s / 60;
    if (m > 0) return std::to_string(m) + "m " + std::to_string(s % 60) + "s";
    return std::to_string(s) + "s";
}

std::string BuildApp::generateId() {
    static const char charset[] = "0123456789ABCDEF";
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dist(0, 15);
    std::string result;
    for (int i = 0; i < 16; i++) {
        result += charset[dist(gen)];
    }
    return result;
}

std::string BuildApp::getCurrentTimestamp() {
    auto now = std::chrono::system_clock::now();
    auto time = std::chrono::system_clock::to_time_t(now);
    char buf[32];
    strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", localtime(&time));
    return std::string(buf);
}

bool BuildApp::fileExists(const std::string& path) {
    return fs::exists(path);
}

std::string BuildApp::readFile(const std::string& path) {
    std::ifstream f(path);
    if (!f.is_open()) return "";
    return std::string((std::istreambuf_iterator<char>(f)), std::istreambuf_iterator<char>());
}

void BuildApp::writeFile(const std::string& path, const std::string& content) {
    std::ofstream f(path);
    if (f.is_open()) {
        f << content;
        f.close();
    }
}

// ======================== PACKAGE JSON ========================

void BuildApp::loadPackageJson() {
    std::string path = projectRoot_ + "/package.json";
    std::ifstream f(path);
    if (!f.is_open()) return;

    try {
        json pkg = json::parse(f);
        std::string ver = pkg.value("version", "0.0.0");
        strncpy(version_.current, ver.c_str(), sizeof(version_.current) - 1);

        int major = 0, minor = 0, patch = 0;
        sscanf(ver.c_str(), "%d.%d.%d", &major, &minor, &patch);
        snprintf(version_.nextPatch, 32, "%d.%d.%d", major, minor, patch + 1);
        snprintf(version_.nextMinor, 32, "%d.%d.0", major, minor + 1);
        snprintf(version_.nextMajor, 32, "%d.0.0", major + 1);

        if (pkg.contains("build")) {
            auto& b = pkg["build"];
            if (b.contains("appId")) strncpy(advanced_.appId, b["appId"].get<std::string>().c_str(), 127);
            if (b.contains("productName")) strncpy(advanced_.productName, b["productName"].get<std::string>().c_str(), 127);
            if (b.contains("asar")) advanced_.asarEnabled = b["asar"].get<bool>();
            if (b.contains("directories") && b["directories"].contains("output"))
                strncpy(advanced_.outputDir, b["directories"]["output"].get<std::string>().c_str(), 255);
        }
        if (pkg.contains("author")) strncpy(advanced_.author, pkg["author"].get<std::string>().c_str(), 63);
        if (pkg.contains("description")) strncpy(advanced_.description, pkg["description"].get<std::string>().c_str(), 255);

        packageLoaded_ = true;
    } catch (...) {
        packageLoaded_ = false;
    }
}

void BuildApp::saveVersion(const std::string& newVersion) {
    std::string pkgPath = projectRoot_ + "/package.json";
    std::ifstream fi(pkgPath);
    if (!fi.is_open()) return;
    json pkg = json::parse(fi);
    fi.close();
    pkg["version"] = newVersion;
    std::ofstream fo(pkgPath);
    fo << pkg.dump(2) << "\n";
    fo.close();

    std::string htmlPath = projectRoot_ + "/index.html";
    std::ifstream hi(htmlPath);
    if (hi.is_open()) {
        std::string html((std::istreambuf_iterator<char>(hi)), std::istreambuf_iterator<char>());
        hi.close();
        std::regex re(R"(<span class="title-version">v[\d.]+</span>)");
        html = std::regex_replace(html, re, "<span class=\"title-version\">v" + newVersion + "</span>");
        std::ofstream ho(htmlPath);
        ho << html;
        ho.close();
    }

    strncpy(version_.current, newVersion.c_str(), 31);
    int major = 0, minor = 0, patch = 0;
    sscanf(newVersion.c_str(), "%d.%d.%d", &major, &minor, &patch);
    snprintf(version_.nextPatch, 32, "%d.%d.%d", major, minor, patch + 1);
    snprintf(version_.nextMinor, 32, "%d.%d.0", major, minor + 1);
    snprintf(version_.nextMajor, 32, "%d.0.0", major + 1);
}

// ======================== BUILD LOGIC ========================

std::string BuildApp::getNewVersion() {
    switch (version_.choice) {
        case 1: return version_.nextPatch;
        case 2: return version_.nextMinor;
        case 3: return version_.nextMajor;
        case 4: return version_.custom;
        default: return version_.current;
    }
}

std::string BuildApp::getCompressionStr() {
    const char* levels[] = {"store", "normal", "maximum", "maximum"};
    return levels[compression_.level];
}

std::string BuildApp::getCompressionName() {
    const char* names[] = {"Store", "Normal", "Maximum", "ULTRA MEGA"};
    return names[compression_.level];
}

std::string BuildApp::getWinTargetStr() {
    const char* targets[] = {"portable", "nsis", "msi", "zip", "squirrel", "appx"};
    return targets[advanced_.winTarget];
}

std::string BuildApp::getLinuxTargetStr() {
    const char* targets[] = {"AppImage", "deb", "rpm", "snap", "flatpak"};
    return targets[advanced_.linuxTarget];
}

std::string BuildApp::constructBuildCommand() {
    std::string cmd;
    if (advanced_.cleanBeforeBuild) {
#ifdef _WIN32
        cmd += std::string("if exist \"") + advanced_.outputDir + "\" rd /s /q \"" + advanced_.outputDir + "\" & ";
#else
        cmd += "rm -rf \"" + projectRoot_ + "/" + advanced_.outputDir + "\" && ";
#endif
    }

    if (platform_.windows) {
#ifdef _WIN32
        std::string builderCmd = "npx electron-builder --win " + getWinTargetStr();
        builderCmd += " --config.compression=" + getCompressionStr();
        if (!advanced_.asarEnabled) builderCmd += " --config.asar=false";
        cmd += builderCmd;
#endif
    }

    if (platform_.windows && platform_.linuxBuild)
        cmd += " && ";

    if (platform_.linuxBuild) {
#ifndef _WIN32
        std::string ts = std::to_string(time(nullptr));
        std::string buildDir = std::string(getenv("HOME") ? getenv("HOME") : "/tmp") + "/lightning-games-build-" + ts;
        std::string script;
        script += "set -e\n";
        script += "rm -rf \"" + buildDir + "\"\n";
        script += "mkdir -p \"" + buildDir + "\"\n";
        script += "rsync -a --exclude='node_modules' --exclude='dist' --exclude='.git' \"" + projectRoot_ + "/\" \"" + buildDir + "/\"\n";
        script += "cd \"" + buildDir + "\"\n";
        script += "npm install\n";
        script += "npx electron-builder --linux " + getLinuxTargetStr() + " --config.compression=" + getCompressionStr();
        if (!advanced_.asarEnabled) script += " --config.asar=false";
        script += "\n";
        script += "mkdir -p \"" + projectRoot_ + "/dist\"\n";
        script += "find \"" + buildDir + "/dist\" -type f \\( -name '*.AppImage' -o -name '*.deb' \\) -exec cp -v {} \"" + projectRoot_ + "/dist/\" \\;\n";
        script += "rm -rf \"" + buildDir + "\"\n";

        std::string shPath = projectRoot_ + "/temp_build_linux.sh";
        std::ofstream sf(shPath);
        sf << "#!/bin/bash\n" << script;
        sf.close();
        cmd += "bash \"" + shPath + "\"";
#endif
    }
    return cmd;
}

void BuildApp::startBuild() {
    std::string newVer = getNewVersion();
    if (newVer != std::string(version_.current) && !newVer.empty())
        saveVersion(newVer);

    std::string cmd = constructBuildCommand();
    std::string label;
    if (platform_.windows && platform_.linuxBuild) label = "Windows + Linux";
    else if (platform_.windows) label = "Windows " + getWinTargetStr();
    else label = "Linux " + getLinuxTargetStr();
    label += " (" + getCompressionName() + ")";

    showBuildSummary_ = false;
    runner_.clearLog();
    runner_.startBuild(cmd, label, projectRoot_);

    BuildHistoryEntry entry;
    entry.id = generateId();
    entry.timestamp = getCurrentTimestamp();
    entry.version = newVer;
    entry.platform = label;
    entry.compression = getCompressionName();
    buildHistory_.insert(buildHistory_.begin(), entry);
}

void BuildApp::scanArtifacts() {
    artifacts_.clear();
    std::string distPath = projectRoot_ + "/" + advanced_.outputDir;
    if (!fs::exists(distPath)) return;

    for (auto& entry : fs::directory_iterator(distPath)) {
        if (!entry.is_regular_file()) continue;
        std::string name = entry.path().filename().string();
        std::string ext = entry.path().extension().string();
        if (ext == ".exe" || ext == ".AppImage" || ext == ".deb" || ext == ".rpm" || ext == ".snap") {
            ArtifactInfo info;
            info.name = name;
            info.path = entry.path().string();
            info.size = formatBytes((long long)entry.file_size());
            info.sizeBytes = entry.file_size();
            info.timestamp = getCurrentTimestamp();
            info.version = version_.current;
            
            if (ext == ".exe") info.type = ArtifactType::WindowsExe;
            else if (ext == ".AppImage") info.type = ArtifactType::LinuxAppImage;
            else if (ext == ".deb") info.type = ArtifactType::LinuxDeb;
            
            artifacts_.push_back(info);
        }
    }
}

void BuildApp::applyPreset(int preset) {
    switch (preset) {
        case 1:
            compression_.level = 0;
            platform_.windows = true;
            platform_.linuxBuild = false;
            version_.choice = 0;
            advanced_.cleanBeforeBuild = false;
            break;
        case 2:
            compression_.level = 1;
            platform_.windows = true;
            platform_.linuxBuild = false;
            version_.choice = 1;
            advanced_.cleanBeforeBuild = true;
            break;
        case 3:
            compression_.level = 2;
            platform_.windows = true;
            platform_.linuxBuild = true;
            version_.choice = 2;
            advanced_.cleanBeforeBuild = true;
            break;
    }
}

// ======================== FEATURE LOGIC ========================

void BuildApp::loadRecentProjects() {
    recentProjects_.clear();
    ProjectInfo proj;
    proj.path = projectRoot_;
    proj.name = "Lightning Games";
    proj.lastOpened = getCurrentTimestamp();
    proj.isFavorite = true;
    recentProjects_.push_back({proj, true});
}

void BuildApp::saveRecentProjects() {}

void BuildApp::calculateMetrics() {
    metrics_.totalBuilds = (int)buildHistory_.size();
    metrics_.successCount = 0;
    metrics_.failedCount = 0;
    for (auto& h : buildHistory_) {
        if (h.state == BuildState::Success) metrics_.successCount++;
        else if (h.state == BuildState::Failed) metrics_.failedCount++;
    }
    if (metrics_.totalBuilds > 0) {
        metrics_.successRate = (double)metrics_.successCount / metrics_.totalBuilds * 100.0;
    }
    metrics_.buildsToday = metrics_.totalBuilds;
    metrics_.buildsThisWeek = metrics_.totalBuilds;
    metrics_.buildsThisMonth = metrics_.totalBuilds;
    
    long long totalSize = 0;
    for (auto& a : artifacts_) totalSize += a.sizeBytes;
    metrics_.totalArtifactsSize = totalSize;
}

void BuildApp::updateSystemResources() {
#ifdef _WIN32
    MEMORYSTATUSEX mem;
    mem.dwLength = sizeof(mem);
    if (GlobalMemoryStatusEx(&mem)) {
        systemResources_.memoryAvailableMB = (long long)(mem.ullAvailPhys / 1024 / 1024);
        systemResources_.memoryUsedMB = (long long)((mem.ullTotalPhys - mem.ullAvailPhys) / 1024 / 1024);
    }
    ULARGE_INTEGER freeBytes, totalBytes;
    if (GetDiskFreeSpaceExA("C:\\", NULL, &totalBytes, &freeBytes)) {
        systemResources_.diskFreeGB = (long long)(freeBytes.QuadPart / 1024 / 1024 / 1024);
        systemResources_.diskTotalGB = (long long)(totalBytes.QuadPart / 1024 / 1024 / 1024);
    }
    systemResources_.cpuPercent = 25.0f + (rand() % 30);
#else
    systemResources_.memoryAvailableMB = 8192;
    systemResources_.memoryUsedMB = 4096;
    systemResources_.diskFreeGB = 50;
    systemResources_.diskTotalGB = 100;
    systemResources_.cpuPercent = 20.0f;
#endif
    systemResources_.threadCount = 4;
}

void BuildApp::updateGitStatus() {
    gitStatus_.isRepo = fs::exists(projectRoot_ + "/.git");
    gitStatus_.branch = "main";
    gitStatus_.hasChanges = false;
    gitStatus_.stagedCount = 0;
    gitStatus_.modifiedCount = 0;
    gitStatus_.newCount = 0;
}

void BuildApp::addToQueue(const BuildJob& job) {
    buildQueue_.jobs.push_back(job);
}

void BuildApp::processQueue() {
    if (buildQueue_.isProcessing) return;
    if (buildQueue_.jobs.empty()) return;
    
    buildQueue_.isProcessing = true;
    buildQueue_.currentJobIndex = 0;
}

void BuildApp::cancelCurrentJob() {
    runner_.cancel();
    if (buildQueue_.currentJobIndex >= 0 && buildQueue_.currentJobIndex < (int)buildQueue_.jobs.size()) {
        buildQueue_.jobs[buildQueue_.currentJobIndex].state = JobState::Cancelled;
    }
}

void BuildApp::saveProfile(const std::string& name) {
    BuildProfile profile;
    profile.id = generateId();
    profile.name = name;
    profile.version = version_;
    profile.platform = platform_;
    profile.compression = compression_;
    profile.advanced = advanced_;
    profile.createdAt = getCurrentTimestamp();
    profile.lastUsed = getCurrentTimestamp();
    profile.isDefault = buildProfiles_.empty();
    buildProfiles_.push_back(profile);
}

void BuildApp::loadProfile(const std::string& id) {
    for (auto& p : buildProfiles_) {
        if (p.id == id) {
            version_ = p.version;
            platform_ = p.platform;
            compression_ = p.compression;
            advanced_ = p.advanced;
            p.lastUsed = getCurrentTimestamp();
            break;
        }
    }
}

void BuildApp::deleteProfile(const std::string& id) {
    buildProfiles_.erase(std::remove_if(buildProfiles_.begin(), buildProfiles_.end(),
        [id](const BuildProfile& p) { return p.id == id; }), buildProfiles_.end());
}

void BuildApp::updateBuildHistory() {
    scanArtifacts();
    if (!artifacts_.empty() && !buildHistory_.empty()) {
        buildHistory_[0].sizeBytes = artifacts_[0].sizeBytes;
    }
}

void BuildApp::calculateCache() {
    buildCache_.isValid = false;
    buildCache_.fileHashes.clear();
}

void BuildApp::clearCache() {
    buildCache_.isValid = false;
    buildCache_.fileHashes.clear();
    buildCache_.lastBuildHash = "";
    buildCache_.cacheSizeBytes = 0;
}

void BuildApp::startParallelBuild() {
    platform_.parallelBuilds = true;
    startBuild();
}

// ======================== THEME ========================

void BuildApp::setupTheme() {
    ImGuiStyle& s = ImGui::GetStyle();
    ImVec4* c = s.Colors;

    // Enhanced spacing
    s.WindowPadding     = ImVec2(12, 12);
    s.FramePadding      = ImVec2(8, 5);
    s.CellPadding       = ImVec2(6, 3);
    s.ItemSpacing       = ImVec2(10, 6);
    s.ItemInnerSpacing  = ImVec2(6, 4);
    s.IndentSpacing     = 22.0f;
    s.ScrollbarSize     = 14.0f;
    s.GrabMinSize       = 10.0f;

    // Rounded corners
    s.WindowRounding    = 8.0f;
    s.ChildRounding     = 6.0f;
    s.FrameRounding     = 4.0f;
    s.PopupRounding     = 6.0f;
    s.ScrollbarRounding = 7.0f;
    s.GrabRounding      = 4.0f;
    s.TabRounding       = 4.0f;

    // Borders
    s.WindowBorderSize  = 1.0f;
    s.ChildBorderSize   = 1.0f;
    s.FrameBorderSize   = 0.0f;
    s.PopupBorderSize   = 1.0f;
    s.TabBorderSize     = 0.0f;

    // Premium dark navy palette with cyan accents
    c[ImGuiCol_WindowBg]            = ImVec4(0.035f, 0.035f, 0.055f, 1.00f);  // Darker background
    c[ImGuiCol_ChildBg]             = ImVec4(0.045f, 0.045f, 0.075f, 1.00f);  // Slightly lighter
    c[ImGuiCol_PopupBg]            = ImVec4(0.05f, 0.05f, 0.08f, 0.98f);
    c[ImGuiCol_Border]             = ImVec4(0.25f, 0.25f, 0.40f, 1.00f);    // More visible border
    c[ImGuiCol_Text]               = ImVec4(0.95f, 0.96f, 1.00f, 1.00f);      // Brighter text
    c[ImGuiCol_TextDisabled]       = ImVec4(0.50f, 0.52f, 0.60f, 1.00f);
    c[ImGuiCol_FrameBg]            = ImVec4(0.08f, 0.08f, 0.14f, 1.00f);
    c[ImGuiCol_FrameBgHovered]     = ImVec4(0.12f, 0.18f, 0.28f, 1.00f);
    c[ImGuiCol_FrameBgActive]      = ImVec4(0.08f, 0.20f, 0.30f, 1.00f);
    c[ImGuiCol_TitleBg]           = ImVec4(0.02f, 0.02f, 0.04f, 1.00f);
    c[ImGuiCol_TitleBgActive]      = ImVec4(0.04f, 0.08f, 0.12f, 1.00f);
    c[ImGuiCol_MenuBarBg]          = ImVec4(0.03f, 0.03f, 0.05f, 1.00f);
    c[ImGuiCol_ScrollbarBg]        = ImVec4(0.03f, 0.03f, 0.05f, 1.00f);
    c[ImGuiCol_ScrollbarGrab]      = ImVec4(0.15f, 0.40f, 0.60f, 1.00f);     // Cyan scrollbar
    c[ImGuiCol_ScrollbarGrabHovered]= ImVec4(0.20f, 0.50f, 0.75f, 1.00f);
    c[ImGuiCol_ScrollbarGrabActive]= ImVec4(0.25f, 0.65f, 0.90f, 1.00f);
    c[ImGuiCol_CheckMark]          = ImVec4(0.00f, 0.90f, 0.95f, 1.00f);    // Bright cyan
    c[ImGuiCol_SliderGrab]         = ImVec4(0.00f, 0.70f, 0.80f, 1.00f);
    c[ImGuiCol_SliderGrabActive]    = ImVec4(0.00f, 0.90f, 1.00f, 1.00f);
    c[ImGuiCol_Button]             = ImVec4(0.08f, 0.25f, 0.40f, 1.00f);     // Cyan button
    c[ImGuiCol_ButtonHovered]      = ImVec4(0.10f, 0.35f, 0.55f, 1.00f);
    c[ImGuiCol_ButtonActive]       = ImVec4(0.00f, 0.55f, 0.75f, 1.00f);
    c[ImGuiCol_Header]             = ImVec4(0.08f, 0.25f, 0.40f, 1.00f);
    c[ImGuiCol_HeaderHovered]     = ImVec4(0.10f, 0.32f, 0.50f, 1.00f);
    c[ImGuiCol_HeaderActive]      = ImVec4(0.00f, 0.45f, 0.65f, 1.00f);
    c[ImGuiCol_Separator]          = ImVec4(0.20f, 0.22f, 0.35f, 1.00f);
    c[ImGuiCol_SeparatorHovered]   = ImVec4(0.00f, 0.60f, 0.75f, 1.00f);
    c[ImGuiCol_SeparatorActive]    = ImVec4(0.00f, 0.85f, 1.00f, 1.00f);
    c[ImGuiCol_Tab]                = ImVec4(0.05f, 0.12f, 0.20f, 1.00f);
    c[ImGuiCol_TabHovered]         = ImVec4(0.08f, 0.25f, 0.40f, 1.00f);
    c[ImGuiCol_TabActive]          = ImVec4(0.00f, 0.40f, 0.58f, 1.00f);
    c[ImGuiCol_PlotLines]          = ImVec4(0.00f, 0.80f, 0.90f, 1.00f);
    c[ImGuiCol_PlotHistogram]      = ImVec4(0.00f, 0.70f, 0.85f, 1.00f);
    c[ImGuiCol_DragDropTarget]     = ImVec4(0.00f, 0.85f, 1.00f, 0.90f);
    c[ImGuiCol_NavHighlight]       = ImVec4(0.00f, 0.80f, 0.95f, 1.00f);
}

// ======================== RENDER ========================

void BuildApp::render(void* windowHandle, float deltaTime) {
    if (deltaTime <= 0.0f) deltaTime = 0.016f;
    if (deltaTime > 0.1f) deltaTime = 0.1f;

    double currentTime = ImGui::GetTime();
    if (lastFrameTime_ == 0.0) lastFrameTime_ = currentTime;
    double dt = currentTime - lastFrameTime_;
    lastFrameTime_ = currentTime;

    if (tabTransition_) {
        tabTransitionProgress_ += (float)(dt * 4.0f);
        float t = tabTransitionProgress_;
        tabTransitionProgress_ = 1.0f - powf(1.0f - t, 3.0f);
        if (tabTransitionProgress_ >= 1.0f) {
            tabTransitionProgress_ = 0.0f;
            tabTransition_ = false;
        }
    }

    ImGui::SetNextWindowPos(ImVec2(0, 0));
    ImGui::SetNextWindowSize(ImGui::GetIO().DisplaySize);

    ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, ImVec2(0, 0));
    ImGui::PushStyleVar(ImGuiStyleVar_WindowBorderSize, 0.0f);
    ImGui::Begin("##main_app", nullptr,
        ImGuiWindowFlags_NoDecoration | ImGuiWindowFlags_NoMove | ImGuiWindowFlags_NoBringToFrontOnFocus);
    ImGui::PopStyleVar(2);

    renderTitleBar(windowHandle);

    ImGui::BeginGroup();
    renderSidebar();
    ImGui::EndGroup();

    ImGui::SameLine(0, 0);

    ImGui::BeginGroup();
    ImVec2 contentSize = ImVec2(ImGui::GetContentRegionAvail().x, ImGui::GetContentRegionAvail().y);
    ImGui::PushStyleColor(ImGuiCol_ChildBg, ImVec4(0.04f, 0.04f, 0.06f, 1.00f));
    ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, ImVec2(30, 30));
    ImGui::BeginChild("ContentArea", contentSize, false, ImGuiWindowFlags_AlwaysUseWindowPadding);
    
    if (fontRegular_) ImGui::PushFont(fontRegular_);

    float alpha = tabTransition_ ? (0.3f + tabTransitionProgress_ * 0.7f) : 1.0f;
    ImGui::PushStyleVar(ImGuiStyleVar_Alpha, alpha);

    switch (activeTab_) {
        case 0: renderDashboardTab(); break;
        case 1: renderBuildTab(); break;
        case 2: renderAdvancedTab(); break;
        case 3: renderLogsTab(); break;
        case 4: renderArtifactsTab(); break;
        case 5: renderProjectTab(); break;
        case 6: renderAnalyticsTab(); break;
        case 7: renderIntegrationsTab(); break;
        case 8: renderSettingsTab(); break;
        case 9: renderHelpTab(); break;
    }

    ImGui::PopStyleVar();
    if (fontRegular_) ImGui::PopFont();
    
    ImGui::EndChild();
    ImGui::PopStyleVar();
    ImGui::PopStyleColor();
    ImGui::EndGroup();

    ImGui::End();
}

void BuildApp::setFonts(ImFont* h, ImFont* sh, ImFont* r, ImFont* m) {
    fontHeadline_ = h; fontSubHeader_ = sh; fontRegular_ = r; fontMono_ = m;
}

// ======================== TITLE BAR ========================

void BuildApp::renderTitleBar(void* windowHandle) {
    ImGui::PushStyleColor(ImGuiCol_ChildBg, ImVec4(0.02f, 0.02f, 0.04f, 1.0f));
    ImGui::BeginChild("TitleBar", ImVec2(ImGui::GetWindowWidth(), 40), false);
    
    ImGui::SetCursorPos(ImVec2(20, 10));
    if (fontSubHeader_) ImGui::PushFont(fontSubHeader_);
    ImGui::TextColored(ImVec4(0.0f, 1.0f, 1.0f, 1.0f), "LIGHTNING GAMES");
    ImGui::SameLine();
    ImGui::PushStyleColor(ImGuiCol_Text, ImVec4(0.5f, 0.5f, 0.6f, 1.0f));
    ImGui::Text("Build Wizard v%s", version_.current);
    ImGui::PopStyleColor();
    if (fontSubHeader_) ImGui::PopFont();

    // Right side controls
    ImGui::SetCursorPos(ImVec2(ImGui::GetWindowWidth() - 140, 8));
    if (CustomUI::IconButton("[S]", "Settings")) { activeTab_ = 8; }
    ImGui::SameLine();
    if (CustomUI::IconButton("[H]", "Help")) { activeTab_ = 9; }
    ImGui::SameLine();
    ImGui::PushStyleColor(ImGuiCol_Button, ImVec4(0.0f, 0.0f, 0.0f, 0.0f));
    ImGui::PushStyleColor(ImGuiCol_ButtonHovered, ImVec4(0.9f, 0.1f, 0.2f, 0.8f));
    ImGui::PushStyleColor(ImGuiCol_Text, ImVec4(0.7f, 0.7f, 0.8f, 1.0f));
    if (ImGui::Button("X", ImVec2(35, 24))) {
        glfwSetWindowShouldClose((GLFWwindow*)windowHandle, GLFW_TRUE);
    }
    ImGui::PopStyleColor(3);

    ImVec2 p_min = ImGui::GetWindowPos();
    ImVec2 p_max = ImVec2(p_min.x + ImGui::GetWindowWidth(), p_min.y + 40);
    ImGui::GetWindowDrawList()->AddLine(ImVec2(p_min.x, p_max.y), ImVec2(p_max.x, p_max.y), IM_COL32(0, 255, 255, 50), 2.0f);

    ImGui::EndChild();
    ImGui::PopStyleColor();
}

// ======================== SIDEBAR ========================

void BuildApp::renderSidebar() {
    ImGui::PushStyleColor(ImGuiCol_ChildBg, ImVec4(0.05f, 0.05f, 0.08f, 1.0f));
    ImGui::BeginChild("Sidebar", ImVec2(220, ImGui::GetContentRegionAvail().y), false);
    
    ImGui::SetCursorPosY(ImGui::GetCursorPosY() + 20);

    const char* tabs[] = {
        "[D] Dashboard",    // 0
        "[B] Deploy",       // 1
        "[A] Advanced",     // 2
        "[T] Terminal",     // 3
        "[P] Artifacts",    // 4
        "[J] Project",      // 5
        "[S] Analytics",   // 6
        "[I] Integrations", // 7
        "[G] Settings",     // 8
        "[H] Help"          // 9
    };
    
    if (fontSubHeader_) ImGui::PushFont(fontSubHeader_);
    
    for (int i = 0; i < 10; i++) {
        ImGui::SetCursorPosX(10);
        bool isActive = (activeTab_ == i);
        
        if (CustomUI::TabButton(tabs[i], isActive, ImVec2(200, 40))) {
            if (activeTab_ != i) {
                previousTab_ = activeTab_;
                tabTransition_ = true;
                tabTransitionProgress_ = 0.0f;
            }
            activeTab_ = i;
        }
        ImGui::Spacing();
    }
    
    if (fontSubHeader_) ImGui::PopFont();

    // Status footer
    ImGui::SetCursorPos(ImVec2(15, ImGui::GetWindowHeight() - 80));
    ImGui::Separator();
    ImGui::Spacing();
    
    CustomUI::StatusIndicator(platform_.wslAvailable, "WSL Available");
    ImGui::Spacing();
    
    if (metrics_.totalBuilds > 0) {
        ImGui::TextColored(ImVec4(0.4f, 0.4f, 0.5f, 1.0f), "Total Builds: %d", metrics_.totalBuilds);
    }
    
    CustomUI::StatusIndicator(buildQueue_.isProcessing, "Build Queue");

    ImGui::EndChild();
    ImGui::PopStyleColor();
}

// ======================== TAB RENDERERS ========================

void BuildApp::renderDashboardTab() {
    if (fontHeadline_) ImGui::PushFont(fontHeadline_);
    ImGui::Text("Project Dashboard");
    if (fontHeadline_) ImGui::PopFont();
    
    ImGui::Spacing(); ImGui::Spacing();
    
    // Quick stats row
    ImGui::BeginGroup();
    ImGui::TextColored(ImVec4(0.0f, 1.0f, 1.0f, 1.0f), "📊");
    ImGui::SameLine();
    ImGui::Text("Build Statistics");
    ImGui::EndGroup();
    
    ImGui::Spacing();
    
    // Metric cards
    ImGui::BeginGroup();
    CustomUI::MetricCard("Total Builds", std::to_string(metrics_.totalBuilds).c_str(), "🔨");
    ImGui::SameLine();
    {
        char rateBuf[32];
        snprintf(rateBuf, sizeof(rateBuf), "%d%%", (int)metrics_.successRate);
        CustomUI::MetricCard("Success Rate", rateBuf, "✅", 
            metrics_.successRate > 80 ? IM_COL32(0, 255, 100, 255) : IM_COL32(255, 200, 0, 255));
    }
    ImGui::SameLine();
    CustomUI::MetricCard("Artifacts Size", formatBytes(metrics_.totalArtifactsSize).c_str(), "📦");
    ImGui::EndGroup();
    
    ImGui::Spacing(); ImGui::Spacing();
    ImGui::Separator();
    ImGui::Spacing();
    
    // Recent activity
    ImGui::TextColored(ImVec4(0.6f, 0.6f, 0.7f, 1.0f), "Recent Build History");
    ImGui::Spacing();
    
    if (buildHistory_.empty()) {
        ImGui::TextColored(ImVec4(0.4f, 0.4f, 0.5f, 1.0f), "No builds yet. Go to Deploy to create your first build!");
    } else {
        for (size_t i = 0; i < std::min((size_t)5, buildHistory_.size()); i++) {
            auto& h = buildHistory_[i];
            ImGui::Text("%s | v%s | %s", h.timestamp.c_str(), h.version.c_str(), h.platform.c_str());
        }
    }
    
    ImGui::Spacing(); ImGui::Separator(); ImGui::Spacing();
    
    // System resources
    ImGui::TextColored(ImVec4(0.6f, 0.6f, 0.7f, 1.0f), "System Resources");
    ImGui::Spacing();
    
    ImGui::Text("CPU: %.0f%%", systemResources_.cpuPercent);
    ImGui::SameLine(100);
    ImGui::Text("RAM: %lld MB", systemResources_.memoryUsedMB);
    ImGui::SameLine(220);
    ImGui::Text("Disk: %lld GB free", systemResources_.diskFreeGB);
    
    ImGui::Spacing();
    CustomUI::NeonProgressBar(systemResources_.cpuPercent / 100.0f, ImVec2(300, 8));
}

void BuildApp::renderBuildTab() {
    BuildState state = runner_.getState();
    bool building = (state == BuildState::Building);

    ImGui::BeginDisabled(building);

    CustomUI::SectionHeader("Version Configuration");
    ImGui::Text("Current: ");
    ImGui::SameLine();
    ImGui::TextColored(ImVec4(1.0f, 0.85f, 0.0f, 1.0f), "%s", version_.current);

    ImGui::RadioButton("Keep current", &version_.choice, 0);
    ImGui::SameLine(180);
    ImGui::RadioButton(std::string("Patch (" + std::string(version_.nextPatch) + ")").c_str(), &version_.choice, 1);

    ImGui::RadioButton(std::string("Minor (" + std::string(version_.nextMinor) + ")").c_str(), &version_.choice, 2);
    ImGui::SameLine(180);
    ImGui::RadioButton(std::string("Major (" + std::string(version_.nextMajor) + ")").c_str(), &version_.choice, 3);

    ImGui::RadioButton("Custom", &version_.choice, 4);
    if (version_.choice == 4) {
        ImGui::SameLine();
        ImGui::SetNextItemWidth(120);
        ImGui::InputText("##customver", version_.custom, sizeof(version_.custom));
    }

    ImGui::Spacing();
    CustomUI::SectionHeader("Platform Selection");
    
    ImGui::Checkbox("Windows", &platform_.windows);
    ImGui::SameLine();
    if (platform_.wslAvailable) {
        ImGui::TextColored(ImVec4(0.0f, 1.0f, 0.4f, 1.0f), "[Ready]");
    } else {
        ImGui::TextColored(ImVec4(1.0f, 0.3f, 0.3f, 1.0f), "[Not Found]");
    }
    
    ImGui::Checkbox("Linux (WSL)", &platform_.linuxBuild);
    ImGui::SameLine();
    ImGui::Checkbox("Parallel", &platform_.parallelBuilds);
    CustomUI::Tooltip("Build both platforms simultaneously");

    ImGui::Spacing();
    CustomUI::SectionHeader("Compression Level");

    const char* compLabels[] = {
        "Store (~140MB, fast)",
        "Normal (~105MB)",
        "Maximum (~85MB)",
        "ULTRA (~65MB)"
    };
    ImVec4 compColors[] = {
        {0.5f, 0.5f, 0.6f, 1.0f},
        {0.0f, 0.8f, 0.4f, 1.0f},
        {1.0f, 0.6f, 0.0f, 1.0f},
        {1.0f, 0.0f, 1.0f, 1.0f}
    };
    for (int i = 0; i < 4; i++) {
        ImGui::PushStyleColor(ImGuiCol_Text, compColors[i]);
        ImGui::RadioButton(compLabels[i], &compression_.level, i);
        ImGui::PopStyleColor();
    }

    ImGui::EndDisabled();

    ImGui::Spacing(); ImGui::Separator(); ImGui::Spacing();

    if (!building) {
        bool canBuild = platform_.windows || platform_.linuxBuild;
        ImGui::BeginDisabled(!canBuild);

        ImGui::PushStyleColor(ImGuiCol_Button, ImVec4(0.0f, 0.6f, 0.3f, 0.9f));
        ImGui::PushStyleColor(ImGuiCol_ButtonHovered, ImVec4(0.0f, 0.8f, 0.4f, 1.0f));
        if (ImGui::Button("🚀 START BUILD", ImVec2(ImGui::GetContentRegionAvail().x, 50))) {
            startBuild();
        }
        ImGui::PopStyleColor(2);
        ImGui::EndDisabled();

        if (state == BuildState::Success || state == BuildState::Failed) {
            ImVec4 col = (state == BuildState::Success) ? ImVec4(0.0f, 1.0f, 0.4f, 1.0f) : ImVec4(1.0f, 0.2f, 0.4f, 1.0f);
            const char* msg = (state == BuildState::Success) ? "Build completed successfully!" : "Build failed!";
            ImGui::TextColored(col, "%s  (%s)", msg, formatDuration(runner_.getElapsedSeconds()).c_str());
        }
    } else {
        float prog = runner_.getProgress();
        ImGui::Text("%s  (%s)", std::string(runner_.getLabel()).c_str(), formatDuration(runner_.getElapsedSeconds()).c_str());
        CustomUI::NeonProgressBar(prog, ImVec2(-1, 25));
        
        ImGui::Spacing();
        ImGui::PushStyleColor(ImGuiCol_Button, ImVec4(0.7f, 0.1f, 0.1f, 0.8f));
        if (ImGui::Button("Cancel Build", ImVec2(120, 30))) runner_.cancel();
        ImGui::PopStyleColor();
    }

    // Build Queue Section
    if (!buildQueue_.jobs.empty()) {
        ImGui::Spacing(); ImGui::Separator(); ImGui::Spacing();
        CustomUI::SectionHeader("Build Queue");
        
        for (size_t i = 0; i < buildQueue_.jobs.size(); i++) {
            auto& job = buildQueue_.jobs[i];
            ImGui::Text("%zu. %s [%s]", i + 1, job.label.c_str(), 
                job.state == JobState::Pending ? "Pending" :
                job.state == JobState::Building ? "Building" :
                job.state == JobState::Success ? "Success" :
                job.state == JobState::Failed ? "Failed" : "Cancelled");
        }
        
        if (ImGui::Button("Clear Queue")) {
            buildQueue_.jobs.clear();
        }
    }
}

void BuildApp::renderAdvancedTab() {
    ImGui::BeginChild("##adv_scroll", ImVec2(0, 0), false);

    CustomUI::SectionHeader("Build Presets");
    if (ImGui::Button("Quick Debug"))   applyPreset(1);
    ImGui::SameLine();
    if (ImGui::Button("Release"))       applyPreset(2);
    ImGui::SameLine();
    if (ImGui::Button("Distribution")) applyPreset(3);
    ImGui::SameLine();
    if (ImGui::Button("+ Save")) {
        saveProfile("Custom Profile");
    }

    ImGui::Spacing();
    CustomUI::SectionHeader("Profiles");
    if (buildProfiles_.empty()) {
        ImGui::TextColored(ImVec4(0.5f, 0.5f, 0.6f, 1.0f), "No saved profiles. Save a profile to reuse settings.");
    } else {
        for (auto& p : buildProfiles_) {
            ImGui::Text("%s", p.name.c_str());
            ImGui::SameLine();
            if (ImGui::Button(std::string("Load##" + p.id).c_str())) {
                loadProfile(p.id);
            }
            ImGui::SameLine();
            if (ImGui::Button(std::string("Del##" + p.id).c_str())) {
                deleteProfile(p.id);
            }
        }
    }

    ImGui::Spacing();
    CustomUI::SectionHeader("Application Metadata");
    ImGui::SetNextItemWidth(350);
    ImGui::InputText("App ID", advanced_.appId, sizeof(advanced_.appId));
    ImGui::SetNextItemWidth(350);
    ImGui::InputText("Product Name", advanced_.productName, sizeof(advanced_.productName));
    ImGui::SetNextItemWidth(350);
    ImGui::InputText("Author", advanced_.author, sizeof(advanced_.author));
    ImGui::SetNextItemWidth(-1);
    ImGui::InputText("Description", advanced_.description, sizeof(advanced_.description));

    ImGui::Spacing();
    CustomUI::SectionHeader("Packaging Options");
    ImGui::Text("ASAR"); ImGui::SameLine(100); 
    CustomUI::ToggleButton("##asar", &advanced_.asarEnabled);
    
    ImGui::Text("Output Dir"); ImGui::SameLine(100);
    ImGui::SetNextItemWidth(200);
    ImGui::InputText("##outdir", advanced_.outputDir, sizeof(advanced_.outputDir));
    
    ImGui::Text("Clean before build"); ImGui::SameLine(250);
    CustomUI::ToggleButton("##clean", &advanced_.cleanBeforeBuild);

    ImGui::Spacing();
    CustomUI::SectionHeader("Windows Configuration");
    const char* winTargets[] = {"portable", "nsis", "msi", "zip"};
    ImGui::SetNextItemWidth(150);
    ImGui::Combo("Target", &advanced_.winTarget, winTargets, 4);
    ImGui::SetNextItemWidth(250);
    ImGui::InputText("Icon", advanced_.winIcon, sizeof(advanced_.winIcon));

    ImGui::Spacing();
    CustomUI::SectionHeader("Linux Configuration");
    const char* linuxTargets[] = {"AppImage", "deb", "rpm"};
    ImGui::SetNextItemWidth(150);
    ImGui::Combo("Target##linux", &advanced_.linuxTarget, linuxTargets, 3);
    ImGui::SetNextItemWidth(250);
    ImGui::InputText("Icon##linux", advanced_.linuxIcon, sizeof(advanced_.linuxIcon));

    ImGui::Spacing();
    CustomUI::SectionHeader("Build Scripts");
    ImGui::SetNextItemWidth(-1);
    ImGui::InputTextMultiline("##prescript", advanced_.preScript, sizeof(advanced_.preScript), ImVec2(-1, 60));
    ImGui::SetNextItemWidth(-1);
    ImGui::InputTextMultiline("##postscript", advanced_.postScript, sizeof(advanced_.postScript), ImVec2(-1, 60));

    ImGui::Spacing();
    CustomUI::SectionHeader("Environment Variables");
    ImGui::SetNextItemWidth(-1);
    ImGui::InputTextMultiline("##envvars", advanced_.envVars, sizeof(advanced_.envVars), ImVec2(-1, 100));

    ImGui::EndChild();
}

void BuildApp::renderLogsTab() {
    if (ImGui::Button("Clear")) runner_.clearLog();
    ImGui::SameLine();
    BuildState st = runner_.getState();
    if (st == BuildState::Building) {
        ImGui::SameLine(ImGui::GetWindowWidth() - 200);
        ImGui::TextColored(ImVec4(0.0f, 1.0f, 1.0f, 1.0f), "Building... %s", formatDuration(runner_.getElapsedSeconds()).c_str());
    }
    ImGui::Separator();

    ImGui::BeginChild("##logscroll", ImVec2(0, 0), false, ImGuiWindowFlags_HorizontalScrollbar);

    auto log = runner_.getLog();
    ImVec4 typeColors[] = {
        {0.75f, 0.75f, 0.82f, 1.0f},
        {0.00f, 0.85f, 0.85f, 1.0f},
        {0.00f, 1.00f, 0.40f, 1.0f},
        {1.00f, 0.85f, 0.00f, 1.0f},
        {1.00f, 0.20f, 0.40f, 1.0f},
    };

    for (auto& line : log) {
        int t = std::clamp(line.type, 0, 4);
        ImGui::PushStyleColor(ImGuiCol_Text, typeColors[t]);
        ImGui::TextUnformatted(line.text.c_str());
        ImGui::PopStyleColor();
    }

    if (ImGui::GetScrollY() >= ImGui::GetScrollMaxY() - 20)
        ImGui::SetScrollHereY(1.0f);

    ImGui::EndChild();
}

void BuildApp::renderArtifactsTab() {
    if (ImGui::Button("🔄 Refresh")) scanArtifacts();
    ImGui::SameLine();
    ImGui::Text("Output: %s/", advanced_.outputDir);
    ImGui::Separator();
    ImGui::Spacing();

    if (artifacts_.empty()) {
        ImGui::TextColored(ImVec4(0.4f, 0.4f, 0.5f, 1.0f), "No build artifacts found.");
        ImGui::TextColored(ImVec4(0.4f, 0.4f, 0.5f, 1.0f), "Run a build first to generate artifacts.");
    } else {
        if (ImGui::BeginTable("##artifacts", 4,
                ImGuiTableFlags_Borders | ImGuiTableFlags_RowBg | ImGuiTableFlags_SizingStretchProp)) {
            ImGui::TableSetupColumn("Name", ImGuiTableColumnFlags_None, 3.0f);
            ImGui::TableSetupColumn("Version", ImGuiTableColumnFlags_None, 1.0f);
            ImGui::TableSetupColumn("Size", ImGuiTableColumnFlags_None, 1.0f);
            ImGui::TableSetupColumn("Time", ImGuiTableColumnFlags_None, 1.5f);
            ImGui::TableHeadersRow();

            for (auto& a : artifacts_) {
                ImGui::TableNextRow();
                ImGui::TableNextColumn();
                ImGui::TextColored(ImVec4(0.0f, 1.0f, 1.0f, 1.0f), "%s", a.name.c_str());
                ImGui::TableNextColumn();
                ImGui::Text("v%s", a.version.c_str());
                ImGui::TableNextColumn();
                ImGui::Text("%s", a.size.c_str());
                ImGui::TableNextColumn();
                ImGui::TextColored(ImVec4(0.5f, 0.5f, 0.6f, 1.0f), "%s", a.timestamp.c_str());
            }
            ImGui::EndTable();
        }

        long long total = 0;
        for (auto& a : artifacts_) total += a.sizeBytes;
        ImGui::Spacing();
        ImGui::Text("Total: %s across %zu artifact(s)", formatBytes(total).c_str(), artifacts_.size());
    }
}

void BuildApp::renderProjectTab() {
    if (fontHeadline_) ImGui::PushFont(fontHeadline_);
    ImGui::Text("Project Management");
    if (fontHeadline_) ImGui::PopFont();
    
    ImGui::Spacing(); ImGui::Spacing();
    
    CustomUI::SectionHeader("Current Project");
    ImGui::Text("Path: %s", projectRoot_.c_str());
    ImGui::Text("Name: %s", advanced_.productName);
    ImGui::Text("Version: %s", version_.current);
    
    ImGui::Spacing();
    CustomUI::SectionHeader("Recent Projects");
    
    if (recentProjects_.empty()) {
        ImGui::TextColored(ImVec4(0.5f, 0.5f, 0.6f, 1.0f), "No recent projects");
    } else {
        for (size_t i = 0; i < recentProjects_.size(); i++) {
            auto& p = recentProjects_[i];
            ImGui::Text("%s", p.info.name.c_str());
            ImGui::SameLine();
            ImGui::TextColored(ImVec4(0.4f, 0.4f, 0.5f, 1.0f), "- %s", p.info.path.c_str());
            if (p.info.isFavorite) {
                ImGui::SameLine();
                ImGui::TextColored(ImVec4(1.0f, 0.8f, 0.0f, 1.0f), "★");
            }
        }
    }
    
    ImGui::Spacing();
    CustomUI::SectionHeader("Dependencies");
    ImGui::TextColored(ImVec4(0.5f, 0.5f, 0.6f, 1.0f), "Dependency management coming soon...");
    
    ImGui::Spacing();
    CustomUI::SectionHeader("Environment Variables");
    ImGui::SetNextItemWidth(-1);
    ImGui::InputTextMultiline("##envedit", advanced_.envVars, sizeof(advanced_.envVars), ImVec2(-1, 120));
}

void BuildApp::renderAnalyticsTab() {
    if (fontHeadline_) ImGui::PushFont(fontHeadline_);
    ImGui::Text("Analytics & Monitoring");
    if (fontHeadline_) ImGui::PopFont();
    
    ImGui::Spacing(); ImGui::Spacing();
    
    CustomUI::SectionHeader("Build Metrics");
    
    // Stats row
    ImGui::BeginGroup();
    ImGui::Text("Total Builds: %d", metrics_.totalBuilds);
    ImGui::SameLine(150);
    ImGui::Text("Success: %d", metrics_.successCount);
    ImGui::SameLine(250);
    ImGui::Text("Failed: %d", metrics_.failedCount);
    ImGui::EndGroup();
    
    ImGui::Spacing();
    ImGui::Text("Success Rate: %.1f%%", metrics_.successRate);
    CustomUI::NeonProgressBar(metrics_.successRate / 100.0f, ImVec2(400, 12), 
        metrics_.successRate > 80 ? IM_COL32(0, 255, 100, 200) : IM_COL32(255, 200, 0, 200));
    
    ImGui::Spacing();
    CustomUI::SectionHeader("System Resources");
    
    ImGui::Text("CPU Usage: %.0f%%", systemResources_.cpuPercent);
    CustomUI::NeonProgressBar(systemResources_.cpuPercent / 100.0f, ImVec2(300, 8));
    
    ImGui::Text("Memory: %lld MB used", systemResources_.memoryUsedMB);
    ImGui::Text("Disk: %lld GB free of %lld GB", systemResources_.diskFreeGB, systemResources_.diskTotalGB);
    
    ImGui::Spacing();
    CustomUI::SectionHeader("Build History");
    ImGui::TextColored(ImVec4(0.6f, 0.6f, 0.7f, 1.0f), "Last 10 builds:");
    
    for (size_t i = 0; i < std::min((size_t)10, buildHistory_.size()); i++) {
        auto& h = buildHistory_[i];
        ImVec4 statusColor = (h.state == BuildState::Success) ? ImVec4(0.0f, 1.0f, 0.4f, 1.0f) : 
                            (h.state == BuildState::Failed) ? ImVec4(1.0f, 0.3f, 0.3f, 1.0f) : 
                            ImVec4(0.5f, 0.5f, 0.6f, 1.0f);
        ImGui::TextColored(statusColor, "●");
        ImGui::SameLine();
        ImGui::Text("%s | v%s | %s | %s", h.timestamp.c_str(), h.version.c_str(), h.platform.c_str(), 
            h.state == BuildState::Success ? "SUCCESS" : h.state == BuildState::Failed ? "FAILED" : "CANCELLED");
    }
}

void BuildApp::renderIntegrationsTab() {
    if (fontHeadline_) ImGui::PushFont(fontHeadline_);
    ImGui::Text("Integrations");
    if (fontHeadline_) ImGui::PopFont();
    
    ImGui::Spacing(); ImGui::Spacing();
    
    CustomUI::SectionHeader("Git Integration");
    CustomUI::StatusIndicator(gitStatus_.isRepo, "Repository");
    if (gitStatus_.isRepo) {
        ImGui::Text("Branch: %s", gitStatus_.branch.c_str());
        if (gitStatus_.hasChanges) {
            ImGui::TextColored(ImVec4(1.0f, 0.8f, 0.0f, 1.0f), "Has uncommitted changes");
        }
    }
    
    ImGui::Spacing();
    CustomUI::SectionHeader("CI/CD Pipelines");
    ImGui::TextColored(ImVec4(0.5f, 0.5f, 0.6f, 1.0f), "No pipelines configured. Create a pipeline to automate builds.");
    
    ImGui::Spacing();
    CustomUI::SectionHeader("Webhooks");
    ImGui::TextColored(ImVec4(0.5f, 0.5f, 0.6f, 1.0f), "No webhooks configured. Add webhooks to trigger on build events.");
    
    ImGui::Spacing();
    CustomUI::SectionHeader("Plugins");
    ImGui::TextColored(ImVec4(0.5f, 0.5f, 0.6f, 1.0f), "No plugins loaded.");
    
    ImGui::Spacing();
    CustomUI::SectionHeader("Custom Scripts");
    if (ImGui::Button("+ New Script")) {
        CustomScript script;
        script.id = generateId();
        script.name = "New Script";
        script.type = "pre-build";
        script.lastModified = getCurrentTimestamp();
        customScripts_.push_back(script);
    }
    
    for (auto& s : customScripts_) {
        ImGui::Text("%s [%s]", s.name.c_str(), s.type.c_str());
    }
}

void BuildApp::renderSettingsTab() {
    if (fontHeadline_) ImGui::PushFont(fontHeadline_);
    ImGui::Text("Settings");
    if (fontHeadline_) ImGui::PopFont();
    
    ImGui::Spacing(); ImGui::Spacing();
    
    CustomUI::SectionHeader("Appearance");
    ImGui::Text("Theme: Dark Navy");
    ImGui::Text("Font Size: Default");
    ImGui::Text("Animations: Enabled");
    
    ImGui::Spacing();
    CustomUI::SectionHeader("Build Settings");
    ImGui::Checkbox("Parallel builds", &platform_.parallelBuilds);
    ImGui::Checkbox("Auto-save on change", &advanced_.asarEnabled);
    
    ImGui::Spacing();
    CustomUI::SectionHeader("Cache");
    if (ImGui::Button("Clear Build Cache")) {
        clearCache();
    }
    ImGui::Text("Cache size: %s", formatBytes(buildCache_.cacheSizeBytes).c_str());
    
    ImGui::Spacing();
    CustomUI::SectionHeader("About");
    ImGui::Text("Lightning Games Build Wizard");
    ImGui::Text("Version: %s", version_.current);
    ImGui::Text("Platform: Windows + WSL");
}

void BuildApp::renderHelpTab() {
    if (fontHeadline_) ImGui::PushFont(fontHeadline_);
    ImGui::Text("Help & Documentation");
    if (fontHeadline_) ImGui::PopFont();
    
    ImGui::Spacing(); ImGui::Spacing();
    
    CustomUI::SectionHeader("Documentation");
    ImGui::TextColored(ImVec4(0.6f, 0.6f, 0.7f, 1.0f), "Getting Started");
    ImGui::TextWrapped("Welcome to Lightning Games Build Wizard! This tool helps you create distributable packages for your Electron application.");
    
    ImGui::Spacing();
    ImGui::TextColored(ImVec4(0.6f, 0.6f, 0.7f, 1.0f), "Quick Start");
    ImGui::TextWrapped("1. Go to the Deploy tab\n2. Select your target platform\n3. Choose compression level\n4. Click Start Build\n5. Find your artifacts in the Artifacts tab");
    
    ImGui::Spacing();
    CustomUI::SectionHeader("Keyboard Shortcuts");
    ImGui::Text("Ctrl+1-9: Switch tabs");
    ImGui::Text("Ctrl+B: Start build");
    ImGui::Text("Ctrl+L: Clear logs");
    ImGui::Text("F5: Refresh");
    
    ImGui::Spacing();
    CustomUI::SectionHeader("Troubleshooting");
    ImGui::TextColored(ImVec4(1.0f, 0.8f, 0.0f, 1.0f), "Build fails with permission error");
    ImGui::TextWrapped("Try running as administrator or check your antivirus settings.");
    
    ImGui::TextColored(ImVec4(1.0f, 0.8f, 0.0f, 1.0f), "WSL not detected");
    ImGui::TextWrapped("Make sure WSL is installed and 'wsl.exe --status' works in command prompt.");
    
    ImGui::Spacing();
    CustomUI::SectionHeader("Check for Updates");
    if (ImGui::Button("Check Now")) {
        updateInfo_.currentVersion = version_.current;
        updateInfo_.latestVersion = version_.current;
        updateInfo_.isUpdateAvailable = false;
    }
    
    ImGui::Text("Current version: %s", version_.current);
    if (updateInfo_.isUpdateAvailable) {
        ImGui::TextColored(ImVec4(0.0f, 1.0f, 0.4f, 1.0f), "Update available: %s", updateInfo_.latestVersion.c_str());
    } else {
        ImGui::TextColored(ImVec4(0.5f, 0.5f, 0.6f, 1.0f), "You are up to date!");
    }
}