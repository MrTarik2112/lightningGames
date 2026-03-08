<!-- ============================================ -->
<!--        LIGHTNING GAMES - README v3.0        -->
<!-- ============================================ -->

<p align="center">
  <img src="assets/icons/256x256.png" alt="Lightning Games" width="140" height="140" />
</p>

<h1 align="center">
  <sup><sub>&#9889;</sub></sup> Lightning Games
</h1>

<p align="center">
  <b>A premium neon-themed game arcade that lives in your system tray.</b><br/>
  <sub>40 handcrafted games. One global hotkey. Zero friction.</sub>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.1.6-00d4ff?style=for-the-badge&logo=semver&logoColor=white" alt="Version" />
  <img src="https://img.shields.io/badge/games-40-ff00aa?style=for-the-badge&logoColor=white" alt="Games" />
  <img src="https://img.shields.io/badge/achievements-37-ffcc00?style=for-the-badge&logoColor=white" alt="Achievements" />
  <img src="https://img.shields.io/badge/themes-4-00ff88?style=for-the-badge&logoColor=white" alt="Themes" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%2010%2F11-0078D6?style=flat-square&logo=windows&logoColor=white" alt="Platform" />
  <img src="https://img.shields.io/badge/electron-28.0-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/runtime%20deps-0-brightgreen?style=flat-square" alt="Zero Runtime Deps" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
</p>

<br/>

<p align="center">
  <code>Press</code> <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>G</kbd> <code>from anywhere to summon the arcade.</code>
</p>

---

<br/>

## Table of Contents

<table>
<tr>
<td width="50%" valign="top">

**Getting Started**
- [Why Lightning Games?](#-why-lightning-games)
- [Quick Start](#-quick-start)
- [Installation](#-installation)

**The Games**
- [Game Library (40 Games)](#-game-library)
  - [Arcade (24)](#arcade-24-games) | [Puzzle (10)](#puzzle-10-games) | [Classic (3)](#classic-3-games) | [Strategy (1)](#strategy-1-game) | [Creative (2)](#creative-2-games)
- [Tower Defense -- In Depth](#-tower-defense--in-depth)
- [Game Difficulty Guide](#-game-difficulty-guide)

</td>
<td width="50%" valign="top">

**Features & Systems**
- [Achievement System (37 Achievements)](#-achievement-system)
- [Theme Gallery](#-theme-gallery)
- [Sound Engine](#-sound-engine)
- [Keyboard & Mouse Reference](#-keyboard--mouse-reference)

**Technical**
- [Architecture](#-architecture)
- [Data & Storage](#-data--storage)
- [Performance Tuning](#-performance-tuning)
- [Building from Source](#-building-from-source)
- [Adding a New Game](#-adding-a-new-game)
- [License](#license)

</td>
</tr>
</table>

<br/>

---

<br/>

## &#9889; Why Lightning Games?

<table>
<tr>
<td>

**The problem:** You want a quick gaming break but don't want to open Steam, wait for updates, or deal with heavy launchers. Browser games are ad-ridden. Mobile games drain your phone.

**The solution:** A single hotkey summons 40 polished games in under 200ms. No accounts. No internet. No installation. Press <kbd>Ctrl+Alt+G</kbd>, play for 2 minutes, press <kbd>Esc</kbd>, back to work.

</td>
</tr>
</table>

| | Lightning Games | Browser Games | Steam / Epic |
|---|:---:|:---:|:---:|
| Launch time | **< 200ms** | 3--5s | 10--30s |
| Internet required | **No** | Yes | Mostly |
| Account required | **No** | Sometimes | Yes |
| Ads | **None** | Everywhere | No |
| Disk usage | **~80 MB** | N/A | 500 MB+ |
| Privacy | **100% local** | Tracked | Tracked |
| Global hotkey | **Yes** | No | No |
| Runs in system tray | **Yes** | No | Partial |

<br/>

---

<br/>

## &#128640; Quick Start

```
1. Download "Lightning Games.exe"
2. Double-click to run (no install needed)
3. Lightning bolt icon appears in system tray
4. Press Ctrl+Alt+G from anywhere to open
5. Click a game card to play
6. Press Esc to go back or hide the window
```

That's it. Your scores, achievements, and settings auto-save locally.

<br/>

---

<br/>

## &#128229; Installation

<table>
<tr>
<td>

### Option A: Portable Executable (Recommended)

Download `Lightning Games.exe` from the latest release.
Double-click to run. No installer, no admin rights, no registry entries.

The app creates **no files** on disk -- everything lives in the Electron `localStorage`.

</td>
</tr>
<tr>
<td>

### Option B: Build from Source

```bash
git clone https://github.com/tarikbc/lightning-games.git
cd lightning-games
npm install       # Install dev dependencies
npm start         # Launch in dev mode
```

To create a distributable `.exe`:
```bash
npm run dist      # Interactive build wizard
```

</td>
</tr>
</table>

<br/>

---

<br/>

## &#127918; Game Library

**40 games** across 5 categories. Every game runs on an 880x540 HTML5 Canvas with synthesized audio and neon visuals.

<br/>

### Arcade (24 games)

Fast-paced games that test your reflexes, timing, and survival skills.

| # | Game | | Description | Controls | Difficulty |
|--:|------|:---:|-------------|----------|:----------:|
| 1 | **Snake** | &#x1F40D; | Classic snake -- eat, grow, survive | WASD / Arrows | &#11088;&#11088; |
| 2 | **Cyber Dash** | &#9889; | Side-scrolling obstacle dodger with energy pickups | WASD / Arrows | &#11088;&#11088;&#11088; |
| 3 | **Tetris** | &#129521; | Block stacking with particle effects and line combos | Arrows, Space | &#11088;&#11088;&#11088; |
| 4 | **Asteroids** | &#9732;&#65039; | Thrust-physics space survival -- rotate, thrust, shoot | WASD, Space | &#11088;&#11088;&#11088;&#11088; |
| 5 | **Frogger** | &#128056; | Cross roads and rivers without getting hit | WASD / Arrows | &#11088;&#11088;&#11088; |
| 6 | **Whack-A-Mole** | &#128296; | Click moles before they hide, speed ramps up | Mouse | &#11088;&#11088; |
| 7 | **Neon Jump** | &#127880; | Infinite vertical platformer -- aim for the sky | Arrows / Space | &#11088;&#11088; |
| 8 | **Neon Runner** | &#129430; | Auto-runner with increasing obstacle density | Space | &#11088;&#11088;&#11088; |
| 9 | **Flappy Bird** | &#128038; | Tap to navigate through neon pipe gaps | Space | &#11088;&#11088;&#11088; |
| 10 | **Space Shooter** | &#128640; | Top-down shoot-em-up with enemy waves | WASD / Arrows | &#11088;&#11088;&#11088; |
| 11 | **Orb Collector** | &#128993; | Collect glowing orbs, dodge mines on the field | Mouse | &#11088;&#11088;&#11088; |
| 12 | **SkyFall** | &#11088; | Catch falling stars, dodge incoming meteors | WASD | &#11088;&#11088; |
| 13 | **Laser Grid** | &#129482; | Survive scanning laser beam patterns | WASD | &#11088;&#11088;&#11088;&#11088; |
| 14 | **Orbit** | &#128752;&#65039; | Stay alive in an orbital path, avoid debris | WASD | &#11088;&#11088;&#11088; |
| 15 | **Stacker** | &#127959;&#65039; | Time your drops to build the perfect tower | Space | &#11088;&#11088;&#11088; |
| 16 | **Color Rush** | &#127912; | Sprint to the matching color zone before time | WASD | &#11088;&#11088;&#11088; |
| 17 | **Blaster** | &#128299; | Defend against waves of alien invaders | Mouse | &#11088;&#11088;&#11088; |
| 18 | **Pixel Quest** | &#127984; | Dungeon crawl with enemies, loot, and exploration | WASD | &#11088;&#11088;&#11088; |
| 19 | **Bouncy Ball** | &#9917; | Physics-based bounce game with trick shots | Mouse | &#11088;&#11088; |
| 20 | **Rhythm Tap** | &#127925; | Hit falling notes on beat for combos | ASDF | &#11088;&#11088;&#11088; |
| 21 | **Ninja Slice** | &#129399; | Slice flying targets before they fall off screen | Mouse | &#11088;&#11088; |
| 22 | **Orbit Defense** | &#128737;&#65039; | Protect your orbital center from incoming threats | Mouse | &#11088;&#11088;&#11088; |
| 23 | **Gravity Flip** | &#11014;&#65039; | Flip gravity on/off to navigate obstacle corridors | Space | &#11088;&#11088;&#11088; |
| 24 | **Tap Dash** | &#127925; | Quick-tap rhythm runner with escalating tempo | Space | &#11088;&#11088; |

<br/>

### Puzzle (10 games)

Think, plan, and solve. No time pressure (mostly).

| # | Game | | Description | Controls | Difficulty |
|--:|------|:---:|-------------|----------|:----------:|
| 1 | **2048** | &#10024; | Slide and merge tiles to reach 2048 (and beyond) | WASD / Arrows | &#11088;&#11088;&#11088; |
| 2 | **Memory Match** | &#129504; | Flip cards and match pairs -- speed matters | Mouse | &#11088;&#11088; |
| 3 | **Tic-Tac-Toe** | &#10060; | Classic 3x3 grid against a competent AI | Mouse | &#11088; |
| 4 | **Minesweeper** | &#128163; | Logic deduction -- clear the field without detonating | L/R Click | &#11088;&#11088;&#11088;&#11088; |
| 5 | **Memotron** | &#127902;&#65039; | Simon-style -- repeat increasingly long sequences | Mouse | &#11088;&#11088;&#11088; |
| 6 | **Word Quest** | &#128221; | Type the displayed word before time expires | Keyboard | &#11088;&#11088;&#11088; |
| 7 | **Jewel Match** | &#128142; | Swap adjacent gems to create matches of 3+ | Mouse | &#11088;&#11088; |
| 8 | **Hex Puzzle** | &#128310; | Place hexagonal tiles to clear lines | Mouse | &#11088;&#11088;&#11088; |
| 9 | **Shape Shifter** | &#128314; | Match the displayed shape before it changes | Mouse | &#11088;&#11088; |
| 10 | **Zig Zag** | &#12336;&#65039; | Navigate a zig-zag path collecting stars | Arrows | &#11088;&#11088; |

<br/>

### Classic (3 games)

Timeless games, neon-ified.

| # | Game | | Description | Controls | Players |
|--:|------|:---:|-------------|----------|:-------:|
| 1 | **Squash Pong** | &#127955; | Solo paddle ball with increasing speed | A/D or Arrows | 1 |
| 2 | **Neon Duel** | &#9876;&#65039; | Head-to-head local 2-player pong | P1: W/S &bull; P2: &uarr;/&darr; | **2** |
| 3 | **Breakout** | &#129521; | Smash bricks with a bouncing ball | A/D or Mouse | 1 |

<br/>

### Strategy (1 game)

Deep gameplay with resource management and tactical decisions.

| # | Game | | Description | Controls | Depth |
|--:|------|:---:|-------------|----------|:-----:|
| 1 | **Tower Defense** | &#128508; | 8 tower types, 6 enemy types, 50+ waves, endless mode | Mouse, `T` for speed | &#11088;&#11088;&#11088;&#11088;&#11088; |

> *Tower Defense is the most complex game in the collection (1,300+ lines). It gets its own section below.*

<br/>

### Creative (2 games)

No score. No pressure. Just vibes.

| # | Game | | Description | Controls |
|--:|------|:---:|-------------|----------|
| 1 | **Neon Piano** | &#127929; | Fully playable synthesizer with keyboard mapping | Keyboard / Mouse |
| 2 | **Neon Draw** | &#9999;&#65039; | Freeform neon light painting canvas | Mouse |

<br/>

---

<br/>

## &#128508; Tower Defense -- In Depth

The crown jewel of Lightning Games. A complete tower defense experience with strategic depth, 8 unique tower types, 6 enemy classes, 3 super abilities, and an endless mode.

<br/>

### Towers

<table>
<tr>
<td align="center" width="12.5%">

**Laser**<br/>&#9889;<br/>`$75`
<br/><sub>DMG 25 &bull; RNG 140<br/>RATE 3/s</sub>

</td>
<td align="center" width="12.5%">

**Cannon**<br/>&#128165;<br/>`$125`
<br/><sub>DMG 60 &bull; RNG 120<br/>RATE 1/s</sub>

</td>
<td align="center" width="12.5%">

**Cryo**<br/>&#10052;&#65039;<br/>`$100`
<br/><sub>DMG 15 &bull; RNG 100<br/>RATE 2/s</sub>

</td>
<td align="center" width="12.5%">

**Sniper**<br/>&#127919;<br/>`$200`
<br/><sub>DMG 150 &bull; RNG 250<br/>RATE 0.5/s</sub>

</td>
<td align="center" width="12.5%">

**Tesla**<br/>&#128311;<br/>`$175`
<br/><sub>DMG 35 &bull; RNG 110<br/>RATE 4/s</sub>

</td>
<td align="center" width="12.5%">

**Missile**<br/>&#128640;<br/>`$300`
<br/><sub>DMG 120 &bull; RNG 180<br/>RATE 0.7/s</sub>

</td>
<td align="center" width="12.5%">

**Aura**<br/>&#10024;<br/>`$150`
<br/><sub>BUFF +30%<br/>RNG 100</sub>

</td>
<td align="center" width="12.5%">

**Venom**<br/>&#128013;<br/>`$160`
<br/><sub>DMG 10 &bull; RNG 130<br/>RATE 1.5/s</sub>

</td>
</tr>
<tr>
<td align="center"><sub>Single<br/>target</sub></td>
<td align="center"><sub>60px AoE<br/>splash</sub></td>
<td align="center"><sub>50% slow<br/>for 3s</sub></td>
<td align="center"><sub>Pierces<br/>3 enemies</sub></td>
<td align="center"><sub>Chain to<br/>3 targets</sub></td>
<td align="center"><sub>Homing +<br/>80px splash</sub></td>
<td align="center"><sub>Buffs nearby<br/>tower DMG</sub></td>
<td align="center"><sub>Poison<br/>over time</sub></td>
</tr>
</table>

<br/>

### Enemies

| Type | Icon | HP | Speed | Reward | Behavior |
|------|:----:|---:|------:|-------:|----------|
| **Normal** | &#128308; | 40 | 50 | $8 | Standard path follower |
| **Fast** | &#128993; | 25 | 90 | $6 | Low HP but nearly double speed |
| **Tank** | &#128995; | 150 | 30 | $20 | Slow-moving HP sponge |
| **Boss** | &#128081; | 500 | 25 | $100 | Appears every 10 waves |
| **Healer** | &#128994; | 60 | 40 | $15 | Regenerates HP of nearby allies |
| **Flying** | &#128309; | 35 | 70 | $10 | Ignores ground path, takes shortcuts |

> Enemy HP and speed scale with wave number. By wave 50, even normal enemies are formidable.

<br/>

### Super Abilities

| Ability | Key | Cooldown | Effect |
|---------|:---:|:--------:|--------|
| **Nuke** &#128165; | Click | 60s | 200 damage to **every** enemy on the map |
| **Slow Field** &#10052;&#65039; | Click | 30s | All enemies move at 30% speed for 5 seconds |
| **Damage Boost** &#9889; | Click | 45s | All towers deal **2x damage** for 10 seconds |

<br/>

### Strategy Tips

<table>
<tr>
<td width="50%">

**Early Game (Waves 1--15)**
- Start with 2--3 Laser towers at the first bend
- Add a Cryo tower at the second chokepoint
- Save money -- don't overbuild

**Mid Game (Waves 16--35)**
- Introduce Sniper towers for long-range boss damage
- Place an Aura tower between your Laser cluster
- Start saving Nuke for boss waves (10, 20, 30...)

</td>
<td width="50%">

**Late Game (Waves 36--50)**
- Tesla towers handle swarms of Fast enemies
- Missile towers for Tank/Boss combos
- Venom for sustained damage on high-HP targets

**Endless Mode (Wave 50+)**
- All stats scale infinitely
- Prioritize Aura + Sniper combos
- Use Slow Field + Nuke together on boss waves
- Press `T` for 3x speed between waves

</td>
</tr>
</table>

<br/>

---

<br/>

## &#127942; Achievement System

**37 achievements** across two rarity tiers. Achievements trigger neon toast popups with a synthesized fanfare sound.

<br/>

### Normal Achievements

Unlock these through regular gameplay.

| | Achievement | How to Unlock |
|:---:|-------------|---------------|
| &#127918; | **Welcome!** | Start any game for the first time |
| &#127942; | **Record Breaker!** | Beat any of your previous high scores |
| &#128293; | **Master Player** | Reach 1,000 points in any single game |
| &#128013; | **Snake Tamer** | Score 100 in Snake |
| &#129521; | **Architect** | Score 500 in Tetris |
| &#129504; | **Memory Apprentice** | Score 10 in Memotron |
| &#128163; | **Mine Expert** | Successfully clear a Minesweeper board |
| &#129430; | **Fast Runner** | Score 500 in Neon Runner |
| &#128081; | **Frogger Master** | Successfully cross in Frogger |
| &#128293; | **Warmup Done** | Play 10 games total |

<br/>

### Ultra Achievements -- *Rare*

These require serious dedication, skill, or creative play.

<table>
<tr>
<th colspan="3" align="left">&#127939; Dedication</th>
</tr>
<tr><td>&#127939;</td><td><b>Marathon Runner</b></td><td>Play 50 total games</td></tr>
<tr><td>&#9889;</td><td><b>Non-Stop</b></td><td>Play 100 total games</td></tr>
<tr><td>&#128138;</td><td><b>Addict</b></td><td>Accumulate over 1 hour of total playtime</td></tr>
<tr><td>&#128260;</td><td><b>Persistent</b></td><td>Play the same game 5 times in a row</td></tr>
<tr><td>&#128506;&#65039;</td><td><b>Explorer</b></td><td>Play 10 different games</td></tr>
<tr><td>&#128241;</td><td><b>Socialite</b></td><td>Switch launcher tabs 10 times</td></tr>
<tr>
<th colspan="3" align="left">&#9200; Time-Based</th>
</tr>
<tr><td>&#129417;</td><td><b>Night Owl</b></td><td>Play a game after 10 PM</td></tr>
<tr><td>&#128036;</td><td><b>Early Bird</b></td><td>Play a game before 8 AM</td></tr>
<tr><td>&#9876;&#65039;</td><td><b>Weekend Warrior</b></td><td>Play on Saturday or Sunday</td></tr>
<tr>
<th colspan="3" align="left">&#127919; Skill-Based</th>
</tr>
<tr><td>&#128013;</td><td><b>Snake Charmer</b></td><td>Score 250 in Snake</td></tr>
<tr><td>&#128168;</td><td><b>Reflex Master</b></td><td>Achieve a 10x combo in Snake</td></tr>
<tr><td>&#129521;</td><td><b>Pentominium</b></td><td>Score 1,000 in Tetris</td></tr>
<tr><td>&#128737;&#65039;</td><td><b>Safe Stepper</b></td><td>Flag 20 mines correctly in one Minesweeper game</td></tr>
<tr><td>&#9889;</td><td><b>Memory God</b></td><td>Complete Memory Match in under 30 seconds</td></tr>
<tr><td>&#127775;</td><td><b>2048 Master</b></td><td>Reach the 4096 tile in 2048</td></tr>
<tr><td>&#128640;</td><td><b>High Jumper</b></td><td>Reach 10,000 height in Neon Jump</td></tr>
<tr><td>&#129504;</td><td><b>Simon's Rival</b></td><td>Score 20 in Memotron</td></tr>
<tr><td>&#128296;</td><td><b>Mole Slayer</b></td><td>Score 200 in Whack-A-Mole</td></tr>
<tr><td>&#128142;</td><td><b>Indestructible</b></td><td>Survive 3 minutes in Asteroids</td></tr>
<tr><td>&#127919;</td><td><b>Precision</b></td><td>Score 50 in Breakout without losing a ball</td></tr>
<tr><td>&#128293;</td><td><b>Triple Threat</b></td><td>Win Tic-Tac-Toe in under 10 seconds</td></tr>
<tr><td>&#127950;&#65039;</td><td><b>Speedrunner</b></td><td>Score 500 in Neon Runner within 1 minute</td></tr>
<tr><td>&#129509;</td><td><b>Bulletproof</b></td><td>Survive 1 min in Space Shooter without damage</td></tr>
<tr>
<th colspan="3" align="left">&#129418; Hidden</th>
</tr>
<tr><td>&#129704;</td><td><b>First Rock</b></td><td><i>Destroy your first asteroid</i></td></tr>
<tr>
<th colspan="3" align="left">&#128081; Meta</th>
</tr>
<tr><td>&#128081;</td><td><b>Collector</b></td><td>Unlock 15 achievements</td></tr>
<tr><td>&#9961;&#65039;</td><td><b>Godly</b></td><td>Unlock <b>every single achievement</b></td></tr>
</table>

<br/>

---

<br/>

## &#127912; Theme Gallery

Four complete color themes, switchable instantly from the settings panel (gear icon).

<table>
<tr>
<td align="center" width="25%">

### Neon
&#128309;&#128995;&#128310;
<br/><br/>
**Default theme.**<br/>
Cyan, magenta, and green<br/>
neon glows on deep dark blue.
<br/><br/>
`--bg: #06060f`<br/>
`--accent: #00dcff`

</td>
<td align="center" width="25%">

### Retro
&#128992;&#128993;
<br/><br/>
**CRT nostalgia.**<br/>
Warm amber tones with<br/>
a sepia + contrast filter.
<br/><br/>
`--bg: #1a1a00`<br/>
`--accent: #ffaa00`

</td>
<td align="center" width="25%">

### Minimal
&#11035;&#11036;
<br/><br/>
**Clean & focused.**<br/>
Pure monochrome black<br/>
and white. No distractions.
<br/><br/>
`--bg: #000000`<br/>
`--accent: #ffffff`

</td>
<td align="center" width="25%">

### Forest
&#128994;&#127794;
<br/><br/>
**Nature palette.**<br/>
Cool greens and organic<br/>
tones for a calm feel.
<br/><br/>
`--bg: #001a0a`<br/>
`--accent: #00ff88`

</td>
</tr>
</table>

All themes work through CSS custom properties, which means every UI element -- game cards, backgrounds, glows, text -- adapts automatically.

<br/>

---

<br/>

## &#128266; Sound Engine

All audio is **procedurally synthesized** using the Web Audio API. There are **zero audio files** in the project. The `SoundManager` generates waveforms in real time:

| Sound Effect | Waveform | Technique | Used In |
|-------------|----------|-----------|---------|
| `playClick()` | Triangle 440Hz | Single tone | UI clicks |
| `playHover()` | Sine 880Hz | Short blip | Card hover |
| `playJump()` | Square 200-600Hz | Frequency sweep up | Platformers |
| `playDeath()` | Sawtooth 400-80Hz | Frequency sweep down | Game over |
| `playShoot()` | Square 900-200Hz | Fast sweep down | Shooters |
| `playExplosion()` | White noise | Noise burst 250ms | Asteroid/TD |
| `playAchievement()` | Square chord | Multi-tone arpeggio | Achievement popup |
| `playEat()` | Multi-tone | Quick ascending pair | Snake |
| `playLineClear()` | Square sweep | Ascending sweep | Tetris |
| `playSlice()` | Sawtooth 1200-300Hz | Sharp sweep down | Ninja Slice |
| `playBounce()` | Triangle 300-600Hz | Gentle sweep up | Physics games |
| `playLaser()` | Sawtooth 1500-200Hz | Sci-fi sweep | Tower Defense |
| `playLevelUp()` | Square 400-1200Hz | Long sweep up | Level transitions |

The sound engine also includes a **procedural 8-bit music system** that generates looping background tracks per-game using note frequency maps and scheduled oscillators.

Volume is adjustable via the launcher's volume slider and persists across sessions.

<br/>

---

<br/>

## &#9000;&#65039; Keyboard & Mouse Reference

### Global (Works from any application)

| Input | Action |
|-------|--------|
| <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>G</kbd> | Toggle Lightning Games window |

### Launcher

| Input | Action |
|-------|--------|
| <kbd>Esc</kbd> | Hide the window (or return from game) |
| Start typing | Auto-focuses the search bar |
| Click game card | Launch that game |
| Click &#9829; on card | Toggle favorite |
| Click &#9881; | Open settings |

### Common In-Game Controls

| Input | Action | Games |
|-------|--------|-------|
| <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or <kbd>&uarr;</kbd><kbd>&larr;</kbd><kbd>&darr;</kbd><kbd>&rarr;</kbd> | Movement | Most games |
| <kbd>Space</kbd> | Jump / Action / Drop | Platformers, Tetris, Stacker |
| Mouse click | Interact / Shoot | Whack-A-Mole, Blaster, Minesweeper |
| <kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><kbd>F</kbd> | Hit notes | Rhythm Tap |
| <kbd>T</kbd> | Toggle speed (1x/2x/3x) | Tower Defense |
| Right-click | Flag mine | Minesweeper |
| <kbd>Esc</kbd> | Return to launcher | All games |

<br/>

---

<br/>

## &#127959; Architecture

### System Diagram

```
 +-----------------------+          +---------------------------+
 |    MAIN PROCESS       |   IPC    |     RENDERER PROCESS      |
 |    (main.js)          |<-------->|     (index.html)          |
 |                       |          |                           |
 |  - Window management  |          |  launcher.js              |
 |  - System tray        |          |    - Game card grid       |
 |  - Global shortcuts   |          |    - Search & filters     |
 |  - Auto-start toggle  |          |    - Tabs & settings      |
 |  - Single instance    |          |    - Achievement engine   |
 +-----------+-----------+          |                           |
             |                      |  gameManager.js           |
      +------+------+              |    - Game lifecycle        |
      | preload.js   |              |    - rAF game loop        |
      | (IPC bridge) |              |    - Score tracking        |
      +--------------+              |    - Stats & persistence   |
                                    |                           |
                                    |  soundManager.js          |
                                    |    - Web Audio API synth   |
                                    |    - 8-bit music engine    |
                                    |                           |
                                    |  particles.js             |
                                    |    - Background effects    |
                                    |                           |
                                    |  games/*.js (40 files)    |
                                    |    - Self-contained games  |
                                    |    - Standard interface    |
                                    +---------------------------+
```

### File Map

```
lightningGames/
 |
 |-- main.js                  Electron main process (173 lines)
 |-- preload.js               Secure IPC bridge via contextBridge
 |-- index.html               Single-page application shell
 |-- package.json             Config, scripts, electron-builder settings
 |
 |-- renderer/
 |   |-- launcher.js          UI engine: cards, tabs, search, settings, achievements
 |   |-- gameManager.js       Game lifecycle, loop, scores, stats, achievement checks
 |   |-- soundManager.js      Procedural audio synth + 8-bit music engine
 |   +-- particles.js         Animated neon particle background
 |
 |-- games/
 |   |-- snake.js             (40 game files, each a self-contained class)
 |   |-- tetris.js
 |   |-- towerdefense.js      (largest: 1,300+ lines)
 |   +-- ...
 |
 |-- styles/
 |   +-- main.css             Full design system: variables, themes, animations
 |
 |-- scripts/
 |   |-- build.js             Interactive build wizard with progress bar
 |   +-- sync-icons.js        Multi-resolution icon generator
 |
 +-- assets/
     +-- icons/               10 sizes: 16x16 through 1024x1024 + .ico + .icns
```

### Game Interface Contract

Every game is a standalone class that implements exactly 6 methods:

```javascript
class GameName {
    constructor() {
        this.score = 0;
        this.gameOver = false;
    }

    init(canvas, ctx) { }    // Called once. Canvas is 880x540.
    update(dt) { }           // Called every frame. dt = seconds since last frame.
    draw() { }               // Called every frame after update().
    getScore() { }           // Return current score as a number.
    isGameOver() { }         // Return true when the game ends.
    destroy() { }            // Clean up event listeners and timers.
}
```

The `GameManager` handles registration, instantiation, the `requestAnimationFrame` loop, and cleanup. Games never touch the DOM outside their canvas.

### IPC Channels

Communication between main and renderer is minimal by design:

| Channel | Direction | Payload | Purpose |
|---------|:---------:|---------|---------|
| `close-window` | Renderer &#8594; Main | -- | Trigger hide animation + hide |
| `quit-app` | Renderer &#8594; Main | -- | Destroy window + quit process |
| `window-hiding` | Main &#8594; Renderer | -- | Let renderer run exit animation |
| `window-showing` | Main &#8594; Renderer | -- | Let renderer run enter animation |

<br/>

---

<br/>

## &#128451; Data & Storage

All persistence uses `localStorage` with a `lg_` prefix. No external databases, no cloud sync, no files on disk.

| Key | Format | Example | Purpose |
|-----|--------|---------|---------|
| `lg_highscores` | `{ id: number }` | `{"snake":142,"tetris":890}` | Per-game best scores |
| `lg_achievements` | `string[]` | `["first_game","warmup"]` | Unlocked achievement IDs |
| `lg_favorites` | `string[]` | `["snake","tetris"]` | Pinned game IDs |
| `lg_settings` | `object` | `{"reducedMotion":false,"shakeIntensity":5,"renderScale":1}` | User preferences |
| `lg_theme` | `string` | `"retro"` | Active theme name |
| `lg_volume` | `float string` | `"0.7"` | Master volume (0.0--1.0) |
| `lg_totalGames` | `int string` | `"47"` | Lifetime games played |
| `lg_totalPlayTime` | `float string` | `"3842.5"` | Lifetime seconds played |
| `lg_lastPlayed` | `{ id: timestamp }` | `{"snake":1709856000}` | Per-game last-played time |
| `lg_uniqueGames` | `string[]` | `["snake","tetris","pong"]` | Distinct games ever played |
| `lg_consecutiveGames` | `int string` | `"3"` | Current same-game streak |
| `lg_lastGameId` | `string` | `"snake"` | Most recently played game |
| `lg_totalAsteroids` | `int string` | `"73"` | Lifetime asteroids destroyed |

> Writes are **debounced at 250ms** to prevent excessive I/O during rapid score changes.

<br/>

---

<br/>

## &#9889; Performance Tuning

### GPU Flags (set before app ready)

```
--enable-gpu-rasterization          Hardware-accelerated tile rasterization
--enable-oop-rasterization          Off-main-thread painting
--enable-accelerated-video-decode   GPU video decode
--enable-gpu-compositing            GPU layer compositing
--disable-background-timer-throttle Consistent timers when backgrounded
--disable-renderer-backgrounding    Prevent renderer throttling
--force-color-profile srgb          Consistent color rendering
```

### Runtime Optimizations

| Optimization | Technique | Impact |
|-------------|-----------|--------|
| **Frame timing** | `requestAnimationFrame` with dt cap at 50ms | Prevents physics explosions on lag spikes |
| **Canvas scaling** | Configurable 0.7x -- 1.0x render resolution | Lower-end GPUs can trade quality for FPS |
| **Event delegation** | Single listener on game grid, not per-card | Fewer DOM listeners, faster GC |
| **Debounced writes** | 250ms delay on localStorage operations | Prevents I/O thrashing during gameplay |
| **Smooth scrolling** | Custom lerp-based scroll with `requestAnimationFrame` | 60fps launcher scrolling |
| **Single instance** | `app.requestSingleInstanceLock()` | Prevents duplicate processes |
| **Selective build** | Only bundles JS/HTML/CSS, excludes `node_modules` | Reduces package from ~500MB to ~80MB |

### Settings for Low-End Hardware

Open Settings (gear icon) and adjust:
- **Render Scale**: Lower to 0.7x for better FPS on integrated GPUs
- **Reduced Motion**: Disables particle background and smooth scroll
- **Shake Intensity**: Reduce or disable screen shake effects

<br/>

---

<br/>

## &#128230; Building from Source

### Prerequisites

- **Node.js** 18 or later
- **npm** (comes with Node)
- **Windows 10/11** (builds target Windows portable `.exe`)

### Development

```bash
npm start          # Launch the app
npm run dev        # Launch with --dev flag
```

### Production Build

```bash
npm run dist
```

The interactive build wizard will:

```
1. Display current version (from package.json)
2. Prompt for new version number
3. Ask compression level (0-10):
   |  Level  |  Time   |  Size   |
   |---------|---------|---------|
   |  0 - 3  |  ~5 sec | ~150 MB |
   |  4 - 7  | ~30 sec | ~110 MB |
   |  8 - 10 |  ~2 min |  ~80 MB |
4. Update package.json with new version
5. Run electron-builder --win portable
6. Save build log to BuildLogs/build-{timestamp}.log
7. Show live progress bar in terminal
```

Output: `dist/Lightning Games.exe` -- a single portable executable.

### Dev Dependencies

| Package | Version | Role |
|---------|---------|------|
| `electron` | ^28.0.0 | Desktop application framework |
| `electron-builder` | ^24.13.3 | Packaging and distribution |
| `canvas` | ^3.2.1 | Programmatic tray icon generation |
| `png-to-ico` | ^3.0.1 | Icon format conversion for Windows |

**Zero runtime dependencies.** The shipped application is pure vanilla JavaScript, HTML, and CSS.

<br/>

---

<br/>

## &#127918; Adding a New Game

<table>
<tr>
<td>

### Step 1: Create the game file

Create `games/mygame.js`:

```javascript
class MyGame {
    constructor() {
        this.score = 0;
        this.gameOver = false;
    }

    init(canvas, ctx) {
        this.canvas = canvas;   // 880x540
        this.ctx = ctx;
        // Set up initial game state
    }

    update(dt) {
        if (this.gameOver) return;
        // dt is in seconds (typically ~0.016 for 60fps)
        // Game logic here
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Render game here
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }

    destroy() {
        // Remove any event listeners you added
    }
}
```

</td>
</tr>
<tr>
<td>

### Step 2: Register in index.html

```html
<script src="games/mygame.js"></script>
```

</td>
</tr>
<tr>
<td>

### Step 3: Add to the launcher

In `renderer/launcher.js`, add to the `GAME_CARDS_CONFIG` array:

```javascript
{
    id: 'mygame',
    icon: '🎮',
    name: 'My Game',
    desc: 'Short description for the card',
    category: 'arcade',   // arcade | puzzle | classic
    color: '--accent-cyan',
    glowColor: 'rgba(0, 212, 255, 0.12)',
    borderColor: 'rgba(0, 212, 255, 0.35)',
    shadowColor: '0 0 30px rgba(0, 212, 255, 0.2), 0 0 60px rgba(0, 212, 255, 0.06)'
}
```

</td>
</tr>
<tr>
<td>

### Step 4 (Optional): Add achievements

In the `ALL_ACHIEVEMENTS` array in the same file:

```javascript
{ id: 'mygame_pro', title: 'My Game Pro', desc: 'Score 500 in My Game.', icon: '🏆', ultra: true }
```

Then add the unlock logic in `gameManager.js` where scores are checked.

</td>
</tr>
</table>

### Sound Effects Available

Your game can use any of these pre-built sounds via `window.soundManager`:

```javascript
// UI
playClick()    playHover()    playSelect()

// Game Events
playJump()     playHit()      playScore()     playDeath()
playShoot()    playExplosion() playLevelUp()   playEat()
playMatch()    playWin()      playBounce()    playSlice()

// Ambient
playLaser()    playFlip()     playWhoosh()    playTick()
playDing()     playBuzz()     playLand()      playSwing()
playCountdown() playPowerUp() playPlace()     playMove()
playLineClear()
```

<br/>

---

<br/>

## &#127775; Game Difficulty Guide

A quick reference for picking a game based on how hard you want to be challenged.

| Difficulty | Meaning | Games |
|:----------:|---------|-------|
| &#11088; | **Chill** -- Nearly impossible to lose | Tic-Tac-Toe |
| &#11088;&#11088; | **Easy** -- Great for a quick break | Snake, Whack-A-Mole, Neon Jump, SkyFall, Bouncy Ball, Ninja Slice, Tap Dash, Memory Match, Jewel Match, Shape Shifter, Zig Zag |
| &#11088;&#11088;&#11088; | **Medium** -- Requires focus and practice | Cyber Dash, Tetris, Frogger, Neon Runner, Flappy Bird, Space Shooter, Orb Collector, Orbit, Stacker, Color Rush, Blaster, Pixel Quest, Rhythm Tap, Orbit Defense, Gravity Flip, 2048, Memotron, Word Quest, Hex Puzzle |
| &#11088;&#11088;&#11088;&#11088; | **Hard** -- You will lose. A lot. | Asteroids, Laser Grid, Minesweeper |
| &#11088;&#11088;&#11088;&#11088;&#11088; | **Strategic** -- Deep, long-session gameplay | Tower Defense |

<br/>

---

<br/>

## License

[MIT](LICENSE)

<p align="center">
  <sub>Built with &#9889; by <b>Tarik</b></sub>
</p>
