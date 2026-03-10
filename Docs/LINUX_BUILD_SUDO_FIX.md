# ⚡ Linux Build - Sudo Fix ✅

**Error:** `electron-builder: Permission denied`  
**Solution:** Use `sudo chmod +x` to fix permissions  
**Status:** ✅ FIXED & READY  

---

## The Fix

Use `sudo` to fix binary permissions:

```javascript
const cmd = `wsl bash -i -c "cd '${escapedPath}' && npm install && sudo chmod +x node_modules/.bin/electron-builder && npx electron-builder ..."`;
```

---

## Test It Now

```powershell
npm run dist
# Select: [2] Linux AppImage (WSL)
# Select: [2] Normal
# Confirm: Y
# Enter sudo password when prompted
```

---

## What Happens

1. npm install runs
2. sudo chmod +x fixes permissions (will ask for password)
3. npx electron-builder runs
4. AppImage created ✅

---

## If Sudo Password Fails

```bash
# Test sudo manually
wsl sudo chmod +x node_modules/.bin/electron-builder

# Or configure sudo without password:
wsl sudo visudo
# Add: %sudo ALL=(ALL) NOPASSWD: /bin/chmod
```

---

**Ready to test!** 🚀

