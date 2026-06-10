# Lightning Games - macOS Support Implementation Plan

## Overview
Add complete macOS support (DMG + .app bundle) with individual commits for each step.

**Current State:** Windows (portable .exe) + Linux (AppImage via WSL)  
**Target State:** Windows + Linux + macOS (DMG + .app)

---

## Commit Plan

### 1. Add macOS Build Configuration to package.json
**Commit:** `build: add macOS electron-builder config`

- Add `mac` section to `package.json` build config
- Target: `dmg` + `dir` (for .app bundle)
- Icon: `assets/icons/icon.icns` (already exists)
- Category: `public.app-category.games`
- Hardened runtime + Gatekeeper preparation

### 2. Add macOS Platform to scripts/package.js
**Commit:** `scripts: add macOS platform to package.js`

- Add `mac` entry to `PLATFORMS` object
- Target: `dmg` (default), optionally `dir` for .app
- Use normal compression

### 3. Add macOS Platform to scripts/build.js (Interactive Wizard)
**Commit:** `build: add macOS platform selection to wizard`

- Add `[3] macOS DMG` / `[4] All Platforms` to platform selection
- Add `buildMac()` function using electron-builder
- Verify macOS artifacts (.dmg file)
- Handle platform availability check (only on macOS or CI)

### 4. Add macOS-Specific main.js Adjustments
**Commit:** `main: add macOS-specific window/tray behaviors`

- Already has `process.platform === 'darwin'` checks for:
  - `app.dock.hide()` - hide dock icon (tray-only app)
  - Login items support (`app.getLoginItemSettings()`)
- Verify all tray/menu functionality works on macOS
- Ensure global shortcut `Ctrl+Alt+G` works (may need `Command+Alt+G` on macOS)

### 5. Verify/Generate macOS Icons (ICNS)
**Commit:** `assets: verify macOS ICNS icon exists`

- Check `assets/icons/icon.icns` exists and is valid
- If missing, create from `assets/icon.png` (1024x1024)
- Ensure all required sizes in ICNS: 16, 32, 64, 128, 256, 512, 1024

### 6. Add macOS Notarization Preparation (Optional but Recommended)
**Commit:** `build: add notarization config for macOS`

- Add `entitlements.mac.plist` for hardened runtime
- Add `entitlements.mac.inherit.plist` for child processes
- Configure `electron-builder` notarization settings
- Add `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_ID_PASS` env vars documentation

### 7. Update README.md with macOS Installation Instructions
**Commit:** `docs: add macOS installation instructions`

- DMG installation steps
- Gatekeeper bypass instructions (`xattr -d com.apple.quarantine`)
- Launch from Applications folder

### 8. Test Build & Verify Artifacts
**Commit:** `build: test macOS build locally / CI`

- Run `node scripts/package.js mac` 
- Verify .dmg and/or .app created in `dist/`
- Verify app launches on macOS (or document CI requirement)

---

## File Changes Summary

| File | Change Type |
|------|-------------|
| `package.json` | Add `mac` build config |
| `scripts/package.js` | Add `mac` platform |
| `scripts/build.js` | Add macOS to wizard + build function |
| `main.js` | Verify macOS behaviors (likely no changes) |
| `assets/icons/icon.icns` | Verify/generate |
| `entitlements.mac.plist` | New file (optional) |
| `entitlements.mac.inherit.plist` | New file (optional) |
| `README.md` | Add macOS docs |

---

## Platform-Specific Notes

### macOS Differences from Windows/Linux
| Feature | Windows/Linux | macOS |
|---------|---------------|-------|
| Tray icon | 16x16 PNG | Template image (PDF/SVG preferred) |
| Dock | Shows by default | Hide with `app.dock.hide()` |
| Global shortcut | `Ctrl+Alt+G` | `Command+Alt+G` recommended |
| Startup | `app.setLoginItemSettings()` | Same API, works |
| Distribution | Portable .exe | DMG + .app bundle |
| Signing | Optional | Required for distribution |
| Notarization | N/A | Required for Gatekeeper |

### Electron-Builder macOS Config
```json
"mac": {
  "target": ["dmg", "dir"],
  "icon": "assets/icons/icon.icns",
  "category": "public.app-category.games",
  "hardenedRuntime": true,
  "gatekeeperAssess": false,
  "entitlements": "entitlements.mac.plist",
  "entitlementsInherit": "entitlements.mac.inherit.plist",
  "extendInfo": {
    "LSUIElement": true
  }
}
```

---

## Execution Order

Each commit should be atomic and testable:

```bash
# 1. Add package.json config
git add package.json && git commit -m "build: add macOS electron-builder config"

# 2. Add package.js platform
git add scripts/package.js && git commit -m "scripts: add macOS platform to package.js"

# 3. Add build.js wizard support
git add scripts/build.js && git commit -m "build: add macOS platform selection to wizard"

# 4. Verify main.js (likely no changes)
git add main.js && git commit -m "main: verify macOS tray/dock behaviors"

# 5. Verify icons
git add assets/icons/icon.icns && git commit -m "assets: verify macOS ICNS icon"

# 6. Add notarization (optional)
git add entitlements.mac.plist entitlements.mac.inherit.plist && git commit -m "build: add notarization config for macOS"

# 7. Update docs
git add README.md && git commit -m "docs: add macOS installation instructions"

# 8. Test build
git add . && git commit -m "build: test macOS build and verify artifacts"
```

---

## Testing Checklist

- [ ] `npm run dist` → Select macOS → Build succeeds
- [ ] `node scripts/package.js mac` → Creates .dmg in dist/
- [ ] .dmg mounts and shows .app bundle
- [ ] .app launches on macOS (test on actual Mac or CI)
- [ ] Tray icon appears in menu bar
- [ ] Global shortcut works (`Command+Alt+G`)
- [ ] Window shows/hides correctly
- [ ] Login item toggle works
- [ ] No console errors on launch

---

## Dependencies

No new npm dependencies required. Uses existing:
- `electron-builder` (already supports macOS)
- `electron` (already cross-platform)

---

## Notes for Implementer

1. **macOS build requires macOS** - Cannot build .dmg/.app on Windows/Linux without CI (GitHub Actions macOS runner)
2. **Icon.icns already exists** - Check `assets/icons/icon.icns` is valid 1024x1024 source
3. **Notarization needs Apple Developer account** - $99/year, can skip for testing
4. **Gatekeeper** - Unsigned apps need `xattr -d com.apple.quarantine` to run
5. **LSUIElement** - Set in Info.plist to hide dock icon (tray-only app)

---

## CI/CD Recommendation

Add GitHub Actions workflow for macOS builds:
```yaml
# .github/workflows/build-macos.yml
jobs:
  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run dist  # or node scripts/package.js mac
```

This plan is ready for execution by another agent.