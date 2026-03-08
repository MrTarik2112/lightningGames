# ⚡ Lightning Games

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0-00d4ff?style=for-the-badge&logo=semver&logoColor=white" />
  <img src="https://img.shields.io/badge/platform-Windows-00d4ff?style=for-the-badge&logo=windows&logoColor=white" />
  <img src="https://img.shields.io/badge/Electron-28.0-00d4ff?style=for-the-badge&logo=electron&logoColor=white" />
  <img src="https://img.shields.io/badge/license-MIT-00d4ff?style=for-the-badge" />
</p>

<p align="center">
  <b>🎮 30+ Mini Games | 🏆 Achievement System | 🎨 4 Themes | ⚡ Quick Access</b>
</p>

<p align="center">
  <i>A premium game collection living in your system tray, instantly accessible</i>
</p>

---

## 📑 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Game List](#-game-list)
- [Achievements](#-achievements)
- [Themes](#-themes)
- [Shortcuts](#-shortcuts)
- [Architecture](#-architecture)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Features

| Feature | Description |
|---------|-------------|
| ⚡ **Quick Access** | `Ctrl+Alt+G` global shortcut for instant toggle |
| 🎮 **30+ Games** | Mix of classic arcade and modern games |
| 🏆 **Achievement System** | 35+ unlockable achievements with progress tracking |
| 🎨 **Theme Support** | 4 different color themes (Neon, Retro, Minimal, Forest) |
| 🔊 **Synthesized Audio** | Web Audio API generated sound effects |
| 💾 **Persistent Data** | High scores and achievements saved to localStorage |
| 🎯 **Favorites** | Mark games as favorites for quick access |
| 🔍 **Search** | Find games by name instantly |
| ⏱️ **Recently Played** | Quick access to last 5 played games |
| 📊 **Statistics** | Track total playtime, games played, and best scores |

### 🎮 Game Categories

| Category | Count | Examples |
|----------|-------|----------|
| 🕹️ **Arcade** | 16 | Snake, Tetris, Space Shooter, Asteroids |
| 🧩 **Puzzle** | 7 | 2048, Memory Match, Minesweeper, Simon |
| 🎾 **Classic** | 4 | Pong, Breakout, Tic-Tac-Toe |
| 🚀 **Modern** | 6 | Cyber Dash, Neon Duel, Rhythm Tap, Pixel Quest |

---

## 📸 Screenshots

<p align="center">
  <img src="https://via.placeholder.com/450x320/050512/00d4ff?text=Launcher+View" width="450" />
  <img src="https://via.placeholder.com/450x320/050512/ff00aa?text=Snake+Gameplay" width="450" />
</p>

---

## 🚀 Installation

### Prerequisites
- Windows 10/11
- Node.js 18+ (for development)

### Method 1: Download Portable Executable
Download the latest release from the releases page and run "Lightning Games.exe"

### Method 2: Build from Source
```bash
# Clone the repository
git clone https://github.com/username/lightning-games.git
cd lightning-games

# Install dependencies
npm install

# Run in development mode
npm start
```

### Build for Distribution
```bash
# Create portable Windows executable
npm run dist
```

---

## 🎮 Game List

### 🕹️ Arcade Games (16)

| Game | Icon | Controls | Description | Difficulty |
|------|------|----------|-------------|------------|
| **Snake** | 🐍 | WASD / Arrows | Classic snake game with modern visuals | ⭐⭐ |
| **Cyber Dash** | ⚡ | WASD / Arrows | Dodge obstacles, collect energy pulses | ⭐⭐⭐ |
| **Tetris** | 🧱 | WASD / Arrows, Space | Block stacking puzzle with particle effects | ⭐⭐⭐ |
| **Asteroids** | ☄️ | WASD, Space | Classic space shooter with thrust physics | ⭐⭐⭐⭐ |
| **Frogger** | 🐸 | WASD / Arrows | Cross the road and river safely | ⭐⭐⭐ |
| **Whack-A-Mole** | 🔨 | Mouse | Fast-paced mole hunting | ⭐⭐ |
| **Neon Jump** | 🎈 | Space / Arrows | Infinite jumping game | ⭐⭐ |
| **Neon Runner** | 🦖 | Space | Auto-runner with obstacles | ⭐⭐⭐ |
| **Space Shooter** | 🚀 | WASD / Arrows | Shoot'em up with auto-fire | ⭐⭐⭐ |
| **Orb Collector** | 🟡 | Mouse | Collect orbs, avoid mines | ⭐⭐⭐ |
| **SkyFall** | ⭐ | WASD | Catch stars, dodge meteors | ⭐⭐ |
| **Laser Grid** | 🧊 | WASD | Dodge scanning lasers | ⭐⭐⭐⭐ |
| **Orbit** | 🛰️ | WASD | Survive in orbital path | ⭐⭐⭐ |
| **Stacker** | 🏗️ | Space | Perfect tower building | ⭐⭐⭐ |
| **Color Rush** | 🎨 | WASD | Run to matching colors | ⭐⭐⭐ |
| **Flappy Bird** | 🐦 | Space | Navigate through pipes | ⭐⭐⭐ |

### 🧩 Puzzle Games (7)

| Game | Icon | Controls | Description | Difficulty |
|------|------|----------|-------------|------------|
| **2048** | ✨ | WASD / Arrows | Number merging puzzle | ⭐⭐⭐ |
| **Memory Match** | 🧠 | Mouse | Card matching with timer | ⭐⭐ |
| **Tic-Tac-Toe** | ❌ | Mouse | Classic X-O game | ⭐ |
| **Minesweeper** | 💣 | Mouse | Logic puzzle, avoid mines | ⭐⭐⭐⭐ |
| **Simon** | 🎛️ | Mouse | Remember the sequence | ⭐⭐⭐ |
| **Word Quest** | 📝 | Keyboard | Type words before time runs out | ⭐⭐⭐ |
| **Jewel Match** | 💎 | Mouse | Match-3 gem puzzle | ⭐⭐ |

### 🎾 Classic Games (4)

| Game | Icon | Controls | Description | Players |
|------|------|----------|-------------|---------|
| **Squash Pong** | 🏓 | A/D or Arrows | Solo paddle ball | 1 |
| **Neon Duel** | ⚔️ | WASD vs Arrows | 2-player competitive | 2 |
| **Breakout** | 🧱 | A/D or Mouse | Brick breaker | 1 |

### 🚀 Modern Games (6)

| Game | Icon | Controls | Description |
|------|------|----------|-------------|
| **Blaster** | 🔫 | Mouse | Alien invasion defense |
| **Pixel Quest** | 🏰 | WASD | Dungeon adventure |
| **Bouncy Ball** | ⚽ | Mouse | Physics-based bouncing |
| **Rhythm Tap** | 🎵 | ASDF | Tap to the beat |
| **Ninja Slice** | 🥷 | Mouse | Slice flying targets |
| **Doodle Jump** | 🎈 | Arrows | Platform jumping |

---

## 🏆 Achievements

### Basic Achievements

| Achievement | Icon | Description | Unlock Condition |
|-------------|------|-------------|------------------|
| **Welcome!** | 🎮 | Launch your first game | Start any game |
| **Record Breaker!** | 🏆 | Break a high score | Beat any previous high score |
| **Master Player** | 🔥 | Score 1000 points | Reach 1000 points in any game |
| **Warmup Done** | 🔥 | Play 10 games total | Play 10 different sessions |
| **Snake Tamer** | 🐍 | Score 100 in Snake | Reach 100 points in Snake |
| **Architect** | 🧱 | Score 500 in Tetris | Clear lines worth 500+ points |
| **Mine Expert** | 💣 | Win Minesweeper | Clear a minefield successfully |
| **First Rock** | 🪨 | Destroy first asteroid | Shoot an asteroid in Asteroids |

### Ultra Achievements (Rare)

| Achievement | Icon | Description | Unlock Condition |
|-------------|------|-------------|------------------|
| **Marathon Runner** | 🏃 | Play 50 games | Total 50 game sessions |
| **Non-Stop** | ⚡ | Play 100 games | Total 100 game sessions |
| **Night Owl** | 🦉 | Late night gaming | Play after 10 PM |
| **Early Bird** | 🐤 | Morning gaming | Play before 8 AM |
| **Weekend Warrior** | ⚔️ | Weekend player | Play on Saturday or Sunday |
| **Snake Charmer** | 🐍 | Snake master | Score 250 in Snake |
| **Pentominium** | 🧱 | Tetris master | Score 1000 in Tetris |
| **Asteroid Annihilator** | ☄️ | Space cleanup | Destroy 50 asteroids total |
| **Space Ace** | 🌌 | Space legend | Destroy 100 asteroids total |
| **Memory God** | ⚡ | Speed memory | Complete Memory Match in 30s |
| **Explorer** | 🗺️ | Try everything | Play 10 different games |
| **2048 Master** | 🌟 | Beyond 2048 | Reach 4096 tile |
| **Collector** | 👑 | Achievement hunter | Unlock 15 achievements |
| **Godly** | ⛩️ | Complete mastery | Unlock ALL achievements |
| **Addict** | 💊 | Time investment | Total playtime over 1 hour |
| **Bulletproof** | 🧥 | Untouchable | Survive 1 min in Space Shooter |
| **Indestructible** | 💎 | Immortal | Survive 3 min in Asteroids |

**Total: 35+ Achievements to Unlock!**

---

## 🎨 Themes

Switch themes in the Settings modal:

| Theme | Preview | Description | CSS Filter |
|-------|---------|-------------|------------|
| **Neon** | 🟦🟪🩷 | Default cyan/magenta/green gradient | None |
| **Retro** | 🟨🟧 | Amber CRT monitor aesthetic | sepia(0.5) contrast(1.1) |
| **Minimal** | ⬛⬜ | Clean black and white | None |
| **Forest** | 🟩🌲 | Green nature tones | None |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+Alt+G` | Toggle window show/hide | Global (anywhere) |
| `Esc` 
