# Build Artifacts Archive - User Guide

> **Version:** 3.0.0  
> **Feature:** Build History Preservation  
> **Status:** ✅ Active

---

## 📦 Overview

The build system now automatically archives old builds instead of deleting them. This allows you to:

- Keep previous versions for rollback
- Compare different builds
- Maintain build history
- Never lose a build accidentally

---

## 🗂️ Directory Structure

### Before (Old System)
```
dist/
├── Lightning Games.exe    # Latest build (overwrites previous)
└── Lightning Games.AppImage
```

### After (New System)
```
dist/
├── Lightning Games.exe    # Latest build
├── Lightning Games.AppImage
└── old/                   # Archive of previous builds
    ├── Lightning Games.exe (v2.9.0)
    ├── Lightning Games.exe (v2.8.5)
    ├── Lightning Games.AppImage (v2.9.0)
    └── Lightning Games.AppImage (v2.8.5)
```

---

## 🔄 How It Works

### Build Process

1. **Start Build**
   ```bash
   npm run dist
   ```

2. **Archive Old Builds**
   - System checks for existing artifacts in `dist/`
   - Finds all `.exe`, `.AppImage`, and `.dmg` files
   - Moves them to `dist/old/` folder
   - Replaces any duplicates in `dist/old/`

3. **Create New Build**
   - electron-builder creates new artifacts
   - Saves to `dist/` folder

4. **Result**
   - Latest build in `dist/`
   - Previous builds in `dist/old/`

### Example

**First Build:**
```
dist/
└── Lightning Games.exe (v3.0.0)
```

**Second Build:**
```
dist/
├── Lightning Games.exe (v3.0.1)  ← New
└── old/
    └── Lightning Games.exe (v3.0.0)  ← Archived
```

**Third Build:**
```
dist/
├── Lightning Games.exe (v3.0.2)  ← New
└── old/
    ├── Lightning Games.exe (v3.0.1)  ← Replaced
    └── Lightning Games.exe (v3.0.0)  ← Kept
```

---

## 💡 Use Cases

### 1. Quick Rollback
If a new build has issues, use the previous version:
```bash
# Latest build has a bug
# Use previous version from dist/old/
```

### 2. Version Comparison
Compare different builds side-by-side:
```bash
dist/
├── Lightning Games.exe (v3.0.2)  # Current
└── old/
    ├── Lightning Games.exe (v3.0.1)  # Previous
    └── Lightning Games.exe (v3.0.0)  # Older
```

### 3. Build History
Track all builds created:
```bash
# Check dist/old/ to see all previous versions
# Useful for debugging or release notes
```

### 4. Testing Multiple Versions
Test different versions without rebuilding:
```bash
# Keep multiple versions in dist/old/
# Test each one independently
```

---

## 🧹 Managing Old Builds

### View Old Builds
```bash
# List all archived builds
ls -la dist/old/

# On Windows
dir dist\old\
```

### Delete Specific Old Build
```bash
# Remove a specific old build
rm dist/old/Lightning\ Games.exe

# On Windows
del dist\old\Lightning Games.exe
```

### Clear All Old Builds
```bash
# Remove entire old builds folder
rm -rf dist/old/

# On Windows
rmdir /s /q dist\old\
```

### Automatic Cleanup (Optional)
To limit old builds, manually delete older ones:
```bash
# Keep only last 3 builds
# Delete older ones from dist/old/
```

---

## 📊 Storage Considerations

### Disk Space Usage

| Scenario | Space Used |
|----------|-----------|
| 1 build | ~105 MB |
| 2 builds | ~210 MB |
| 5 builds | ~525 MB |
| 10 builds | ~1.05 GB |

### Recommendations

- **Development:** Keep 2-3 old builds
- **Testing:** Keep 5-10 old builds
- **Production:** Keep 1-2 old builds
- **Archive:** Move old builds to external storage

---

## 🔍 Build Log Output

### Archive Process Log

```
╔══ Archive Old Builds ══╗
→ Archiving old builds...
✓ Created old builds archive directory
→ Moving 1 old artifact(s) to dist/old/
  → Archived: Lightning Games.exe
✓ Old builds archived successfully
```

### No Old Builds

```
╔══ Archive Old Builds ══╗
→ Archiving old builds...
ℹ No old artifacts to archive
✓ Old builds archived successfully
```

---

## ⚙️ Technical Details

### Archive Logic

```javascript
// 1. Create dist/old/ if it doesn't exist
if (!fs.existsSync(oldDir)) {
  fs.mkdirSync(oldDir, { recursive: true });
}

// 2. Find all artifacts in dist/
const artifacts = fs.readdirSync(distDir).filter(f => 
  (f.endsWith('.exe') || f.endsWith('.AppImage') || f.endsWith('.dmg')) && f !== 'old'
);

// 3. Move each artifact to dist/old/
artifacts.forEach(artifact => {
  const src = path.join(distDir, artifact);
  const dst = path.join(oldDir, artifact);
  
  // Replace if exists
  if (fs.existsSync(dst)) {
    fs.rmSync(dst, { force: true });
  }
  
  fs.renameSync(src, dst);
});
```

### File Replacement

- If a file with the same name exists in `dist/old/`, it's replaced
- This prevents duplicate files with different versions
- Latest version always overwrites older one with same name

---

## 🚀 Best Practices

### 1. Regular Cleanup
```bash
# Monthly cleanup
# Keep only last 3-5 builds
# Delete older ones from dist/old/
```

### 2. Version Naming
Use version numbers in your builds:
```bash
# Build v3.0.0
npm run dist
# Result: Lightning Games.exe (v3.0.0)

# Build v3.0.1
npm run dist
# Result: Lightning Games.exe (v3.0.1)
```

### 3. Archive Important Builds
```bash
# For important releases, copy to external storage
cp -r dist/old/ /backup/lightning-games-builds/
```

### 4. Document Versions
Keep notes about each build:
```
v3.0.2 - Bug fixes and performance improvements
v3.0.1 - Critical security patch
v3.0.0 - Major release with new features
```

---

## 🔧 Troubleshooting

### Old Builds Not Archiving

**Problem:** Old builds are deleted instead of archived

**Solution:** Check that `dist/old/` directory exists
```bash
# Create it manually if needed
mkdir -p dist/old
```

### Disk Space Issues

**Problem:** Too many old builds taking up space

**Solution:** Clean up old builds
```bash
# Remove all old builds
rm -rf dist/old/

# Or keep only recent ones
# Delete older files from dist/old/
```

### File Permission Issues

**Problem:** Cannot move files to `dist/old/`

**Solution:** Check file permissions
```bash
# On Linux/Mac
chmod 755 dist/old/

# On Windows, run as Administrator
```

---

## 📝 Summary

The build artifacts archive feature:

✅ **Preserves** all previous builds  
✅ **Prevents** accidental loss of builds  
✅ **Enables** easy rollback  
✅ **Maintains** build history  
✅ **Simplifies** version management  

Simply run `npm run dist` and your old builds are automatically archived!

---

**Built with ⚡ by Tarik**

*Feature added: 2026-03-09*
