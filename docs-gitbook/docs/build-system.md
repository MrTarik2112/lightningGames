# 🔧 Build System

Follow this guide to build and distribute the Lightning Games application.

---

## 🚀 Quick Commands

### Standard Build

```bash
npm run dist
```

This command starts an interactive wizard:
- Version selection
- Compression level
- Platform selection (Windows/Linux)

### Windows Only

```bash
npm run build:win
```

### Linux Only

```bash
npm run build:linux
```

### All Platforms

```bash
npm run build:all
```

---

## ⚡ Recommended Settings

### Development (Fastest)

| Setting | Value |
|---------|-------|
| Compression | 0-1 |
| Build Time | ~5-20 seconds |
| Output Size | ~140-125 MB |
| Use Case | Testing, quick iterations |

### Distribution (Balanced)

| Setting | Value |
|---------|-------|
| Compression | 3-4 |
| Build Time | ~50-70 seconds |
| Output Size | ~105-95 MB |
| Use Case | General releases |

### Maximum Compression

| Setting | Value |
|---------|-------|
| Compression | 10 |
| Build Time | ~15 minutes |
| Output Size | ~35 MB |
| Use Case | Bandwidth-limited distribution |

---

## 📊 Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| First Build | 90-120s | 60-80s | **33% faster** |
| Rebuild | 85-110s | 30-40s | **65% faster** |
| Cache Hit | 0% | 65-75% | **Automatic** |

---

## ✅ What's Optimized

### Smart Caching
- Automatic source code change detection
- node_modules reuse
- Cache statistics tracking

### Parallel npm Installation
- Concurrent package downloads
- 20-30% faster installation

### WSL Optimization
- rsync for incremental copying
- 40-50% faster WSL builds

---

## 💡 Tips

1. **Don't delete cache** - Between builds, cache reaches 65-75% hit rate
2. **Use Bun** - `bun run dist` is 3-5x faster
3. **Parallel build** - Build both platforms simultaneously

---

## 🐛 Troubleshooting

### Build Error

```bash
# Clean and retry
rm -rf dist node_modules
npm install
npm run dist
```

### Output Too Large

```bash
# Use maximum compression
npm run dist
# Select Compression: 10
```

### Linux Build Issue

For building on WSL:
- Use WSL2
- Make sure rsync is installed
- See Docs/LINUX_BUILD_READY.md for more info

---

## 📦 Output

When build completes:

```
dist/
├── Lightning Games X.Y.Z.exe    # Windows portable
└── Lightning Games-X.Y.Z.AppImage  # Linux AppImage
```

---

## ❓ Next Steps

- [Settings](settings.md) - Customize app settings
- [Troubleshooting](troubleshooting.md) - Common issues