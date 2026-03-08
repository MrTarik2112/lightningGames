# ⚡ Lightning Games - Project Documentation

> **Version:** 2.2  
> **Last Updated:** 2026-03-06
> **Author:** Tarik  

---

## 📋 1. Project Overview

**Lightning Games** is a lightweight, high-performance game launcher built with Electron that lives in the system tray. It provides quick access to 40 arcade and puzzle games with a premium, neon-themed UI.

### Key Features
- 🎮 **40 Games** - Arcade, Puzzle, and Classic genres
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
│   └── CONTEXT.md           # Project context reference
│
├── 🎮 games/                # 40 Game implementations
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
│   ├── therapytap.js         # Rhythm game
│   ├── jewels.js            # Match-3
│   ├── ninja.js             # Target slicing
│   ├── piano.js             # Neon Piano
│   ├── neondraw.js          # Relaxing drawing
│   ├── orbitdefense.js      # Orbit defense
│   ├── gravityflip.js       # Gravity flip
│   ├── hexpuzzle.js         # Hex puzzle
│   ├── tapdash.js           # Quick taps
│   ├── shapeshifter.js      # Shape matching
│   ├── zigzag.js            # Zig zag collector
│   └── towerdefense.js     # Ultimate tower defense (Fixed UI click bug)
│
├── 🎨 renderer/             # UI & Management
│   ├── gameManager.js       # Core game engine
│   ├── launcher.js          # Game selection UI
│   ├── soundManager.js      # Audio system
│   └── particles.js         # Background effects
│
├── 📜 scripts/              # Build Utilities
│   ├── build.js             # Interactive build script (with progress bar)
│   └── sync-icons.js        # Icon synchronization tool
│
├── 📂 BuildLogs/            # Build history and logs
│   └── build-*.log         # Automated build logs
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

---

## 🎮 4. Complete Game List (40 Games)

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
| 27 | `wordquest` | Word Quest | 📝 | puzzle | 880x540 | Word spelling |
| 28 | `bouncy` | Bouncy Ball | ⚽ | arcade | 880x540 | Physics bounce game |
| 29 | `rhythmtap` | Rhythm Tap | 🎵 | arcade | 880x540 | Tap to the beat |
| 30 | `jewels` | Jewel Match | 💎 | puzzle | 880x540 | Match 3 gems |
| 31 | `ninja` | Ninja Slice | 🥷 | arcade | 880x540 | Slice the targets |
| 32 | `piano` | Neon Piano | 🎹 | puzzle | 880x540 | Play the piano |
| 33 | `neondraw` | Neon Draw | ✏️ | puzzle | 880x540 | Relax and draw |
| 34 | `orbitdefense` | Orbit Defense | 🛡️ | arcade | 880x540 | Protect your orbit |
| 35 | `gravityflip` | Gravity Flip | 🔄 | arcade | 880x540 | Flip gravity |
| 36 | `hexpuzzle` | Hex Puzzle | 🔶 | puzzle | 880x540 | Hex tile puzzle |
| 37 | `tapdash` | Tap Dash | 👆 | arcade | 880x540 | Quick taps |
| 38 | `shapeshifter` | Shape Shifter | 🔺 | puzzle | 880x540 | Match shapes |
| 39 | `zigzag` | Zig Zag | 〰️ | arcade | 880x540 | Collect stars |
| 40 | `towerdefense` | Tower Defense | 🗼 | arcade | 880x540 | Ultimate tower defense |

---

## 🏰 5. Tower Defense - Complete Guide

The Tower Defense game is the most advanced game in Lightning Games with over 1300 lines of code.

### Tower Types (8 Total)

| Tower | Icon | Cost | Range | Damage | Fire Rate | Special Ability |
|-------|------|------|-------|--------|-----------|-----------------|
| **Laser** | ⚡ | $75 | 140px | 25 | 3/sec | Single target |
| **Cannon** | 💥 | $125 | 120px | 60 | 1/sec | Splash damage (60px) |
| **Cryo** | ❄️ | $100 | 100px | 15 | 2/sec | Slows enemies (50%, 3s) |
| **Sniper** | 🎯 | $200 | 250px | 150 | 0.5/sec | Piercing (3 enemies) |
| **Tesla** | 🔷 | $175 | 110px | 35 | 4/sec | Chain lightning (3 targets) |
| **Missile** | 🚀 | $300 | 180px | 120 | 0.7/sec | Homing + Splash (80px) |
| **Aura** | ✨ | $150 | 100px | 0 | - | Buffs nearby towers (+30% damage) |
| **Venom** | 🐍 | $160 | 130px | 10 | 1.5/sec | Poisons enemies over time |

### Gameplay Features
- **Fast Forward**: Press `T` to toggle game speed between 1x, 2x, and 3x.
- **Endless Mode**: Reach wave 50 to unlock infinite scaling waves.
- **Dynamic Health Bars**: Visible health bars on all enemies, turning green when poisoned.

### Enemy Types (6 Total)

| Enemy | Icon | HP | Speed | Reward | Special |
|-------|------|-----|-------|--------|---------|
| **Normal** | 🔴 | 40 | 50 | $8 | None |
| **Fast** | 🟡 | 25 | 90 | $6 | None |
| **Tank** | 🟣 | 150 | 30 | $20 | High HP |
| **Boss** | 👑 | 500 | 25 | $100 | Appears every 10 waves |
| **Healer** | 🟢 | 60 | 40 | $15 | Heals nearby enemies |
| **Flying** | 🔵 | 35 | 70 | $10 | Ignores path obstacles |

### Special Abilities (3 Total)

| Ability | Icon | Cooldown | Effect |
|---------|------|----------|--------|
| **Nuke** | 💥 | 60s | Deals 200 damage to ALL enemies |
| **Slow** | ❄️ | 30s | Slows all enemies to 30% speed for 5s |
| **Boost** | ⚡ | 45s | Doubles all tower damage for 10s |

---

## 🏅 6. All Achievements List (35+ Total)

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

---

## 💾 7. localStorage Data Schema

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

---

## 🎨 8. CSS Variables & Themes

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
}
```

---

## 🎮 9. Game Interface Contract

Every game must implement this interface:

```javascript
class GameName {
    constructor() { this.score = 0; this.gameOver = false; }
    init(canvas, ctx) { /* Initialize game */ }
    update(dt) { /* Update logic */ }
    draw() { /* Render game */ }
    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    destroy() { /* Clean up events */ }
}
```

---

## 📡 10. IPC Communication

Secure IPC bridge using `contextBridge`:

| Channel | Payload | Description |
|---------|---------|-------------|
| `close-window` | none | Hide/minimize window |
| `quit-app` | none | Fully quit application |
| `window-hiding` | none | App about to hide |
| `window-showing` | none | App now visible |

---

## 🔊 11. Sound System

All sounds are synthesized using Web Audio API.

```javascript
window.soundManager.playClick();
window.soundManager.playAchievement();
window.soundManager.playJump();
window.soundManager.playDeath();
```

---

## 🛠️ 12. Build & Deployment

### 12.1 Interactive Build System

The project uses an interactive build script that prompts for a version number before building the portable executable.

**To Run Build:**
```bash
npm run dist
```

**Process:**
1. Script shows current version.
2. Prompts for a new version number.
3. Prompts for a new version number.
4. Prompts for a compression level (0-10).
   - 0-3 (Fast): ~5s, ~150MB
   - 4-7 (Normal): ~30s, ~110MB
   - 8-10 (Maximum): ~2m, ~80MB
5. Updates `package.json` with the new version and compression setting.
6. Runs `electron-builder --win portable`.
5. **Logging**: All stdout/stderr is saved to a timestamped file in the `BuildLogs/` directory.
6. **UI**: A live progress bar is displayed in the terminal during the build.

---

## ⚡ 13. Performance Optimizations

- **GPU Rasterization** enabled in main process
- **OOP Rasterization** for off-main-thread painting
- **Background throttling disabled** for consistent framerates
- **Canvas resolution scaling** (0.7-1.0)
- **Debounced localStorage writes** (250ms delay)
- **Event delegation** for cards
- **requestAnimationFrame** for cycles

---

## 📝 14. How to Add a New Game

1. Create `games/mygame.js` with the standard game class.
2. Add `<script src="games/mygame.js"></script>` to `index.html`.
3. Add config to `GAME_CARDS_CONFIG` in `renderer/launcher.js`.
4. (Optional) Add achievements to `ALL_ACHIEVEMENTS`.

---

## 🔧 15. Build Instructions (Legacy)

*Note: Use `npm run dist` for the interactive builder.*

```bash
# Development
npm start
npm run dev

# Direct Build
npx electron-builder --win portable
```

---

## 📦 16. Dependencies

- **Electron:** ^28.0.0
- **Electron Builder:** ^24.13.3
- **Canvas:** ^3.2.1
- **PNG to ICO:** ^3.0.1

---

## 🎯 17. Quick Reference

| Task | Location |
|------|----------|
| Add game | `games/*.js` + `index.html` + `renderer/launcher.js` |
| Add achievement | `renderer/launcher.js` → `ALL_ACHIEVEMENTS` |
| Change colors | `styles/main.css` → CSS variables |
| Add sound | `renderer/soundManager.js` |

---

## 🛠️ 18. Recent Fixes

### Tower Defense UI (2026-03-06)
- **Issue:** Shop buttons and ability buttons were unclickable.
- **Fix:** Implemented full boundary checking in `_handleClick(e)` for Shop, Abilities, and Start Wave regions.

### 12.4 Build Performance Optimizations

The build process is optimized for speed by:
- **Excluding node_modules**: Since the app is vanilla JS, the ~500MB of dev dependencies (electron, builder, canvas) are excluded from the bundle.
- **Selective Bundling**: Only essential files (JS, HTML, CSS, assets) are included.
- **ASAR Extraction**: Enabled for faster file access and smaller header sizes.
- **Disabled Compression**: `compression: "store"` is set in `package.json` so the builder doesn't waste time running LZMA compression on the 150MB electron binary.


These changes typically reduce build time from minutes to seconds.

*End of Documentation*
