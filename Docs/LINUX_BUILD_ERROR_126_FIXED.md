# ⚡ Linux Build Error 126 - FIXED ✅

**Error:** Exit code 126 (Permission Denied)  
**Cause:** npx/bunx permission issue in WSL  
**Fix:** Use npm exec / bun x instead  
**Status:** ✅ FIXED & READY TO TEST  

---

## What Was Wrong

```
✗ Linux build failed: Command failed with code 126
```

**Problem:** `npx` and `bunx` don't work reliably in WSL due to permission issues.

---

## The Fix

Changed from:
```bash
npx electron-builder --linux AppImage
bunx electron-builder --linux AppImage
```

To:
```bash
npm exec electron-builder -- --linux AppImage
bun x electron-builder --linux AppImage
```

**Why:** Built-in npm/bun commands work reliably in WSL, external tools don't.

---

## Test It Now

```powershell
# 1. Run build wizard
npm run dist

# 2. Select:
#    Platform: [2] Linux AppImage (WSL)
#    Compression: [2] Normal
#    Confirm: Y

# 3. Should work now! ✅
```

---

## If Still Fails

```bash
# Test npm exec manually
wsl npm exec electron-builder -- --linux AppImage

# Check npm version
wsl npm --version

# Check electron-builder installed
wsl npm list electron-builder
```

---

## Documentation

See: `Docs/LINUX_BUILD_ERROR_126_FIX.md` for full details.

---

**Ready to test!** 🚀

