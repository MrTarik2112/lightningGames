# Linux (WSL) Build Verification Report

**Date:** 2026-03-10  
**Status:** ⚠️ CRITICAL ISSUES FOUND  
**Tested By:** Kiro  
**Environment:** Windows 10 (WSL not tested yet)

---

## Executive Summary

Linux (WSL) build functionality **has NOT been tested** in production. The build wizard includes WSL support code, but there are **several critical issues** that will likely cause failures:

1. **WSL Path Conversion Bug** - Incorrect path transformation
2. **Missing Dependencies** - Linux build tools not verified
3. **No Error Handling** - Failures won't be caught properly
4. **Untested Code Path** - No production validation

---

## Critical Issues Found

### 1. ⚠️ WSL Path Conversion Bug (Line 155 in build.js)

**Current Code:**
```javascript
const wslPath = `/mnt/c${projectRoot.substring(2).replace(/\\/g, '/')}`;
```

**Problem:**
- `projectRoot` = `C:\Users\tarik\Documents\lightningGames`
- `.substring(2)` removes `C:` → `\Users\tarik\Documents\lightningGames`
- Result: `/mnt/c\Users\tarik\Documents\lightningGames` ❌ (backslash not replaced!)

**Why It Fails:**
- The `.replace(/\\/g, '/')` happens AFTER `.substring(2)`
- But `.substring(2)` still has backslashes that need replacing
- WSL path becomes invalid: `/mnt/c\Users\...` (mixed slashes)

**Correct Implementation:**
```javascript
const wslPath = `/mnt/c${projectRoot.substring(2).replace(/\\/g, '/')}`;
// Should be:
const wslPath = `/mnt/${projectRoot[0].toLowerCase()}${projectRoot.substring(2).replace(/\\/g, '/')}`;
```

**Expected Result:**
- Input: `C:\Users\tarik\Documents\lightningGames`
- Output: `/mnt/c/Users/tarik/Documents/lightningGames` ✓

---

### 2. ⚠️ WSL Detection May Fail (Line 67 in build.js)

**Current Code:**
```javascript
function hasWSL() {
  if (!isWindows) return false;
  try {
    execSync('wsl --list', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return true;
  } catch {
    return false;
  }
}
```

**Potential Issues:**
- `wsl --list` might require `--verbose` flag on some systems
- WSL might be installed but no distros configured
- Command might hang if WSL is corrupted
- No timeout specified

**Better Implementation:**
```javascript
function hasWSL() {
  if (!isWindows) return false;
  try {
    // Check if wsl.exe exists
    execSync('where wsl', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    
    // Try to run a simple command
    execSync('wsl echo "test"', { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000  // 5 second timeout
    });
    return true;
  } catch {
    return false;
  }
}
```

---

### 3. ⚠️ Linux Build Command Issues (Line 155-160)

**Current Code:**
```javascript
const wslPath = `/mnt/c${projectRoot.substring(2).replace(/\\/g, '/')}`;
const cmd = `wsl bash -c "cd '${wslPath}' && ${builderCmd} --linux AppImage --config.compression=${compression}"`;

await runCommand(cmd, [], { shell: true });
```

**Problems:**
1. **Path quoting** - Single quotes might not work in WSL bash
2. **Command escaping** - `${builderCmd}` might contain special chars
3. **No error output** - If it fails, no useful error message
4. **Compression parameter** - Might not be recognized by electron-builder

**Better Implementation:**
```javascript
const wslPath = `/mnt/c${projectRoot.substring(2).replace(/\\/g, '/')}`;
const escapedPath = wslPath.replace(/'/g, "'\\''");  // Escape single quotes
const cmd = `wsl bash -c "cd '${escapedPath}' && ${builderCmd} --linux AppImage --config.compression=${compression}"`;

try {
  await runCommand(cmd, [], { shell: true });
  log.success('Linux build complete');
  return true;
} catch (err) {
  log.error(`Linux build failed: ${err.message}`);
  log.info('Troubleshooting:');
  log.info('1. Ensure WSL is installed: wsl --list --verbose');
  log.info('2. Ensure Ubuntu distro is installed');
  log.info('3. Try manual build: wsl bash -c "cd /mnt/c/... && npx electron-builder --linux AppImage"');
  return false;
}
```

---

### 4. ⚠️ Missing Linux Dependencies

**electron-builder** requires these tools on Linux:
- `dpkg` - Debian package tools
- `fakeroot` - For building packages
- `rpm` - For RPM packages (optional)
- `wine` - For Windows builds from Linux (optional)

**Current Status:** NOT VERIFIED

**What Happens If Missing:**
```
Error: dpkg not found
Error: fakeroot not found
Error: Cannot build AppImage without required tools
```

**Installation (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y dpkg fakeroot rpm
```

---

### 5. ⚠️ No Verification of Linux Build Output

**Current Code:**
```javascript
function verifyArtifacts() {
  // Only checks for .exe and .AppImage files
  for (const file of fs.readdirSync(distDir)) {
    if (file.endsWith('.exe') || file.endsWith('.AppImage')) {
      // ...
    }
  }
}
```

**Problem:**
- Doesn't verify file integrity
- Doesn't check if AppImage is executable
- Doesn't validate file size
- No checksum verification

---

## Testing Checklist

### Before Running Linux Build

- [ ] WSL is installed: `wsl --list --verbose`
- [ ] Ubuntu distro is configured
- [ ] Can run WSL commands: `wsl echo "test"`
- [ ] Linux build tools installed: `wsl sudo apt-get install -y dpkg fakeroot`
- [ ] npm/Bun installed in WSL: `wsl npm --version`
- [ ] Project accessible in WSL: `wsl ls /mnt/c/Users/tarik/Documents/lightningGames`

### Manual Linux Build Test

```bash
# 1. Open PowerShell
# 2. Run this command to test WSL path conversion:
wsl bash -c "cd /mnt/c/Users/tarik/Documents/lightningGames && pwd"

# 3. If path is correct, try building:
wsl bash -c "cd /mnt/c/Users/tarik/Documents/lightningGames && npx electron-builder --linux AppImage"

# 4. Check output:
ls -la dist/*.AppImage
```

---

## Recommended Fixes

### Priority 1: Fix WSL Path Conversion

**File:** `scripts/build.js` (Line 155)

```javascript
// BEFORE (BROKEN):
const wslPath = `/mnt/c${projectRoot.substring(2).replace(/\\/g, '/')}`;

// AFTER (FIXED):
const wslPath = `/mnt/${projectRoot[0].toLowerCase()}${projectRoot.substring(2).replace(/\\/g, '/')}`;
```

### Priority 2: Add WSL Validation

**File:** `scripts/build.js` (Line 67)

```javascript
function hasWSL() {
  if (!isWindows) return false;
  try {
    // Check if wsl.exe exists
    execSync('where wsl', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    
    // Try to run a simple command with timeout
    execSync('wsl echo "test"', { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000
    });
    return true;
  } catch {
    return false;
  }
}
```

### Priority 3: Add Linux Dependency Check

**New Function in `scripts/build.js`:**

```javascript
async function checkLinuxDependencies() {
  log.section('Checking Linux Dependencies');
  
  const deps = ['dpkg', 'fakeroot'];
  const missing = [];
  
  for (const dep of deps) {
    try {
      execSync(`wsl which ${dep}`, { stdio: ['pipe', 'pipe', 'pipe'] });
      log.success(`${dep} found`);
    } catch {
      missing.push(dep);
      log.warning(`${dep} not found`);
    }
  }
  
  if (missing.length > 0) {
    log.error(`Missing dependencies: ${missing.join(', ')}`);
    log.info('Install with: wsl sudo apt-get install -y ' + missing.join(' '));
    return false;
  }
  
  return true;
}
```

### Priority 4: Improve Error Handling

**File:** `scripts/build.js` (Line 138-172)

```javascript
async function buildLinux(compression, compressionName) {
  log.section('Building Linux AppImage (WSL)');
  
  if (!hasWSL()) {
    log.error('WSL not available - skipping Linux build');
    log.info('Install WSL: https://docs.microsoft.com/en-us/windows/wsl/install');
    return false;
  }

  // Check dependencies
  const depsOk = await checkLinuxDependencies();
  if (!depsOk) {
    log.error('Missing Linux dependencies');
    return false;
  }

  const pm = pmDetector.getPreferred();
  const builderCmd = pm === 'bun' ? 'bunx electron-builder' : 'npx electron-builder';
  
  try {
    const wslPath = `/mnt/${projectRoot[0].toLowerCase()}${projectRoot.substring(2).replace(/\\/g, '/')}`;
    const escapedPath = wslPath.replace(/'/g, "'\\''");
    const cmd = `wsl bash -c "cd '${escapedPath}' && ${builderCmd} --linux AppImage --config.compression=${compression}"`;
    
    log.step(`Running: ${cmd}`);
    await runCommand(cmd, [], { shell: true });
    log.success('Linux build complete');
    return true;
  } catch (err) {
    log.error(`Linux build failed: ${err.message}`);
    log.info('Troubleshooting:');
    log.info('1. Verify WSL: wsl --list --verbose');
    log.info('2. Test path: wsl bash -c "cd /mnt/c/... && pwd"');
    log.info('3. Check dependencies: wsl dpkg --version');
    log.info('4. Try manual build in WSL');
    return false;
  }
}
```

---

## Current Status Summary

| Component | Status | Issue |
|-----------|--------|-------|
| WSL Detection | ⚠️ Partial | May fail on some systems |
| Path Conversion | ❌ Broken | Backslash not replaced |
| Build Command | ⚠️ Untested | No production validation |
| Dependency Check | ❌ Missing | No verification |
| Error Handling | ⚠️ Weak | Limited error info |
| Linux Build | ❌ Untested | Never run in production |

---

## Conclusion

**Linux (WSL) build is NOT production-ready.** The code exists but has critical bugs and has never been tested. Before using:

1. ✅ Fix WSL path conversion bug
2. ✅ Add dependency checking
3. ✅ Improve error handling
4. ✅ Test manually in WSL
5. ✅ Validate AppImage output

**Recommendation:** Use Windows build only until Linux build is properly tested and fixed.

---

**Next Steps:**
1. Apply Priority 1 fix (path conversion)
2. Test manually: `npm run dist` → Select Linux option
3. Verify AppImage is created in `dist/`
4. Document any additional issues found

