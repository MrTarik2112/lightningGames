#pragma once
#include "imgui.h"
#include "build_runner.h"
#include <string>
#include <vector>
#include <map>
#include <chrono>
#include <atomic>

// ======================== ENUMS ========================

enum class BuildState;
enum class TabIndex {
    Dashboard = 0,
    Build = 1,
    Advanced = 2,
    Logs = 3,
    Artifacts = 4,
    Project = 5,
    Analytics = 6,
    Integrations = 7,
    Settings = 8,
    Help = 9
};

enum class ThemeType {
    DarkNavy,
    LightMode,
    HighContrast,
    Colorblind
};

enum class ArtifactType {
    WindowsExe,
    WindowsNsis,
    WindowsMsi,
    WindowsZip,
    LinuxAppImage,
    LinuxDeb,
    LinuxRpm,
    MacDmg
};

enum class LogFilterType {
    All,
    Info,
    Warning,
    Error,
    Success
};

enum class JobState {
    Pending,
    Building,
    Success,
    Failed,
    Cancelled
};

// ======================== CORE STRUCTURES ========================

struct VersionConfig {
    char current[32] = "";
    int choice = 0;
    char custom[32] = "";
    char nextPatch[32] = "";
    char nextMinor[32] = "";
    char nextMajor[32] = "";
};

struct PlatformConfig {
    bool windows = true;
    bool linuxBuild = false;
    bool wslAvailable = false;
    bool parallelBuilds = false;
    bool macBuild = false;
};

struct CompressionConfig {
    int level = 1;
    char customArgs[256] = "";
};

struct AdvancedConfig {
    char appId[128] = "com.tarik.lightninggames";
    char productName[128] = "Lightning Games";
    char description[256] = "";
    char author[64] = "Tarik";

    bool asarEnabled = true;
    char asarUnpack[256] = "**/*.node";

    int winTarget = 0;
    char winIcon[256] = "assets/icon.ico";
    bool winElevated = false;
    char winPublisher[128] = "";

    int linuxTarget = 0;
    char linuxIcon[256] = "assets/icon.png";
    char linuxCategory[64] = "Game";
    char linuxMaintainer[64] = "Tarik";

    char outputDir[256] = "dist";
    bool cleanBeforeBuild = false;
    char electronVersion[32] = "";
    char extraFlags[512] = "";

    char preScript[512] = "";
    char postScript[512] = "";

    char fileFilters[2048] = "**/*\n!**/node_modules/**\n!**/dist/**\n!**/BuildLogs/**\n!**/.git/**\n!**/.crush/**\n!**/Docs/**\n!**/scripts/**\n!**/temp_*/**\n!**/*.md\n!.gitignore\n!.gitattributes";

    char envVars[1024] = "";
    int preset = 0;
};

struct ArtifactInfo {
    std::string name;
    std::string size;
    long long sizeBytes = 0;
    std::string path;
    std::string timestamp;
    std::string version;
    ArtifactType type;
    bool isSigned = false;
    std::string checksum;
};

// ======================== NEW STRUCTURES FOR 34 FEATURES ========================

// --- Build Queue System ---
struct BuildJob {
    std::string id;
    std::string command;
    std::string label;
    std::string version;
    std::string platform;
    JobState state = JobState::Pending;
    float progress = 0.0f;
    double startTime = 0.0;
    double duration = 0.0;
    std::string errorMessage;
    bool autoStart = true;
};

struct BuildQueue {
    std::vector<BuildJob> jobs;
    int currentJobIndex = -1;
    bool isProcessing = false;
    bool autoContinue = true;
};

// --- Build Profiles ---
struct BuildProfile {
    std::string id;
    std::string name;
    bool isDefault = false;

    VersionConfig version;
    PlatformConfig platform;
    CompressionConfig compression;
    AdvancedConfig advanced;

    std::string createdAt;
    std::string lastUsed;
};

// --- Build History ---
struct BuildHistoryEntry {
    std::string id;
    std::string timestamp;
    std::string version;
    std::string platform;
    std::string compression;
    BuildState state;
    double duration = 0.0;
    long long sizeBytes = 0;
    std::string profile;
    int fileCount = 0;
};

// --- Build Cache ---
struct BuildCache {
    std::map<std::string, std::string> fileHashes;
    std::string lastBuildHash;
    bool isValid = false;
    long long cacheSizeBytes = 0;
    std::string lastUpdated;
};

// --- Project Management ---
struct ProjectInfo {
    std::string path;
    std::string name;
    std::string lastOpened;
    bool isFavorite = false;
    std::string packageJsonVersion;
    int gameCount = 0;
    long long totalSize = 0;
};

struct RecentProject {
    ProjectInfo info;
    bool isValid = true;
};

// --- Dependencies ---
struct DependencyInfo {
    std::string name;
    std::string version;
    std::string latestVersion;
    bool hasUpdate = false;
    bool isDev = false;
    int depth = 0;
    std::vector<std::string> dependents;
};

struct InstallProgress {
    bool isInstalling = false;
    float progress = 0.0f;
    std::string currentPackage;
    std::string output;
};

// --- Environment Variables ---
struct EnvVar {
    std::string key;
    std::string value;
    bool isSecret = false;
    std::string group;
    bool enabled = true;
};

// --- File Filters ---
struct FileFilterRule {
    std::string pattern;
    bool isExclude = false;
    bool isEnabled = true;
};

// --- Analytics ---
struct BuildMetrics {
    int totalBuilds = 0;
    int successCount = 0;
    int failedCount = 0;
    int cancelledCount = 0;
    double successRate = 0.0;
    double avgBuildTime = 0.0;
    long long totalArtifactsSize = 0;
    int buildsToday = 0;
    int buildsThisWeek = 0;
    int buildsThisMonth = 0;
};

struct TimeSeriesData {
    std::vector<std::pair<std::string, int>> buildCount;
    std::vector<std::pair<std::string, double>> buildTime;
    std::vector<std::pair<std::string, long long>> artifactSize;
};

// --- Performance Monitor ---
struct SystemResources {
    float cpuPercent = 0.0f;
    long long memoryUsedMB = 0;
    long long memoryAvailableMB = 0;
    long long diskFreeGB = 0;
    long long diskTotalGB = 0;
    int threadCount = 0;
};

struct ResourceHistory {
    std::vector<std::pair<double, SystemResources>> samples;
    double maxCpu = 0.0f;
    long long maxMemoryMB = 0;
};

// --- Size Analyzer ---
struct SizeCategory {
    std::string name;
    long long sizeBytes = 0;
    int fileCount = 0;
    std::vector<std::string> extensions;
};

struct SizeAnalysis {
    long long totalSize = 0;
    long long codeSize = 0;
    long long assetSize = 0;
    long long nodeModulesSize = 0;
    long long compressedSize = 0;
    std::vector<SizeCategory> categories;
    long long estimatedUnpacked = 0;
};

// --- Dependency Tree ---
struct DependencyNode {
    std::string name;
    std::string version;
    int depth = 0;
    bool isDev = false;
    bool hasConflict = false;
    std::vector<DependencyNode*> children;
};

// --- Git Integration ---
struct GitStatus {
    bool isRepo = false;
    std::string branch;
    bool hasChanges = false;
    int stagedCount = 0;
    int modifiedCount = 0;
    int newCount = 0;
    int deletedCount = 0;
};

struct GitCommit {
    std::string hash;
    std::string message;
    std::string author;
    std::string date;
};

struct GitBranch {
    std::string name;
    bool isCurrent = false;
    bool isRemote = false;
};

// --- CI/CD Pipeline ---
struct PipelineStage {
    std::string name;
    std::string command;
    std::string condition;
    bool enabled = true;
    int order = 0;
    bool runOnSuccess = true;
    bool runOnFail = false;
};

struct Pipeline {
    std::string id;
    std::string name;
    std::vector<PipelineStage> stages;
    bool isEnabled = true;
    std::string triggerEvent;
};

// --- Webhooks ---
struct Webhook {
    std::string id;
    std::string name;
    std::string url;
    std::string method;
    std::map<std::string, std::string> headers;
    std::string payload;
    std::string triggerEvent;
    bool enabled = true;
    int retryCount = 3;
    int timeout = 30;
};

struct WebhookHistory {
    std::string webhookId;
    std::string timestamp;
    int statusCode;
    bool success;
    std::string response;
    double duration;
};

// --- Plugin System ---
struct PluginInfo {
    std::string id;
    std::string name;
    std::string version;
    std::string author;
    std::string description;
    std::string path;
    bool isLoaded = false;
    bool hasSettings = false;
};

struct PluginSetting {
    std::string key;
    std::string value;
    std::string type;
    std::string description;
};

// --- Script Editor ---
struct CustomScript {
    std::string id;
    std::string name;
    std::string content;
    std::string type;
    bool isValid = true;
    std::vector<std::string> errors;
    std::string lastModified;
};

struct ScriptExecution {
    std::string scriptId;
    std::string output;
    int exitCode = 0;
    double duration = 0.0;
    std::string timestamp;
};

// --- Artifact Gallery ---
struct ArtifactCard {
    ArtifactInfo info;
    std::string thumbnailPath;
    bool isSelected = false;
    bool isHovered = false;
    std::vector<std::string> tags;
};

// --- Artifact Comparison ---
struct ComparisonResult {
    std::string leftName;
    std::string rightName;
    long long sizeDiff = 0;
    int fileCountDiff = 0;
    std::vector<std::string> onlyInLeft;
    std::vector<std::string> onlyInRight;
    std::vector<std::string> different;
};

// --- Cloud Upload ---
struct UploadProfile {
    std::string id;
    std::string name;
    std::string type;
    std::string url;
    std::map<std::string, std::string> credentials;
    std::string uploadPath;
};

struct UploadProgress {
    std::string artifactName;
    float progress = 0.0f;
    std::string status;
    double speed = 0.0;
    std::string eta;
};

struct UploadHistory {
    std::string timestamp;
    std::string artifactName;
    std::string target;
    bool success = false;
    long long bytesUploaded = 0;
};

// --- Code Preview ---
struct CodeFile {
    std::string path;
    std::string name;
    std::string content;
    std::string language;
    int lineCount = 0;
    bool hasErrors = false;
    std::vector<std::string> errors;
};

// --- Log Viewer ---
struct LogEntry {
    std::string text;
    int type;
    std::string timestamp;
    std::string source;
};

struct LogFilter {
    std::string searchText;
    bool useRegex = false;
    std::vector<LogFilterType> activeTypes;
    std::string startTime;
    std::string endTime;
};

// --- Documentation ---
struct DocSection {
    std::string id;
    std::string title;
    std::string content;
    std::vector<std::string> subsections;
    std::vector<std::string> codeExamples;
};

struct DocSearchResult {
    std::string sectionId;
    std::string title;
    std::string snippet;
    float relevance = 0.0f;
};

// --- Update Checker ---
struct UpdateInfo {
    std::string currentVersion;
    std::string latestVersion;
    bool isUpdateAvailable = false;
    std::string downloadUrl;
    std::string releaseNotes;
    long long downloadSize = 0;
    std::string publishedAt;
    bool isSecurityUpdate = false;
};

// --- Animation System ---
struct AnimationState {
    float progress = 0.0f;
    bool isPlaying = false;
    bool isReversed = false;
    float duration = 1.0f;
    std::string easingFunction = "easeOut";
};

// --- Theme System ---
struct ThemeColors {
    ImVec4 windowBg;
    ImVec4 childBg;
    ImVec4 popupBg;
    ImVec4 border;
    ImVec4 text;
    ImVec4 textSecondary;
    ImVec4 accentCyan;
    ImVec4 accentGreen;
    ImVec4 accentYellow;
    ImVec4 accentRed;
    ImVec4 accentPurple;
    ImVec4 button;
    ImVec4 buttonHover;
    ImVec4 slider;
    ImVec4 scrollbar;
    ImVec4 tab;
};

struct Theme {
    std::string id;
    std::string name;
    ThemeColors colors;
    std::string fontFamily;
    float fontSize = 16.0f;
    bool isDark = true;
};

// --- Multi-Window ---
struct WindowState {
    std::string id;
    std::string title;
    ImVec2 position;
    ImVec2 size;
    bool isOpen = true;
    bool isModal = false;
    bool isFloating = false;
};

// ======================== MAIN APPLICATION CLASS ========================

class BuildApp {
public:
    BuildApp();
    void init();
    void render(void* windowHandle, float deltaTime = 0.016f);
    void setFonts(ImFont* headline, ImFont* subheader, ImFont* regular, ImFont* mono);
    static void setupTheme();

private:
    // Core configuration
    VersionConfig version_;
    PlatformConfig platform_;
    CompressionConfig compression_;
    AdvancedConfig advanced_;

    std::string projectRoot_;
    std::string windowsRoot_;
    bool packageLoaded_ = false;
    bool showBuildSummary_ = false;

    BuildRunner runner_;
    std::vector<ArtifactInfo> artifacts_;

    // Fonts
    ImFont* fontHeadline_ = nullptr;
    ImFont* fontSubHeader_ = nullptr;
    ImFont* fontRegular_ = nullptr;
    ImFont* fontMono_ = nullptr;

    // Tab system
    int activeTab_ = 1;
    int previousTab_ = 0;
    bool tabTransition_ = false;
    float tabTransitionProgress_ = 0.0f;

    // ======================== NEW FEATURE MEMBERS ========================

    // Feature 1-5: Build System
    BuildQueue buildQueue_;
    std::vector<BuildProfile> buildProfiles_;
    std::vector<BuildHistoryEntry> buildHistory_;
    BuildCache buildCache_;

    // Feature 6-10: Project Management
    std::vector<RecentProject> recentProjects_;
    ProjectInfo currentProject_;
    std::vector<DependencyInfo> dependencies_;
    InstallProgress installProgress_;
    std::vector<EnvVar> envVars_;
    std::vector<FileFilterRule> fileFilters_;

    // Feature 11-15: Analytics
    BuildMetrics metrics_;
    TimeSeriesData timeSeriesData_;
    SystemResources systemResources_;
    ResourceHistory resourceHistory_;
    SizeAnalysis sizeAnalysis_;
    std::vector<DependencyNode> dependencyTree_;

    // Feature 16-20: Integration
    GitStatus gitStatus_;
    std::vector<GitCommit> gitCommits_;
    std::vector<GitBranch> gitBranches_;
    std::vector<Pipeline> pipelines_;
    std::vector<Webhook> webhooks_;
    std::vector<WebhookHistory> webhookHistory_;
    std::vector<PluginInfo> plugins_;
    std::vector<CustomScript> customScripts_;

    // Feature 21-24: Artifact Management
    std::vector<ArtifactCard> artifactGallery_;
    std::vector<UploadProfile> uploadProfiles_;
    std::map<std::string, UploadProgress> uploadProgressMap_;
    std::vector<UploadHistory> uploadHistory_;

    // Feature 25-27: Code/Editor
    CodeFile currentCodeFile_;
    LogFilter logFilter_;
    bool searchResultSelected_ = false;
    std::vector<LogEntry> filteredLogs_;

    // Feature 28-30: Help
    std::vector<DocSection> documentation_;
    std::vector<DocSearchResult> docSearchResults_;
    UpdateInfo updateInfo_;
    bool isCheckingUpdate_ = false;

    // Feature 31-34: UI/UX
    Theme currentTheme_;
    std::vector<Theme> availableThemes_;
    AnimationState animationState_;
    std::vector<WindowState> windowStates_;

    // Drag & drop
    bool isDraggingFile_ = false;
    std::string droppedFilePath_;

    // Animation timers
    double animationStartTime_ = 0.0;
    double lastFrameTime_ = 0.0;

    // ======================== RENDER METHODS ========================

    // Core UI
    void renderTitleBar(void* windowHandle);
    void renderSidebar();
    void renderContentArea();

    // Tab renderers
    void renderDashboardTab();
    void renderBuildTab();
    void renderAdvancedTab();
    void renderLogsTab();
    void renderArtifactsTab();
    void renderProjectTab();
    void renderAnalyticsTab();
    void renderIntegrationsTab();
    void renderSettingsTab();
    void renderHelpTab();

    // Feature renderers - Build System
    void renderBuildQueue();
    void renderBuildProfiles();
    void renderBuildHistory();
    void renderBuildCache();
    void renderParallelBuilds();

    // Feature renderers - Project Management
    void renderProjectSelector();
    void renderProjectEditor();
    void renderDependencies();
    void renderEnvVarsEditor();
    void renderFileFilters();

    // Feature renderers - Analytics
    void renderMetricsDashboard();
    void renderPerformanceMonitor();
    void renderResourceMonitor();
    void renderSizeAnalyzer();
    void renderDependencyTree();

    // Feature renderers - Integration
    void renderGitPanel();
    void renderPipelineEditor();
    void renderWebhooks();
    void renderPlugins();
    void renderScriptEditor();

    // Feature renderers - Artifacts
    void renderArtifactGallery();
    void renderArtifactComparison();
    void renderCloudUpload();

    // Feature renderers - Code/Editor
    void renderCodePreview();
    void renderLogSearch();
    void renderJsonEditor();

    // Feature renderers - Help
    void renderDocumentation();
    void renderUpdater();

    // Feature renderers - UI/UX
    void renderThemeSelector();
    void renderAnimations();
    void renderMultiWindow();
    void renderDragDrop();

    // ======================== LOGIC METHODS ========================

    // Core
    void loadPackageJson();
    void saveVersion(const std::string& newVersion);
    void startBuild();
    void scanArtifacts();
    void applyPreset(int preset);
    std::string getNewVersion();
    std::string getCompressionStr();
    std::string getCompressionName();
    std::string getWinTargetStr();
    std::string getLinuxTargetStr();
    std::string constructBuildCommand();

    // Feature logic - Build System
    void addToQueue(const BuildJob& job);
    void processQueue();
    void cancelCurrentJob();
    void saveProfile(const std::string& name);
    void loadProfile(const std::string& id);
    void deleteProfile(const std::string& id);
    void updateBuildHistory();
    void calculateCache();
    void clearCache();
    void startParallelBuild();

    // Feature logic - Project Management
    void addRecentProject(const ProjectInfo& project);
    void loadRecentProjects();
    void saveRecentProjects();
    void refreshDependencies();
    void installDependency(const std::string& name, const std::string& version);
    void removeDependency(const std::string& name);
    void addEnvVar(const EnvVar& env);
    void removeEnvVar(const std::string& key);
    void addFileFilter(const FileFilterRule& rule);
    void removeFileFilter(int index);

    // Feature logic - Analytics
    void calculateMetrics();
    void updateSystemResources();
    void analyzeBuildSize();
    void buildDependencyTree();

    // Feature logic - Integration
    void updateGitStatus();
    void gitCommit(const std::string& message);
    void gitPush();
    void gitPull();
    void switchBranch(const std::string& branchName);
    void runPipeline(const std::string& pipelineId);
    void triggerWebhook(const std::string& webhookId);
    void loadPlugin(const std::string& path);
    void unloadPlugin(const std::string& id);
    void executeScript(const std::string& scriptId);

    // Feature logic - Artifacts
    void selectArtifact(int index);
    void compareArtifacts(const std::string& left, const std::string& right);
    void uploadArtifact(const std::string& artifactId, const std::string& profileId);

    // Feature logic - Help
    void checkForUpdates();
    void searchDocumentation(const std::string& query);

    // Feature logic - UI/UX
    void applyTheme(const Theme& theme);
    void playAnimation(const std::string& name);
    void openWindow(const std::string& windowId);
    void closeWindow(const std::string& windowId);

    // Utilities
    std::string wslToWindowsPath(const std::string& p);
    std::string formatBytes(long long bytes);
    std::string formatDuration(double seconds);
    std::string generateId();
    std::string getCurrentTimestamp();
    bool fileExists(const std::string& path);
    std::string readFile(const std::string& path);
    void writeFile(const std::string& path, const std::string& content);
};