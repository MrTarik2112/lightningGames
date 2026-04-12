# ⚡ Lightning Games - Complete Technical Documentation

> **Version:** 2.4.0  
> **Last Updated:** 2026-04-05  
> **Author:** Tarik  
> **Status:** Production Ready  
> **Package Manager:** Bun + npm (auto-detect)  
> **Build System:** v6.0 - Interactive Wizard with Bun Support  

---

## 📋 1. Project Overview

**Lightning Games** is a lightweight, high-performance game launcher built with Electron that lives in the system tray. It provides instant access to 59 handcrafted arcade and puzzle games with a premium neon-themed UI, zero internet requirements, and 100% local data storage. The project is supported by a vibrant [Discord Community](https://discord.gg/hbNRTQFbjT).

### Core Philosophy
- **Instant Launch**: < 1s from hotkey to playable game
- **Zero Friction**: No accounts, no internet, no installation
- **Local First**: All data stored in localStorage, never leaves your machine
- **Vanilla Stack**: Pure JavaScript, HTML5 Canvas, no frameworks
- **Performance**: GPU-accelerated rendering, frame-independent physics

### Key Features
- 🎮 **59 Games** - 25 Arcade, 10 Puzzle, 3 Classic, 1 Strategy, 2 Creative + 18 more
- 🎯 **Achievement System** - 100+ unlockable achievements with rarity tiers
- 🏆 **High Scores** - Per-game persistent scoring with global leaderboard tracking
- 🌓 **11 Themes** - Neon (default), Retro, Minimal, Forest, Ocean, Sunset, Purple Haze, Matrix, Cyberpunk, Dark Blue, Fire
- 🔔 **System Tray Integration** - Global hotkey (Ctrl+Alt+G) from anywhere
- ⚡ **GPU Optimized** - Hardware acceleration, OOP rasterization, 60fps target
- 🔊 **Synthesized Audio** - 25+ procedurally generated sound effects, 8-bit music engine
- 📊 **Stats Tracking** - Play time, games played, unique games, consecutive streaks
- 🎨 **Neon Aesthetics** - Glassmorphism UI, particle effects, smooth animations
- 🔐 **Privacy** - 100% offline, no telemetry, no external connections

### Tech Stack
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | Electron | ^28.0.0 | Desktop application runtime |
| **Build Tool** | electron-builder | ^24.13.3 | Packaging & distribution |
| **Package Manager** | Bun / npm | Latest | Dependency management (auto-detect) |
| **Frontend** | Vanilla JavaScript | ES2020+ | Game logic & UI |
| **Rendering** | HTML5 Canvas | 2D Context | Game graphics |
| **Styling** | CSS3 | Variables & Grid | Responsive design |
| **Audio** | Web Audio API | Synthesized | Sound effects & music |
| **Storage** | localStorage | Browser API | Persistent data |
| **Icons** | Canvas + PNG-to-ICO | Programmatic | Tray & window icons |

---

## 📁 2. Complete File Structure

```
lightningGames/
│
├── 📄 Root Level Files (Configuration & Entry Points)
│   ├── main.js                  # Electron main process (173 lines)
│   │                             # - Window management & lifecycle
│   │                             # - System tray integration
│   │                             # - Global hotkey registration
│   │                             # - GPU optimization flags
│   │
│   ├── preload.js               # Secure IPC bridge (contextBridge)
│   │                             # - Exposes electronAPI to renderer
│   │                             # - closeWindow(), quitApp()
│   │                             # - onWindowHiding/Showing listeners
│   │
│   ├── index.html               # Single-page application shell
│   │                             # - Canvas container (880x540)
│   │                             # - Script includes for all games
│   │                             # - Minimal DOM structure
│   │
│   ├── package.json             # Project metadata & build config
│   │                             # - Dependencies (Electron, Builder)
│   │                             # - Build scripts (start, dist, dev)
│   │                             # - electron-builder configuration
│   │                             # - Version management
│   │
│   ├── package-lock.json        # Dependency lock file
│   ├── README.md                # User-facing documentation
│   ├── AGENTS.md                # Technical documentation (this file)
│   ├── LICENSE                  # MIT License
│   ├── .gitattributes           # Git configuration
│   └── context.md               # Project context reference
│
├── 🎮 games/ (41 Game Implementations)
│   ├── Arcade Games (25)
│   │   ├── snake.js             # Classic snake -- eat, grow, survive
│   │   ├── pacman.js            # Smooth Pac-Man with 4 ghosts, power pellets
│   │   ├── cyberdash.js         # Side-scrolling obstacle dodger
│   │   ├── tetris.js            # Block stacking with combos
│   │   ├── asteroids.js         # Thrust-physics space survival
│   │   ├── frogger.js           # Cross roads and rivers
│   │   ├── whackamole.js        # Click moles before they hide
│   │   ├── doodlejump.js        # Infinite vertical platformer
│   │   ├── runner.js            # Auto-runner with obstacles
│   │   ├── flappy.js            # Navigate through pipe gaps
│   │   ├── space.js             # Top-down shoot-em-up
│   │   ├── orbcollector.js      # Collect orbs, dodge mines
│   │   ├── skyfall.js           # Catch stars, dodge meteors
│   │   ├── lasergrid.js         # Survive laser patterns
│   │   ├── orbit.js             # Orbital path survival
│   │   ├── stacker.js           # Time drops to build tower
│   │   ├── colorrush.js         # Sprint to matching color
│   │   ├── blaster.js           # Defend against aliens
│   │   ├── pixelquest.js        # Dungeon crawl adventure
│   │   ├── bouncy.js            # Physics bounce game
│   │   ├── rhythmtap.js         # Hit notes on beat
│   │   ├── ninja.js             # Slice flying targets
│   │   ├── orbitdefense.js      # Protect orbital center
│   │   ├── gravityflip.js       # Flip gravity navigation
│   │   └── tapdash.js           # Quick-tap rhythm runner
│   │
│   ├── Puzzle Games (10)
│   │   ├── game2048.js          # Slide & merge tiles
│   │   ├── memory.js            # Flip & match pairs
│   │   ├── tictactoe.js         # 3x3 grid vs AI
│   │   ├── minesweeper.js       # Logic deduction
│   │   ├── simon.js             # Memotron -- repeat sequences
│   │   ├── wordquest.js         # Type word before time expires
│   │   ├── jewels.js            # Match 3+ gems
│   │   ├── hexpuzzle.js         # Place hexagonal tiles
│   │   ├── shapeshifter.js      # Match displayed shape
│   │   └── zigzag.js            # Navigate zig-zag path
│   │
│   ├── Classic Games (3)
│   │   ├── pong.js              # Solo paddle ball
│   │   ├── neonduel.js          # 2-player local pong
│   │   └── breakout.js          # Smash bricks
│   │
│   ├── Strategy (1)
│   │   └── towerdefense.js      # 8 towers, 6 enemies, 50+ waves (1,300+ lines)
│   │
│   └── Creative (2)
│       ├── piano.js             # Fully playable synthesizer
│       └── neondraw.js          # Freeform neon painting
│
├── 🎨 renderer/ (UI & Game Management)
│   ├── launcher.js              # Main UI engine (800+ lines)
│   │                             # - Game card grid & search
│   │                             # - Tab system (All, Arcade, Puzzle, etc.)
│   │                             # - Settings panel & theme switching
│   │                             # - Achievement display & notifications
│   │                             # - Favorites & sorting
│   │                             # - Stats dashboard
│   │
│   ├── gameManager.js           # Core game lifecycle (600+ lines)
│   │                             # - Game registration & instantiation
│   │                             # - requestAnimationFrame loop
│   │                             # - Score tracking & persistence
│   │                             # - Achievement unlock logic
│   │                             # - Stats aggregation
│   │                             # - High score management
│   │
│   ├── soundManager.js          # Procedural audio engine (400+ lines)
│   │                             # - Web Audio API synthesis
│   │                             # - 25+ sound effects
│   │                             # - 8-bit music generation
│   │                             # - Volume control & persistence
│   │
│   └── particles.js             # Background effects (200+ lines)
│                                 # - Animated neon particles
│                                 # - Parallax scrolling
│                                 # - Theme-aware colors
│
├── 📜 scripts/ (Build & Utilities)
│   ├── build.js                 # Interactive build wizard (800+ lines)
│   │                             # - Version prompting
│   │                             # - Compression level (0-10) with visual bars
│   │                             # - Platform selection (Windows, WSL, Docker)
│   │                             # - Parallel builds
│   │                             # - Progress bar & logging
│   │                             # - Release notes generation
│   │
│   ├── dev.js                   # Development server (100+ lines)
│   │                             # - Hot reload support
│   │                             # - Auto dependency check
│   │                             # - Debug mode enabled
│   │
│   ├── clean.js                 # Cleanup utility (150+ lines)
│   │                             # - Clean dist, cache, logs
│   │                             # - --all, --modules options
│   │                             # - Disk space reporting
│   │
│   ├── stats.js                 # Project statistics (180+ lines)
│   │                             # - Code line counts
│   │                             # - File counts by category
│   │                             # - Disk usage analysis
│   │
│   ├── test.js                  # Test suite (180+ lines)
│   │                             # - File existence checks
│   │                             # - Syntax validation
│   │                             # - Dependency verification
│   │
│   ├── validate.js              # Game validator (170+ lines)
│   │                             # - Required method checks
│   │                             # - Common issue detection
│   │                             # - Per-game or all-games mode
│   │
│   ├── lint.js                  # Code linter (170+ lines)
│   │                             # - No var keyword
│   │                             # - No == (use ===)
│   │                             # - No debugger statements
│   │                             # - Line length warnings
│   │
│   ├── package.js               # Quick packager (90+ lines)
│   │                             # - Platform-specific builds
│   │                             # - win, winzip, linux, deb, mac
│   │
│   ├── release.js               # Release manager (160+ lines)
│   │                             # - Version bumping
│   │                             # - Changelog generation
│   │
│   ├── install.js               # Setup script (170+ lines)
│   │                             # - Prerequisite checks
│   │                             # - Dependency installation
│   │                             # - Platform-specific setup
│   │
│   ├── info.js                  # Project info (150+ lines)
│   │                             # - Version & structure display
│   │                             # - System information
│   │                             # - Available scripts
│   │
│   ├── version.js               # Version bumper (70+ lines)
│   │                             # - major, minor, patch
│   │                             # - Specific version support
│   │
│   └── sync-icons.js            # Icon generator (150+ lines)
│                                 # - Multi-resolution PNG generation
│                                 # - ICO format conversion
│                                 # - ICNS format support
│
├── 📂 BuildLogs/ (Build History)
│   └── build-{timestamp}.log    # Timestamped build logs
│                                 # - Full stdout/stderr capture
│                                 # - Build duration & file size
│                                 # - Compression statistics
│
├── 🛠️ build-ui/ (Visual Build Wizard)
│   ├── src/                     # C++ Source Code
│   │   ├── main.cpp             # GLFW & Dear ImGui Window setup (High-DPI)
│   │   ├── app.cpp              # UI State & Rendering logic
│   │   └── build_runner.cpp     # Cross-platform sub-process management
│   ├── CMakeLists.txt           # CMake build configuration
│   ├── setup.sh                 # Linux/WSL compilation script
│   └── setup-win.sh             # Windows (MinGW) cross-compilation script
│
├── 📜 Root Scripts
│   ├── LightningBuildUI_Native.bat  # Fast launcher for Native Windows Build UI (.exe)
│   └── LightningBuildUI.bat         # Launcher for WSL Linux Build UI
│
├── 💅 styles/ (Design System)
│   └── main.css                 # Complete stylesheet (1,200+ lines)
│                                 # - CSS custom properties (50+)
│                                 # - 4 complete themes
│                                 # - Glassmorphism components
│                                 # - Animations & transitions
│                                 # - Responsive grid layout
│                                 # - Neon glow effects
│
├── 📦 assets/ (Visual Resources)
│   ├── icon.png                 # 256x256 main icon
│   ├── icon.ico                 # Windows icon format
│   └── icons/                   # Multi-resolution set
│       ├── 16x16.png            # Tray icon size
│       ├── 24x24.png
│       ├── 32x32.png
│       ├── 48x48.png
│       ├── 64x64.png
│       ├── 128x128.png
│       ├── 256x256.png
│       ├── 512x512.png
│       ├── 1024x1024.png
│       ├── icon.ico             # Windows executable icon
│       └── icon.icns            # macOS icon (future support)
│
├── 📦 dist/ (Build Output - Generated)
│   └── Lightning Games.exe      # Portable executable (~80-150MB)
│       └── win-unpacked/        # Unpacked application files
│
├── 📦 node_modules/ (Dependencies - Generated)
│   ├── electron/                # Desktop runtime
│   ├── electron-builder/        # Build tool
│   ├── canvas/                  # Icon generation
│   └── png-to-ico/              # Icon conversion
│
└── .crush/ (Crush CLI Data - Auto-generated)
    ├── crush.db                 # Local database
    ├── logs/
    │   └── crush.log            # CLI logs
    └── commands/                # Command cache
```

### File Statistics
- **Total Lines of Code**: ~8,700
- **Game Files**: 59 (avg 150-300 lines each)
- **Largest Game**: Tower Defense (1,300+ lines)
- **Renderer Code**: ~2,000 lines
- **Styles**: ~1,200 lines
- **Build Scripts**: ~450 lines
- **Zero External Dependencies** at runtime

---

## 🏗️ 3. Technical Architecture

### 3.1 Main Process (main.js) - 173 Lines

The Electron main process is the bridge between the OS and the renderer. It handles window lifecycle, system tray integration, and global hotkey registration.

#### GPU Optimization Flags
Applied before `app.ready()` to enable hardware acceleration:

```javascript
// Rasterization & Compositing
app.commandLine.appendSwitch('enable-gpu-rasterization');      // Tile rasterization on GPU
app.commandLine.appendSwitch('enable-oop-rasterization');      // Off-main-thread painting
app.commandLine.appendSwitch('enable-gpu-compositing');        // Layer compositing on GPU
app.commandLine.appendSwitch('enable-accelerated-video-decode'); // GPU video decode

// Timing & Throttling
app.commandLine.appendSwitch('disable-background-timer-throttle'); // Consistent timers when backgrounded
app.commandLine.appendSwitch('disable-renderer-backgrounding');    // Prevent renderer throttling

// Color Management
app.commandLine.appendSwitch('force-color-profile', 'srgb');   // Consistent color rendering
```

#### Window Configuration
```javascript
const mainWindow = new BrowserWindow({
    width: 960,                    // Fixed width
    height: 700,                   // Fixed height
    resizable: false,              // No resizing
    frame: false,                  // Frameless (custom title bar)
    transparent: true,             // Transparent background
    alwaysOnTop: true,             // Always visible
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,    // Security: disable node integration
        contextIsolation: true,    // Security: isolate context
        enableRemoteModule: false  // Security: disable remote module
    }
});
```

#### System Tray Integration
- **Icon**: Programmatically generated 16x16 cyan lightning bolt
- **Context Menu**:
  - Open (Ctrl+Alt+G)
  - Run at Startup (toggle)
  - Quit Completely
- **Behavior**: Single-click to toggle visibility

#### Global Shortcuts
| Shortcut | Action | Behavior |
|----------|--------|----------|
| `Ctrl+Alt+G` | Toggle window | Show if hidden, hide if visible |
| `Escape` | Hide window | Triggered from renderer via IPC |

#### Window Lifecycle
1. **Show**: Fade-in animation (350ms), position at cursor
2. **Hide**: Fade-out animation (350ms), minimize to tray
3. **Blur**: Auto-hide when focus lost (configurable)
4. **Close**: Minimize to tray (not exit)

#### Single Instance Lock
```javascript
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) app.quit();  // Prevent duplicate instances
```

### 3.2 Preload Script (preload.js) - Secure IPC Bridge

Uses `contextBridge` to safely expose IPC methods to the renderer without exposing the entire Node.js API.

```javascript
contextBridge.exposeInMainWorld('electronAPI', {
    // Window Control
    closeWindow: () => ipcRenderer.send('close-window'),
    quitApp: () => ipcRenderer.send('quit-app'),
    
    // Window Events
    onWindowHiding: (callback) => ipcRenderer.on('window-hiding', callback),
    onWindowShowing: (callback) => ipcRenderer.on('window-showing', callback)
});
```

**Security Model**:
- ✅ No `require()` access from renderer
- ✅ No `process` object access
- ✅ No file system access
- ✅ Only whitelisted IPC channels
- ✅ Context isolation enabled

### 3.3 Game Manager (gameManager.js) - 600+ Lines

Central engine managing the complete game lifecycle, scoring, achievements, and statistics.

#### Class Structure
```javascript
class GameManager {
    // Game Registry
    games = {};                    // { gameId: GameClass }
    activeGame = null;             // Currently playing game instance
    
    // Scoring & Achievements
    highScores = {};               // { gameId: score }
    achievements = [];             // [ achievementId, ... ]
    
    // User Preferences
    settings = {
        reducedMotion: false,      // Disable animations
        shakeIntensity: 5,         // Screen shake (0-10)
        renderScale: 1.0           // Canvas resolution (0.7-1.0)
    };
    favorites = [];                // [ gameId, ... ]
    theme = 'default';             // 'default' | 'retro' | 'minimal' | 'forest'
    volume = 0.7;                  // Master volume (0.0-1.0)
    
    // Statistics
    totalGamesPlayed = 0;          // Lifetime games
    totalPlayTime = 0;             // Lifetime seconds
    totalAsteroidsDestroyed = 0;   // Game-specific stat
    uniqueGamesPlayed = [];        // [ gameId, ... ]
    consecutiveGames = 0;          // Same game streak
    lastGameId = null;             // Most recent game
    lastPlayed = {};               // { gameId: timestamp }
}
```

#### Game Loop (requestAnimationFrame)
```javascript
startGameLoop() {
    const loop = (timestamp) => {
        // Frame-independent delta time with lag spike cap
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;
        
        // Update game state
        if (this.activeGame && !this.activeGame.instance.isGameOver()) {
            this.activeGame.instance.update(dt);
        }
        
        // Render game
        this.activeGame.instance.draw();
        
        // Check for game over
        if (this.activeGame.instance.isGameOver()) {
            this.endGame();
        }
        
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}
```

#### Achievement Unlock System
```javascript
checkAchievements(gameId, score) {
    // Normal achievements
    if (score >= 1000) this.unlockAchievement('score_1000');
    if (this.totalGamesPlayed >= 10) this.unlockAchievement('warmup');
    
    // Game-specific achievements
    if (gameId === 'snake' && score >= 100) this.unlockAchievement('snake_100');
    if (gameId === 'tetris' && score >= 500) this.unlockAchievement('tetris_500');
    
    // Ultra achievements (rare)
    if (this.totalGamesPlayed >= 50) this.unlockAchievement('marathon_runner');
    if (this.totalPlayTime >= 3600) this.unlockAchievement('addict');
    
    // Time-based achievements
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 8) this.unlockAchievement('night_owl');
}
```

#### Data Persistence
```javascript
saveProgress() {
    const data = {
        highScores: this.highScores,
        achievements: this.achievements,
        settings: this.settings,
        favorites: this.favorites,
        theme: this.theme,
        volume: this.volume,
        totalGamesPlayed: this.totalGamesPlayed,
        totalPlayTime: this.totalPlayTime,
        uniqueGamesPlayed: this.uniqueGamesPlayed,
        lastGameId: this.lastGameId,
        lastPlayed: this.lastPlayed
    };
    
    // Debounced write (250ms delay)
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
        localStorage.setItem('lg_data', JSON.stringify(data));
    }, 250);
}
```

### 3.4 Sound Manager (soundManager.js) - 400+ Lines

Procedurally generates all audio using the Web Audio API. No audio files, no external dependencies.

#### Synthesized Sound Effects (25+)

| Sound | Waveform | Technique | Used In |
|-------|----------|-----------|---------|
| `playClick()` | Triangle 440Hz | Single tone | UI clicks |
| `playHover()` | Sine 880Hz | Short blip | Card hover |
| `playJump()` | Square 200→600Hz | Frequency sweep up | Platformers |
| `playDeath()` | Sawtooth 400→80Hz | Frequency sweep down | Game over |
| `playShoot()` | Square 900→200Hz | Fast sweep down | Shooters |
| `playExplosion()` | White noise | Noise burst 250ms | Asteroid/TD |
| `playAchievement()` | Square chord | Multi-tone arpeggio | Achievement popup |
| `playEat()` | Multi-tone | Quick ascending pair | Snake |
| `playLineClear()` | Square sweep | Ascending sweep | Tetris |
| `playSlice()` | Sawtooth 1200→300Hz | Sharp sweep down | Ninja Slice |
| `playBounce()` | Triangle 300→600Hz | Gentle sweep up | Physics games |
| `playLaser()` | Sawtooth 1500→200Hz | Sci-fi sweep | Tower Defense |
| `playLevelUp()` | Square 400→1200Hz | Long sweep up | Level transitions |
| `playMatch()` | Sine chord | Harmonic pair | Puzzle matches |
| `playWin()` | Square arpeggio | Ascending 5-note | Victory |
| `playTick()` | Click 1000Hz | Percussive | Countdown |
| `playPowerUp()` | Sine sweep | Ascending glissando | Power-ups |

#### 8-Bit Music Engine
```javascript
generateBackgroundMusic(gameId) {
    const noteMap = {
        'snake': [262, 294, 330, 349, 392],      // C D E F G
        'tetris': [330, 392, 440, 494],          // E G A B
        'asteroids': [220, 247, 262, 294]        // A B C D
    };
    
    const notes = noteMap[gameId] || [262, 294, 330, 349];
    let noteIndex = 0;
    
    setInterval(() => {
        const frequency = notes[noteIndex % notes.length];
        this.playTone(frequency, 0.2, 0.3);  // freq, volume, duration
        noteIndex++;
    }, 400);  // 150 BPM
}
```

#### Volume Control
```javascript
setVolume(level) {
    this.masterVolume = Math.max(0, Math.min(1, level));
    this.gainNode.gain.value = this.masterVolume;
    localStorage.setItem('lg_volume', this.masterVolume);
}
```

### 3.5 Launcher UI (launcher.js) - 800+ Lines

The main user interface engine handling game selection, search, filtering, settings, and achievement display.

#### Key Components
- **Game Grid**: Responsive card layout with hover effects
- **Search Bar**: Real-time fuzzy matching
- **Tab System**: All, Arcade, Puzzle, Classic, Strategy, Creative
- **Settings Panel**: Theme, volume, render scale, motion preferences
- **Achievement Display**: Toast notifications + achievement list
- **Stats Dashboard**: Lifetime stats, play time, unique games
- **Favorites System**: Pin/unpin games for quick access

#### Event Delegation Pattern
```javascript
// Single listener on grid, not per-card (better performance)
gameGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.game-card');
    if (!card) return;
    
    const gameId = card.dataset.gameId;
    if (e.target.closest('.favorite-btn')) {
        this.toggleFavorite(gameId);
    } else {
        this.launchGame(gameId);
    }
});
```

### 3.6 Particle Effects (particles.js) - 200+ Lines

Animated background effects that adapt to the current theme.

```javascript
class ParticleSystem {
    particles = [];
    
    update(dt) {
        this.particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    draw(ctx) {
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1;
    }
}
```

### 3.7 Build Wizard C++ Engine (build-ui) - High Performance GUI

The project includes a fully featured, cross-platform visual build wizard written in C++ using Dear ImGui, completely replacing the legacy `build.js` terminal script with a premium neon-themed desktop application.

#### Architecture Highlights
- **Framework**: C++20 standard, using Dear ImGui (v1.91.8) for immediate mode UI rendering, and GLFW for window management.
- **High-DPI Rendering**: Natively reads Windows DPI scaling (`SetProcessDPIAware()`) and applies dynamic font scaling using the Windows system font (`segoeui.ttf`) for pristine 4K resolution clarity.
- **Cross-Platform Process Sandbox**: Uses `build_runner.cpp` to run the active build process asynchronously on a separate std::thread.
  - **Linux / WSL**: Uses POSIX `fork()`, `exec()`, and `pipe()` to stream stdout/stderr.
  - **Windows Native**: Uses Win32 API `CreateProcessA()` and `CreatePipe()` for deep native integration.
- **State Management**: Uses `nlohmann/json` to directly interface with the Electron `package.json` for live-saving version numbers and detecting targets.
- **Compilation Toolchain**: Provided two bash scripts:
  - `setup.sh`: Uses standard `g++` to compile into an ELF binary for WSL.
  - `setup-win.sh`: Uses `x86_64-w64-mingw32-g++` (MinGW) via CMake to cross-compile a standalone `lightning-build-ui.exe` static executable requiring zero external `.dll` files.

---

## 🎮 4. Complete Game List (59 Games) - Detailed Reference

All games run on an **880x540 HTML5 Canvas** with synthesized audio and neon visuals.

### Game Registry by Category

#### Arcade Games (25 Total)
Fast-paced, reflex-based gameplay with increasing difficulty curves.

| # | ID | Name | Icon | Difficulty | Mechanics | Best For |
|---|-----|------|------|:----------:|-----------|----------|
| 1 | `snake` | Snake | 🐍 | ⭐⭐ | Grid movement, self-collision | Quick sessions |
| 2 | `cyberdash` | Cyber Dash | ⚡ | ⭐⭐⭐ | Horizontal dodging, energy pickups | Reflexes |
| 3 | `tetris` | Tetris | 🧱 | ⭐⭐⭐ | Block rotation, line clearing | Spatial reasoning |
| 4 | `asteroids` | Asteroids | ☄️ | ⭐⭐⭐⭐ | Thrust physics, rotation, shooting | Physics mastery |
| 5 | `frogger` | Frogger | 🐸 | ⭐⭐⭐ | Timing, obstacle avoidance | Precision |
| 6 | `whackamole` | Whack-A-Mole | 🔨 | ⭐⭐ | Click speed, pattern recognition | Mouse control |
| 7 | `doodlejump` | Neon Jump | 🎈 | ⭐⭐ | Vertical platforming, momentum | Relaxation |
| 8 | `runner` | Neon Runner | 🦖 | ⭐⭐⭐ | Auto-running, obstacle timing | Endurance |
| 9 | `flappy` | Flappy Bird | 🐦 | ⭐⭐⭐ | Tap timing, gap navigation | Frustration tolerance |
| 10 | `space` | Space Shooter | 🚀 | ⭐⭐⭐ | Top-down shooting, wave management | Bullet hell |
| 11 | `orbcollector` | Orb Collector | 🟡 | ⭐⭐⭐ | Collection, mine avoidance | Risk/reward |
| 12 | `skyfall` | SkyFall | ⭐ | ⭐⭐ | Catching, dodging | Casual play |
| 13 | `lasergrid` | Laser Grid | 🧊 | ⭐⭐⭐⭐ | Pattern dodging, timing | Extreme difficulty |
| 14 | `orbit` | Orbit | 🛰️ | ⭐⭐⭐ | Orbital mechanics, debris avoidance | Physics |
| 15 | `stacker` | Stacker | 🏗️ | ⭐⭐⭐ | Timing, tower building | Precision |
| 16 | `colorrush` | Color Rush | 🎨 | ⭐⭐⭐ | Color matching, speed | Perception |
| 17 | `blaster` | Blaster | 🔫 | ⭐⭐⭐ | Shooting, wave defense | Strategy |
| 18 | `pixelquest` | Pixel Quest | 🏰 | ⭐⭐⭐ | Exploration, combat | Adventure |
| 19 | `bouncy` | Bouncy Ball | ⚽ | ⭐⭐ | Physics, trick shots | Relaxation |
| 20 | `rhythmtap` | Rhythm Tap | 🎵 | ⭐⭐⭐ | Rhythm, timing | Music lovers |
| 21 | `ninja` | Ninja Slice | 🥷 | ⭐⭐ | Slicing, precision | Casual |
| 22 | `orbitdefense` | Orbit Defense | 🛡️ | ⭐⭐⭐ | Defense, positioning | Strategy |
| 23 | `gravityflip` | Gravity Flip | 🔄 | ⭐⭐⭐ | Gravity mechanics, navigation | Puzzle-action |
| 24 | `tapdash` | Tap Dash | 👆 | ⭐⭐ | Quick taps, rhythm | Casual |
| 25 | `pacman` | Pac-Man | 👻 | ⭐⭐⭐ | Smooth movement, 4 smart ghosts, power pellets, fruit system | Classic arcade |
| 26 | `neonbrawl` | Neon Brawl | 🥊 | ⭐⭐⭐ | Beat 'em up, combo system, dash attack | Action |

#### Puzzle Games (10 Total)
Strategic, thinking-based gameplay with no time pressure (mostly).

| # | ID | Name | Icon | Difficulty | Mechanics | Best For |
|---|-----|------|------|:----------:|-----------|----------|
| 1 | `game2048` | 2048 | ✨ | ⭐⭐⭐ | Tile merging, strategy | Math lovers |
| 2 | `memory` | Memory Match | 🧠 | ⭐⭐ | Card matching, memory | Concentration |
| 3 | `tictactoe` | Tic-Tac-Toe | ❌ | ⭐ | Grid strategy, AI opponent | Beginners |
| 4 | `minesweeper` | Minesweeper | 💣 | ⭐⭐⭐⭐ | Logic deduction, flagging | Logic puzzles |
| 5 | `simon` | Memotron | 🎛️ | ⭐⭐⭐ | Sequence memory, pattern | Memory training |
| 6 | `wordquest` | Word Quest | 📝 | ⭐⭐⭐ | Typing, vocabulary | Word lovers |
| 7 | `jewels` | Jewel Match | 💎 | ⭐⭐ | Match-3, swapping | Casual puzzle |
| 8 | `hexpuzzle` | Hex Puzzle | 🔶 | ⭐⭐⭐ | Tile placement, lines | Spatial |
| 9 | `shapeshifter` | Shape Shifter | 🔺 | ⭐⭐ | Shape matching, speed | Perception |
| 10 | `zigzag` | Zig Zag | 〰️ | ⭐⭐ | Path navigation, collection | Casual |

#### Classic Games (3 Total)
Timeless arcade classics, neon-ified.

| # | ID | Name | Icon | Players | Mechanics | Best For |
|---|-----|------|------|:-------:|-----------|----------|
| 1 | `pong` | Squash Pong | 🏓 | 1 | Paddle control, ball physics | Solo play |
| 2 | `neonduel` | Neon Duel | ⚔️ | **2** | Local multiplayer, competitive | Couch gaming |
| 3 | `breakout` | Breakout | 🧱 | 1 | Brick breaking, ball control | Nostalgia |

#### Strategy (1 Total)
Deep, long-session gameplay with resource management.

| # | ID | Name | Icon | Depth | Mechanics | Best For |
|---|-----|------|------|:-----:|-----------|----------|
| 1 | `towerdefense` | Tower Defense | 🗼 | ⭐⭐⭐⭐⭐ | 8 towers, 6 enemies, waves, abilities | Strategic thinkers |

#### Creative (2 Total)
No score, no pressure. Pure expression.

| # | ID | Name | Icon | Mechanics | Best For |
|---|-----|------|------|-----------|----------|
| 1 | `piano` | Neon Piano | 🎹 | Keyboard synthesis, note playing | Musicians |
| 2 | `neondraw` | Neon Draw | ✏️ | Freeform drawing, color mixing | Artists |

### Game Metadata Schema
```javascript
{
    id: 'gameid',                    // Unique identifier
    icon: '🎮',                      // Emoji icon
    name: 'Game Name',               // Display name
    desc: 'Short description',       // Card description
    category: 'arcade',              // arcade | puzzle | classic | strategy | creative
    color: '--accent-cyan',          // CSS variable for theme color
    glowColor: 'rgba(...)',          // Glow effect color
    borderColor: 'rgba(...)',        // Border color
    shadowColor: '0 0 30px...'       // Shadow/glow effect
}
```

---

## 🏰 5. Tower Defense - Complete Strategic Guide

The crown jewel of Lightning Games. A complete tower defense experience with 1,300+ lines of code, 8 unique tower types, 6 enemy classes, 3 super abilities, and an endless mode that scales infinitely.

### Tower Types (8 Total) - Detailed Analysis

| Tower | Icon | Cost | Range | DPS | Fire Rate | Special Ability | Best Against | Strategy |
|-------|------|------|-------|-----|-----------|-----------------|--------------|----------|
| **Laser** | ⚡ | $75 | 140px | 75 | 3/sec | Single target | Normal enemies | Early game workhorse |
| **Cannon** | 💥 | $125 | 120px | 60 | 1/sec | 60px AoE splash | Grouped enemies | Area control |
| **Cryo** | ❄️ | $100 | 100px | 30 | 2/sec | 50% slow for 3s | Fast enemies | Crowd control |
| **Sniper** | 🎯 | $200 | 250px | 75 | 0.5/sec | Pierces 3 enemies | Bosses | Long-range support |
| **Tesla** | 🔷 | $175 | 110px | 140 | 4/sec | Chain to 3 targets | Swarms | Swarm killer |
| **Missile** | 🚀 | $300 | 180px | 84 | 0.7/sec | Homing + 80px splash | Tanks | Versatile |
| **Aura** | ✨ | $150 | 100px | 0 | - | +30% damage to nearby | Support role | Multiplier |
| **Venom** | 🐍 | $160 | 130px | 15 | 1.5/sec | Poison over time | Healers | Sustained damage |

### Enemy Types (6 Total) - Behavioral Analysis

| Enemy | Icon | HP | Speed | Reward | Scaling | Behavior | Counter |
|-------|------|-----|-------|--------|---------|----------|---------|
| **Normal** | 🔴 | 40 | 50 | $8 | Linear | Standard path follower | Laser towers |
| **Fast** | 🟡 | 25 | 90 | $6 | Linear | Nearly 2x speed | Cryo + Tesla |
| **Tank** | 🟣 | 150 | 30 | $20 | Quadratic | Slow-moving HP sponge | Sniper + Missile |
| **Boss** | 👑 | 500 | 25 | $100 | Exponential | Appears every 10 waves | Nuke ability |
| **Healer** | 🟢 | 60 | 40 | $15 | Linear | Regenerates nearby allies | Venom + Sniper |
| **Flying** | 🔵 | 35 | 70 | $10 | Linear | Ignores ground path | Tesla + Missile |

**Scaling Formula**: `baseHP * (1 + wave * 0.15)` for Normal enemies

### Super Abilities (3 Total) - Tactical Use

| Ability | Icon | Cooldown | Effect | Cost | Best Used |
|---------|------|----------|--------|------|-----------|
| **Nuke** | 💥 | 60s | 200 damage to **ALL** enemies | Free | Boss waves (10, 20, 30...) |
| **Slow Field** | ❄️ | 30s | All enemies 30% speed for 5s | Free | Overwhelming swarms |
| **Damage Boost** | ⚡ | 45s | All towers 2x damage for 10s | Free | Combined with Nuke |

### Wave Progression & Difficulty Curve

```
Waves 1-10:   Introduction phase
  - Mostly Normal enemies
  - First Boss at wave 10
  - Goal: Build foundation

Waves 11-25:  Escalation phase
  - Mix of Normal, Fast, Tank
  - Bosses every 10 waves
  - Goal: Expand tower network

Waves 26-40:  Intensity phase
  - Healers and Flying enemies
  - Rapid enemy scaling
  - Goal: Optimize tower placement

Waves 41-50:  Endgame phase
  - All enemy types present
  - Extreme HP/speed scaling
  - Goal: Reach endless mode

Waves 50+:    Endless mode
  - Infinite wave generation
  - Exponential scaling
  - Goal: Survive as long as possible
```

### Strategy Guide by Phase

#### Early Game (Waves 1-15)
```
1. Build 2-3 Laser towers at first bend
2. Add Cryo tower at second chokepoint
3. Save money -- don't overbuild
4. Use Nuke on first Boss (wave 10)
5. Target: $500+ by wave 15
```

#### Mid Game (Waves 16-35)
```
1. Introduce Sniper towers for long-range
2. Place Aura tower between Laser cluster
3. Start saving Nuke for boss waves
4. Add Tesla for Fast enemy swarms
5. Target: $2000+ by wave 35
```

#### Late Game (Waves 36-50)
```
1. Tesla towers handle Fast swarms
2. Missile towers for Tank/Boss combos
3. Venom for sustained damage
4. Combine Slow + Nuke on bosses
5. Target: Reach wave 50 for endless
```

#### Endless Mode (Wave 50+)
```
1. All stats scale infinitely
2. Prioritize Aura + Sniper combos
3. Use Slow Field + Nuke together
4. Press T for 3x speed between waves
5. Goal: Personal best survival time
```

### Advanced Tactics

**Tower Synergies**:
- Aura + Laser cluster = 30% damage boost to all
- Cryo + Tesla = Slowed enemies take more chain hits
- Sniper + Missile = Piercing + homing coverage
- Venom + Healer = Poison damage > healing

**Placement Patterns**:
- **Chokepoint Defense**: Concentrate towers at path bends
- **Layered Defense**: Multiple tower types at same location
- **Perimeter Defense**: Ring of towers around map edges
- **Focused Fire**: All towers targeting same enemy type

**Economy Management**:
- Early: Spend 80% of income, save 20%
- Mid: Spend 70%, save 30%
- Late: Spend 60%, save 40% for emergencies
- Endless: Spend 50%, save 50% for upgrades

### Game Features

**Fast Forward**: Press `T` to toggle game speed
- 1x: Normal speed (default)
- 2x: Double speed
- 3x: Triple speed (useful between waves)

**Endless Mode**: Unlocked after reaching wave 50
- Waves continue infinitely
- Enemy stats scale exponentially
- Personal best tracking

**Dynamic Health Bars**: 
- Visible on all enemies
- Turn green when poisoned
- Show damage numbers on hit

**Wave Rewards**:
- Completing wave = $8 base + enemy kills
- Boss kills = $100 bonus
- Healer kills = $15 bonus
- Flying kills = $10 bonus

---

## 🏅 6. Achievement System - Complete Reference (37 Total)

A comprehensive achievement system with rarity tiers, unlock conditions, and progression tracking.

### Achievement Rarity Tiers

| Tier | Rarity | Unlock Rate | Characteristics |
|------|--------|------------|-----------------|
| **Normal** | Common | 50%+ | Unlocked through regular gameplay |
| **Ultra** | Rare | 10-50% | Requires dedication or skill |
| **Hidden** | Secret | <5% | Unlocked through specific actions |
| **Godly** | Legendary | <1% | Requires completing all achievements |

### Normal Achievements (12 Total)

Unlock these through regular gameplay. Most players will unlock 5-8 of these.

| ID | Title | Description | Icon | Unlock Condition |
|----|-------|-------------|------|------------------|
| `first_game` | Welcome! | You launched your first game | 🎮 | Play any game once |
| `record_breaker` | Record Breaker! | You broke a record | 🏆 | Beat any previous high score |
| `score_1000` | Master Player | You reached 1000 points | 🔥 | Score 1000+ in any game |
| `snake_100` | Snake Tamer | Scored 100 points in Snake | 🐍 | Score 100+ in Snake |
| `tetris_500` | Architect | Scored 500 points in Tetris | 🧱 | Score 500+ in Tetris |
| `simon_10` | Memory Apprentice | Scored 10 points in Memotron | 🧠 | Score 10+ in Memotron |
| `minesweeper_win` | Mine Expert | Cleared a challenging minefield | 💣 | Win a Minesweeper game |
| `runner_high` | Fast Runner | Scored 500 in Neon Runner | 🦖 | Score 500+ in Neon Runner |
| `frogger_master` | Frogger Master | Crossed the road in Frogger! | 👑 | Win a Frogger game |
| `pacman_100` | Pellet Eater | Scored 100 points in Pac-Man | 👻 | Score 100+ in Pac-Man |
| `warmup` | Warmup Done | Played a total of 10 games | 🔥 | Play 10 games total |
| `first_rock` | First Rock | Destroyed an asteroid for the first time | 🪨 | Destroy 1 asteroid in Asteroids |

### Ultra Achievements - Dedication Tier (7 Total)

Require consistent play and time investment.

| ID | Title | Description | Icon | Unlock Condition |
|----|-------|-------------|------|------------------|
| `marathon_runner` | Marathon Runner | Played a total of 50 games | 🏃 | Play 50 games total |
| `no_life` | Non-Stop | Played a total of 100 games | ⚡ | Play 100 games total |
| `addict` | Addict | Total playtime exceeded 1 hour | 💊 | Accumulate 3600+ seconds |
| `persistent` | Persistent | Played the same game 5 times in a row | 🔄 | Play same game 5 consecutive times |
| `explorer` | Explorer | Played 10 different games | 🗺️ | Play 10 unique games |
| `socialite` | Socialite | Switched tabs 10 times | 📱 | Switch launcher tabs 10 times |
| `collector` | Collector | Unlocked 15 achievements | 👑 | Unlock 15 achievements total |

### Ultra Achievements - Time-Based Tier (3 Total)

Require playing at specific times of day.

| ID | Title | Description | Icon | Unlock Condition |
|----|-------|-------------|------|------------------|
| `night_owl` | Night Owl | Played a game after 10 PM | 🦉 | Play game between 22:00-23:59 |
| `early_bird` | Early Bird | Played a game before 8 AM | 🐤 | Play game between 00:00-07:59 |
| `weekend_warrior` | Weekend Warrior | Played on Saturday or Sunday | ⚔️ | Play game on weekend |

### Ultra Achievements - Skill-Based Tier (15 Total)

Require high scores, speed, or specific accomplishments.

| ID | Title | Description | Icon | Unlock Condition |
|----|-------|-------------|------|------------------|
| `snake_charmer` | Snake Charmer | Scored 250 points in Snake | 🐍 | Score 250+ in Snake |
| `pentominium` | Pentominium | Scored 1000 points in Tetris | 🧱 | Score 1000+ in Tetris |
| `safe_stepper` | Safe Stepper | Marked 20 mines correctly in one go | 🛡️ | Flag 20 mines in Minesweeper |
| `asteroid_annihilator` | Asteroid Annihilator | Destroyed a total of 50 asteroids | ☄️ | Destroy 50 asteroids total |
| `space_ace` | Space Ace | Destroyed a total of 100 asteroids | 🌌 | Destroy 100 asteroids total |
| `memory_god` | Memory God | Finished Memory Match under 30s | ⚡ | Complete Memory Match in <30s |
| `reflex_master` | Reflex Master | Achieved a 10x combo in Snake | 💨 | Get 10x combo in Snake |
| `master_2048` | 2048 Master | Reached the 4096 tile | 🌟 | Reach 4096 tile in 2048 |
| `high_jumper` | High Jumper | Reached 10000 height in Neon Jump | 🚀 | Reach 10000 height in Neon Jump |
| `simons_rival` | Simon's Rival | Scored 20 points in Memotron | 🧠 | Score 20+ in Memotron |
| `mole_slayer` | Mole Slayer | Scored 200 points in Whack-A-Mole | 🔨 | Score 200+ in Whack-A-Mole |
| `pacman_500` | Ghost Hunter | Scored 500 points in Pac-Man | 👻 | Score 500+ in Pac-Man |
| `indestructible` | Indestructible | Survived 3 minutes in Asteroids | 💎 | Survive 180s in Asteroids |
| `precision` | Precision | Scored 50 in Breakout without losing a ball | 🎯 | Score 50+ in Breakout without loss |
| `triple_threat` | Triple Threat | Won Tic-Tac-Toe under 10 seconds | 🔥 | Win Tic-Tac-Toe in <10s |
| `speedrunner` | Speedrunner | Scored 500 in Neon Runner within 1 minute | 🏎️ | Score 500+ in Neon Runner in <60s |

### Ultra Achievements - Hidden Tier (1 Total)

Secret achievements that require discovering specific conditions.

| ID | Title | Description | Icon | Unlock Condition |
|----|-------|-------------|------|------------------|
| `bulletproof` | Bulletproof | Survived 1 minute in Space Shooter without getting hit | 🧥 | Survive 60s in Space Shooter without damage |

### Godly Achievement (1 Total)

The ultimate achievement -- unlock all others.

| ID | Title | Description | Icon | Unlock Condition |
|----|-------|-------------|------|------------------|
| `godly` | Godly | Unlocked all achievements | ⛩️ | Unlock all 36 other achievements |

### Achievement Unlock System

```javascript
// Achievement check on game end
checkAchievements(gameId, score, stats) {
    // Normal achievements
    if (score >= 1000) this.unlock('score_1000');
    if (this.totalGamesPlayed >= 10) this.unlock('warmup');
    
    // Game-specific achievements
    if (gameId === 'snake' && score >= 100) this.unlock('snake_100');
    if (gameId === 'tetris' && score >= 500) this.unlock('tetris_500');
    
    // Ultra achievements
    if (this.totalGamesPlayed >= 50) this.unlock('marathon_runner');
    if (this.totalPlayTime >= 3600) this.unlock('addict');
    
    // Time-based achievements
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 8) this.unlock('night_owl');
    
    // Skill-based achievements
    if (gameId === 'snake' && score >= 250) this.unlock('snake_charmer');
    
    // Check for godly achievement
    if (this.achievements.length === 36) this.unlock('godly');
}
```

### Achievement Display

Achievements are displayed in three ways:

1. **Toast Notification**: Pops up when unlocked with fanfare sound
2. **Achievement List**: Visible in launcher settings panel
3. **Stats Dashboard**: Shows unlock progress and rarity breakdown

---

## 💾 7. Data Persistence & localStorage Schema

All data is stored locally in the browser's `localStorage` with a `lg_` prefix to avoid conflicts with other applications.

### Storage Keys Reference

| Key | Type | Format | Example | Purpose |
|-----|------|--------|---------|---------|
| `lg_highscores` | JSON Object | `{ gameId: score }` | `{"snake":142,"tetris":890}` | Per-game best scores |
| `lg_achievements` | JSON Array | `[ achievementId ]` | `["first_game","warmup"]` | Unlocked achievement IDs |
| `lg_settings` | JSON Object | `{ key: value }` | `{"reducedMotion":false,"shakeIntensity":5}` | User preferences |
| `lg_theme` | String | Theme name | `"retro"` | Active theme: default, retro, minimal, forest |
| `lg_volume` | String (Number) | Float 0.0-1.0 | `"0.7"` | Master volume level |
| `lg_totalGames` | String (Number) | Integer | `"47"` | Lifetime games played |
| `lg_totalPlayTime` | String (Number) | Float (seconds) | `"3842.5"` | Lifetime seconds played |
| `lg_favorites` | JSON Array | `[ gameId ]` | `["snake","tetris"]` | Pinned game IDs |
| `lg_lastPlayed` | JSON Object | `{ gameId: timestamp }` | `{"snake":1709856000}` | Per-game last-played time |
| `lg_uniqueGames` | JSON Array | `[ gameId ]` | `["snake","tetris","pong"]` | Distinct games ever played |
| `lg_consecutiveGames` | String (Number) | Integer | `"3"` | Current same-game streak |
| `lg_lastGameId` | String | Game ID | `"snake"` | Most recently played game |
| `lg_totalAsteroids` | String (Number) | Integer | `"73"` | Lifetime asteroids destroyed |

### Data Serialization

```javascript
// Save data (debounced at 250ms)
saveData() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
        const data = {
            highScores: this.highScores,
            achievements: this.achievements,
            settings: this.settings,
            theme: this.theme,
            volume: this.volume,
            totalGamesPlayed: this.totalGamesPlayed,
            totalPlayTime: this.totalPlayTime,
            uniqueGamesPlayed: this.uniqueGamesPlayed,
            lastGameId: this.lastGameId,
            lastPlayed: this.lastPlayed
        };
        localStorage.setItem('lg_data', JSON.stringify(data));
    }, 250);
}

// Load data
loadData() {
    const stored = localStorage.getItem('lg_data');
    if (stored) {
        const data = JSON.parse(stored);
        Object.assign(this, data);
    }
}
```

### Storage Limits & Optimization

- **localStorage Limit**: ~5-10MB per domain (varies by browser)
- **Current Usage**: ~50KB (well under limit)
- **Debouncing**: 250ms delay prevents excessive I/O
- **Compression**: Data is stored as JSON (not compressed)
- **Backup**: No cloud sync (intentional for privacy)

### Data Migration

When updating the app, old data is automatically migrated:

```javascript
migrateData(oldVersion, newVersion) {
    if (oldVersion < '2.0') {
        // Migrate old achievement IDs
        this.achievements = this.achievements.map(id => 
            oldAchievementMap[id] || id
        );
    }
    if (oldVersion < '3.0') {
        // Add new fields with defaults
        this.consecutiveGames = this.consecutiveGames || 0;
    }
}
```

---

## 🎨 8. CSS Design System & Themes

A comprehensive design system using CSS custom properties (variables) that enables instant theme switching without reloading.

### Base Variables (:root) - 50+ Properties

```css
:root {
    /* ===== BACKGROUNDS ===== */
    --bg-primary: #050512;                          /* Main background */
    --bg-secondary: rgba(10, 10, 25, 0.75);        /* Secondary background */
    --bg-card: rgba(16, 16, 42, 0.65);             /* Card background */
    --bg-card-hover: rgba(24, 24, 60, 0.85);       /* Card hover state */
    --bg-glass: rgba(255, 255, 255, 0.03);         /* Glassmorphism */
    --bg-overlay: rgba(0, 0, 0, 0.5);              /* Modal overlay */
    
    /* ===== BORDERS & OUTLINES ===== */
    --border-glass: rgba(255, 255, 255, 0.1);      /* Subtle border */
    --border-glow: rgba(0, 220, 255, 0.3);         /* Glowing border */
    --border-width: 1px;                            /* Standard border */
    --border-radius: 12px;                          /* Corner radius */
    
    /* ===== TEXT COLORS ===== */
    --text-primary: #ffffff;                        /* Main text */
    --text-secondary: rgba(255, 255, 255, 0.7);    /* Secondary text */
    --text-muted: #555577;                          /* Muted text */
    --text-dim: #333355;                            /* Very dim text */
    --text-accent: var(--accent-cyan);              /* Accent text */
    
    /* ===== ACCENT COLORS ===== */
    --accent-cyan: #00d4ff;                         /* Primary accent */
    --accent-magenta: #ff00aa;                      /* Secondary accent */
    --accent-green: #00ff88;                        /* Success color */
    --accent-yellow: #ffcc00;                       /* Warning color */
    --accent-orange: #ff8844;                       /* Alert color */
    --accent-purple: #8855ff;                       /* Tertiary accent */
    --accent-red: #ff4466;                          /* Error color */
    
    /* ===== GLOW EFFECTS ===== */
    --glow-cyan: 0 0 30px rgba(0, 220, 255, 0.25), 0 0 60px rgba(0, 220, 255, 0.08);
    --glow-magenta: 0 0 30px rgba(255, 0, 170, 0.25), 0 0 60px rgba(255, 0, 170, 0.08);
    --glow-green: 0 0 30px rgba(0, 255, 136, 0.25), 0 0 60px rgba(0, 255, 136, 0.08);
    --glow-purple: 0 0 30px rgba(136, 85, 255, 0.25), 0 0 60px rgba(136, 85, 255, 0.08);
    
    /* ===== TRANSITIONS ===== */
    --transition-fast: 150ms ease-out;              /* Quick transitions */
    --transition-normal: 300ms ease-out;            /* Standard transitions */
    --transition-slow: 500ms ease-out;              /* Slow transitions */
    
    /* ===== SHADOWS ===== */
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
}
```

### Theme Variants

#### Theme: Neon (Default)
```css
[data-theme="neon"] {
    --bg-primary: #050512;
    --accent-cyan: #00d4ff;
    --accent-magenta: #ff00aa;
    --accent-green: #00ff88;
    /* Bright, vibrant neon colors */
}
```

#### Theme: Retro
```css
[data-theme="retro"] {
    --bg-primary: #1a1a00;
    --accent-cyan: #ffaa00;
    --accent-magenta: #ff6600;
    --accent-green: #ffff00;
    /* Warm amber tones with CRT filter */
    filter: sepia(0.3) contrast(1.2);
}
```

#### Theme: Minimal
```css
[data-theme="minimal"] {
    --bg-primary: #000000;
    --accent-cyan: #ffffff;
    --accent-magenta: #ffffff;
    --accent-green: #ffffff;
    /* Pure monochrome, no distractions */
}
```

#### Theme: Forest
```css
[data-theme="forest"] {
    --bg-primary: #001a0a;
    --accent-cyan: #00ff88;
    --accent-magenta: #00cc66;
    --accent-green: #00ff88;
    /* Cool greens, organic tones */
}
```

### Component Styles

#### Game Card
```css
.game-card {
    background: var(--bg-card);
    border: var(--border-width) solid var(--border-glow);
    border-radius: var(--border-radius);
    padding: 16px;
    transition: all var(--transition-normal);
    box-shadow: var(--glow-cyan);
}

.game-card:hover {
    background: var(--bg-card-hover);
    box-shadow: var(--glow-cyan), 0 0 40px rgba(0, 220, 255, 0.4);
    transform: translateY(-4px);
}
```

#### Button
```css
.btn {
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta));
    color: var(--text-primary);
    border: none;
    border-radius: var(--border-radius);
    padding: 10px 20px;
    cursor: pointer;
    transition: all var(--transition-fast);
    box-shadow: var(--glow-cyan);
}

.btn:hover {
    box-shadow: var(--glow-cyan), 0 0 30px rgba(0, 220, 255, 0.5);
    transform: scale(1.05);
}

.btn:active {
    transform: scale(0.98);
}
```

#### Input Field
```css
input, textarea {
    background: var(--bg-glass);
    border: var(--border-width) solid var(--border-glass);
    color: var(--text-primary);
    padding: 10px;
    border-radius: var(--border-radius);
    transition: all var(--transition-fast);
}

input:focus, textarea:focus {
    outline: none;
    border-color: var(--accent-cyan);
    box-shadow: 0 0 20px rgba(0, 220, 255, 0.3);
}
```

### Responsive Grid

```css
.game-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    padding: 20px;
}

@media (max-width: 1200px) {
    .game-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
}

@media (max-width: 768px) {
    .game-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
}
```

### Animation Keyframes

```css
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes glow {
    0%, 100% { box-shadow: var(--glow-cyan); }
    50% { box-shadow: var(--glow-cyan), 0 0 40px rgba(0, 220, 255, 0.5); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.fade-in { animation: fadeIn var(--transition-normal); }
.glow { animation: glow 2s infinite; }
.pulse { animation: pulse 2s infinite; }
```

---

## 🎮 9. Game Interface Contract & Implementation

Every game in Lightning Games must implement a standardized interface. This ensures compatibility with the GameManager and consistent behavior across all 41 games.

### Required Interface

```javascript
class GameName {
    // Constructor: Initialize game state
    constructor() {
        this.score = 0;
        this.gameOver = false;
        this.canvas = null;
        this.ctx = null;
    }

    // init(canvas, ctx): Called once when game starts
    // - canvas: HTMLCanvasElement (880x540)
    // - ctx: CanvasRenderingContext2D
    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        // Initialize game state, load assets, set up event listeners
    }

    // update(dt): Called every frame before draw()
    // - dt: Delta time in seconds (typically 0.016 for 60fps)
    // - Frame-independent movement: position += velocity * dt
    update(dt) {
        if (this.gameOver) return;
        // Update game logic, physics, AI, etc.
    }

    // draw(): Called every frame after update()
    // - Render all game elements to canvas
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw background, sprites, UI, etc.
    }

    // getScore(): Return current score
    // - Used by GameManager for high score tracking
    getScore() {
        return this.score;
    }

    // isGameOver(): Return true when game ends
    // - GameManager checks this to end the game
    isGameOver() {
        return this.gameOver;
    }

    // destroy(): Clean up resources
    // - Remove event listeners
    // - Cancel timers
    // - Free memory
    destroy() {
        // Remove any event listeners added in init()
        // Cancel any setInterval/setTimeout
    }
}
```

### Example Implementation: Simple Snake

```javascript
class Snake {
    constructor() {
        this.score = 0;
        this.gameOver = false;
        this.gridSize = 20;
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width / this.gridSize;
        this.height = canvas.height / this.gridSize;
        
        document.addEventListener('keydown', (e) => this.handleInput(e));
    }

    update(dt) {
        if (this.gameOver) return;
        
        // Update direction
        this.direction = this.nextDirection;
        
        // Move snake
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check collisions
        if (head.x < 0 || head.x >= this.width || 
            head.y < 0 || head.y >= this.height ||
            this.snake.some(s => s.x === head.x && s.y === head.y)) {
            this.gameOver = true;
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.spawnFood();
        } else {
            this.snake.pop();
        }
    }

    draw() {
        // Draw background
        this.ctx.fillStyle = '#050512';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        this.ctx.fillStyle = '#00ff88';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });
        
        // Draw food
        this.ctx.fillStyle = '#ff00aa';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );
        
        // Draw score
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }

    destroy() {
        document.removeEventListener('keydown', (e) => this.handleInput(e));
    }

    handleInput(e) {
        switch(e.key) {
            case 'ArrowUp': case 'w': case 'W':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown': case 's': case 'S':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft': case 'a': case 'A':
                if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight': case 'd': case 'D':
                if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                break;
        }
    }

    spawnFood() {
        this.food = {
            x: Math.floor(Math.random() * this.width),
            y: Math.floor(Math.random() * this.height)
        };
    }
}
```

### Best Practices

1. **Frame-Independent Movement**: Always multiply velocity by `dt`
   ```javascript
   this.x += this.vx * dt;  // Correct
   this.x += this.vx;       // Wrong - frame-dependent
   ```

2. **Event Listener Cleanup**: Remove all listeners in `destroy()`
   ```javascript
   destroy() {
       document.removeEventListener('keydown', this.handleKeyDown);
       window.removeEventListener('resize', this.handleResize);
   }
   ```

3. **Canvas Clearing**: Always clear before drawing
   ```javascript
   draw() {
       this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
       // Draw game
   }
   ```

4. **Sound Effects**: Use the global SoundManager
   ```javascript
   window.soundManager.playJump();
   window.soundManager.playExplosion();
   ```

5. **Score Tracking**: Update `this.score` during gameplay
   ```javascript
   if (enemyHit) {
       this.score += 100;
       window.soundManager.playScore();
   }
   ```

---

## 📡 10. IPC Communication Protocol

Secure inter-process communication between main and renderer processes using `contextBridge`.

### IPC Channels

| Channel | Direction | Payload | Purpose | Example |
|---------|:---------:|---------|---------|---------|
| `close-window` | Renderer → Main | none | Hide/minimize window | `window.electronAPI.closeWindow()` |
| `quit-app` | Renderer → Main | none | Fully quit application | `window.electronAPI.quitApp()` |
| `window-hiding` | Main → Renderer | none | App about to hide | `window.electronAPI.onWindowHiding(callback)` |
| `window-showing` | Main → Renderer | none | App now visible | `window.electronAPI.onWindowShowing(callback)` |

### Usage Examples

```javascript
// Close window (hide to tray)
window.electronAPI.closeWindow();

// Quit application completely
window.electronAPI.quitApp();

// Listen for window events
window.electronAPI.onWindowHiding(() => {
    console.log('Window is hiding');
    // Pause game, save state, etc.
});

window.electronAPI.onWindowShowing(() => {
    console.log('Window is showing');
    // Resume game, etc.
});
```

### Security Model

- ✅ **Context Isolation**: Renderer cannot access Node.js APIs
- ✅ **Preload Script**: Only whitelisted methods exposed
- ✅ **No require()**: Cannot load arbitrary modules
- ✅ **No process**: Cannot access process object
- ✅ **No fs**: Cannot access file system
- ✅ **Minimal Surface**: Only 4 IPC channels exposed

---

## 🔊 11. Sound System - Procedural Audio

All audio is synthesized in real-time using the Web Audio API. There are **zero audio files** in the project.

### Sound Effects Library (25+)

| Sound | Waveform | Frequency | Duration | Use Case |
|-------|----------|-----------|----------|----------|
| `playClick()` | Triangle | 440Hz | 100ms | UI clicks |
| `playHover()` | Sine | 880Hz | 50ms | Card hover |
| `playJump()` | Square | 200→600Hz | 150ms | Platformers |
| `playDeath()` | Sawtooth | 400→80Hz | 300ms | Game over |
| `playShoot()` | Square | 900→200Hz | 100ms | Shooters |
| `playExplosion()` | White noise | - | 250ms | Explosions |
| `playAchievement()` | Square chord | Multi-tone | 500ms | Achievement unlock |
| `playEat()` | Multi-tone | 400, 600Hz | 100ms | Snake eating |
| `playLineClear()` | Square sweep | 400→800Hz | 200ms | Tetris line clear |
| `playSlice()` | Sawtooth | 1200→300Hz | 150ms | Ninja slice |
| `playBounce()` | Triangle | 300→600Hz | 100ms | Physics bounce |
| `playLaser()` | Sawtooth | 1500→200Hz | 200ms | Tower Defense laser |
| `playLevelUp()` | Square | 400→1200Hz | 400ms | Level transitions |
| `playMatch()` | Sine chord | 523, 659Hz | 150ms | Puzzle matches |
| `playWin()` | Square arpeggio | 523, 659, 784Hz | 600ms | Victory |
| `playTick()` | Click | 1000Hz | 50ms | Countdown |
| `playPowerUp()` | Sine sweep | 400→1200Hz | 300ms | Power-ups |
| `playFlip()` | Sawtooth | 800→400Hz | 100ms | Gravity flip |
| `playWhoosh()` | Noise sweep | - | 200ms | Movement |
| `playSwing()` | Triangle | 600→400Hz | 150ms | Swing action |
| `playCountdown()` | Square | 800Hz | 100ms | Countdown tick |
| `playPlace()` | Sine | 600Hz | 100ms | Block placement |
| `playMove()` | Triangle | 500Hz | 75ms | Piece movement |
| `playDing()` | Sine | 1000Hz | 200ms | Success ding |
| `playBuzz()` | Sawtooth | 200Hz | 150ms | Error buzz |

### 8-Bit Music Engine

```javascript
generateBackgroundMusic(gameId) {
    const noteMap = {
        'snake': [262, 294, 330, 349, 392],      // C D E F G
        'tetris': [330, 392, 440, 494],          // E G A B
        'asteroids': [220, 247, 262, 294],       // A B C D
        'pong': [440, 494, 523, 587]             // A B C D
    };
    
    const notes = noteMap[gameId] || [262, 294, 330, 349];
    let noteIndex = 0;
    
    // Play notes at 150 BPM (400ms per note)
    this.musicInterval = setInterval(() => {
        const frequency = notes[noteIndex % notes.length];
        this.playTone(frequency, 0.2, 0.3);
        noteIndex++;
    }, 400);
}
```

### Volume Control

```javascript
setVolume(level) {
    // Clamp between 0.0 and 1.0
    this.masterVolume = Math.max(0, Math.min(1, level));
    
    // Update Web Audio gain node
    this.gainNode.gain.value = this.masterVolume;
    
    // Persist to localStorage
    localStorage.setItem('lg_volume', this.masterVolume);
}

getVolume() {
    return this.masterVolume;
}
```

---

## 🛠️ 12. Build & Deployment System

### Interactive Build Wizard

The project uses an interactive build script (`scripts/build.js`) that guides users through the build process.

#### Build Process Flow

```
1. Display current version from package.json
   ↓
2. Prompt for new version number
   ↓
3. Prompt for compression level (0-10)
   ├─ 0: Store    (~5s,   ~140MB) - No compression
   ├─ 1-3: Fast   (~20-50s, ~125-105MB) - Quick builds
   ├─ 4-6: Normal (~70s-2m, ~95-75MB) - Balanced
   ├─ 7-9: High   (~3-8m, ~65-45MB) - High compression
   └─ 10: MaxComp (~15m, ~35MB) - Maximum compression
   ↓
4. Select target platform
   ├─ Windows Portable
   ├─ Linux AppImage (WSL)
   ├─ Linux AppImage (Docker)
   └─ Parallel builds
   ↓
5. Update package.json with new version
   ↓
6. Run electron-builder
   ↓
7. Save build log to BuildLogs/
   ↓
8. Output: dist/Lightning Games.exe
```

#### Compression Levels (0-10)

| Level | Name | Time | Size | Description |
|:-----:|------|------|------|-------------|
| 0 | Store | ~5s | ~140MB | No compression |
| 1 | Fast | ~20s | ~125MB | Quick build |
| 2 | Light | ~35s | ~115MB | Light compression |
| 3 | Medium | ~50s | ~105MB | Balanced (default) |
| 4 | Good | ~70s | ~95MB | Good compression |
| 5 | High | ~90s | ~85MB | High compression |
| 6 | Higher | ~2m | ~75MB | Higher compression |
| 7 | Ultra | ~3m | ~65MB | Ultra compression |
| 8 | Extreme | ~5m | ~55MB | Extreme compression |
| 9 | Insane | ~8m | ~45MB | Insane compression |
| 10 | MaxComp | ~15m | ~35MB | Maximum compression |

#### Running the Build

```bash
npm run dist
```

#### Build Configuration (package.json)

```json
{
    "build": {
        "appId": "com.lightninggames.app",
        "productName": "Lightning Games",
        "files": [
            "main.js",
            "preload.js",
            "index.html",
            "renderer/**/*",
            "games/**/*",
            "styles/**/*",
            "assets/**/*"
        ],
        "win": {
            "target": ["portable"],
            "certificateFile": null,
            "certificatePassword": null
        },
        "portable": {
            "artifactName": "${productName}.exe"
        },
        "compression": "normal"
    }
}
```

### Build Optimizations

| Optimization | Technique | Impact |
|-------------|-----------|--------|
| **Exclude node_modules** | Only bundle essential files | Reduces 500MB → 80MB |
| **Selective bundling** | Include only JS/HTML/CSS/assets | Faster build time |
| **ASAR extraction** | Enabled for faster file access | Improves startup |
| **Compression levels** | 0-10 configurable | Size vs. time tradeoff |
| **Portable format** | Single .exe file | No installation needed |

### Build Logs

All builds are logged to `BuildLogs/build-{timestamp}.log`:

```
[2026-03-08 14:32:15] Build started
[2026-03-08 14:32:15] Version: 2.1.6 → 2.2.0
[2026-03-08 14:32:15] Compression: 5 (Normal)
[2026-03-08 14:32:20] electron-builder started
[2026-03-08 14:32:45] Build completed
[2026-03-08 14:32:45] Output: dist/Lightning Games.exe (112 MB)
[2026-03-08 14:32:45] Build time: 30 seconds
```

---

## 📜 13. Scripts Reference

### Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `build.js` | Interactive build wizard | `npm run dist` |
| `dev.js` | Start development server | `node scripts/dev.js` |
| `clean.js` | Clean build artifacts | `node scripts/clean.js --all` |
| `stats.js` | Project statistics | `node scripts/stats.js` |
| `test.js` | Run test suite | `node scripts/test.js` |
| `validate.js` | Validate game files | `node scripts/validate.js [game]` |
| `lint.js` | Code quality checks | `node scripts/lint.js` |
| `package.js` | Quick packaging | `node scripts/package.js [platform]` |
| `release.js` | Create release | `node scripts/release.js [type]` |
| `install.js` | Project setup | `node scripts/install.js` |
| `info.js` | Project information | `node scripts/info.js` |
| `version.js` | Version bumping | `node scripts/version.js [type]` |
| `sync-icons.js` | Icon generation | `node scripts/sync-icons.js` |

### Script Details

#### dev.js - Development Server
```bash
node scripts/dev.js
```
- Checks and installs dependencies if missing
- Starts Electron with dev flags enabled
- Enables remote debugging on port 9222
- Graceful shutdown on Ctrl+C

#### clean.js - Cleanup Utility
```bash
node scripts/clean.js --all      # Clean everything
node scripts/clean.js --dist     # Clean dist/ only
node scripts/clean.js --cache    # Clean build cache
node scripts/clean.js --logs     # Clean build logs
node scripts/clean.js --modules  # Clean node_modules
```
- Reports freed disk space
- Safe removal with error handling

#### stats.js - Project Statistics
```bash
node scripts/stats.js
```
- Total lines of code
- Files by category (games, renderer, styles, scripts)
- Disk usage breakdown
- Dependency count

#### test.js - Test Suite
```bash
node scripts/test.js
```
Checks:
- package.json validity
- Main process file exists
- Preload script exists
- Index.html with canvas
- Games folder with game files
- Renderer folder with JS files
- Styles folder with CSS files
- Assets folder exists
- node_modules installed
- Electron binary present
- JavaScript syntax validation

#### validate.js - Game Validator
```bash
node scripts/validate.js           # Validate all games
node scripts/validate.js snake     # Validate specific game
```
Checks:
- Class definition exists
- Required methods (init, update, draw, getScore, isGameOver, destroy)
- No document.write() usage
- No eval() usage
- Canvas context usage
- Game over handling
- Score tracking

#### lint.js - Code Linter
```bash
node scripts/lint.js
```
Rules:
- No `var` keyword (use `let`/`const`)
- No `==` (use `===`)
- No `debugger` statements
- No `alert()` calls
- Line length warnings (>100 chars)
- Trailing whitespace detection

#### package.js - Quick Packager
```bash
node scripts/package.js win      # Windows portable
node scripts/package.js winzip   # Windows ZIP
node scripts/package.js linux    # Linux AppImage
node scripts/package.js deb      # Linux DEB
node scripts/package.js mac      # macOS DMG
```
- No prompts, direct build
- Uses normal compression
- Inherits stdio for live output

#### release.js - Release Manager
```bash
node scripts/release.js major    # 1.0.0 → 2.0.0
node scripts/release.js minor    # 1.0.0 → 1.1.0
node scripts/release.js patch    # 1.0.0 → 1.0.1
node scripts/release.js 2.5.0    # Specific version
```
- Updates package.json version
- Generates RELEASE-vX.X.X.md changelog

#### install.js - Project Setup
```bash
node scripts/install.js
```
Checks:
- Node.js v16+ required
- npm available
- Platform-specific requirements
- Creates dist/ and BuildLogs/ directories
- Runs npm install

#### info.js - Project Information
```bash
node scripts/info.js
```
Displays:
- Project name, version, license
- Game count
- File structure summary
- System info (platform, Node, npm, CPUs, memory)
- Available scripts
- Dependencies list

#### version.js - Version Bumper
```bash
node scripts/version.js major    # 1.0.0 → 2.0.0
node scripts/version.js minor    # 1.0.0 → 1.1.0
node scripts/version.js patch    # 1.0.0 → 1.0.1
```
- Quick version update without release artifacts
- Updates package.json only

---

## ⚡ 13. Performance Optimizations

### GPU Acceleration Flags

Applied in `main.js` before `app.ready()`:

```javascript
// Rasterization & Compositing
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-oop-rasterization');
app.commandLine.appendSwitch('enable-gpu-compositing');
app.commandLine.appendSwitch('enable-accelerated-video-decode');

// Timing & Throttling
app.commandLine.appendSwitch('disable-background-timer-throttle');
app.commandLine.appendSwitch('disable-renderer-backgrounding');

// Color Management
app.commandLine.appendSwitch('force-color-profile', 'srgb');
```

### Runtime Optimizations

| Optimization | Technique | Benefit |
|-------------|-----------|---------|
| **Frame timing** | `requestAnimationFrame` with dt cap | Prevents physics explosions on lag |
| **Canvas scaling** | Configurable 0.7x-1.0x resolution | Lower-end GPUs trade quality for FPS |
| **Event delegation** | Single listener on grid, not per-card | Fewer DOM listeners, faster GC |
| **Debounced writes** | 250ms delay on localStorage | Prevents I/O thrashing |
| **Smooth scrolling** | Custom lerp with `requestAnimationFrame` | 60fps launcher scrolling |
| **Single instance** | `app.requestSingleInstanceLock()` | Prevents duplicate processes |
| **Selective bundling** | Excludes node_modules from package | Reduces disk footprint |

### Settings for Low-End Hardware

Users can adjust in Settings panel:

- **Render Scale**: Lower to 0.7x for better FPS
- **Reduced Motion**: Disables particles and smooth scroll
- **Shake Intensity**: Reduce or disable screen shake

---

## 📝 14. How to Add a New Game

### Step-by-Step Guide

#### 1. Create Game File

Create `games/mygame.js`:

```javascript
class MyGame {
    constructor() {
        this.score = 0;
        this.gameOver = false;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        // Initialize game
    }

    update(dt) {
        // Update game logic
    }

    draw() {
        // Render game
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    destroy() { /* Clean up */ }
}
```

#### 2. Register in index.html

```html
<script src="games/mygame.js"></script>
```

#### 3. Add to Launcher

In `renderer/launcher.js`, add to `GAME_CARDS_CONFIG`:

```javascript
{
    id: 'mygame',
    icon: '🎮',
    name: 'My Game',
    desc: 'Short description',
    category: 'arcade',
    color: '--accent-cyan',
    glowColor: 'rgba(0, 212, 255, 0.12)',
    borderColor: 'rgba(0, 212, 255, 0.35)',
    shadowColor: '0 0 30px rgba(0, 212, 255, 0.2)'
}
```

#### 4. (Optional) Add Achievements

In `ALL_ACHIEVEMENTS` array:

```javascript
{ 
    id: 'mygame_pro', 
    title: 'My Game Pro', 
    desc: 'Score 500 in My Game.', 
    icon: '🏆', 
    ultra: true 
}
```

Then add unlock logic in `gameManager.js`:

```javascript
if (gameId === 'mygame' && score >= 500) {
    this.unlockAchievement('mygame_pro');
}
```

---

## 🔧 15. Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Start with dev flags
npm run dev
```

### Testing

```bash
# Run a single game
npm start
# Then press Ctrl+Alt+G and select a game

# Test achievements
# Play games and check localStorage in DevTools
```

### Building

```bash
# Interactive build wizard
npm run dist

# Direct build (not recommended)
npx electron-builder --win portable
```

---

## 📦 16. Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **electron** | ^28.0.0 | Desktop application framework |
| **electron-builder** | ^24.13.3 | Packaging and distribution |
| **canvas** | ^3.2.1 | Programmatic icon generation |
| **png-to-ico** | ^3.0.1 | Icon format conversion |

**Zero runtime dependencies.** The shipped application is pure vanilla JavaScript.

---

## 🎯 17. Quick Reference

| Task | Command |
|------|----------|
| Start app | `npm start` |
| Build | `npm run dist` |
| Dev mode | `node scripts/dev.js` |
| Run tests | `node scripts/test.js` |
| View stats | `node scripts/stats.js` |
| Clean artifacts | `node scripts/clean.js --all` |
| Validate games | `node scripts/validate.js` |
| Lint code | `node scripts/lint.js` |
| Quick package | `node scripts/package.js win` |
| Create release | `node scripts/release.js minor` |
| Bump version | `node scripts/version.js patch` |
| Project info | `node scripts/info.js` |
| Setup project | `node scripts/install.js` |

| Task | Location |
|------|----------|
| Add game | `games/*.js` + `index.html` + `renderer/launcher.js` |
| Add achievement | `renderer/launcher.js` → `ALL_ACHIEVEMENTS` |
| Change colors | `styles/main.css` → CSS variables |
| Add sound | `renderer/soundManager.js` → `playXxx()` method |
| Change theme | `styles/main.css` → `[data-theme="name"]` |
| Modify window | `main.js` → `BrowserWindow` config |
| Update version | `package.json` → `version` field |

---

## 🛠️ 24. Recent Fixes & Updates

### v3.7.0 (2026-03-11) - STATS SCREEN ULTRA ENHANCEMENT 📊

**MASSIVE STATS OVERHAUL** - Transformed from basic 4-card display to comprehensive analytics dashboard!

- ✨ **8 Stat Cards** (up from 4) with animated progress bars
  - Added: Total Score (📈) - Sum of all high scores
  - Added: Average Score (💯) - Average high score across games
  - All cards now have gradient progress bars with glow effects
  
- ⚡ **Quick Summary Section** (NEW!)
  - 🎲 Most Played Game - Game played most frequently
  - 👑 Best Game - Highest scoring game
  - 🕐 Longest Session - Total play time estimate
  - 📅 Days Played - Estimated days active
  
- 🕐 **Recent Activity** (NEW!)
  - Last 10 games played with timestamps
  - Shows: Game icon, name, score, category, time ago
  - Scrollable list with hover effects
  - Empty state message
  
- ⏱️ **Play Time Distribution Chart** (NEW!)
  - Visual horizontal bar chart
  - Games played per category
  - Gradient fills with animated bars
  - Value labels showing game counts
  
- 🎯 **Milestones System** (NEW!)
  - 8 progressive milestones with progress tracking
  - First Steps (10 games), Achievement Hunter (10 achievements)
  - Favorite Collector (5 favorites), Time Traveler (1 hour)
  - Explorer (20 games), Streak Master (5 streak)
  - Century Club (100 games), Champion (10,000 points)
  - Completed checkmark (✓) and green border when done
  
- 🏅 **Enhanced Top Games Leaderboard**
  - Top 10 games by high score
  - Medal colors: Gold/Silver/Bronze for top 3
  - Click to launch game
  - Hover animations with slide effect
  
- 📊 **Category Breakdown**
  - All game categories with played/total counts
  - Animated progress bars
  - Percentage completion
  
- 🏆 **Achievement Progress Tracking**
  - Normal/Ultra/Hidden breakdown
  - Color-coded gradients
  - Progress bars with counts
  
- 🎨 **Visual Enhancements**
  - Gradient progress bars (Cyan → Magenta)
  - Glow effects on all elements
  - Smooth 0.8s animations
  - Hover effects with lift/scale
  - Responsive grid layouts
  
- 📱 **Responsive Design**
  - Desktop: Full grid layout
  - Tablet: 2-column grids
  - Mobile: Single column
  
- 🔧 **Technical Implementation**
  - 5 new rendering functions
  - Enhanced renderStats() function
  - Efficient data calculations
  - Real-time updates
  - GPU-accelerated animations
  
**Files Modified:**
- `index.html` - Added 5 new sections (Quick Summary, Recent Activity, Play Time Chart, Milestones, 2 new stat cards)
- `styles/main.css` - Added 700+ lines of new CSS for all new components
- `renderer/launcher.js` - Added 5 new functions (renderQuickSummary, renderRecentActivity, renderPlayTimeChart, renderMilestones, enhanced renderStats)

**Result:** A professional, data-rich analytics dashboard that provides comprehensive insights into gaming progress, achievements, and milestones!

### v3.6.4 (2026-03-10) - PREMIUM ANIMATION SYSTEM
- **Advanced Animations**: Professional-grade animations for all elements
  - Tooltip: Pop animation with bounce easing (0.6s)
  - Spotlight: Continuous glow pulse animation (2s)
  - Title: Slide down animation with bounce easing
  - Description: Fade in animation with delay (0.2s)
  - Keyboard hints: Slide up animation with delay (0.3s)
  - Keyboard hint items: Staggered slide animations (0.1s-0.4s delays)
  - Controls: Slide up animation with delay (0.4s)
  - Buttons: Hover animation with smooth lift effect
  - Close button: Slide right animation with rotate on hover
  - Confetti: Enhanced fall animation with 720deg rotation (2.5s)
  - Progress bar: Smooth fill transition (0.8s) with glow pulse
- **Animation Easing Functions**:
  - Bounce easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` for pop effects
  - Smooth easing: `cubic-bezier(0.22, 1, 0.36, 1)` for transitions
  - Standard easing: `ease-out` for fades
- **Staggered Animations**:
  - Keyboard hints appear one by one
  - Smooth cascade effect
  - Professional timing
- **Continuous Animations**:
  - Spotlight glow pulse (infinite)
  - Progress bar glow pulse (infinite)
  - Keyboard key bounce (infinite)
- **Performance**:
  - GPU-accelerated animations
  - 60fps maintained
  - Smooth transitions
  - No jank or stuttering

### v3.6.3 (2026-03-10) - BACKDROP VISIBILITY FIX
- **Background Visibility Fix**: Removed dark backdrop for better content visibility
  - Backdrop: Transparent background instead of black overlay
  - Spotlight: Reduced shadow opacity (0.85 → 0.6) for subtle darkening
  - Result: Original app content remains visible behind tutorial
- **Blur Optimization**:
  - Removed backdrop blur completely
  - Tooltip blur: 20px → 8px (less intrusive)
  - Background: 0.98 → 0.95 opacity (more transparent)
- **Visual Balance**:
  - Spotlight provides focus without hiding content
  - Tutorial overlay is informative but not obstructive
  - Better user experience with visible background

### v3.6.2 (2026-03-10) - TUTORIAL UI REFINEMENT
- **Tooltip Size Optimization**: Reduced tooltip size for better visibility
  - Max-width: 420px → 360px
  - Padding: 28px → 20px
  - More compact and elegant design
- **Typography Refinement**:
  - Title: 20px → 18px
  - Description: 15px → 13px
  - Better readability with smaller text
- **Keyboard Hints Optimization**:
  - Grid columns: 130px → 110px
  - Padding: 14px → 10px
  - More compact layout
- **Progress Bar Refinement**:
  - Height: 6px → 5px
  - Reduced glow for cleaner look
- **Button Optimization**:
  - Padding: 12px 14px → 10px 12px
  - Font size: 13px → 12px
  - Smaller but still clickable
- **Backdrop Adjustment**:
  - Blur: 10px → 6px (less blur, clearer content)
  - Opacity: 0.75 → 0.8 (slightly darker)
- **Close Button**:
  - Size: 28px → 24px
  - Font size: 24px → 20px
- **Responsive Design**:
  - Mobile optimizations
  - Better spacing on small screens
  - Improved touch targets

### v3.6.1 (2026-03-10) - TUTORIAL VISUAL FIX & ENHANCEMENT
- **Spotlight Visibility Fix**: Fixed issue where spotlight area was blurred
  - Implemented box-shadow technique for spotlight effect
  - Removed blur from spotlight area while keeping backdrop blurred
  - Spotlight now shows crystal-clear content
- **Visual Enhancements**:
  - Spotlight border increased to 3px with stronger glow
  - Tooltip styling improved with better contrast
  - Keyboard hints redesigned with gradient background
  - Progress bar enhanced with 3-color gradient
  - Buttons redesigned with better hover effects
  - Close button improved with rotation animation
  - Confetti enhanced with more particles and colors
- **Animation Improvements**:
  - Spotlight pulse animation more pronounced
  - Tooltip fade-in animation added
  - Button hover animations smoother
  - Confetti rotation increased to 720deg
- **Responsive Design**:
  - Mobile layout optimized
  - Tablet layout improved
  - Desktop layout refined
- **Accessibility**:
  - Reduced motion support enhanced
  - prefers-reduced-motion media query added
  - High contrast maintained

### v3.6.0 (2026-03-10) - ADVANCED INTERACTIVE TUTORIAL SYSTEM
- **Comprehensive Tutorial System**: Fully interactive, animated, step-by-step guide
  - 14 detailed tutorial steps covering all features
  - Smooth animations and transitions (fadeIn, slideUp, slideDown, bounce, etc.)
  - Spotlight effect highlighting relevant UI elements
  - Context-sensitive tooltips with dynamic positioning
  - Progress bar showing tutorial completion
  - Keyboard shortcuts display with visual indicators
  - Confetti celebration on completion
  - Tutorial progress persistence (localStorage)
  - Restart capability for completed tutorials
  - Sound effects integration
- **Tutorial Features**:
  - Game gallery and card system explanation
  - Favorites system walkthrough
  - Search functionality demonstration
  - Category filtering guide
  - Random game feature
  - Settings and themes customization
  - Keyboard shortcuts reference
  - Achievements system overview
  - Statistics tracking explanation
  - Global hotkey (Ctrl+Alt+G) information
- **Visual Effects**:
  - Neon glow effects on focused elements
  - Pulsing animations for attention
  - Smooth spotlight transitions
  - Animated progress bar
  - Keyboard key animations
  - Confetti particle effects
- **Accessibility**:
  - Skip button for quick exit
  - Back/Next navigation
  - Clear progress indication
  - Readable descriptions
  - Accessible from Settings menu

### v3.5 (2026-03-10) - KEYBOARD NAVIGATION SYSTEM
- **Difficulty System**: Complete overhaul with comprehensive logging
  - Added settings reload in `startGame()` to ensure latest difficulty is applied
  - Enhanced logging in GameManager, Tower Defense, and Launcher
  - Fixed constructor initialization - removed hardcoded starting values
  - Added `waveReward` calculation in `init()` method
  - Difficulty now properly applied before game initialization
  - Console logs show entire difficulty application flow for debugging
- **Bun Migration**: Full support for Bun package manager
  - Automatic package manager detection (Bun → npm fallback)
  - All build scripts support both Bun and npm
  - 3-5x faster dependency installation with Bun
  - 100% backward compatible with npm
  - `scripts/detect-pm.js` handles automatic detection
  - Updated `bunfig.toml` for Bun configuration
- **Documentation**: Added comprehensive guides
  - `DIFFICULTY_SYSTEM_VERIFICATION.md` - Complete verification guide
  - `DIFFICULTY_DEBUG_GUIDE.md` - Debugging instructions
  - `BUN_README.md` - Bun migration guide
  - `BUN_MIGRATION_COMPLETE.md` - Migration completion report

### v3.3 (2026-03-09) - MASSIVE FEATURES EXPANSION
- **Achievements**: Expanded from 37 to 100+ achievements
  - Added 8 new categories: Game-Specific, Progression, Time-Based, Playtime, Collection, Social/UI, Special/Hidden
  - Added rarity tiers: Normal, Ultra, Legendary, Hidden
  - Comprehensive achievement tracking system
- **Themes**: Expanded from 4 to 11 themes
  - Added 7 new themes: Ocean, Sunset, Purple Haze, Matrix, Cyberpunk, Dark Blue, Fire
  - Theme switching achievement tracking
- **Settings**: Expanded from 3 to 18+ settings
  - Visual Effects: Particle Density, Glow Intensity, Animation Speed, Show FPS, Screen Flash
  - Audio: SFX Volume, Music Volume, Mute on Blur
  - Gameplay: Auto-Pause, Confirm Exit, Show Timer, Difficulty Selector
  - Interface: Compact Mode, Show Descriptions, Achievement Notifications, Card Size
- **FPS Counter**: Real-time FPS monitoring with color-coded display
- **Achievement System**: Comprehensive tracking for all user actions
- **Documentation**: Added FEATURES_EXPANSION_COMPLETE.md and NEW_FEATURES_QUICK_REFERENCE.md

### v3.2 (2026-03-08)
- **Build UI**: Restored muted neon color palette for better readability
- **Colors**: Softer cyan, magenta, green, and other accent colors
- **Version**: Build system updated to v5.4

### v3.1 (2026-03-08)
- **Scripts**: Added 11 new utility scripts (dev, clean, stats, test, validate, lint, package, release, install, info, version)
- **Build System**: Compression levels expanded to 0-10 with visual bars
- **MaxComp**: Added Level 10 MaxComp mode for ~35MB ultra-compressed builds
- **Platform Selection**: Improved UI with colored icons and availability indicators
- **Documentation**: Added comprehensive scripts reference section

### v3.0 (2026-03-08)
- **Documentation**: Complete technical documentation rewrite
- **Architecture**: Detailed system diagrams and component breakdown
- **Achievements**: Expanded to 37 total with rarity tiers
- **Tower Defense**: Comprehensive strategy guide added

### v2.2 (2026-03-06)
- **Tower Defense UI**: Fixed shop and ability button click detection
- **Build System**: Optimized compression and build time

### v2.1 (2026-02-28)
- **Performance**: GPU acceleration flags enabled
- **Themes**: Added Forest theme

---

## 📄 License

[MIT](LICENSE) - Free to use, modify, and distribute.

---

## 🚀 7. Build System v6.0 - Interactive Wizard

### Overview

The Lightning Games Build System v6.0 is a complete interactive build wizard that guides you through building Windows and Linux packages with full customization.

### Key Features

✅ **Bun Support** - Auto-detects Bun, falls back to npm (3-5x faster builds)  
✅ **Version Selection** - Interactive version update with auto-sync to UI  
✅ **Platform Selection** - Windows, Linux (WSL), or Both  
✅ **Compression Levels** - Store, Normal, Maximum, ULTRA MEGA  
✅ **WSL Detection** - Automatic availability check  
✅ **Build Verification** - Automatic artifact validation  
✅ **Beautiful UI** - Neon-themed interactive prompts  

### Quick Start

```bash
npm run dist
```

Or with Bun:

```bash
bun run dist
```

### Build Wizard Flow

1. **Version Configuration**
   - Enter new version or press Enter to keep current
   - Auto-updates `package.json` and `index.html`
   - Shows in app UI (top-left corner)

2. **Platform Selection**
   - [1] Windows Portable
   - [2] Linux AppImage (WSL) - Via WSL Linux filesystem
   - [3] Both Platforms - Windows + Linux

3. **Compression Level**
   - [1] Store (~140MB, ~5s) - No compression
   - [2] Normal (~105MB, ~50s) - Balanced
   - [3] Maximum (~85MB, ~90s) - High compression
   - [4] ULTRA MEGA (~65MB, ~3m) - Extreme compression

4. **Confirmation**
   - Review settings and start build

### Compression Comparison

| Level | Windows | Linux AppImage | Time | Use Case |
|-------|---------|--------|------|----------|
| Store | 274 MB | 140 MB | ~5s | Quick testing |
| Normal | 105 MB | 99 MB | ~50s | Development |
| Maximum | 85 MB | 75 MB | ~90s | Release |
| ULTRA MEGA | 65 MB | 55 MB | ~3m | Final production |

**Linux Build Notes:**
- Builds via WSL using native Linux filesystem
- Avoids all `/mnt/c` permission issues
- Requires: WSL, rsync, npm, electron-builder
- Build time: ~50-60s (includes npm install)
- Output: `dist/Lightning Games-X.Y.Z.AppImage`

### Version Auto-Update

When you enter a new version during build:

**Updates:**
- `package.json` → `"version": "X.Y.Z"`
- `index.html` → `<span class="title-version">vX.Y.Z</span>`
- Build filename → `Lightning Games X.Y.Z.exe`

**Result:**
- Version appears in app UI (top-left)
- Included in build artifacts
- Tracked in build logs

### Build Configuration

**Files Included:**
```
**/*
├── games/**/*
├── renderer/**/*
├── styles/**/*
├── assets/**/*
├── index.html
├── main.js
├── preload.js
└── package.json
```

**Excluded:**
- node_modules/
- dist/
- BuildLogs/
- .git/
- Docs/
- scripts/
- *.md files

### Package Manager Detection

The build wizard automatically detects which package manager to use:

1. **Checks for Bun** - If available, uses `bunx electron-builder`
2. **Falls back to npm** - If Bun not found, uses `npx electron-builder`

**Performance:**
- Bun: 3-5x faster dependency installation
- Same output: Identical build artifacts

**WSL Integration:**
- Automatically detects WSL availability
- Checks for rsync in WSL
- Provides installation guide if dependencies missing
- Runs builds in WSL's native Linux filesystem

### Build Output

All builds are saved to `dist/`:

```
dist/
├── Lightning Games X.Y.Z.exe          # Windows portable executable
├── Lightning Games-X.Y.Z.AppImage     # Linux AppImage executable
├── win-unpacked/                      # Windows unpacked files
└── linux-unpacked/                    # Linux unpacked files
```

**Windows Build:**
- Single portable .exe file
- No installation required
- Runs directly on Windows

**Linux Build (via WSL):**
- Single AppImage executable
- No installation required
- Runs on any Linux distribution
- Built in WSL, copied to Windows dist/

### Recent Fixes (v6.1) - LINUX WSL BUILD COMPLETE ✅

**MAJOR MILESTONE: Linux AppImage builds now fully working via WSL!**

- ✨ **WSL Linux Filesystem Build** - Bypasses all `/mnt/c` permission issues
  - Copies project to WSL native Linux filesystem (`$HOME`)
  - Runs `npm install` and `electron-builder` in Linux environment
  - Copies resulting AppImage back to Windows `dist/` folder
  - Cleans up temporary build directory
  - **Result**: Zero permission errors, reliable builds
  
- ✨ **Bash Script Execution** - Fixed shell escaping issues
  - Creates temporary bash script file instead of inline commands
  - Avoids complex quote escaping in nested shells
  - Proper path expansion with `$HOME` instead of `~`
  - Clean error handling and logging
  
- ✨ **Rsync Integration** - Efficient file copying
  - Checks for rsync availability in WSL
  - Excludes node_modules, dist, BuildLogs, .git
  - Fast incremental copying
  - Automatic installation guide if missing
  
- ✨ **UI Text Corrections** - Reflects actual implementation
  - Changed "Linux AppImage (Docker)" → "Linux AppImage (WSL)"
  - Updated platform selection messages
  - Removed unused Docker detection code
  
- ✨ **Build Verification** - Confirms successful artifact creation
  - Detects AppImage files in dist/
  - Shows file size and location
  - Validates build completion
  
- 🐛 **Fixed Permission Denied (Error 126)** - Root cause was NTFS filesystem
  - Windows filesystem mounted at `/mnt/c` doesn't support Unix permissions
  - `chmod` commands ineffective on NTFS
  - Solution: Build in WSL's native Linux filesystem
  
- 🐛 **Fixed Shell Escaping Issues** - Complex nested quotes
  - Original approach: `wsl bash -c 'command && command && ...'`
  - Problem: Quote escaping became impossible with many commands
  - Solution: Write commands to temporary bash script file
  
- 🐛 **Fixed Path Expansion** - Tilde expansion in bash
  - Original: `~/lightning-games-build-*` (not expanded in script)
  - Fixed: `$HOME/lightning-games-build-*` (properly expanded)

**Test Results:**
- ✅ Linux AppImage: 104.56 MB (Store compression)
- ✅ Build time: ~58 seconds
- ✅ Zero permission errors
- ✅ Artifact successfully copied to Windows dist/
- ✅ Temporary files cleaned up

**How It Works:**
```
1. User runs: npm run dist
2. Select platform: [2] Linux AppImage (WSL)
3. Select compression: [1] Store
4. Build wizard creates temp bash script
5. Script runs in WSL:
   - Copy project to $HOME/lightning-games-build-*
   - npm install (in Linux filesystem)
   - npx electron-builder --linux AppImage
   - Copy AppImage back to Windows dist/
   - Clean up temp directory
6. Result: dist/Lightning Games-X.Y.Z.AppImage
```

**Requirements:**
- WSL installed and working
- rsync available in WSL (auto-check with install guide)
- npm available in WSL
- electron-builder available (installed via npm)

### Recent Fixes (v6.0)

- ✨ Fixed ASAR packaging - All folders now properly included
- ✨ Fixed build configuration - Corrected files list
- ✨ Added version auto-update to UI
- ✨ Added ULTRA MEGA compression level
- ✨ Added Bun support with auto-detection
- 🐛 Fixed missing renderer/, games/, styles/ in builds
- 🐛 Fixed assets/ not being included in ASAR

---

**Built with ⚡ by Tarik**

*End of Technical Documentation*
