# ⚡ Lightning Games - Automatic Version Update System

**Version:** 1.0  
**Date:** 2026-03-09  
**Status:** ✅ Active

---

## 🎯 Overview

The build wizard automatically updates the version number in both `package.json` and the app UI (`index.html`) when you enter a new version during the build process.

---

## 📋 What Gets Updated

When you enter a new version (e.g., `2.3.0`), the build wizard updates:

### 1. package.json
```json
{
  "name": "lightning-games",
  "version": "2.3.0",  ← Updated here
  "description": "⚡ Lightning Games..."
}
```

### 2. index.html (UI Display)
```html
<div class="title-bar">
  <span class="title-text">Lightning Games</span>
  <span class="title-version">v2.3.0</span>  ← Updated here
</div>
```

---

## 🚀 How It Works

### During Build Wizard

1. **Prompt for Version**
   ```
   Enter new version (or press Enter to keep current): 2.3.0
   ```

2. **Validation**
   - Checks format: `X.Y.Z` (semantic versioning)
   - Must be numbers only (e.g., `2.3.0`, not `v2.3.0`)

3. **Update Files**
   - Updates `package.json` → `"version": "2.3.0"`
   - Updates `index.html` → `v2.3.0`

4. **Confirmation**
   ```
   ✓ Version updated to 2.3.0
   ℹ Updated: package.json, index.html
   ```

---

## 📍 Where Version Appears

### In the App (Top-Left Corner)

```
┌─────────────────────────────────────┐
│ ⚡ Lightning Games v2.3.0           │  ← Here!
├─────────────────────────────────────┤
│                                     │
│     Quick Game Select               │
│                                     │
```

### In Build Output

```
dist/
├── Lightning Games 2.3.0.exe          ← Filename includes version
└── Lightning Games-2.3.0.AppImage     ← Filename includes version
```

---

## 🎨 Example Session

### Before Build

**package.json:**
```json
"version": "2.2.0"
```

**index.html:**
```html
<span class="title-version">v2.2.0</span>
```

**App UI:**
```
⚡ Lightning Games v2.2.0
```

### During Build

```
╔══ Version Configuration ══╗

  Current version: 2.2.0

  Enter new version: 2.3.0

✓ Version updated to 2.3.0
ℹ Updated: package.json, index.html
```

### After Build

**package.json:**
```json
"version": "2.3.0"
```

**index.html:**
```html
<span class="title-version">v2.3.0</span>
```

**App UI:**
```
⚡ Lightning Games v2.3.0
```

**Build Output:**
```
dist/
├── Lightning Games 2.3.0.exe
└── Lightning Games-2.3.0.AppImage
```

---

## 🔧 Technical Implementation

### Build Script (scripts/build.js)

```javascript
// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// Update index.html
const indexHtmlPath = path.join(projectRoot, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
indexHtml = indexHtml.replace(
  /<span class="title-version">v[\d.]+<\/span>/,
  `<span class="title-version">v${newVersion}</span>`
);
fs.writeFileSync(indexHtmlPath, indexHtml);

log.success(`Version updated to ${newVersion}`);
log.info(`Updated: package.json, index.html`);
```

### Regex Pattern

```javascript
/<span class="title-version">v[\d.]+<\/span>/
```

**Matches:**
- `<span class="title-version">v2.2.0</span>`
- `<span class="title-version">v2.3.0</span>`
- `<span class="title-version">v10.15.3</span>`

**Replaces with:**
- `<span class="title-version">v2.3.0</span>` (new version)

---

## ✅ Validation Rules

### Valid Versions

✅ `2.3.0` - Standard semantic version  
✅ `3.0.0` - Major version  
✅ `2.3.1` - Patch version  
✅ `10.15.3` - Multi-digit version  

### Invalid Versions

❌ `v2.3.0` - No 'v' prefix  
❌ `2.3` - Must have 3 parts  
❌ `2.3.0-beta` - No suffixes  
❌ `abc` - Must be numbers  

---

## 🎯 Use Cases

### 1. Patch Release (Bug Fixes)

```
Current: 2.2.0
New:     2.2.1

Changes: Bug fixes only
```

### 2. Minor Release (New Features)

```
Current: 2.2.1
New:     2.3.0

Changes: New features, backward compatible
```

### 3. Major Release (Breaking Changes)

```
Current: 2.3.0
New:     3.0.0

Changes: Major updates, breaking changes
```

---

## 📊 Version History Tracking

The version appears in multiple places:

1. **App UI** - Top-left corner
2. **package.json** - Project metadata
3. **Build filename** - `Lightning Games X.Y.Z.exe`
4. **Build logs** - BuildLogs/build-*.log
5. **Git commits** - Version bump commits

---

## 🛠️ Manual Version Update

If you need to update the version without building:

### Option 1: Use version.js script

```bash
node scripts/version.js 2.3.0
```

This updates `package.json` only.

### Option 2: Manual edit

1. Edit `package.json`:
   ```json
   "version": "2.3.0"
   ```

2. Edit `index.html`:
   ```html
   <span class="title-version">v2.3.0</span>
   ```

---

## 🎉 Summary

The automatic version update system ensures:

✅ **Consistency** - Version is updated everywhere  
✅ **Automation** - No manual editing needed  
✅ **Validation** - Only valid versions accepted  
✅ **Visibility** - Version shown in app UI  
✅ **Traceability** - Version in filenames and logs  

**One input, multiple updates:**

```
Enter version: 2.3.0
    ↓
package.json updated
    ↓
index.html updated
    ↓
Build created with version in filename
    ↓
App shows v2.3.0 in UI
```

---

**Built with ⚡ by Tarik**
