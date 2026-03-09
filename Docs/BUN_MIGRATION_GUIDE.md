# 🚀 Bun Migration Guide for Lightning Games

> **Version:** 1.0  
> **Last Updated:** 2026-03-09  
> **Status:** Complete Migration with npm Fallback

---

## 📋 Overview

Lightning Games now supports **Bun** as the primary package manager while maintaining full **npm** compatibility as a fallback. This migration provides:

- ⚡ **3-5x faster** dependency installation
- 🔥 **2-3x faster** script execution
- 💾 **Smaller disk footprint** with hardlinks
- 🔄 **Automatic fallback** to npm when Bun is unavailable
- 🎯 **Zero breaking changes** - works with both package managers

---

## 🎯 Quick Start

### Option 1: Using Bun (Recommended)

```bash
# Install Bun (if not already installed)
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Linux/macOS/WSL
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Run the app
bun start

# Build
bun run dist
```

### Option 2: Using npm (Fallback)

```bash
# Install dependencies
npm install

# Run the app
npm start

# Build
npm run dist
```


---

## 🔧 Installation

### Installing Bun

#### Windows
```powershell
# PowerShell (Run as Administrator recommended)
powershell -c "irm bun.sh/install.ps1 | iex"

# Or using Scoop
scoop install bun

# Or using Chocolatey
choco install bun
```

#### Linux / WSL
```bash
curl -fsSL https://bun.sh/install | bash

# Or using Homebrew
brew install oven-sh/bun/bun
```

#### macOS
```bash
curl -fsSL https://bun.sh/install | bash

# Or using Homebrew
brew install bun
```

### Verifying Installation

```bash
# Check Bun version
bun --version

# Check npm version (fallback)
npm --version

# Run detection script
node scripts/detect-pm.js --verbose
```

---

## 📦 Package Manager Detection

The project automatically detects and uses the best available package manager:

1. **Environment Variable**: `LIGHTNING_PM=bun` or `LIGHTNING_PM=npm`
2. **Lockfile Detection**: Checks for `bun.lockb` or `package-lock.json`
3. **Availability**: Prefers Bun if installed, falls back to npm
4. **Manual Override**: Set `LIGHTNING_PM` environment variable

### Detection Script

```bash
# Show detection report
node scripts/detect-pm.js --verbose

# Get JSON output
node scripts/detect-pm.js --json

# Get specific command
node scripts/detect-pm.js --command install
```

