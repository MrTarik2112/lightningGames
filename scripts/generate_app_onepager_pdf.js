const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'output', 'pdf');
const tmpDir = path.join(root, 'tmp', 'pdfs');
const htmlPath = path.join(tmpDir, 'lightning-games-onepager.html');
const pdfPath = path.join(outputDir, 'lightning-games-onepager.pdf');

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(tmpDir, { recursive: true });

const whatItIs = [
  'Lightning Games is an Electron desktop app that lives in the system tray.',
  'It opens a frameless launcher window with a neon styled interface.',
  'The launcher is designed for quick access to a large local game library.',
  'The repo currently ships 59 JavaScript game files under the games folder.',
  'Games are loaded into a single HTML shell that also hosts the launcher UI.',
  'The app runs offline from local assets packaged with Electron.',
  'It uses a secure preload bridge instead of exposing Node APIs to the renderer.',
  'The main process manages the tray icon, global hotkey, window visibility, and quit flow.',
  'The renderer manages game registration, launch, pause, resume, and score updates.',
  'Player progress is stored in browser localStorage rather than a server database.',
  'The interface includes search, categories, favorites, recent activity, and stats views.',
  'The experience is heavily themed with particle effects, glow treatments, and multiple themes.'
];

const persona = [
  'Primary user: a Windows desktop player who wants instant, low-friction access to short local games from the tray.',
  'Likely persona: someone who prefers offline play, quick breaks, visible progress tracking, and a playful premium UI without accounts or setup overhead.'
];

const features = [
  'Electron desktop runtime',
  'System tray presence',
  'Tray click toggles window',
  'Global hotkey Ctrl+Alt+G',
  'Single-instance lock',
  'Frameless fixed-size window',
  'Always-on-top launcher window',
  'Hide instead of full close',
  'Auto-hide on blur',
  'Startup fade-in flow',
  'Secure preload bridge',
  'Context isolation enabled',
  'Node integration disabled',
  'Web security enabled',
  '59 local game scripts included',
  'Arcade game category',
  'Puzzle game category',
  'Classic game category',
  'Favorites category tab',
  'Searchable game grid',
  'Random game button',
  'Recently played section',
  'Stats dashboard',
  'Top games by score',
  'Recent activity list',
  'Category breakdown',
  'Playtime distribution view',
  'Milestones panel',
  'Achievement list filters',
  'Achievement toast container',
  'High score tracking',
  'Per-game best score display',
  'Persistent favorites',
  'Persistent achievements',
  'Persistent last played timestamps',
  'Persistent total play time',
  'Persistent consecutive streaks',
  'Persistent unique games list',
  'Persistent total asteroids stat',
  'Volume slider in title bar',
  'Procedural SFX engine',
  'Per-game music themes',
  'Background particle canvas',
  'Reduced motion setting',
  'Screen shake setting',
  'Resolution scale setting',
  'Particle density setting',
  'Glow intensity setting',
  'Animation speed setting',
  'Show FPS option',
  'Screen flash option',
  'SFX volume option',
  'Music volume option',
  'Mute on blur option',
  'Auto-pause option',
  'Confirm exit option',
  'Show timer option',
  'Difficulty selector',
  'Compact mode option',
  'Show descriptions option',
  'Achievement notifications option',
  'Card size control',
  'Grid layout selector',
  'Dark mode toggle',
  'Tutorial button',
  'JSON data export',
  'JSON data import',
  'High-score screenshot action',
  'Achievement share action',
  'Hard reset action',
  'Build scripts for Bun and npm',
  'Portable Windows build target',
  'Linux AppImage build target',
  'Native build UI project included',
  'Backend/API services: Not found in repo'
];

const architecture = [
  'Main process: main.js configures GPU and privacy-related Chromium flags, creates the BrowserWindow, manages the tray menu, registers Ctrl+Alt+G, and handles close/quit IPC.',
  'Preload bridge: preload.js exposes only closeWindow, quitApp, and window show/hide event hooks through contextBridge.',
  'Renderer shell: index.html defines the launcher, stats, settings, data modals, game canvas, and script includes for renderer modules plus all game scripts.',
  'Game lifecycle: renderer/gameManager.js registers game classes, instantiates the active game, runs the animation loop, pauses/resumes, updates scores, and checks achievements.',
  'UI layer: renderer/launcher.js renders game cards from GAME_CARDS_CONFIG, wires search, category tabs, favorites, stats, settings, export/import, screenshot, and tutorial flows.',
  'Media layers: renderer/soundManager.js synthesizes music and SFX with the Web Audio API; renderer/particles.js draws the animated background canvas.',
  'Data flow: user input in launcher -> gameManager launches/updates games -> score and stats mutate in memory -> localStorage persists highscores, settings, achievements, favorites, playtime, and last-played data.',
  'Remote services, cloud sync, and external APIs: Not found in repo.'
];

const runSteps = [
  '1. From the repo root, install dependencies with `bun install` or `npm install`.',
  '2. Start the app with `bun start` or `npm start`.',
  '3. Use `bun run dev` or `npm run dev` if you want DevTools.',
  '4. Build a distributable with `bun run dist` or `npm run dist`.'
];

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Lightning Games - One Page Summary</title>
  <style>
    @page { size: A4 landscape; margin: 0.28in; }
    :root {
      --bg: #061018;
      --panel: #0d1824;
      --panel2: #101e2d;
      --line: #1e4057;
      --ink: #e8f6ff;
      --muted: #9dc3d8;
      --accent: #5ce1ff;
      --accent2: #7cffc8;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; color: var(--ink); background: var(--bg); }
    body { width: 100%; }
    .page {
      width: 100%;
      min-height: 100vh;
      background:
        radial-gradient(circle at top right, rgba(92,225,255,0.16), transparent 26%),
        radial-gradient(circle at bottom left, rgba(124,255,200,0.12), transparent 22%),
        linear-gradient(180deg, #07111a, #08131d 30%, #08111b 100%);
      padding: 14px 18px 12px;
    }
    .header {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 12px;
      margin-bottom: 8px;
      align-items: end;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.2px;
      color: white;
      margin: 0;
    }
    .subtitle {
      margin-top: 4px;
      font-size: 10px;
      line-height: 1.35;
      color: var(--muted);
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: flex-end;
      align-content: start;
    }
    .pill {
      border: 1px solid var(--line);
      background: rgba(15, 28, 43, 0.88);
      border-radius: 999px;
      padding: 5px 8px;
      font-size: 9px;
      color: var(--ink);
      white-space: nowrap;
    }
    .grid-top {
      display: grid;
      grid-template-columns: 1.22fr 0.78fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }
    .panel {
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(13,24,36,0.96), rgba(16,30,45,0.96));
      border-radius: 12px;
      padding: 9px 10px 8px;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
    }
    h2 {
      margin: 0 0 5px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.1px;
      color: var(--accent);
    }
    ul {
      margin: 0;
      padding-left: 13px;
    }
    li {
      margin: 0 0 2px;
      font-size: 8.7px;
      line-height: 1.18;
      color: var(--ink);
    }
    .persona p {
      margin: 0 0 5px;
      font-size: 8.9px;
      line-height: 1.28;
      color: var(--ink);
    }
    .compact li { margin-bottom: 2px; }
    .features {
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(13,24,36,0.97), rgba(16,30,45,0.97));
      border-radius: 12px;
      padding: 9px 10px 6px;
    }
    .feature-columns {
      column-count: 4;
      column-gap: 14px;
      padding-left: 14px;
      margin-top: 2px;
    }
    .feature-columns li {
      break-inside: avoid;
      margin-bottom: 2px;
      font-size: 8.15px;
      line-height: 1.14;
    }
    .footer {
      margin-top: 6px;
      font-size: 7.5px;
      color: var(--muted);
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">Lightning Games</h1>
        <div class="subtitle">One-page repo summary generated from local project evidence on ${new Date().toISOString().slice(0, 10)}. Scope is limited to files present in this repository.</div>
      </div>
      <div class="meta">
        <div class="pill">Electron 28.0.0</div>
        <div class="pill">59 game files</div>
        <div class="pill">Tray + hotkey launcher</div>
        <div class="pill">localStorage persistence</div>
        <div class="pill">Bun / npm scripts</div>
      </div>
    </div>

    <div class="grid-top">
      <section class="panel">
        <h2>What It Is</h2>
        <ul class="compact">
          ${whatItIs.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </section>

      <section class="panel persona">
        <h2>Who It Is For</h2>
        ${persona.map(item => `<p>${item}</p>`).join('')}
        <h2 style="margin-top:8px;">How To Run</h2>
        <ul class="compact">
          ${runSteps.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </section>

      <section class="panel">
        <h2>How It Works</h2>
        <ul class="compact">
          ${architecture.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </section>
    </div>

    <section class="features">
      <h2>What It Does</h2>
      <ul class="feature-columns">
        ${features.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </section>

    <div class="footer">Output target: ${pdfPath.replace(/\\/g, '/')}</div>
  </div>
</body>
</html>`;

fs.writeFileSync(htmlPath, html, 'utf8');

const { app, BrowserWindow } = require('electron');

async function main() {
  await app.whenReady();

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    webPreferences: {
      sandbox: false
    }
  });

  await win.loadFile(htmlPath);
  await new Promise(resolve => setTimeout(resolve, 500));

  const pdfData = await win.webContents.printToPDF({
    landscape: true,
    printBackground: true,
    pageSize: 'A4',
    margins: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    },
    preferCSSPageSize: true
  });

  fs.writeFileSync(pdfPath, pdfData);

  const pdfText = pdfData.toString('latin1');
  const pageMatches = pdfText.match(/\/Type\s*\/Page\b/g);
  const pageCount = pageMatches ? pageMatches.length : 0;
  console.log(JSON.stringify({ pdfPath, htmlPath, pageCount }, null, 2));

  await win.close();
  app.quit();
}

main().catch(err => {
  console.error(err);
  app.exit(1);
});
