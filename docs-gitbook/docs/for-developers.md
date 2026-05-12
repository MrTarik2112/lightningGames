# 👨‍💻 For Developers

Complete guide for developers who want to contribute to Lightning Games. This document covers everything from setting up your development environment to creating new games, understanding the core systems, and following best practices.

---

## 📋 Table of Contents

1. [Development Environment](#development-environment)
2. [Project Architecture](#project-architecture)
3. [Electron Deep Dive](#electron-deep-dive)
4. [Core Systems](#core-systems)
5. [Game Interface Contract](#game-interface-contract)
6. [Adding a New Game](#adding-a-new-game)
7. [Sound Manager](#sound-manager)
8. [Game Manager](#game-manager)
9. [Achievement System](#achievement-system)
10. [Tower Defense Deep Guide](#tower-defense-deep-guide)
11. [UI and Styling](#ui-and-styling)
12. [Data Persistence](#data-persistence)
13. [Build System](#build-system)
14. [Code Standards](#code-standards)
15. [Debugging Guide](#debugging-guide)
16. [Testing Guidelines](#testing-guidelines)
17. [Pull Request Workflow](#pull-request-workflow)
18. [Release Process](#release-process)
19. [Resources](#resources)

---

## 🛠️ Development Environment

### System Requirements

Before you begin development on Lightning Games, ensure your system meets the following requirements. These are the minimum specifications needed to run the development environment and build the application.

| Requirement | Minimum Version | Recommended Version | Notes |
|-------------|-----------------|---------------------|-------|
| **Operating System** | Windows 10 / Ubuntu 20.04 / macOS 11 | Windows 11 / Ubuntu 22.04 / macOS 13 | Full support for Windows, Linux (via WSL), and macOS |
| **Node.js** | v16.0.0 | v20.0.0 LTS or higher | Check with `node -v`. Node 18+ recommended for best performance |
| **npm** | v8.0.0 | v10.0.0 or higher | Comes bundled with Node.js |
| **Git** | v2.30.0 | v2.40.0 or higher | Required for version control |
| **RAM** | 4GB | 8GB or higher | More RAM needed for building |
| **Disk Space** | 2GB free | 5GB free | For dependencies and builds |

### Installing Node.js

If you don't have Node.js installed, follow these steps for your operating system. Choosing the LTS (Long Term Support) version is recommended for stability.

**Windows:**
1. Download the LTS installer from [nodejs.org](https://nodejs.org/)
2. Run the .msi installer
3. Ensure "Add to PATH" is checked
4. Restart your terminal

**macOS (using Homebrew):**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Installing Bun (Optional but Recommended)

Bun is a modern JavaScript runtime that is significantly faster than npm for installing dependencies. It can reduce install times by 3-5x, making development faster.

**Installation:**
```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (using PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

After installation, you can use `bun install` instead of `npm install` throughout the project.

### Initial Setup

The following steps will get you from zero to a running development environment. Make sure you have git configured with your name and email before starting.

```bash
# 1. Clone the repository
git clone https://github.com/MrTarik2112/lightninggames.git
cd lightninggames

# 2. Verify Node.js version
node -v  # Should be v16 or higher

# 3. Install dependencies (choose one)
npm install    # Using npm
# or
bun install    # Using Bun (faster)

# 4. Verify installation
ls node_modules  # Should contain many packages

# 5. Start the application
npm start
# or
bun start
```

### Development Commands Reference

This table shows all available npm scripts for development. Each command serves a specific purpose in the development workflow.

| Command | Usage | Description |
|---------|-------|-------------|
| `npm start` | `npm start` | Starts the app in development mode with hot reload |
| `npm run dev` | `npm run dev` | Starts with debug flags enabled for troubleshooting |
| `npm run dist` | `npm run dist` | Opens the interactive build wizard |
| `npm run build:win` | `npm run build:win` | Builds only Windows portable executable |
| `npm run build:linux` | `npm run build:linux` | Builds only Linux AppImage (requires WSL) |
| `npm run build:all` | `npm run build:all` | Builds for both Windows and Linux |
| `npm run test` | `npm run test` | Runs the test suite |
| `npm run lint` | `npm run lint` | Runs code linter to check style |
| `npm run validate` | `npm run validate` | Validates all game files |
| `npm run stats` | `npm run stats` | Shows project statistics |

### VS Code Setup (Recommended)

While you can use any text editor, VS Code is recommended for this project due to its excellent JavaScript support and debugging capabilities.

**Recommended Extensions:**
- ESLint - JavaScript linting
- Prettier - Code formatting
- GitLens - Git integration
- Live Server - Local development server
- Thunder Client - API testing (if needed)

**Recommended Settings (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.tabSize": 4,
  "editor.insertSpaces": true,
  "files.associations": {
    "*.js": "javascript"
  },
  "javascript.validate.enable": true,
  "eslint.enable": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 🏗️ Project Architecture

### High-Level Architecture

Lightning Games follows a client-server architecture using Electron. The main process acts as the server, managing window lifecycle, system tray, and global shortcuts. The renderer process handles all UI and game logic.

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Main Process                   │
├─────────────────────────────────────────────────────────────┤
│  • Window Management                                        │
│  • System Tray Integration                                  │
│  • Global Shortcuts (Ctrl+Alt+G)                           │
│  • IPC Communication                                       │
│  • GPU Optimization Flags                                   │
│  • Single Instance Lock                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                     contextBridge
                     (preload.js)
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Renderer Process                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Launcher   │  │ GameManager  │  │  SoundManager   │  │
│  │     (UI)     │  │ (Game Loop)  │  │   (Audio API)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Particles  │  │    Games     │  │    Styles       │  │
│  │   (Effects)  │  │   (59 impl)  │  │   (main.css)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

Understanding the project structure is essential for effective contribution. Each directory has a specific purpose and contains related files.

```
lightningGames/
├── main.js                 # Electron main process - window management, tray, shortcuts
├── preload.js              # Secure IPC bridge using contextBridge
├── index.html              # App shell with canvas container
├── package.json            # Project configuration and dependencies
│
├── games/                  # All game implementations (59 games)
│   ├── arcade/            # 25 arcade games
│   │   ├── snake.js       # Classic snake game
│   │   ├── tetris.js      # Block stacking game
│   │   ├── pacman.js      # Pac-Man with 4 ghosts
│   │   ├── asteroids.js   # Space survival
│   │   └── ... (more)
│   ├── puzzle/            # 10 puzzle games
│   │   ├── game2048.js    # Number merging
│   │   ├── memory.js      # Card matching
│   │   ├── minesweeper.js # Logic deduction
│   │   └── ... (more)
│   ├── classic/           # 3 classic games
│   │   ├── pong.js        # Solo paddle
│   │   ├── neonduel.js    # 2-player
│   │   └── breakout.js    # Brick breaking
│   ├── strategy/          # 1 strategy game
│   │   └── towerdefense.js # Complex TD with 8 towers
│   └── creative/          # 2 creative games
│       ├── piano.js       # Synthesizer
│       └── neondraw.js    # Drawing canvas
│
├── renderer/               # Core UI and game management
│   ├── launcher.js        # Main UI engine (~800 lines)
│   │                     # - Game card grid & search
│   │                     # - Tab system (All, Arcade, Puzzle...)
│   │                     # - Settings panel
│   │                     # - Achievement display
│   │                     # - Stats dashboard
│   ├── gameManager.js     # Game lifecycle (~600 lines)
│   │                     # - Game registration
│   │                     # - requestAnimationFrame loop
│   │                     # - Score tracking
│   │                     # - Achievement unlock logic
│   │                     # - High score management
│   ├── soundManager.js    # Audio engine (~400 lines)
│   │                     # - Web Audio API synthesis
│   │                     # - 25+ sound effects
│   │                     # - 8-bit music generation
│   │                     # - Volume control
│   └── particles.js       # Background effects (~200 lines)
│                         # - Animated neon particles
│                         # - Theme-aware colors
│
├── styles/                # CSS design system
│   └── main.css           # Complete stylesheet (~1200 lines)
│                         # - CSS custom properties
│                         # - 11 themes
│                         # - Glassmorphism components
│                         # - Animations & transitions
│
├── assets/                 # Static assets
│   ├── icon.png          # Main icon (256x256)
│   ├── icon.ico          # Windows icon
│   └── icons/            # Multi-resolution icons
│
├── scripts/               # Build utilities
│   ├── build.js          # Interactive build wizard
│   ├── dev.js            # Development server
│   ├── clean.js          # Cleanup utility
│   ├── stats.js          # Project statistics
│   ├── test.js           # Test suite
│   ├── validate.js       # Game validator
│   ├── lint.js           # Code linter
│   ├── package.js        # Quick packager
│   └── release.js        # Release manager
│
└── dist/                  # Build output (generated)
    └── Lightning Games.exe
```

### File Statistics

Having an understanding of the codebase size helps contextualize the project. The following are approximate line counts for major components.

| Component | Approximate Lines | Description |
|-----------|-------------------|-------------|
| **Total Code** | ~8,700 lines | All JavaScript, CSS, and HTML |
| **Game Files** | ~5,000 lines | 59 games at ~80-300 lines each |
| **Tower Defense** | ~1,300 lines | Largest single game |
| **Renderer Code** | ~2,000 lines | launcher.js, gameManager.js, etc. |
| **Styles** | ~1,200 lines | Complete CSS design system |
| **Build Scripts** | ~450 lines | Build and utility scripts |

---

## ⚡ Electron Deep Dive

### Main Process (main.js)

The main process is the entry point of the Electron application. It manages the application lifecycle, creates windows, handles system tray integration, and registers global shortcuts. Understanding main.js is essential for any features related to system integration.

**Key Responsibilities:**

```javascript
// Window Configuration
const mainWindow = new BrowserWindow({
    width: 960,                    // Fixed width
    height: 700,                  // Fixed height
    resizable: false,             // No resizing
    frame: false,                 // Frameless (custom title bar)
    transparent: true,            // Transparent background
    alwaysOnTop: true,           // Always visible
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,  // Security: disable node integration
        contextIsolation: true,   // Security: isolate context
        enableRemoteModule: false // Security: disable remote module
    }
});
```

**GPU Optimization Flags:**

These flags are applied before `app.ready()` to enable hardware acceleration and improve performance.

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

**System Tray Integration:**

The tray icon provides quick access to the application from anywhere on the system. It shows a cyan lightning bolt and includes context menu options.

```javascript
// Tray icon created from programmatic canvas drawing
const tray = new Tray(createTrayIcon());

// Context menu
const contextMenu = Menu.buildFromTemplate([
    { label: 'Open (Ctrl+Alt+G)', click: showWindow },
    { label: 'Run at Startup', type: 'checkbox', checked: false },
    { type: 'separator' },
    { label: 'Quit Completely', click: () => app.quit() }
]);

tray.setContextMenu(contextMenu);
tray.on('click', toggleWindow);
```

**Global Shortcuts:**

The Ctrl+Alt+G hotkey allows users to open the application from anywhere on their system, even when the app is minimized or in the background.

```javascript
// Global shortcut registration
globalShortcut.register('Ctrl+Alt+G', () => {
    if (mainWindow.isVisible()) {
        mainWindow.hide();
    } else {
        mainWindow.show();
    }
});
```

### Preload Script (preload.js)

The preload script creates a secure bridge between the main process and renderer. It uses contextBridge to expose only specific, safe methods, preventing direct access to Node.js APIs from the renderer.

**Security Model:**

The preload script ensures security through several mechanisms. Context isolation prevents the renderer from accessing Node.js APIs directly. The limited API surface exposes only specific IPC channels needed for window control. Additionally, the main process has complete control over what happens when these channels are invoked.

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

**IPC Channels:**

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `close-window` | Renderer → Main | Hide/minimize window |
| `quit-app` | Renderer → Main | Fully quit application |
| `window-hiding` | Main → Renderer | App about to hide |
| `window-showing` | Main → Renderer | App now visible |

### Window Lifecycle

The application implements a specific lifecycle for showing and hiding the window, ensuring smooth transitions and proper resource management.

**Show Sequence:**
1. Fade-in animation (350ms)
2. Position at cursor location
3. Focus the window
4. Send window-showing event to renderer

**Hide Sequence:**
1. Fade-out animation (350ms)
2. Minimize to tray
3. Send window-hiding event to renderer

**Single Instance Lock:**

Only one instance of the application can run at a time. This prevents multiple windows and ensures all user data is in one place.

```javascript
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) app.quit();
```

---

## 🎮 Core Systems

### Game Manager (gameManager.js)

The GameManager is the central engine that manages the complete game lifecycle. It handles game registration, instantiation, the game loop, score tracking, achievement unlocking, and statistics aggregation.

**Class Structure:**

```javascript
class GameManager {
    // Game Registry
    games = {};                    // { gameId: GameClass }
    activeGame = null;             // Currently playing game instance
    
    // Scoring & Achievements
    highScores = {};               // { gameId: score }
    achievements = [];            // [ achievementId, ... ]
    
    // User Preferences
    settings = {
        reducedMotion: false,
        shakeIntensity: 5,
        renderScale: 1.0
    };
    favorites = [];                // [ gameId, ... ]
    theme = 'default';
    volume = 0.7;
    
    // Statistics
    totalGamesPlayed = 0;
    totalPlayTime = 0;
    uniqueGamesPlayed = [];
    consecutiveGames = 0;
    lastGameId = null;
}
```

**Game Loop Implementation:**

The game loop uses requestAnimationFrame for smooth 60fps rendering. Delta time (dt) is calculated between frames and used for frame-independent physics calculations.

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

### Launcher (launcher.js)

The Launcher is the main user interface engine. It handles game selection, search, filtering, settings display, achievement viewing, and statistics display.

**Key Components:**

The launcher includes several major UI sections. The game grid displays cards for all available games in a responsive layout. The search bar provides real-time fuzzy matching across game names and descriptions. The tab system organizes games by category (All, Arcade, Puzzle, Classic, Strategy, Creative). The settings panel provides access to all customization options. The achievement display shows toast notifications and a detailed achievement list.

**Event Delegation Pattern:**

For performance optimization, the launcher uses event delegation instead of attaching listeners to each individual game card.

```javascript
// Single listener on grid, not per-card
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

### Sound Manager (soundManager.js)

The SoundManager uses the Web Audio API to synthesize all sounds programmatically. There are no audio files in the project - every sound is generated in real-time using oscillators and noise generators.

**Sound Categories:**

| Category | Waveform | Description |
|----------|----------|-------------|
| UI Sounds | Triangle, Sine | Click, hover, navigation |
| Game Sounds | Square, Sawtooth | Jump, death, shoot, explosion |
| Music | Square (arpeggio) | 8-bit background music |

**Adding New Sounds:**

To add a new sound effect, create a new method in the SoundManager class following the established pattern of oscillator creation, frequency modulation, and gain control.

```javascript
playMySound() {
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    // Configure oscillator
    oscillator.type = 'square';  // square, sine, triangle, sawtooth
    oscillator.frequency.setValueAtTime(440, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(220, this.context.currentTime + 0.1);
    
    // Configure gain (volume envelope)
    gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    // Play and stop
    oscillator.start();
    oscillator.stop(this.context.currentTime + 0.1);
}
```

### Particles (particles.js)

The ParticleSystem creates animated background effects that adapt to the current theme. It provides the neon aesthetic that gives Lightning Games its distinctive look.

```javascript
class ParticleSystem {
    particles = [];
    
    update(dt) {
        this.particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
        });
        // Remove dead particles
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

---

## 🎯 Game Interface Contract

Every game in Lightning Games must implement this standardized interface. This ensures compatibility with the GameManager and consistent behavior across all games.

### Required Interface Methods

The following methods must be implemented by every game class. Each serves a specific purpose in the game lifecycle.

```javascript
class GameName {
    constructor() {
        this.score = 0;
        this.gameOver = false;
    }

    // init(canvas, ctx) - Called once when game starts
    // canvas: HTMLCanvasElement (880x540)
    // ctx: CanvasRenderingContext2D
    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Initialize game state, load assets, setup event listeners
    }

    // update(dt) - Called every frame before draw()
    // dt: Delta time in seconds (typically 0.016 for 60fps)
    // Frame-independent movement: position += velocity * dt
    update(dt) {
        if (this.gameOver) return;
        
        // Update game logic, physics, AI, etc.
    }

    // draw() - Called every frame after update()
    // Render all game elements to canvas
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        // Draw game sprites
        // Draw UI (score, etc.)
    }

    // getScore() - Return current score
    getScore() {
        return this.score;
    }

    // isGameOver() - Return true when game ends
    isGameOver() {
        return this.gameOver;
    }

    // destroy() - Clean up resources
    destroy() {
        // Remove event listeners added in init()
        // Cancel setInterval/setTimeout
    }
}
```

### Best Practices

Following these best practices ensures games work correctly with the GameManager and provide a smooth player experience.

**Frame-Independent Movement:**

Always multiply velocity by delta time (dt). This ensures consistent gameplay regardless of frame rate fluctuations.

```javascript
// ✅ Correct - Frame independent
this.x += this.velocityX * dt;

// ❌ Wrong - Frame dependent
this.x += this.velocityX;
```

**Canvas Clearing:**

Always clear the canvas before drawing each frame to prevent visual artifacts and ensure clean rendering.

```javascript
draw() {
    // Clear entire canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw game elements
}
```

**Event Listener Cleanup:**

Remove all event listeners in the destroy() method to prevent memory leaks and ensure clean state when switching games.

```javascript
destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.handleResize);
    if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
}
```

**Sound Effects:**

Use the global SoundManager for consistent audio across all games.

```javascript
// Available sound effects
window.soundManager.playJump();
window.soundManager.playDeath();
window.soundManager.playExplosion();
window.soundManager.playEat();
window.soundManager.playShoot();
window.soundManager.playWin();
```

---

## ➕ Adding a New Game

This section provides a complete, step-by-step guide to adding a new game to Lightning Games. Follow these steps to ensure your game integrates properly with the existing systems.

### Step 1: Create Game File

Create a new file in the `games/` directory. The file name should be lowercase and match the class name.

**File: games/mygame.js**

```javascript
class MyGame {
    constructor() {
        this.score = 0;
        this.gameOver = false;
        
        // Game-specific state
        this.player = { x: 100, y: 100, width: 20, height: 20 };
        this.velocity = { x: 0, y: 0 };
        this.speed = 200;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Setup input handling
        document.addEventListener('keydown', (e) => this.handleInput(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Initialize game state
        this.reset();
    }

    reset() {
        this.score = 0;
        this.gameOver = false;
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    update(dt) {
        if (this.gameOver) return;
        
        // Update player position
        this.player.x += this.velocity.x * dt;
        this.player.y += this.velocity.y * dt;
        
        // Boundary collision
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > this.width - this.player.width) {
            this.player.x = this.width - this.player.width;
        }
        if (this.player.y < 0) this.player.y = 0;
        if (this.player.y > this.height - this.player.height) {
            this.player.y = this.height - this.player.height;
        }
        
        // Game logic here
        // Check collisions, update score, etc.
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.ctx.fillStyle = '#050512';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw player
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.shadowBlur = 20;
        this.ctx.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
        this.ctx.shadowBlur = 0;
        
        // Draw score
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Orbitron';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        
        // Draw game over overlay
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#ff00aa';
            this.ctx.font = '40px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '20px Orbitron';
            this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 40);
            this.ctx.textAlign = 'left';
        }
    }

    getScore() {
        return this.score;
    }

    isGameOver() {
        return this.gameOver;
    }

    destroy() {
        document.removeEventListener('keydown', (e) => this.handleInput(e));
        document.removeEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleInput(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.velocity.y = -this.speed;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.velocity.y = this.speed;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.velocity.x = -this.speed;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.velocity.x = this.speed;
                break;
        }
    }

    handleKeyUp(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
            case 'ArrowDown':
            case 's':
            case 'S':
                this.velocity.y = 0;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.velocity.x = 0;
                break;
        }
    }
}
```

### Step 2: Register in index.html

Add your game script to index.html before the other game scripts. The order matters for loading sequence.

```html
<!-- Add your game before the closing body tag -->
<script src="games/mygame.js"></script>
```

### Step 3: Add to Launcher Configuration

In `renderer/launcher.js`, add your game to the `GAME_CARDS_CONFIG` array. This configuration controls how your game appears in the UI.

```javascript
{
    id: 'mygame',
    icon: '🎮',
    name: 'My Game',
    desc: 'An awesome game I created',
    category: 'arcade',  // Options: arcade, puzzle, classic, strategy, creative
    color: '--accent-cyan',  // Use existing CSS variable
    glowColor: 'rgba(0, 212, 255, 0.12)',
    borderColor: 'rgba(0, 212, 255, 0.35)',
    shadowColor: '0 0 30px rgba(0, 212, 255, 0.2)'
}
```

### Step 4: (Optional) Add Achievements

To add achievements for your game, first add to `ALL_ACHIEVEMENTS` in launcher.js:

```javascript
{ 
    id: 'mygame_beginner', 
    title: 'Beginner', 
    desc: 'Score 100 points in My Game.', 
    icon: '🌟', 
    normal: true 
},
{ 
    id: 'mygame_pro', 
    title: 'Pro Player', 
    desc: 'Score 500 points in My Game.', 
    icon: '🏆', 
    ultra: true 
},
{ 
    id: 'mygame_master', 
    title: 'Master', 
    desc: 'Score 1000 points in My Game.', 
    icon: '👑', 
    ultra: true 
}
```

Then add unlock logic in `gameManager.js` inside the `checkAchievements()` method:

```javascript
// MyGame achievements
if (gameId === 'mygame' && score >= 100) {
    this.unlockAchievement('mygame_beginner');
}
if (gameId === 'mygame' && score >= 500) {
    this.unlockAchievement('mygame_pro');
}
if (gameId === 'mygame' && score >= 1000) {
    this.unlockAchievement('mygame_master');
}
```

---

## 🏆 Achievement System

Lightning Games features a comprehensive achievement system with 100+ achievements across multiple categories. Understanding this system helps you create meaningful achievements for your games.

### Achievement Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Normal** | Basic progression | First game, first score, first win |
| **Game-Specific** | Per-game milestones | Snake: 100, 250, 500, 1000 points |
| **Progression** | Games played milestones | 10, 50, 100, 500 games |
| **Time-Based** | Playing at specific times | Night Owl, Early Bird, Weekend |
| **Playtime** | Total time played | 1 hour, 10 hours, 24 hours |
| **Collection** | Unlocking achievements | 15, 30, 50 achievements |
| **Social/UI** | Using features | Tab switching, theme changing |
| **Hidden** | Secret/discoverable | Lucky Seven, Close Call |

### Achievement Rarity Tiers

| Tier | Unlock Rate | Description |
|------|-------------|-------------|
| **Normal** | 50%+ | Most players will unlock |
| **Ultra** | 10-50% | Requires dedication |
| **Legendary** | <5% | Very rare |
| **Hidden** | <1% | Secret/discoverable |

### Checking Achievements

Achievements are checked in the GameManager's `checkAchievements()` method, called after each game ends.

```javascript
checkAchievements(gameId, score, stats) {
    // Normal achievements
    if (score >= 1000) this.unlockAchievement('score_1000');
    if (this.totalGamesPlayed >= 10) this.unlockAchievement('warmup');
    
    // Game-specific achievements
    if (gameId === 'snake' && score >= 100) this.unlockAchievement('snake_100');
    if (gameId === 'tetris' && score >= 500) this.unlockAchievement('tetris_500');
    
    // Ultra achievements
    if (this.totalGamesPlayed >= 50) this.unlockAchievement('marathon_runner');
    if (this.totalPlayTime >= 3600) this.unlockAchievement('addict');
    
    // Time-based achievements
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 8) this.unlockAchievement('night_owl');
    
    // Check for Godly achievement
    if (this.achievements.length === 36) this.unlockAchievement('godly');
}
```

---

## 🗼 Tower Defense Deep Guide

Tower Defense is the most complex game in Lightning Games, featuring 8 tower types, 6 enemy types, 3 super abilities, and 50+ waves. This section provides in-depth coverage of how the game works.

### Tower Types (8 Total)

Each tower has unique stats and abilities. Understanding tower mechanics is essential for balancing and extending the game.

| Tower | Icon | Cost | Range | DPS | Fire Rate | Special |
|-------|------|------|-------|-----|-----------|---------|
| **Laser** | ⚡ | $75 | 140px | 75 | 3/sec | Single target |
| **Cannon** | 💥 | $125 | 120px | 60 | 1/sec | 60px AoE splash |
| **Cryo** | ❄️ | $100 | 100px | 30 | 2/sec | 50% slow for 3s |
| **Sniper** | 🎯 | $200 | 250px | 75 | 0.5/sec | Pierces 3 enemies |
| **Tesla** | 🔷 | $175 | 110px | 140 | 4/sec | Chain to 3 targets |
| **Missile** | 🚀 | $300 | 180px | 84 | 0.7/sec | Homing + 80px splash |
| **Aura** | ✨ | $150 | 100px | 0 | - | +30% damage to nearby |
| **Venom** | 🐍 | $160 | 130px | 15 | 1.5/sec | Poison over time |

### Enemy Types (6 Total)

Enemies scale in difficulty as waves progress. Each type has unique behavior and counters.

| Enemy | Icon | HP | Speed | Reward | Behavior |
|-------|------|-----|-------|--------|----------|
| **Normal** | 🔴 | 40 | 50 | $8 | Standard path follower |
| **Fast** | 🟡 | 25 | 90 | $6 | Nearly 2x speed |
| **Tank** | 🟣 | 150 | 30 | $20 | Slow-moving HP sponge |
| **Boss** | 👑 | 500 | 25 | $100 | Appears every 10 waves |
| **Healer** | 🟢 | 60 | 40 | $15 | Regenerates nearby allies |
| **Flying** | 🔵 | 35 | 70 | $10 | Ignores ground path |

### Super Abilities (3 Total)

Players can activate three powerful abilities during gameplay.

| Ability | Icon | Cooldown | Effect |
|---------|------|----------|--------|
| **Nuke** | 💥 | 60s | 200 damage to ALL enemies |
| **Slow Field** | ❄️ | 30s | All enemies 30% slow for 5s |
| **Damage Boost** | ⚡ | 45s | All towers 2x damage for 10s |

### Wave Progression

Waves scale in difficulty throughout the game. After wave 50, endless mode activates with infinite scaling.

```
Waves 1-10:   Introduction - Mostly Normal enemies
Waves 11-25:  Escalation - Mix of Normal, Fast, Tank
Waves 26-40:  Intensity - Healers and Flying enemies
Waves 41-50:  Endgame - All enemy types combined
Waves 50+:    Endless - Infinite scaling
```

---

## 🎨 UI and Styling

### CSS Design System

Lightning Games uses CSS custom properties (variables) for theming and styling. This enables instant theme switching without reloading.

### Base Variables

```css
:root {
    /* Backgrounds */
    --bg-primary: #050512;
    --bg-secondary: rgba(10, 10, 25, 0.75);
    --bg-card: rgba(16, 16, 42, 0.65);
    
    /* Text Colors */
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.7);
    
    /* Accent Colors */
    --accent-cyan: #00d4ff;
    --accent-magenta: #ff00aa;
    --accent-green: #00ff88;
    
    /* Effects */
    --glow-cyan: 0 0 30px rgba(0, 220, 255, 0.25);
    --transition-fast: 150ms ease-out;
    --transition-normal: 300ms ease-out;
}
```

### Theme Variants

Each theme changes the CSS variables to provide a different visual experience.

```css
[data-theme="retro"] {
    --bg-primary: #1a1a00;
    --accent-cyan: #ffaa00;
    --accent-magenta: #ff6600;
}

[data-theme="forest"] {
    --bg-primary: #001a0a;
    --accent-cyan: #00ff88;
    --accent-magenta: #00cc66;
}
```

### Component Styles

**Game Card:**

```css
.game-card {
    background: var(--bg-card);
    border: 1px solid var(--border-glow);
    border-radius: 12px;
    padding: 16px;
    transition: all var(--transition-normal);
    box-shadow: var(--glow-cyan);
}

.game-card:hover {
    background: var(--bg-card-hover);
    transform: translateY(-4px);
}
```

---

## 💾 Data Persistence

All data is stored locally using the browser's localStorage API. Understanding the data schema helps when implementing features that persist user progress.

### Storage Keys

| Key | Type | Example |
|-----|------|---------|
| `lg_data` | JSON Object | All game data |
| `lg_highscores` | JSON Object | `{ snake: 142, tetris: 890 }` |
| `lg_achievements` | JSON Array | `[ "first_game", "warmup" ]` |
| `lg_theme` | String | `"neon"` |
| `lg_volume` | Number | `0.7` |

### Data Schema

```javascript
{
    highScores: { gameId: score },
    achievements: [ achievementId, ... ],
    settings: { key: value },
    theme: 'default',
    volume: 0.7,
    totalGamesPlayed: 0,
    totalPlayTime: 0,
    uniqueGamesPlayed: [ gameId, ... ],
    favorites: [ gameId, ... ],
    lastGameId: 'snake',
    lastPlayed: { gameId: timestamp }
}
```

### Saving Data

Data is automatically saved with debouncing to prevent excessive writes.

```javascript
saveProgress() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
        localStorage.setItem('lg_data', JSON.stringify(data));
    }, 250);  // 250ms delay
}
```

---

## 🔧 Build System

### Build Options

The project uses an interactive build wizard that guides users through the build process.

```bash
# Interactive wizard (recommended)
npm run dist

# Direct builds
npm run build:win      # Windows portable
npm run build:linux    # Linux AppImage (requires WSL)
npm run build:all      # Both platforms
```

### Compression Levels

| Level | Name | Time | Size | Use Case |
|:-----:|------|------|------|----------|
| 0 | Store | ~5s | ~140MB | Quick testing |
| 1-3 | Fast | ~20-50s | ~125-105MB | Development |
| 4-6 | Normal | ~70s-2m | ~95-75MB | General releases |
| 7-9 | High | ~3-8m | ~65-45MB | High compression |
| 10 | MaxComp | ~15m | ~35MB | Maximum compression |

---

## 📝 Code Standards

### JavaScript Rules

| Rule | Description | Example |
|------|-------------|---------|
| Use `let`/`const` | Never use `var` | `const PI = 3.14;` |
| Use `===` | Never use `==` | `if (a === b)` |
| No `alert()` | Use custom UI | - |
| No `debugger` | Remove before commit | - |
| Max line length | 100 characters | - |

### Naming Conventions

```javascript
// Variables and functions - camelCase
let playerScore = 0;
function calculatePosition() {}

// Classes - PascalCase
class SnakeGame {}
class TowerDefense {}

// Constants - UPPER_SNAKE_CASE
const MAX_SPEED = 100;
const GRAVITY = 9.8;

// File names - lowercase with hyphens
// snake-game.js
// tower-defense.js
```

### Commenting Guidelines

Use JSDoc for all functions and complex logic. Keep comments updated with code changes and never leave commented-out code in the codebase.

```javascript
/**
 * Updates the position of an entity based on velocity and delta time.
 * @param {Object} entity - The entity to update
 * @param {number} dt - Delta time in seconds
 * @returns {Object} Updated entity position
 * @example
 * const player = { x: 0, y: 0, vx: 100, vy: 50 };
 * updatePosition(player, 0.016);
 */
function updatePosition(entity, dt) {
    return {
        x: entity.x + entity.vx * dt,
        y: entity.y + entity.vy * dt
    };
}
```

---

## 🐛 Debugging Guide

### Console Debugging

The application logs extensively to help troubleshoot issues. Enable logging to see detailed information about game events, state changes, and errors.

```javascript
// Logging in games
console.log('[MyGame] Initializing game');
console.warn('[MyGame] Warning message');
console.error('[MyGame] Error:', error);
```

### Chrome DevTools

Use Chrome DevTools for debugging the renderer process. Press F12 or right-click and select Inspect.

**Useful Panels:**
- **Console** - View logs and errors
- **Sources** - Set breakpoints and step through code
- **Network** - Monitor network requests (if any)
- **Application** - View localStorage and cookies
- **Performance** - Profile frame rates and CPU usage

### Common Issues

| Issue | Solution |
|-------|----------|
| Game not starting | Check console for errors |
| Controls not working | Click canvas to focus |
| Sound not playing | Check volume settings |
| Performance issues | Enable FPS counter in settings |

---

## 🧪 Testing Guidelines

### Manual Testing

Always test changes in both development mode and built version before submitting.

```bash
# Test in development
npm start

# Test in built version
npm run dist
```

### Test Checklist

- [ ] Game starts without errors
- [ ] Controls work correctly
- [ ] Score updates properly
- [ ] Game over triggers correctly
- [ ] Sound effects play
- [ ] No console errors
- [ ] Works in built version

### Validation

```bash
# Validate specific game
node scripts/validate.js snake

# Validate all games
node scripts/validate.js
```

---

## 🔀 Pull Request Workflow

### 1. Fork & Clone

```bash
# Fork on GitHub, then clone
git clone https://github.com/YOUR_USERNAME/lightninggames.git
cd lightninggames
```

### 2. Create Branch

```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Or bugfix branch
git checkout -b fix/bug-description
```

### 3. Make Changes

```bash
# Make your changes
git add .
git commit -m "Add: My new feature"
```

### 4. Run Validation

Before pushing, run validation tools:

```bash
npm run lint      # Check code style
npm run validate  # Validate games
npm run test      # Run tests
```

### 5. Push & PR

```bash
# Push to your fork
git push origin feature/my-new-feature
```

Then open a PR on GitHub with the following template:

```markdown
## Description
What does this PR do?

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Enhancement
- [ ] Documentation

## Testing
- [ ] Tested locally
- [ ] No new warnings/errors

## Screenshots
If applicable
```

---

## 📦 Release Process

### Version Bumping

The project follows semantic versioning (MAJOR.MINOR.PATCH). Use the version script to update versions properly.

```bash
# Bump patch version
node scripts/version.js patch

# Bump minor version
node scripts/version.js minor

# Bump major version
node scripts/version.js major

# Set specific version
node scripts/version.js 2.5.0
```

### Building Release

```bash
# Run interactive build wizard
npm run dist
```

The build wizard will prompt for:
1. New version number
2. Compression level (0-10)
3. Target platform (Windows/Linux/Both)

---

## 📚 Resources

### Official Documentation

- [Electron Documentation](https://www.electronjs.org/docs) - Official Electron docs
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - MDN Canvas reference
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - MDN Web Audio reference

### Tools

- [Chrome DevTools](https://developer.chrome.com/docs/devtools) - Browser debugging
- [VS Code](https://code.visualstudio.com) - Recommended code editor
- [GitHub Desktop](https://desktop.github.com) - Git GUI client

### Community

- Discord: [Join here](https://discord.gg/hbNRTQFbjT)
- GitHub Issues: [Report bugs](https://github.com/MrTarik2112/lightninggames/issues)

---

## ❓ Getting Help

If you need assistance with development, there are several ways to get help:

1. **GitHub Discussions** - Ask questions and share ideas
2. **Discord** - Real-time chat with community
3. **GitHub Issues** - Report bugs and request features

When asking for help, provide:
- Your operating system
- Node.js/Bun version
- Steps to reproduce
- Error messages
- Relevant code snippets

---

## ✅ Quick Reference

```bash
# Setup
npm install
npm start

# Development
npm run dev        # Dev mode
npm run lint       # Check code style
npm run validate   # Validate games

# Build
npm run dist       # Interactive build
npm run build:win  # Windows only

# Test
npm run test       # Run tests
```

---

## 🚀 Performance Optimization

Performance is critical for games that need to run at 60fps. This section covers techniques to optimize your game code and ensure smooth gameplay across different hardware configurations.

### Frame Rate Management

The target frame rate is 60fps, which means each frame has approximately 16.67 milliseconds to complete. Use delta time to ensure consistent physics regardless of frame rate fluctuations.

```javascript
// Frame time calculation
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS; // ~16.67ms

// In your update loop
update(dt) {
    // Cap dt to prevent physics explosion on lag
    const cappedDt = Math.min(dt, 0.05);
    
    // Update physics with capped delta time
    this.velocity += this.acceleration * cappedDt;
    this.position += this.velocity * cappedDt;
}
```

### Rendering Optimization

Optimize your rendering to minimize GPU load and ensure smooth animations. The canvas context operations can be expensive if not handled efficiently.

**Batch Similar Draw Calls:**

```javascript
// ❌ Inefficient - multiple draw calls
this.ctx.fillStyle = '#00d4ff';
this.particles.forEach(p => {
    this.ctx.fillRect(p.x, p.y, p.size, p.size);
});

// ✅ Efficient - batch draw
this.ctx.fillStyle = '#00d4ff';
this.ctx.beginPath();
this.particles.forEach(p => {
    this.ctx.rect(p.x, p.y, p.size, p.size);
});
this.ctx.fill();
```

**Use requestAnimationFrame Properly:**

```javascript
// ✅ Correct - use rAF for game loop
startGameLoop() {
    let lastTime = performance.now();
    
    const loop = (currentTime) => {
        const dt = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        
        this.update(dt);
        this.draw();
        
        requestAnimationFrame(loop);
    };
    
    requestAnimationFrame(loop);
}
```

### Memory Management

Prevent memory leaks by properly cleaning up resources when games end or switch.

```javascript
destroy() {
    // Remove all event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('mousedown', this.handleMouseDown);
    
    // Clear intervals and timeouts
    if (this.gameTimer) clearInterval(this.gameTimer);
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    
    // Clear arrays
    this.particles = [];
    this.enemies = [];
    this.projectiles = [];
    
    // Remove canvas references
    this.canvas = null;
    this.ctx = null;
}
```

### Object Pooling

For games that create and destroy many objects (bullets, particles, enemies), use object pooling to avoid garbage collection overhead.

```javascript
class BulletPool {
    constructor(size) {
        this.pool = [];
        this.active = [];
        
        // Pre-allocate bullets
        for (let i = 0; i < size; i++) {
            this.pool.push({
                x: 0, y: 0, vx: 0, vy: 0,
                active: false, width: 5, height: 5
            });
        }
    }
    
    get() {
        // Find inactive bullet in pool
        const bullet = this.pool.find(b => !b.active);
        if (bullet) {
            bullet.active = true;
            this.active.push(bullet);
        }
        return bullet;
    }
    
    release(bullet) {
        bullet.active = false;
        const index = this.active.indexOf(bullet);
        if (index > -1) this.active.splice(index, 1);
    }
    
    updateAll(dt) {
        this.active.forEach(bullet => {
            bullet.x += bullet.vx * dt;
            bullet.y += bullet.vy * dt;
            
            // Deactivate if off screen
            if (bullet.x < 0 || bullet.x > 880 || 
                bullet.y < 0 || bullet.y > 540) {
                this.release(bullet);
            }
        });
    }
}
```

### Performance Profiling

Use the built-in FPS counter to monitor performance. Enable it in Settings → Display → Show FPS.

```javascript
// Manual FPS calculation (for debugging)
let frameCount = 0;
let lastFpsUpdate = performance.now();

update(dt) {
    frameCount++;
    const now = performance.now();
    
    if (now - lastFpsUpdate >= 1000) {
        console.log(`FPS: ${frameCount}`);
        frameCount = 0;
        lastFpsUpdate = now;
    }
}
```

---

## 🎮 Advanced Game Patterns

This section covers advanced game development patterns and techniques used in Lightning Games. These patterns help create polished, maintainable game code.

### State Machine Pattern

Use a state machine to manage complex game states cleanly.

```javascript
class GameState {
    constructor() {
        this.states = {
            MENU: 'menu',
            PLAYING: 'playing',
            PAUSED: 'paused',
            GAME_OVER: 'gameover'
        };
        this.currentState = this.states.MENU;
    }
    
    setState(newState) {
        // Exit current state
        this.exitState(this.currentState);
        
        // Set new state
        this.currentState = newState;
        
        // Enter new state
        this.enterState(newState);
    }
    
    enterState(state) {
        switch(state) {
            case this.states.PLAYING:
                this.startGame();
                break;
            case this.states.GAME_OVER:
                this.showGameOver();
                break;
        }
    }
    
    exitState(state) {
        switch(state) {
            case this.states.PLAYING:
                this.pauseGame();
                break;
        }
    }
    
    update(dt) {
        switch(this.currentState) {
            case this.states.MENU:
                this.updateMenu(dt);
                break;
            case this.states.PLAYING:
                this.updateGame(dt);
                break;
            case this.states.PAUSED:
                // No updates while paused
                break;
            case this.states.GAME_OVER:
                this.updateGameOver(dt);
                break;
        }
    }
}
```

### Entity-Component Pattern

Separate data from behavior for more flexible game objects.

```javascript
// Component - Data
class PositionComponent {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

class VelocityComponent {
    constructor(vx = 0, vy = 0) {
        this.vx = vx;
        this.vy = vy;
    }
}

class RenderComponent {
    constructor(color, width, height) {
        this.color = color;
        this.width = width;
        this.height = height;
    }
}

// Entity - Collection of components
class Entity {
    constructor() {
        this.components = new Map();
    }
    
    addComponent(name, component) {
        this.components.set(name, component);
    }
    
    getComponent(name) {
        return this.components.get(name);
    }
    
    hasComponent(name) {
        return this.components.has(name);
    }
}

// System - Logic
class MovementSystem {
    update(entities, dt) {
        entities.forEach(entity => {
            const pos = entity.getComponent('position');
            const vel = entity.getComponent('velocity');
            
            if (pos && vel) {
                pos.x += vel.vx * dt;
                pos.y += vel.vy * dt;
            }
        });
    }
}
```

### Observer Pattern for Events

Decouple game systems using an event system.

```javascript
class EventEmitter {
    constructor() {
        this.listeners = new Map();
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        }
    }
    
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(cb => cb(data));
        }
    }
}

// Usage in game
const events = new EventEmitter();

// Listen for score changes
events.on('scoreChanged', (newScore) => {
    console.log(`Score: ${newScore}`);
});

// Emit score changes
events.emit('scoreChanged', 100);
```

### Parallax Background Effects

Create depth with parallax scrolling backgrounds.

```javascript
class ParallaxBackground {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        
        this.layers = [
            { speed: 0.1, objects: [] },  // Far - slow
            { speed: 0.3, objects: [] },  // Mid
            { speed: 0.6, objects: [] }   // Near - fast
        ];
    }
    
    addLayer(speed, color, count, size) {
        const layer = this.layers.find(l => l.speed === speed);
        if (layer) {
            for (let i = 0; i < count; i++) {
                layer.objects.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    size: size + Math.random() * size,
                    color: color
                });
            }
        }
    }
    
    update(dt, cameraX = 0) {
        this.layers.forEach(layer => {
            layer.objects.forEach(obj => {
                obj.x -= layer.speed * cameraX * dt;
                
                // Wrap around
                if (obj.x < -obj.size) {
                    obj.x = this.width + obj.size;
                }
            });
        });
    }
    
    draw() {
        this.layers.forEach(layer => {
            layer.objects.forEach(obj => {
                this.ctx.fillStyle = obj.color;
                this.ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
            });
        });
    }
}
```

---

## 🔍 Advanced Debugging

Beyond basic console logging, these advanced techniques help diagnose and fix complex issues.

### Breakpoint Debugging

Use browser DevTools breakpoints to pause execution and inspect game state.

```javascript
// Conditional breakpoint - stop when score reaches 100
// In DevTools: right-click line number → "Add conditional breakpoint"
// Condition: this.score >= 100

update(dt) {
    this.score += Math.floor(10 * dt);
    // Debugger will pause here when score >= 100
}
```

### State Visualization

Draw debug information on screen to visualize game state.

```javascript
// Enable with 'D' key
drawDebug() {
    if (!this.showDebug) return;
    
    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    this.ctx.font = '12px monospace';
    
    // FPS
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
    
    // Player info
    this.ctx.fillText(`Player: ${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)}`, 10, 35);
    this.ctx.fillText(`Velocity: ${this.player.vx.toFixed(1)}, ${this.player.vy.toFixed(1)}`, 10, 50);
    
    // Enemies
    this.ctx.fillText(`Enemies: ${this.enemies.length}`, 10, 65);
    
    // Memory
    if (performance.memory) {
        this.ctx.fillText(`Memory: ${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB`, 10, 80);
    }
}
```

### Error Boundary Pattern

Catch and handle errors gracefully to prevent game crashes.

```javascript
class SafeGame {
    constructor() {
        this.errorHandler = (error) => {
            console.error('[SafeGame] Error:', error);
            this.handleError(error);
        };
        
        window.addEventListener('error', this.errorHandler);
        window.addEventListener('unhandledrejection', this.errorHandler);
    }
    
    handleError(error) {
        // Log error
        console.error('Game Error:', error);
        
        // Show error screen
        this.showErrorScreen(error.message);
        
        // Optionally attempt recovery
        this.attemptRecovery();
    }
    
    destroy() {
        window.removeEventListener('error', this.errorHandler);
        window.removeEventListener('unhandledrejection', this.errorHandler);
    }
}
```

### Network Simulation

For testing network-related features (future online components), simulate network conditions.

```javascript
class NetworkSimulator {
    constructor() {
        this.latency = 0;
        this.packetLoss = 0;
        this.jitter = 0;
    }
    
    // Simulate network delay
    async send(data) {
        const delay = this.latency + (Math.random() * this.jitter);
        
        // Simulate packet loss
        if (Math.random() < this.packetLoss) {
            return null; // Packet lost
        }
        
        await this.sleep(delay);
        return data;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Apply network conditions
    setConditions({ latency = 0, packetLoss = 0, jitter = 0 }) {
        this.latency = latency;
        this.packetLoss = packetLoss;
        this.jitter = jitter;
    }
    
    // Preset conditions
    static get PRESETS() {
        return {
            G4: { latency: 20, packetLoss: 0, jitter: 5 },
            WIFI: { latency: 50, packetLoss: 0.01, jitter: 20 },
            MOBILE_3G: { latency: 150, packetLoss: 0.05, jitter: 50 },
            SLOW: { latency: 500, packetLoss: 0.1, jitter: 100 }
        };
    }
}
```

---

## 🎯 Game-Specific Patterns

Different game genres require different approaches. This section covers common patterns for each genre.

### Arcade Games (Fast-Paced Action)

```javascript
class ArcadeGame {
    constructor() {
        // High frame rate physics
        this.physicsSteps = 4;  // Sub-step for precision
        
        // Screen shake for impact
        this.shakeIntensity = 0;
        this.shakeDecay = 0.9;
    }
    
    applyShake(intensity) {
        this.shakeIntensity = intensity;
    }
    
    updateShake() {
        if (this.shakeIntensity > 0.1) {
            const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            
            this.ctx.save();
            this.ctx.translate(shakeX, shakeY);
            
            this.shakeIntensity *= this.shakeDecay;
        }
    }
    
    endShake() {
        if (this.shakeIntensity > 0.1) {
            this.ctx.restore();
        }
    }
}
```

### Puzzle Games (Grid-Based)

```javascript
class PuzzleGame {
    constructor() {
        this.gridWidth = 8;
        this.gridHeight = 8;
        this.cellSize = 60;
    }
    
    // Convert screen position to grid position
    screenToGrid(x, y) {
        return {
            col: Math.floor(x / this.cellSize),
            row: Math.floor(y / this.cellSize)
        };
    }
    
    // Convert grid position to screen position
    gridToScreen(col, row) {
        return {
            x: col * this.cellSize,
            y: row * this.cellSize
        };
    }
    
    // Check if position is valid grid cell
    isValidCell(col, row) {
        return col >= 0 && col < this.gridWidth &&
               row >= 0 && row < this.gridHeight;
    }
    
    // Animate swap between two cells
    async animateSwap(fromCol, fromRow, toCol, toRow, duration = 200) {
        const startFrom = this.gridToScreen(fromCol, fromRow);
        const startTo = this.gridToScreen(toCol, toRow);
        
        const startTime = performance.now();
        
        return new Promise(resolve => {
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease in-out
                const eased = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                // Update positions for animation
                // Draw with interpolated positions
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
}
```

### Tower Defense (Strategic Placement)

```javascript
class TowerDefenseGame {
    constructor() {
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        
        // Path for enemies to follow
        this.path = [];
        
        // Placement grid
        this.placementGrid = [];
    }
    
    // Check if position is valid for tower placement
    canPlaceTower(x, y) {
        // Check if on path
        if (this.isOnPath(x, y)) return false;
        
        // Check if has tower already
        if (this.getTowerAt(x, y)) return false;
        
        // Check if near path (tower range might block path)
        if (this.isNearPath(x, y)) return false;
        
        return true;
    }
    
    isOnPath(x, y) {
        const pathWidth = 40;
        return this.path.some(segment => {
            return this.distToSegment(x, y, segment.start, segment.end) < pathWidth;
        });
    }
    
    // Calculate distance from point to line segment
    distToSegment(px, py, ax, ay, bx, by) {
        const ABx = bx - ax;
        const ABy = by - ay;
        const APx = px - ax;
        const APy = py - ay;
        
        const ab2 = ABx * ABx + ABy * ABy;
        const ap_ab = APx * ABx + APy * ABy;
        
        let t = ap_ab / ab2;
        t = Math.max(0, Math.min(1, t));
        
        const closestX = ax + t * ABx;
        const closestY = ay + t * ABy;
        
        return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
    }
    
    // Tower targeting logic
    findTarget(tower) {
        let bestTarget = null;
        let bestDistance = tower.range;
        
        this.enemies.forEach(enemy => {
            const dist = this.distance(tower, enemy);
            if (dist < bestDistance) {
                bestDistance = dist;
                bestTarget = enemy;
            }
        });
        
        return bestTarget;
    }
}
```

---

## 🔧 Advanced Input Handling

### Touch and Mouse Input

```javascript
class InputHandler {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.touch = { active: false, x: 0, y: 0 };
        
        // Keyboard
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
        
        // Mouse
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mousedown', () => this.mouse.down = true);
        window.addEventListener('mouseup', () => this.mouse.down = false);
        
        // Touch
        window.addEventListener('touchstart', e => {
            this.touch.active = true;
            this.touch.x = e.touches[0].clientX;
            this.touch.y = e.touches[0].clientY;
        });
        window.addEventListener('touchmove', e => {
            this.touch.x = e.touches[0].clientX;
            this.touch.y = e.touches[0].clientY;
        });
        window.addEventListener('touchend', () => this.touch.active = false);
    }
    
    // Check if key is pressed
    isDown(keyCode) {
        return this.keys[keyCode] === true;
    }
    
    // Get input position (mouse or touch)
    getPosition() {
        if (this.touch.active) {
            return { x: this.touch.x, y: this.touch.y };
        }
        return { x: this.mouse.x, y: this.mouse.y };
    }
}
```

### Virtual Gamepad Support

```javascript
class GamepadHandler {
    constructor() {
        this.gamepads = [];
        this.pollInterval = null;
        
        window.addEventListener('gamepadconnected', e => {
            console.log('Gamepad connected:', e.gamepad.id);
            this.startPolling();
        });
        
        window.addEventListener('gamepaddisconnected', e => {
            console.log('Gamepad disconnected:', e.gamepad.id);
            this.stopPolling();
        });
    }
    
    startPolling() {
        this.pollInterval = setInterval(() => this.poll(), 16);
    }
    
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }
    
    poll() {
        const gamepads = navigator.getGamepads();
        this.gamepads = Array.from(gamepads).filter(gp => gp !== null);
    }
    
    // Get button state
    isButtonPressed(buttonIndex) {
        return this.gamepads.some(gp => gp.buttons[buttonIndex]?.pressed);
    }
    
    // Get axis value (-1 to 1)
    getAxis(axisIndex) {
        for (const gp of this.gamepads) {
            const value = gp.axes[axisIndex];
            // Deadzone
            if (Math.abs(value) > 0.1) return value;
        }
        return 0;
    }
}
```

---

## 📊 Analytics and Metrics

Track game performance and player behavior to improve the experience.

### Custom Analytics

```javascript
class GameAnalytics {
    constructor() {
        this.events = [];
        this.sessionStart = Date.now();
    }
    
    // Track game start
    trackGameStart(gameId) {
        this.events.push({
            type: 'game_start',
            gameId: gameId,
            timestamp: Date.now()
        });
    }
    
    // Track score
    trackScore(gameId, score) {
        this.events.push({
            type: 'score',
            gameId: gameId,
            score: score,
            timestamp: Date.now()
        });
    }
    
    // Track achievement
    trackAchievement(achievementId) {
        this.events.push({
            type: 'achievement',
            achievementId: achievementId,
            timestamp: Date.now()
        });
    }
    
    // Track session end
    trackSessionEnd() {
        this.events.push({
            type: 'session_end',
            duration: Date.now() - this.sessionStart,
            timestamp: Date.now()
        });
    }
    
    // Get summary
    getSummary() {
        const gameStarts = this.events.filter(e => e.type === 'game_start').length;
        const achievements = this.events.filter(e => e.type === 'achievement').length;
        
        return {
            gamesPlayed: gameStarts,
            achievementsUnlocked: achievements,
            sessionDuration: Date.now() - this.sessionStart
        };
    }
}
```

---

## 🌍 Internationalization (i18n)

Support multiple languages for wider accessibility.

```javascript
class I18n {
    constructor(locale = 'en') {
        this.locale = locale;
        this.translations = {};
        this.loadTranslations();
    }
    
    loadTranslations() {
        this.translations = {
            en: {
                'game.start': 'Start Game',
                'game.pause': 'Pause',
                'game.resume': 'Resume',
                'game.over': 'Game Over',
                'score': 'Score',
                'highscore': 'High Score'
            },
            tr: {
                'game.start': 'Oyna',
                'game.pause': 'Duraklat',
                'game.resume': 'Devam Et',
                'game.over': 'Oyun Bitti',
                'score': 'Skor',
                'highscore': 'En Yüksek Skor'
            }
        };
    }
    
    t(key) {
        return this.translations[this.locale]?.[key] || key;
    }
    
    setLocale(locale) {
        if (this.translations[locale]) {
            this.locale = locale;
        }
    }
}

// Usage
const i18n = new I18n('en');
console.log(i18n.t('game.start')); // "Start Game"

i18n.setLocale('tr');
console.log(i18n.t('game.start')); // "Oyna"
```

---

## 🔄 Migration and Updates

When updating the codebase, follow these patterns to maintain compatibility.

### Data Migration

```javascript
class DataMigration {
    constructor(currentVersion) {
        this.version = currentVersion;
    }
    
    migrate(oldData) {
        let data = { ...oldData };
        
        // Run migrations based on version
        if (data.version < 2.0) {
            data = this.migrateV2(data);
        }
        if (data.version < 3.0) {
            data = this.migrateV3(data);
        }
        
        data.version = this.version;
        return data;
    }
    
    migrateV2(data) {
        // Add new fields with defaults
        data.theme = data.theme || 'default';
        data.volume = data.volume ?? 0.7;
        
        return data;
    }
    
    migrateV3(data) {
        // Map old achievement IDs to new format
        data.achievements = data.achievements.map(id => {
            return this.achievementMap[id] || id;
        });
        
        // Add new statistics fields
        data.totalPlayTime = data.totalPlayTime || 0;
        data.consecutiveGames = data.consecutiveGames || 0;
        
        return data;
    }
}
```

---

## ✅ Quick Reference

```bash
# Setup
npm install
npm start

# Development
npm run dev        # Dev mode
npm run lint       # Check code style
npm run validate   # Validate games

# Build
npm run dist       # Interactive build
npm run build:win  # Windows only

# Test
npm run test       # Run tests
```

---

*Happy coding! 🚀*