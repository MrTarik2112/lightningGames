# ⚡ Lightning Games - Project Documentation

> **Version:** 2.0  
> **Last Updated:** 2026-03-03  
> **Author:** Tarik  

---

## 📋 1. Project Overview

**Lightning Games** is a lightweight, high-performance game launcher built with Electron that lives in the system tray. It provides quick access to 31+ arcade and puzzle games with a premium, neon-themed UI.

### Key Features
- 🎮 **32 Games** - Arcade, Puzzle, and Classic genres
- 🎯 **Achievements System** - 35+ unlockable achievements
- 🏆 **High Scores** - Per-game persistent high scores
- 🌓 **4 Themes** - Neon, Retro, Minimal, Forest
- 🔔 **System Tray Integration** - Global shortcut (Ctrl+Alt+G)
- ⚡ **GPU Optimized** - Hardware acceleration enabled
- 🔊 **Synthesized Audio** - Web Audio API sound effects
- 📊 **Stats Tracking** - Play time, games played, achievements

### Tech Stack
| Component | Technology |
|-----------|------------|
| Framework | Electron ^28.0.0 |
| Build Tool | electron-builder ^24.13.3 |
| Frontend | Vanilla JavaScript, HTML5 Canvas |
| Styling | CSS3 with CSS Variables |
| Audio | Web Audio API (Synthesized) |
| Storage | localStorage |

---

## 📁 2. Complete File Structure

```
lightningGames/
│
├── 📄 Root Level Files
│   ├── main.js              # Electron main process
│   ├── preload.js           # Secure IPC bridge
│   ├── index.html           # Main application window
│   ├── package.json         # Dependencies & build config
│   ├── package-lock.json    # Lock file
│   ├── README.md            # Project readme
│   ├── LICENSE              # MIT License
│   ├── .gitattributes       # Git attributes
│   └── CONTEXT.md           # This file
│
├── 🎮 games/                # 31 Game implementations
│   ├── snake.js             # Classic Snake
│   ├── tetris.js            # Block stacking
│   ├── game2048.js          # Number merging
│   ├── flappy.js            # Flappy Bird clone
│   ├── minesweeper.js       # Logic puzzle
│   ├── pong.js              # Classic Pong
│   ├── breakout.js          # Brick breaker
│   ├── space.js             # Space shooter
│   ├── asteroids.js         # Asteroid field
│   ├── frogger.js           # Cross the road
│   ├── memory.js            # Memory match
│   ├── tictactoe.js         # X-O-X
│   ├── whackamole.js        # Mole hunting
│   ├── doodlejump.js        # Neon Jump
│   ├── simon.js             # Memotron
│   ├── runner.js            # Neon Runner
│   ├── orbcollector.js      # Orb collection
│   ├── skyfall.js           # Star catching
│   ├── lasergrid.js         # Dodge lasers
│   ├── orbit.js             # Orbital survival
│   ├── stacker.js           # Block tower
│   ├── colorrush.js         # Color matching
│   ├── cyberdash.js         # Cyber obstacle dodge
│   ├── neonduel.js          # 2-player Pong
│   ├── blaster.js           # Alien defense
│   ├── pixelquest.js        # Dungeon adventure
│   ├── wordquest.js         # Word spelling
│   ├── bouncy.js            # Physics bounce
│   ├── rhythmtap.js         # Rhythm game
│   ├── jewels.js            # Match-3
│   └── ninja.js             # Target slicing
│
├── 🎨 renderer/             # UI & Management
│   ├── gameManager.js       # Core game engine
│   ├── launcher.js          # Game selection UI
│   ├── soundManager.js      # Audio system
│   └── particles.js         # Background effects
│
├── 💅 styles/               # Styling
│   └── main.css             # Complete design system
│
└── 📦 dist/                 # Build output (generated)
    └── win-unpacked/        # Windows portable build
```

---

## 🏗️ 3. Technical Architecture

### 3.1 Main Process (main.js)

The Electron main process handles window management, system tray, and global shortcuts.

#### GPU Optimizations
```javascript
// Applied before app ready
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-oop-rasterization');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-gpu-compositing');
app.commandLine.appendSwitch('disable-background-timer-throttle');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('force-color-profile', 'srgb');
```

#### Window Configuration
- **Size:** 960x700 (fixed, non-resizable)
- **Features:** Frameless, transparent, always on top
- **Behavior:** Hides on blur, toggles with Ctrl+Alt+G
- **Animation:** 350ms hide/show transitions

#### System Tray
- Custom programmatic lightning bolt icon (16x16 cyan)
- Context menu with:
  - Open (Ctrl+Alt+G)
  - Run at Startup (toggle)
  - Quit Completely

#### Global Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Alt+G` | Toggle window visibility |
| `Escape` | Back to launcher / Hide window |

### 3.2 Preload Script (preload.js)

Secure IPC bridge using `contextBridge`:

```javascript
contextBridge.exposeInMainWorld('electronAPI', {
    closeWindow: () => ipcRenderer.send('close-window'),
    quitApp: () => ipcRenderer.send('quit-app'),
    onWindowHiding: (callback) => ipcRenderer.on('window-hiding', callback),
    onWindowShowing: (callback) => ipcRenderer.on('window-showing', callback)
});
```

### 3.3 Game Manager (gameManager.js)

Central engine managing game lifecycle, high scores, and achievements.

#### Class Structure
```javascript
class GameManager {
    games = {};              // Registered games registry
    activeGame = null;       // Currently playing game
    highScores = {};         // Per-game high scores
    achievements = [];       // Unlocked achievement IDs
    settings = {};           // User preferences
    favorites = [];          // Favorite game IDs
    
    // Tracking
    totalGamesPlayed = 0;
    totalPlayTime = 0;
    totalAsteroidsDestroyed = 0;
    uniqueGamesPlayed = [];
    consecutiveGames = 0;
}
```

#### Game Loop
```javascript
// Frame-independent movement with lag spike cap
const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
this.lastTime = timestamp;

// Update & Render
this.activeGame.instance.update(dt);
this.activeGame.instance.draw();
```

#### Key Methods
| Method | Description |
|--------|-------------|
| `registerGame(id, GameClass, meta)` | Register a new game |
| `startGame(id)` | Initialize and start a game |
| `pauseCurrentGame()` | Pause active game, save state |
| `resumeCurrentGame()` | Resume paused game |
| `resetCurrentGame()` | Restart current game |
| `checkAndUpdateHighScore(id, score)` | Save new high scores |
| `unlockAchievement(id, title, desc, icon, ultra)` | Award achievement |
| `shakeScreen(intensity)` | Trigger screen shake |

### 3.4 Launcher UI (launcher.js)

Manages game selection interface with:

- **Category Tabs:** All, Favorites, Arcade, Puzzle, Classic
- **Search:** Debounced input (150ms)
- **Recently Played:** Last 5 games with timestamps
- **Stats View:** Total games, achievements list
- **Game Cards:** 5-column grid with 3D tilt effects

#### 3D Card Tilt Effect
```javascript
// Mouse tracking with requestAnimationFrame
const dx = x - xc;  // distance from center X
const dy = y - yc;  // distance from center Y
card.style.transform = `rotateX(${-dy / 8}deg) rotateY(${dx / 8}deg) translateZ(10px)`;
```

---

## 🎮 4. Complete Game List (32 Games)

| # | ID | Name | Icon | Category | Canvas | Description |
|---|-----|------------------|------|----------|--------|-------------|
| 1 | `snake` | Snake | 🐍 | arcade | 880x540 | Classic snake game |
| 2 | `cyberdash` | Cyber Dash | ⚡ | arcade | 880x540 | Dodge obstacles, collect energy |
| 3 | `tetris` | Tetris | 🧱 | arcade | 880x540 | Block stacking puzzle |
| 4 | `asteroids` | Asteroids | ☄️ | arcade | 880x540 | Survive in space |
| 5 | `frogger` | Frogger | 🐸 | arcade | 880x540 | Cross the road |
| 6 | `memory` | Memory Match | 🧠 | puzzle | 880x540 | Match the cards |
| 7 | `tictactoe` | Tic-Tac-Toe | ❌ | puzzle | 880x540 | Classic X-O-X |
| 8 | `whackamole` | Whack-A-Mole | 🔨 | arcade | 880x540 | Mole hunting |
| 9 | `doodlejump` | Neon Jump | 🎈 | arcade | 880x540 | Fly high |
| 10 | `simon` | Memotron | 🎛️ | puzzle | 880x540 | Remember the sequence |
| 11 | `runner` | Neon Runner | 🦖 | arcade | 880x540 | Overcome obstacles |
| 12 | `game2048` | 2048 | ✨ | puzzle | 880x540 | Number merging |
| 13 | `flappy` | Flappy Bird | 🐦 | arcade | 880x540 | Flight simulation |
| 14 | `minesweeper` | Mayın Tarlası | 💣 | puzzle | 880x540 | Logic puzzle |
| 15 | `pong` | Squash Pong | 🏓 | classic | 880x540 | Single player pong |
| 16 | `neonduel` | Neon Duel | ⚔️ | classic | 880x540 | 2 Player Local Duel |
| 17 | `breakout` | Breakout | 🧱 | classic | 880x540 | Brick breaking |
| 18 | `space` | Space Shooter | 🚀 | arcade | 880x540 | Space battle |
| 19 | `orbcollector` | Orb Collector | 🟡 | arcade | 880x540 | Collect orbs, avoid mines |
| 20 | `skyfall` | SkyFall | ⭐ | arcade | 880x540 | Catch stars, dodge meteors |
| 21 | `lasergrid` | Laser Grid | 🧊 | arcade | 880x540 | Dodge scanning lasers |
| 22 | `orbit` | Orbit | 🛰️ | arcade | 880x540 | Survive in orbit |
| 23 | `stacker` | Stacker | 🏗️ | arcade | 880x540 | Build a block tower |
| 24 | `colorrush` | Color Rush | 🎨 | arcade | 880x540 | Run to the correct color |
| 25 | `blaster` | Blaster | 🔫 | arcade | 880x540 | Alien invasion defense |
| 26 | `pixelquest` | Pixel Quest | 🏰 | arcade | 880x540 | Dungeon adventure |
| 27 | `wordquest` | Word Quest | 📝 | puzzle | 880x540 | Spell the words |
| 28 | `bouncy` | Bouncy Ball | ⚽ | arcade | 880x540 | Physics bounce game |
| 29 | `rhythmtap` | Rhythm Tap | 🎵 | arcade | 880x540 | Tap to the beat |
| 30 | `jewels` | Jewel Match | 💎 | puzzle | 880x540 | Match 3 gems |
| 31 | `ninja` | Ninja Slice | 🥷 | arcade | 880x540 | Slice the targets |
| 32 | `piano` | Neon Piano | 🎹 | puzzle | 880x540 | Play the piano |

### Per-Game Achievements

| Game | Achievement ID | Title | Description | Type |
|------|---------------|-------|-------------|------|
| Snake | `snake_100` | Snake Tamer | Scored 100 points in Snake | Normal |
| Snake | `snake_charmer` | Snake Charmer | Scored 250 points in Snake | Ultra |
| Snake | `reflex_master` | Reflex Master | Achieved a 10x combo in Snake | Ultra |
| Tetris | `tetris_500` | Architect | Scored 500 points in Tetris | Normal |
| Tetris | `pentominium` | Pentominium | Scored 1000 points in Tetris | Ultra |
| Memotron | `simon_10` | Memory Apprentice | Scored 10 points in Memotron | Normal |
| Memotron | `simons_rival` | Simon's Rival | Scored 20 points in Memotron | Ultra |
| Minesweeper | `minesweeper_win` | Mine Expert | Cleared a challenging minefield | Normal |
| Minesweeper | `safe_stepper` | Safe Stepper | Marked 20 mines correctly in one go | Ultra |
| Neon Runner | `runner_high` | Fast Runner | Scored 500 in Neon Runner | Normal |
| Neon Runner | `speedrunner` | Speedrunner | Scored 500 within 1 minute | Ultra |
| Frogger | `frogger_master` | Frogger Master | Crossed the road in Frogger! | Normal |
| 2048 | `master_2048` | 2048 Master | Reached the 4096 tile | Ultra |
| Neon Jump | `high_jumper` | High Jumper | Reached 10000 height | Ultra |
| Whack-A-Mole | `mole_slayer` | Mole Slayer | Scored 200 points | Ultra |
| Asteroids | `indestructible` | Indestructible | Survived 3 minutes | Ultra |
| Breakout | `precision` | Precision | Scored 50 without losing a ball | Ultra |
| Tic-Tac-Toe | `triple_threat` | Triple Threat | Won under 10 seconds | Ultra |
| Memory Match | `memory_god` | Memory God | Finished under 30 seconds | Ultra |
| Space Shooter | `bulletproof` | Bulletproof | Survived 1 minute without getting hit | Ultra |

---

## 🏅 5. All Achievements List (35+ Total)

### Normal Achievements

| ID | Title | Description | Icon |
|----|-------|-------------|------|
| `first_game` | Welcome! | You launched your first game | 🎮 |
| `record_breaker` | Record Breaker! | You broke a record | 🏆 |
| `score_1000` | Master Player | You reached 1000 points | 🔥 |
| `snake_100` | Snake Tamer | Scored 100 points in Snake | 🐍 |
| `tetris_500` | Architect | Scored 500 points in Tetris | 🧱 |
| `simon_10` | Memory Apprentice | Scored 10 points in Memotron | 🧠 |
| `minesweeper_win` | Mine Expert | Cleared a challenging minefield | 💣 |
| `runner_high` | Fast Runner | Scored 500 in Neon Runner | 🦖 |
| `frogger_master` | Frogger Master | Crossed the road in Frogger! | 👑 |
| `warmup` | Warmup Done | Played a total of 10 games | 🔥 |
| `first_rock` | First Rock | Destroyed an asteroid for the first time | 🪨 |

### Ultra Achievements (Rare)

| ID | Title | Description | Icon |
|----|-------|-------------|------|
| `marathon_runner` | Marathon Runner | Played a total of 50 games | 🏃 |
| `no_life` | Non-Stop | Played a total of 100 games | ⚡ |
| `night_owl` | Night Owl | Played a game after 10 PM | 🦉 |
| `early_bird` | Early Bird | Played a game before 8 AM | 🐤 |
| `weekend_warrior` | Weekend Warrior | Played on Saturday or Sunday | ⚔️ |
| `snake_charmer` | Snake Charmer | Scored 250 points in Snake | 🐍 |
| `pentominium` | Pentominium | Scored 1000 points in Tetris | 🧱 |
| `safe_stepper` | Safe Stepper | Marked 20 mines correctly in one go | 🛡️ |
| `asteroid_annihilator` | Asteroid Annihilator | Destroyed a total of 50 asteroids | ☄️ |
| `space_ace` | Space Ace | Destroyed a total of 100 asteroids | 🌌 |
| `memory_god` | Memory God | Finished Memory Match under 30s | ⚡ |
| `reflex_master` | Reflex Master | Achieved a 10x combo in Snake | 💨 |
| `persistent` | Persistent | Played the same game 5 times in a row | 🔄 |
| `explorer` | Explorer | Played 10 different games | 🗺️ |
| `master_2048` | 2048 Master | Reached the 4096 tile | 🌟 |
| `high_jumper` | High Jumper | Reached 10000 height in Neon Jump | 🚀 |
| `simons_rival` | Simon's Rival | Scored 20 points in Memotron | 🧠 |
| `mole_slayer` | Mole Slayer | Scored 200 points in Whack-A-Mole | 🔨 |
| `indestructible` | Indestructible | Survived 3 minutes in Asteroids | 💎 |
| `precision` | Precision | Scored 50 in Breakout without losing a ball | 🎯 |
| `triple_threat` | Triple Threat | Won Tic-Tac-Toe under 10 seconds | 🔥 |
| `addict` | Addict | Total playtime exceeded 1 hour | 💊 |
| `collector` | Collector | Unlocked 15 achievements | 👑 |
| `godly` | Godly | Unlocked all achievements | ⛩️ |
| `speedrunner` | Speedrunner | Scored 500 in Neon Runner within 1 minute | 🏎️ |
| `bulletproof` | Bulletproof | Survived 1 minute in Space Shooter without getting hit | 🧥 |
| `socialite` | Socialite | Switched tabs 10 times | 📱 |

### Hidden Achievements

| ID | Title | Description | Icon |
|----|-------|-------------|------|
| `first_rock` | First Rock | Destroyed an asteroid for the first time | 🪨 |

---

## 💾 6. localStorage Data Schema

All data is prefixed with `lg_` to avoid conflicts.

| Key | Type | Description |
|-----|------|-------------|
| `lg_highscores` | JSON Object | `{ gameId: score, ... }` |
| `lg_achievements` | JSON Array | `[ achievementId, ... ]` |
| `lg_settings` | JSON Object | `{ reducedMotion, shakeIntensity, renderScale }` |
| `lg_totalGames` | String (Number) | Total games played count |
| `lg_totalPlayTime` | String (Number) | Total play time in seconds |
| `lg_favorites` | JSON Array | `[ gameId, ... ]` |
| `lg_lastPlayed` | JSON Object | `{ gameId: timestamp, ... }` |
| `lg_theme` | String | Current theme: 'default', 'retro', 'minimal', 'forest' |
| `lg_volume` | String (Number) | Master volume 0.0-1.0 |
| `lg_consecutiveGames` | String (Number) | Same game streak count |
| `lg_lastGameId` | String | Last played game ID |
| `lg_uniqueGames` | JSON Array | `[ gameId, ... ]` - unique games played |
| `lg_totalAsteroids` | String (Number) | Total asteroids destroyed |

### Settings Object Structure
```javascript
{
    reducedMotion: boolean,    // Default: true
    shakeIntensity: number,    // Default: 0.6 (0-1)
    renderScale: number        // Default: 0.9 (0.7-1)
}
```

---

## 🎨 7. CSS Variables & Themes

### Base Variables (:root)

```css
:root {
    /* Background */
    --bg-primary: #050512;
    --bg-secondary: rgba(10, 10, 25, 0.75);
    --bg-card: rgba(16, 16, 42, 0.65);
    --bg-card-hover: rgba(24, 24, 60, 0.85);
    --bg-glass: rgba(255, 255, 255, 0.03);
    
    /* Borders */
    --border-glass: rgba(255, 255, 255, 0.1);
    --border-glow: rgba(0, 220, 255, 0.3);
    
    /* Text */
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.7);
    --text-muted: #555577;
    --text-dim: #333355;
    
    /* Accents */
    --accent-cyan: #00d4ff;
    --accent-magenta: #ff00aa;
    --accent-green: #00ff88;
    --accent-yellow: #ffcc00;
    --accent-orange: #ff8844;
    --accent-purple: #8855ff;
    --accent-red: #ff4466;
    
    /* Glow Effects */
    --glow-cyan: 0 0 30px rgba(0, 220, 255, 0.25), 0 0 60px rgba(0, 220, 255, 0.08);
    --glow-magenta: 0 0 30px rgba(255, 0, 170, 0.25), 0 0 60px rgba(255, 0, 170, 0.08);
    --glow-green: 0 0 30px rgba(0, 255, 136, 0.25), 0 0 60px rgba(0, 255, 136, 0.08);
    
    /* Sizing */
    --radius-xs: 6px;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    --radius-2xl: 24px;
    
    /* Typography */
    --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', 'Cascadia Code', monospace;
    
    /* Transitions */
    --transition-flash: 0.1s ease;
    --transition-fast: 0.15s ease;
    --transition-normal: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-smooth: 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    --transition-bounce: 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Theme Variations

#### Default (Neon)
```css
:root {
    --bg-primary: #050512;
    --accent-cyan: #00d4ff;
    --accent-magenta: #ff00aa;
    --accent-yellow: #ffcc00;
    --accent-green: #00ff88;
}
```

#### Retro (Amber)
```css
body.theme-retro {
    --bg-primary: #1a1a00;
    --accent-cyan: #ffaa00;
    --accent-magenta: #ff8800;
    --accent-yellow: #ffee00;
    --accent-green: #ccff00;
    filter: sepia(0.5) contrast(1.1);
}
```

#### Minimal (B&W)
```css
body.theme-minimal {
    --bg-primary: #000000;
    --accent-cyan: #ffffff;
    --accent-magenta: #cccccc;
    --accent-yellow: #aaaaaa;
    --accent-green: #888888;
}
```

#### Forest (Green)
```css
body.theme-forest {
    --bg-primary: #001a0a;
    --accent-cyan: #00ff88;
    --accent-magenta: #66ff00;
    --accent-yellow: #ccff00;
    --accent-green: #008844;
}
```

---

## 🎮 8. Game Interface Contract

Every game must implement this interface:

### Required Methods

```javascript
class GameName {
    constructor() {
        this.score = 0;
        this.gameOver = false;
        // Initialize game-specific state
    }
    
    /**
     * Initialize the game
     * @param {HTMLCanvasElement} canvas - The game canvas
     * @param {CanvasRenderingContext2D} ctx - The 2D context
     */
    init(canvas, ctx) {
        // Reset all game state
        // Set up event listeners
        // Initialize entities
    }
    
    /**
     * Update game logic
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Update positions
        // Check collisions
        // Update score
    }
    
    /**
     * Render the game
     */
    draw() {
        // Clear canvas
        // Draw entities
        // Draw UI
    }
    
    /**
     * Get current score
     * @returns {number}
     */
    getScore() {
        return this.score;
    }
    
    /**
     * Check if game is over
     * @returns {boolean}
     */
    isGameOver() {
        return this.gameOver;
    }
    
    // Optional: Clean up event listeners
    destroy() {
        // Remove key handlers
        // Remove click handlers
    }
}
```

### Optional Methods

```javascript
/**
 * Called when game is paused (window hidden)
 */
pause() {
    // Pause timers
    // Stop animations
}

/**
 * Called when game is resumed (window shown)
 */
resume() {
    // Resume timers
    // Continue animations
}
```

### Game Registration

```javascript
if (window.gameManager) {
    window.gameManager.registerGame('gameId', GameName, {
        name: 'Display Name',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
```

### Calling GameManager Methods from Games

```javascript
// Track asteroids destroyed (for Asteroids game)
if (window.gameManager) {
    window.gameManager.trackAsteroidDestroyed();
}

// Trigger screen shake
if (window.gameManager) {
    window.gameManager.shakeScreen(0.5); // intensity 0-1
}

// Play sound effects
if (window.soundManager) {
    window.soundManager.playJump();
    window.soundManager.playHit();
    window.soundManager.playScore();
    window.soundManager.playDeath();
}
```

---

## 📡 9. IPC Communication

### Renderer to Main

| Channel | Payload | Description |
|---------|---------|-------------|
| `close-window` | none | Hide/minimize window |
| `quit-app` | none | Fully quit application |

### Main to Renderer

| Channel | Payload | Description |
|---------|---------|-------------|
| `window-hiding` | none | Window about to hide (play exit animation) |
| `window-showing` | none | Window now visible (play enter animation) |

### Usage Example

```javascript
// In renderer (launcher.js)
window.electronAPI.closeWindow();
window.electronAPI.quitApp();

window.electronAPI.onWindowHiding(() => {
    // Pause game, play exit animation
});

window.electronAPI.onWindowShowing(() => {
    // Resume game, play enter animation
});
```

---

## 🔊 10. Sound System

All sounds are synthesized using Web Audio API. No external audio files required.

### UI Sounds

```javascript
window.soundManager.playClick();       // Button click (440Hz triangle)
window.soundManager.playHover();       // Hover effect (880Hz sine)
window.soundManager.playSelect();      // Selection (660Hz square)
window.soundManager.playShow();        // Window show sweep (440→880Hz)
window.soundManager.playHide();        // Window hide sweep (880→440Hz)
window.soundManager.playAchievement(); // Achievement fanfare (C-E-G-C arpeggio)
```

### Game Sounds

```javascript
window.soundManager.playJump();       // Jump sound (200→600Hz sweep)
window.soundManager.playHit();        // Impact sound (noise)
window.soundManager.playScore();      // Score gained (1000Hz sine)
window.soundManager.playDeath();      // Game over (400→100Hz sawtooth)
window.soundManager.playShoot();      // Projectile (800→200Hz sawtooth)
window.soundManager.playExplosion();  // Explosion (noise burst)
window.soundManager.playLevelUp();    // Level up (400→1200Hz sweep)
```

### Volume Control

```javascript
// Set master volume (0-1)
window.gameManager.setVolume(0.5);

// Or directly
window.soundManager.updateVolume(0.5);
```

---

## ⚙️ 11. Settings & Configuration

### Available Settings

| Setting | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| `reducedMotion` | boolean | true/false | true | Disable animations & shake |
| `shakeIntensity` | number | 0-1 | 0.6 | Screen shake strength |
| `renderScale` | number | 0.7-1 | 0.9 | Canvas resolution multiplier |
| `volume` | number | 0-1 | 0.5 | Master audio volume |
| `theme` | string | default/retro/minimal/forest | default | UI color theme |

### Accessing Settings

```javascript
// Get settings
const settings = window.gameManager.getSettings();
// Returns: { reducedMotion, shakeIntensity, renderScale }

// Update settings
window.gameManager.updateSettings({
    reducedMotion: false,
    shakeIntensity: 0.8,
    renderScale: 1.0
});

// Theme is separate
localStorage.setItem('lg_theme', 'retro');
document.body.className = 'theme-retro';
```

---

## ⚡ 12. Performance Optimizations

### GPU & Rendering
- **GPU Rasterization** enabled in main process
- **OOP Rasterization** for off-main-thread painting
- **Background throttling disabled** for consistent framerates
- **Canvas resolution scaling** (0.7-1.0) for performance control

### localStorage
- **Debounced writes** (250ms delay) to prevent excessive I/O
- Keys prefixed with `lg_` for isolation

### UI Rendering
- **Event delegation** for game card interactions
- **`requestAnimationFrame`** for smooth animations
- **UI element caching** (score/highscore elements)
- **Only update DOM when score changes**

### Game Loop
- **Frame-independent movement** using delta time
- **Lag spike capping** (`dt = Math.min(dt, 0.05)`)
- **Animation frame cancellation** when paused/hidden

### Particle System
- **Dynamic particle count** based on screen size (capped at 24)
- **Reduced motion mode** drops to 8 particles
- **Fast distance approximation** before expensive calculations
- **Animation pausing** when window hidden

### Memory
- **Single instance lock** prevents multiple app instances
- **Proper event cleanup** in game destroy methods

---

## 📝 13. How to Add a New Game

### Step 1: Create Game File

Create `games/mygame.js`:

```javascript
// MyGame v1.0
class MyGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this._keyHandler = null;
    }
    
    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this._bindKeys();
        // Initialize your game entities
    }
    
    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = (e) => {
            // Handle input
        };
        document.addEventListener('keydown', this._keyHandler);
    }
    
    update(dt) {
        if (this.gameOver) return;
        // Update game logic
    }
    
    draw() {
        this.ctx.fillStyle = '#050512';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw game
    }
    
    getScore() {
        return this.score;
    }
    
    isGameOver() {
        return this.gameOver;
    }
    
    destroy() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
        }
    }
}

// Register the game
if (window.gameManager) {
    window.gameManager.registerGame('mygame', MyGame, {
        name: 'My Cool Game',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
```

### Step 2: Add to index.html

Add script tag in the games section:

```html
<script src="games/mygame.js"></script>
```

### Step 3: Add to Launcher Config

Edit `renderer/launcher.js` and add to `GAME_CARDS_CONFIG`:

```javascript
{
    id: 'mygame',
    icon: '🎮',
    name: 'My Cool Game',
    desc: 'Description here',
    category: 'arcade', // or 'puzzle', 'classic'
    color: '#00d4ff',   // Accent color
    glowColor: 'rgba(0, 212, 255, 0.12)',
    borderColor: 'rgba(0, 212, 255, 0.35)',
    shadowColor: '0 0 30px rgba(0, 212, 255, 0.2), 0 0 60px rgba(0, 212, 255, 0.06)'
}
```

### Step 4: Add Achievements (Optional)

Add to `ALL_ACHIEVEMENTS` in `launcher.js`:

```javascript
{ id: 'mygame_win', title: 'Winner', desc: 'Win the game', icon: '🏆' },
{ id: 'mygame_master', title: 'Master', desc: 'Score 1000 points', icon: '👑', ultra: true }
```

### Step 5: Test

Run the app and verify:
```bash
npm start
```

---

## 🔧 14. Build Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### Development

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Or with dev tools
npm run dev
```

### Production Build

```bash
# Build Windows portable executable
npm run dist

# Output: dist/Lightning Games.exe
```

### Build Configuration (package.json)

```json
{
  "build": {
    "appId": "com.tarik.lightninggames",
    "productName": "Lightning Games",
    "win": {
      "target": "portable",
      "icon": "assets/icon.ico"
    },
    "directories": {
      "output": "dist"
    },
    "files": [
      "**/*",
      "!dist/*"
    ]
  }
}
```

---

## 📦 15. Dependencies

### Production Dependencies
None (Electron app uses bundled Chromium)

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `electron` | ^28.0.0 | Desktop app framework |
| `electron-builder` | ^24.13.3 | Build & packaging |

### Installation

```bash
npm install
```

---

## 🎯 Quick Reference

### File Quick Links
- **Main Process:** `main.js`
- **Game Engine:** `renderer/gameManager.js`
- **UI Logic:** `renderer/launcher.js`
- **Audio:** `renderer/soundManager.js`
- **Particles:** `renderer/particles.js`
- **Styles:** `styles/main.css`
- **Entry HTML:** `index.html`

### Common Tasks
| Task | Location |
|------|----------|
| Add game | `games/*.js` + `index.html` + `renderer/launcher.js` |
| Add achievement | `renderer/launcher.js` → `ALL_ACHIEVEMENTS` |
| Change colors | `styles/main.css` → CSS variables |
| Add sound | `renderer/soundManager.js` |
| Change shortcuts | `main.js` → `globalShortcut.register()` |

### Debug Tips
- Press `Ctrl+Shift+I` (in dev mode) to open DevTools
- Check Console for achievement unlocks
- Check Application → Local Storage for data

---

*End of Documentation*
