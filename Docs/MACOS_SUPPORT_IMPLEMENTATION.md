# 🍎 macOS Support Implementation Document

**Version:** 1.0.0  
**Date:** 2026-06-10  
**Status:** ✅ Active & Merged  

---

## 🎯 Overview

This document describes the implementation of complete macOS support for **Lightning Games**, enabling compilation of `.dmg` disk images and `.app` application bundles, and tailoring the tray-only integration specifically for macOS (Darwin) platforms.

---

## 📋 Implemented Changes

### 1. Build Configuration (`package.json`)
Added the macOS-specific configuration block under Electron-Builder (`build` key):
- **Target**: `["dmg", "dir"]` (DMG installer + unpacked `.app` bundle)
- **Icon**: `assets/icons/icon.icns` (1024x1024 master icon)
- **Category**: `public.app-category.games`
- **Hardened Runtime**: Enabled (`hardenedRuntime: true`) for macOS Gatekeeper compatibility.
- **LSUIElement**: Configured as `true` under `extendInfo` to completely hide the Dock icon (essential for tray-only background utility design).

### 2. Interactive Wizard Support (`scripts/build.js`)
Enhanced the build script (`scripts/build.js`):
- Added platform detection for `darwin` (`isMac`).
- Implemented `canBuildMac()` and `buildMac()` routines utilizing `electron-builder`.
- Updated the interactive platform selection wizard menu:
  - Option `[3] macOS DMG` (Requires running on macOS)
  - Option `[4] All Platforms` (Compiles Windows, Linux, and macOS depending on host support)
- Included `.dmg` extension matching inside `verifyArtifacts()` to output bundle metadata correctly after building.

### 3. macOS Window & Tray Behaviors (`main.js`)
- **Hotkey**: Standardized global hotkey registry to use `Command+Alt+G` on macOS (darwin) while preserving `Ctrl+Alt+G` on Windows/Linux.
- **Tray Menu**: Configured dynamic context menu label generation to reflect correct shortcut notation:
  - macOS: `🎮 Open (Cmd+Alt+G)`
  - Windows/Linux: `🎮 Open (Ctrl+Alt+G)`
- **Dock hiding**: Ensures `app.dock.hide()` triggers immediately upon ready stage.

### 4. Notarization Entitlements
Added XML property list definitions for proper sandbox execution and hardened runtime security compliance:
- **`entitlements.mac.plist`**: Grants standard process capabilities like JIT compiler usage (`com.apple.security.cs.allow-jit`) and unsigned memory allocation.
- **`entitlements.mac.inherit.plist`**: Propagates these security exceptions to Chromium renderer child processes.

---

## 🚀 How to Build

Run the standard build package commands:

```bash
# Using Bun (Recommended)
bun run dist

# Using npm (Fallback)
npm run dist
```

Select Option **`3`** for macOS DMG or Option **`4`** for all platforms. 

> [!NOTE]
> Compilation of DMG/app targets requires a macOS host machine or a GitHub Actions runner using `macos-latest`.
