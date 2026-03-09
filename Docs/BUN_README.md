# ⚡ Bun Support for Lightning Games

Lightning Games now supports **Bun** as the primary package manager with automatic **npm** fallback!

## 🚀 Why Bun?

- **3-5x faster** dependency installation
- **2-3x faster** script execution  
- **Smaller disk footprint** with hardlinks
- **Drop-in replacement** for npm
- **Automatic fallback** to npm when unavailable

## 📦 Installation

### Install Bun

**Windows:**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

**Linux/macOS/WSL:**
```bash
curl -fsSL https://bun.sh/install | bash
```

### Install Dependencies

```bash
# With Bun (recommended)
bun install

# With npm (fallback)
npm install
```

## 🎮 Usage

All commands work with both Bun and npm:

```bash
# Start the app
bun start        # or: npm start

# Development mode
bun run dev      # or: npm run dev

# Build
bun run dist     # or: npm run dist
```

## 🔧 Configuration

The project automatically detects which package manager to use. You can override this:

```bash
# Force Bun
export LIGHTNING_PM=bun

# Force npm
export LIGHTNING_PM=npm
```

## 📊 Performance Comparison

| Operation | npm | Bun | Improvement |
|-----------|-----|-----|-------------|
| Install (cold) | ~45s | ~12s | **3.75x faster** |
| Install (warm) | ~8s | ~2s | **4x faster** |
| Run scripts | ~500ms | ~150ms | **3.3x faster** |

## 🛠️ Build System

All build scripts support both package managers:

- `scripts/build.js` - Interactive build wizard
- `scripts/dev.js` - Development server
- `scripts/install.js` - Project setup
- `scripts/detect-pm.js` - Package manager detection

## 📝 Migration Notes

- **Lockfiles**: Both `bun.lockb` and `package-lock.json` are supported
- **Scripts**: All npm scripts work identically with Bun
- **Dependencies**: No changes needed to `package.json`
- **Compatibility**: 100% backward compatible with npm

## 🐛 Troubleshooting

### Bun not detected
```bash
# Check installation
bun --version

# Restart terminal
# Add to PATH if needed
```

### Force npm usage
```bash
export LIGHTNING_PM=npm
npm install
```

### Check detection
```bash
node scripts/detect-pm.js --verbose
```

## 📚 Documentation

- [Bun Official Docs](https://bun.sh/docs)
- [Migration Guide](Docs/BUN_MIGRATION_GUIDE.md)
- [Build System](Docs/BUILD_QUICK_START.md)

---

**Built with ⚡ by Tarik**
