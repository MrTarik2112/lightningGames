# ❓ Troubleshooting

Common issues and solutions for Lightning Games.

---

## 🚀 Getting Started

### App Won't Start

**Symptoms:** App doesn't open when running `npm start`

**Solutions:**
1. Check Node.js version (requires v16+)
   ```bash
   node -v
   ```
2. Delete node_modules and reinstall
   ```bash
   rm -rf node_modules
   npm install
   ```
3. Try with Bun instead
   ```bash
   bun install
   bun start
   ```

### Window Doesn't Appear

**Symptoms:** App runs but window is invisible

**Solutions:**
1. Check system tray icon
2. Press `Ctrl+Alt+G` to toggle visibility
3. Check display settings (may need admin rights)

---

## 🎮 Games

### Game Won't Start

**Solutions:**
1. Refresh the game list
2. Check browser console for errors (F12)
3. Try a different game
4. Restart the app

### Game Runs Slowly

**Solutions:**
1. Lower resolution scale in Settings → Display
2. Reduce particle density
3. Enable "Reduce motion"
4. Close other applications

### Controls Not Working

**Solutions:**
1. Click on the game canvas first
2. Check keyboard bindings in game
3. Try restarting the game

---

## 🔊 Audio

### No Sound

**Solutions:**
1. Check master volume in Settings → Audio
2. Check SFX and Music volume
3. Make sure "Mute on blur" isn't enabled unexpectedly
4. Refresh the page

### Sound Glitching

**Solutions:**
1. Close other audio applications
2. Lower audio volume slightly
3. Update audio drivers

---

## ⚙️ Settings

### Theme Won't Change

**Solutions:**
1. Wait a few seconds for theme to apply
2. Try selecting a different theme first
3. Restart the app

### Settings Not Saving

**Solutions:**
1. Close and reopen Settings
2. Check localStorage isn't full
3. Try "Export data" to backup, then "Hard reset" if needed

---

## 🔧 Build Issues

### Build Fails

**Solutions:**
1. Clear cache
   ```bash
   npm run build -- --clear-cache
   ```
2. Delete dist folder
   ```bash
   rm -rf dist
   npm run dist
   ```
3. Check Node.js version
4. Try with npm instead of bun

### Build Output Too Large

**Solutions:**
1. Use higher compression level (7-10)
2. Exclude unnecessary files from build
3. Use "Store" compression for testing (~140MB)

### Linux Build Errors

**Solutions:**
1. Use WSL2 instead of WSL1
2. Make sure rsync is installed in WSL
3. Check Docs/LINUX_BUILD_READY.md for detailed fixes

---

## 💾 Data

### Data Not Saving

**Solutions:**
1. Check localStorage available space
2. Export data as backup
3. Try hard reset if corrupted

### Import Fails

**Solutions:**
1. Make sure JSON file is valid
2. Check file encoding (UTF-8)
3. Try exporting fresh data and comparing formats

---

## 📊 Performance

### High CPU Usage

**Solutions:**
1. Lower resolution scale (70-80%)
2. Reduce particle density
3. Disable background animations
4. Update graphics drivers

### Slow Startup

**Solutions:**
1. Update to latest version (v3.8+ has optimizations)
2. Disable startup animations in settings
3. Check for conflicts with other apps

---

## 🔔 System Tray

### Tray Icon Missing

**Solutions:**
1. Check system tray settings
2. Restart the app
3. Check if app is running in background

### Hotkey Not Working

**Solutions:**
1. Try clicking on desktop first
2. Check if another app uses Ctrl+Alt+G
3. Run app as administrator

---

## ❓ Still Need Help?

1. Check GitHub Issues
2. Join Discord Community
3. Open a new Issue with:
   - Your OS and version
   - Node.js/Bun version
   - Steps to reproduce
   - Error messages

---

## 📋 Quick Commands Reference

```bash
# Install
npm install

# Run
npm start

# Build
npm run dist

# Clean build
rm -rf dist node_modules
npm install
npm run dist
```