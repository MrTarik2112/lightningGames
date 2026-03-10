# Linux (WSL) Build Testing Guide

**Last Updated:** 2026-03-10  
**Status:** Ready for Testing  
**Fixes Applied:** Path conversion, WSL detection, dependency checking

---

## Quick Start

### Prerequisites

1. **WSL Installed**
   ```powershell
   # Check if WSL is installed
   wsl --list --verbose
   
   # If not installed:
   wsl --install
   ```

2. **Ubuntu Distro Configured**
   ```powershell
   # List installed distros
   wsl --list --verbose
   
   # If Ubuntu not installed:
   wsl --install -d Ubuntu
   ```

3. **Linux Build Tools**
   ```bash
   # Run in WSL
   wsl sudo apt-get update
   wsl sudo apt-get install -y dpkg fakeroot
   ```

4. **npm/Bun in WSL**
   ```bash
   # Check npm
   wsl npm --version
   
   # If not installed:
   wsl sudo apt-get install -y npm
   ```

---

## Step-by-Step Testing

### Step 1: Verify WSL Setup

```powershell
# Test 1: Check WSL availability
wsl --list --verbose

# Expected output:
# NAME      STATE           VERSION
# Ubuntu    Running         2
```

```powershell
# Test 2: Test basic WSL command
wsl echo "WSL is working"

# Expected output:
# WSL is working
```

### Step 2: Verify Path Conversion

```powershell
# Test 3: Check if path conversion works
# This tests the fixed path conversion logic

$projectPath = "C:\Users\tarik\Documents\lightningGames"
$drive = $projectPath[0].ToLower()
$pathPart = $projectPath.Substring(2) -replace '\\', '/'
$wslPath = "/mnt/$drive$pathPart"

Write-Host "Windows path: $projectPath"
Write-Host "WSL path: $wslPath"

# Expected output:
# Windows path: C:\Users\tarik\Documents\lightningGames
# WSL path: /mnt/c/Users/tarik/Documents/lightningGames
```

```bash
# Test 4: Verify path is accessible in WSL
wsl bash -c "cd '/mnt/c/Users/tarik/Documents/lightningGames' && pwd"

# Expected output:
# /mnt/c/Users/tarik/Documents/lightningGames
```

### Step 3: Verify Linux Dependencies

```bash
# Test 5: Check dpkg
wsl which dpkg

# Expected output:
# /bin/dpkg
```

```bash
# Test 6: Check fakeroot
wsl which fakeroot

# Expected output:
# /usr/bin/fakeroot
```

```bash
# Test 7: If dependencies missing, install them
wsl sudo apt-get update
wsl sudo apt-get install -y dpkg fakeroot

# Expected output:
# Setting up dpkg (...)
# Setting up fakeroot (...)
```

### Step 4: Verify npm in WSL

```bash
# Test 8: Check npm version
wsl npm --version

# Expected output:
# 10.x.x (or similar)
```

```bash
# Test 9: Check if dependencies are installed
wsl bash -c "cd '/mnt/c/Users/tarik/Documents/lightningGames' && npm list electron-builder"

# Expected output:
# lightning-games@2.2.3 /mnt/c/Users/tarik/Documents/lightningGames
# └── electron-builder@24.13.3
```

### Step 5: Run Linux Build

```powershell
# Test 10: Run the build wizard
npm run dist

# Select options:
# 1. Version: Press Enter (keep current)
# 2. Platform: Select [2] Linux AppImage (WSL)
# 3. Compression: Select [2] Normal
# 4. Confirm: Y
```

### Step 6: Verify Build Output

```powershell
# Test 11: Check if AppImage was created
ls -la dist/*.AppImage

# Expected output:
# -rw-r--r-- 1 user group 99MB Mar 10 12:34 dist/Lightning Games 2.2.3.AppImage
```

```bash
# Test 12: Verify AppImage is executable
wsl bash -c "file '/mnt/c/Users/tarik/Documents/lightningGames/dist/Lightning Games 2.2.3.AppImage'"

# Expected output:
# /mnt/c/Users/tarik/Documents/lightningGames/dist/Lightning Games 2.2.3.AppImage: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, ...
```

---

## Troubleshooting

### Issue: "WSL not available"

**Cause:** WSL not installed or not working

**Solution:**
```powershell
# 1. Check if WSL is installed
wsl --list --verbose

# 2. If not installed, install it
wsl --install

# 3. If installed but not working, try:
wsl --shutdown
wsl --list --verbose
```

### Issue: "dpkg not found"

**Cause:** Linux build tools not installed

**Solution:**
```bash
wsl sudo apt-get update
wsl sudo apt-get install -y dpkg fakeroot
```

### Issue: "Path not found in WSL"

**Cause:** Path conversion failed

**Solution:**
```bash
# Test the path manually
wsl bash -c "cd '/mnt/c/Users/tarik/Documents/lightningGames' && pwd"

# If it fails, check:
# 1. Username is correct (tarik)
# 2. Path has no spaces or special characters
# 3. WSL can access Windows files
```

### Issue: "npm not found in WSL"

**Cause:** npm not installed in WSL

**Solution:**
```bash
wsl sudo apt-get update
wsl sudo apt-get install -y npm
```

### Issue: "electron-builder not found"

**Cause:** Dependencies not installed

**Solution:**
```bash
wsl bash -c "cd '/mnt/c/Users/tarik/Documents/lightningGames' && npm install"
```

### Issue: "Build hangs or times out"

**Cause:** WSL is slow or system is under load

**Solution:**
```powershell
# 1. Close other applications
# 2. Try again with lower compression:
npm run dist
# Select compression [1] Store (fastest)

# 3. If still hangs, try manual build:
wsl bash -c "cd '/mnt/c/Users/tarik/Documents/lightningGames' && npx electron-builder --linux AppImage"
```

---

## Manual Build (If Wizard Fails)

```bash
# 1. Open PowerShell
# 2. Run this command:
wsl bash -c "cd '/mnt/c/Users/tarik/Documents/lightningGames' && npx electron-builder --linux AppImage --config.compression=normal"

# 3. Wait for build to complete
# 4. Check output:
ls -la dist/*.AppImage
```

---

## Expected Build Times

| Compression | Time | Size |
|-------------|------|------|
| Store | ~5s | ~140MB |
| Normal | ~50s | ~105MB |
| Maximum | ~90s | ~85MB |
| ULTRA MEGA | ~3m | ~65MB |

---

## Success Criteria

✅ **Build is successful if:**
1. No errors in console output
2. AppImage file exists in `dist/`
3. AppImage file size is reasonable (~80-140MB)
4. AppImage is executable (ELF format)
5. Build time matches expected range

---

## Next Steps After Successful Build

1. **Test AppImage on Linux**
   ```bash
   # Copy to Linux machine or WSL
   ./dist/Lightning\ Games\ 2.2.3.AppImage
   ```

2. **Verify Functionality**
   - App launches
   - Games load
   - Settings work
   - Achievements display

3. **Document Results**
   - Create build report
   - Note any issues
   - Update documentation

---

## Reporting Issues

If build fails, provide:

1. **Error message** (full output)
2. **System info:**
   ```powershell
   wsl --list --verbose
   wsl uname -a
   wsl npm --version
   ```
3. **Build command used**
4. **Steps to reproduce**

---

## References

- [WSL Installation Guide](https://docs.microsoft.com/en-us/windows/wsl/install)
- [electron-builder Documentation](https://www.electron.build/)
- [Linux Build Requirements](https://www.electron.build/multi-platform-build#linux)

