# Example Build Log Output

> **Sample output from a successful multi-platform build**

---

## Complete Build Log Example

```
=== Lightning Games Build Log ===
Version: 2.2.0
Platforms: windows, linux-wsl
Compression: Normal
Date: 2026-03-09T14:32:15.000Z
============================================================

[BUILD STARTED]

  System Information:
    OS: win32
    Node.js: v18.16.0
    CPU Cores: 8
    Total Memory: 16 GB
    Free Memory: 8 GB
    Working Directory: C:\projects\lightning-games

  Project Information:
    Project: Lightning Games
    Version: 2.2.0
    Author: Tarik
    License: MIT

  Cache Information:
    Cache Directory: .cache
    Cache Size: 245 MB
    Cache Hits: 12
    Cache Misses: 3
    Hit Rate: 80%

  Environment Variables:
    NODE_ENV: production
    ELECTRON_CACHE: C:\projects\lightning-games\.cache\electron
    ELECTRON_BUILDER_CACHE: C:\projects\lightning-games\.cache\electron-builder
    npm_config_prefer_offline: true
    npm_config_no_audit: true
    npm_config_progress: false
    npm_config_legacy_peer_deps: true

  Build Configuration:
    Platforms: windows, linux-wsl
    Compression: Normal (Level 3)
    Needs Rebuild: false

[14:32:15.000] [+0s] [INFO] Build log: BuildLogs/build-2026-03-09T14-32-15-000Z.log

============================================================

[Windows Build Executor]

[14:32:16.000] [+1s] [INFO] Platform: Windows Portable
[14:32:16.100] [+1.1s] [INFO] Compression: Normal (Level 3)
[14:32:16.200] [+1.2s] [INFO] Environment variables configured for caching
[14:32:16.300] [+1.3s] [SUCCESS] npm install skipped (cache hit)

  [electron-builder]
  
[14:32:16.400] [+1.4s] [COMMAND] electron-builder --win portable --config.compression store
[14:32:16.500] [+1.5s] [INFO] Building Windows portable executable
[14:32:20.000] [+5s] [INFO] Packaging...
[14:32:25.000] [+10s] [INFO] Downloading Electron...
[14:32:35.000] [+20s] [INFO] Download complete
[14:32:40.000] [+25s] [INFO] Building...
[14:32:45.000] [+30s] [SUCCESS] Windows build completed in 30s

  Platform: Windows Portable
  Duration: 30s
  Exit Code: 0
  Status: SUCCESS

[14:32:45.100] [+30.1s] [MEMORY] Heap: 125MB / 256MB | RSS: 340MB

============================================================

[WSL Build Executor]

[14:32:46.000] [+31s] [INFO] Platform: Linux AppImage (WSL)
[14:32:46.100] [+31.1s] [INFO] Compression: Normal (Level 3)
[14:32:46.200] [+31.2s] [SUCCESS] WSL dependencies verified
[14:32:46.300] [+31.3s] [INFO] WSL source path: /mnt/c/projects/lightning-games
[14:32:46.400] [+31.4s] [INFO] Linux build path: ~/lightning-games-build-1709856735000
[14:32:46.500] [+31.5s] [INFO] Cache path: ~/.cache/lightning-games

  [npm install]

[14:32:46.600] [+31.6s] [COMMAND] npm install --no-optional --prefer-offline --no-fund --no-audit --legacy-peer-deps
[14:32:46.700] [+31.7s] [INFO] Installing project dependencies
[14:32:50.000] [+35s] [INFO] npm WARN deprecated some-package@1.0.0
[14:33:15.000] [+60s] [INFO] added 150 packages in 45s
[14:33:15.100] [+60.1s] [SUCCESS] npm install completed in 45s

  Duration: 45s
  Method: npm install (aggressive cache)
  Flags: --no-optional --prefer-offline --no-fund --no-audit --legacy-peer-deps

  [electron-builder]

[14:33:15.200] [+60.2s] [COMMAND] electron-builder --linux AppImage --config.compression store
[14:33:15.300] [+60.3s] [INFO] Building Linux AppImage
[14:33:20.000] [+65s] [INFO] Copying project to Linux filesystem...
[14:33:25.000] [+70s] [INFO] Restoring cached node_modules...
[14:33:30.000] [+75s] [INFO] Installing dependencies (fast)...
[14:33:40.000] [+85s] [INFO] Building AppImage...
[14:33:45.000] [+90s] [INFO] Caching node_modules for future builds...
[14:33:50.000] [+95s] [INFO] Copying artifacts to Windows...
[14:33:55.000] [+100s] [INFO] Linux build complete!
[14:33:55.100] [+100.1s] [SUCCESS] WSL build completed in 60s

  Platform: Linux AppImage (WSL)
  Duration: 60s
  Exit Code: 0
  Status: SUCCESS

[14:33:55.200] [+100.2s] [MEMORY] Heap: 145MB / 256MB | RSS: 380MB

============================================================

[Collecting Build Artifacts]

[14:33:56.000] [+101s] [INFO] Scanning dist directory: C:\projects\lightning-games\dist
[14:33:56.100] [+101.1s] [INFO] Found artifact: Lightning Games.exe

  Name: Lightning Games.exe
  Size: 112 MB
  Modified: 2026-03-09T14:32:45.000Z
  Path: C:\projects\lightning-games\dist\Lightning Games.exe

[14:33:56.200] [+101.2s] [INFO] Found artifact: Lightning Games.AppImage

  Name: Lightning Games.AppImage
  Size: 95 MB
  Modified: 2026-03-09T14:33:55.000Z
  Path: C:\projects\lightning-games\dist\Lightning Games.AppImage

[14:33:56.300] [+101.3s] [SUCCESS] Collected 2 artifact(s)

============================================================

[BUILD COMPLETED]

[14:33:57.000] [+102s] [SECTION] BUILD COMPLETED

  Performance Metrics:
    Total Duration: 2m 15s
    Build Duration: 1m 50s
    Platforms: windows, linux-wsl
    Compression Level: 3
    Artifacts Generated: 2
    All Successful: YES

  Build Results Summary:
    windows: SUCCESS (30s)
    linux-wsl: SUCCESS (60s)

  Generated Artifacts:
    Name: Lightning Games.exe
    Size: 112 MB
    Modified: 2026-03-09T14:32:45.000Z
    
    Name: Lightning Games.AppImage
    Size: 95 MB
    Modified: 2026-03-09T14:33:55.000Z

  Cache Statistics:
    Total Size: 245 MB
    Hit Rate: 80%
    Total Hits: 13
    Total Misses: 3
    Cached Builds: 2

  Final Summary:
    Status: SUCCESS
    Total Duration: 2m 15s
    Platforms Built: 2
    Artifacts: 2
    Build Log: BuildLogs/build-2026-03-09T14-32-15-000Z.log

============================================================
Build SUCCESS
Total duration: 2m 15s
Artifacts: 2
  - Lightning Games.exe (112 MB)
  - Lightning Games.AppImage (95 MB)
```

---

## Log Analysis Examples

### Extract Build Duration
```bash
$ grep "Total Duration" BuildLogs/build-2026-03-09T14-32-15-000Z.log
Total Duration: 2m 15s
```

### Extract Per-Platform Times
```bash
$ grep "SUCCESS\|FAILED" BuildLogs/build-2026-03-09T14-32-15-000Z.log
windows: SUCCESS (30s)
linux-wsl: SUCCESS (60s)
```

### Extract Artifact Information
```bash
$ grep -A 3 "Generated Artifacts" BuildLogs/build-2026-03-09T14-32-15-000Z.log
  Generated Artifacts:
    Name: Lightning Games.exe
    Size: 112 MB
    Modified: 2026-03-09T14:32:45.000Z
```

### Extract Cache Statistics
```bash
$ grep -A 5 "Cache Statistics" BuildLogs/build-2026-03-09T14-32-15-000Z.log
  Cache Statistics:
    Total Size: 245 MB
    Hit Rate: 80%
    Total Hits: 13
    Total Misses: 3
    Cached Builds: 2
```

### Extract Memory Usage
```bash
$ grep "MEMORY" BuildLogs/build-2026-03-09T14-32-15-000Z.log
[14:32:45.100] [+30.1s] [MEMORY] Heap: 125MB / 256MB | RSS: 340MB
[14:33:55.200] [+100.2s] [MEMORY] Heap: 145MB / 256MB | RSS: 380MB
```

---

## Failed Build Example

```
[BUILD STARTED]
  System Information:
    OS: win32
    Node.js: v18.16.0
    ...

[Windows Build Executor]
[14:32:16.000] [+1s] [INFO] Platform: Windows Portable
[14:32:16.100] [+1.1s] [INFO] Compression: Normal (Level 3)
[14:32:16.200] [+1.2s] [SUCCESS] npm install skipped (cache hit)

  [electron-builder]
[14:32:16.400] [+1.4s] [COMMAND] electron-builder --win portable --config.compression store
[14:32:20.000] [+5s] [ERROR] Build failed: exit code 1

  Platform: Windows Portable
  Duration: 5s
  Exit Code: 1
  Status: FAILED
  Error: ENOENT: no such file or directory, open 'C:\projects\lightning-games\assets\icon.ico'

[BUILD COMPLETED]
  Performance Metrics:
    Total Duration: 5s
    Build Duration: 5s
    Platforms: windows
    Compression Level: 3
    Artifacts Generated: 0
    All Successful: NO

  Final Summary:
    Status: PARTIAL_FAILURE
    Total Duration: 5s
    Platforms Built: 1
    Artifacts: 0
    Build Log: BuildLogs/build-2026-03-09T14-32-15-000Z.log

============================================================
Build FAILED
Total duration: 5s
Artifacts: 0
```

---

## Partial Failure Example

```
[BUILD COMPLETED]

  Build Results Summary:
    windows: SUCCESS (30s)
    linux-wsl: FAILED (15s)

  Generated Artifacts:
    Name: Lightning Games.exe
    Size: 112 MB
    Modified: 2026-03-09T14:32:45.000Z

  Final Summary:
    Status: PARTIAL_FAILURE
    Total Duration: 1m 15s
    Platforms Built: 2
    Artifacts: 1
    Build Log: BuildLogs/build-2026-03-09T14-32-15-000Z.log

============================================================
Build FAILED
Total duration: 1m 15s
Artifacts: 1
  - Lightning Games.exe (112 MB)
```

---

## Key Observations

### Successful Build Indicators
- ✅ All platforms show "SUCCESS"
- ✅ Exit codes are 0
- ✅ Artifacts are generated
- ✅ Build duration is reasonable (<5 minutes)
- ✅ Memory usage is stable

### Performance Indicators
- 🚀 Cache hit rate >70% = good
- ⚡ Build duration <2 minutes = excellent
- 💾 Memory usage <50% = healthy
- 📦 Artifact sizes reasonable (<150MB each)

### Troubleshooting Indicators
- ⚠️ Cache hit rate <50% = investigate cache
- ⏱️ Build duration >5 minutes = check compression level
- 💥 Memory usage >80% = system under stress
- ❌ Exit code != 0 = build failed

---

**Example Log Date:** 2026-03-09  
**Build System Version:** 5.7  
**Logging System Version:** 1.0

