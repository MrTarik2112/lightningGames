# Build Logging System - Quick Reference

> **Quick Guide to Understanding Build Logs**

---

## 📍 Log File Location

```
BuildLogs/build-{timestamp}.log
```

Example: `BuildLogs/build-2026-03-09T14-32-15-000Z.log`

---

## 🔍 What Gets Logged

### System Information
- Operating system
- Node.js version
- CPU cores
- Total and free memory
- Working directory

### Project Information
- Project name
- Version number
- Author
- License

### Build Configuration
- Selected platforms
- Compression level
- Cache status
- Rebuild needed (yes/no)

### Build Execution
- Each platform's build process
- npm install details
- electron-builder execution
- Build duration per platform
- Exit codes

### Artifacts
- Filename
- File size
- Last modified time
- Full path

### Performance
- Total build time
- Per-platform build time
- Compression level used
- Number of artifacts
- Success/failure status

### Cache Statistics
- Cache size
- Hit rate percentage
- Number of hits
- Number of misses

### Memory Usage
- Snapshots at key points
- Heap usage
- RSS (resident set size)

---

## 📊 Log Sections

### [BUILD STARTED]
Initial build information and configuration

### [Platform Build Executor]
Details for each platform (Windows, WSL, Docker, Linux)

### [npm install]
Dependency installation details

### [electron-builder]
Application building details

### [Collecting Build Artifacts]
Generated files and their properties

### [BUILD COMPLETED]
Final results and summary

---

## 🎯 Common Log Searches

### Find build duration
```bash
grep "Total Duration" BuildLogs/build-*.log
```

### Find errors
```bash
grep -i "error\|failed" BuildLogs/build-*.log
```

### Find artifact sizes
```bash
grep -A 2 "Generated Artifacts" BuildLogs/build-*.log
```

### Find cache hit rate
```bash
grep "Hit Rate" BuildLogs/build-*.log
```

### Find memory usage
```bash
grep "Memory" BuildLogs/build-*.log
```

### Find npm install time
```bash
grep -A 3 "npm install" BuildLogs/build-*.log
```

---

## 📈 Understanding Performance

### Build Duration Breakdown

```
Total Duration: 2m 15s
├── Windows Build: 30s
├── WSL Build: 60s
├── npm install: 45s
└── electron-builder: 60s
```

### Cache Hit Rate

- **80%+**: Excellent (most builds cached)
- **50-80%**: Good (some cache reuse)
- **<50%**: Poor (frequent rebuilds)

### Memory Usage

- **Heap Used**: Active memory in use
- **Heap Total**: Total allocated heap
- **RSS**: Total process memory

---

## ✅ Success Indicators

### Build Successful
```
Status: SUCCESS
Exit Code: 0
All Successful: YES
```

### Build Partial Failure
```
Status: PARTIAL_FAILURE
windows: SUCCESS
linux-wsl: FAILED
```

### Build Failed
```
Status: FATAL_ERROR
Error: [error message]
```

---

## 🔧 Troubleshooting

### Build took too long
- Check cache hit rate (should be >50%)
- Check compression level (higher = slower)
- Check memory usage (should be <80% of total)

### Build failed
- Search for "error" or "failed" in log
- Check exit codes (should be 0 for success)
- Check platform-specific errors

### npm install slow
- Check cache hit rate
- Check network connectivity
- Consider clearing cache: `node scripts/build.js --clear-cache`

### Artifacts missing
- Check "Collecting Build Artifacts" section
- Verify dist directory exists
- Check for build errors

---

## 📋 Log Entry Format

Each log entry includes:

```
[HH:MM:SS.mmm] [+elapsed] [LEVEL] Message
```

Example:
```
[14:32:15.000] [+0s] [INFO] Platform: Windows Portable
[14:32:20.500] [+5.5s] [SUCCESS] npm install completed in 5s
[14:32:45.000] [+30s] [ERROR] Build failed: exit code 1
```

---

## 🎯 Key Metrics to Monitor

| Metric | Good | Warning | Bad |
|--------|------|---------|-----|
| Cache Hit Rate | >70% | 50-70% | <50% |
| Build Duration | <2m | 2-5m | >5m |
| Memory Usage | <50% | 50-80% | >80% |
| Artifact Size | <150MB | 150-200MB | >200MB |
| npm install | <1m | 1-2m | >2m |

---

## 💡 Tips

1. **Compare logs**: Compare recent logs to identify performance changes
2. **Archive logs**: Keep logs for historical analysis
3. **Automate analysis**: Create scripts to parse and analyze logs
4. **Monitor trends**: Track build times over multiple builds
5. **Share logs**: Include logs when reporting build issues

---

## 📞 Support

For build issues:
1. Check the build log in `BuildLogs/`
2. Search for "error" or "failed"
3. Note the platform and compression level
4. Include the log file when reporting issues

---

**Last Updated:** 2026-03-09  
**Build System Version:** 5.7  
**Logging System Version:** 1.0

