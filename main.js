const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// Hardware acceleration flags
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-oop-rasterization');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('disable-background-timer-throttle');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('force-color-profile', 'srgb');

let mainWindow = null;
let tray = null;
let isQuitting = false;
let isAnimating = false;
let isStartingUp = true;
let blurTimeout = null;

// Window position persistence
function loadWindowState() {
    try {
        const p = path.join(app.getPath('userData'), 'window-state.json');
        if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) { /* ignore */ }
    return null;
}

function saveWindowState() {
    if (!mainWindow) return;
    try {
        const bounds = mainWindow.getBounds();
        const state = { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
        const p = path.join(app.getPath('userData'), 'window-state.json');
        fs.writeFileSync(p, JSON.stringify(state));
    } catch (e) { /* ignore */ }
}

function isValidPosition(x, y) {
    return screen.getAllDisplays().some(d => {
        const b = d.workArea;
        return x >= b.x - 100 && x <= b.x + b.width + 100 &&
               y >= b.y - 100 && y <= b.y + b.height + 100;
    });
}

// Shared functions
function showWindow() {
  if (!mainWindow || isAnimating) return;
  if (mainWindow.isVisible()) return;

  isAnimating = true;
  clearTimeout(blurTimeout);

  const state = loadWindowState();
  if (state && isValidPosition(state.x, state.y)) {
    mainWindow.setBounds({ x: state.x, y: state.y }, false);
  } else {
    mainWindow.center();
  }
  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.send('window-showing');

  setTimeout(() => { isAnimating = false; }, 250);
}

function hideWindow() {
  if (!mainWindow || isAnimating) return;
  if (!mainWindow.isVisible()) return;

  isAnimating = true;
  clearTimeout(blurTimeout);

  saveWindowState();
  mainWindow.webContents.send('window-hiding');
  setTimeout(() => {
    if (mainWindow) mainWindow.hide();
    isAnimating = false;
  }, 150);
}

function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    hideWindow();
  } else {
    showWindow();
  }
}

function updateTrayMenu() {
  if (!tray) return;

  // Check if login item settings are supported (Windows/macOS only)
  const supportsLoginItems = process.platform === 'win32' || process.platform === 'darwin';
  let openAtLogin = false;

  if (supportsLoginItems) {
    try {
      openAtLogin = app.getLoginItemSettings().openAtLogin;
    } catch (e) {
      // Not supported on this platform
    }
  }

  const menuTemplate = [
    { label: '⚡ Lightning Games', enabled: false },
    { type: 'separator' },
    { label: '🎮 Open (Ctrl+Alt+G)', click: () => toggleWindow() }
  ];

  // Recent games
  if (trayRecentGames.length > 0) {
    menuTemplate.push({ type: 'separator' });
    menuTemplate.push({ label: '🕐 Recent Games', enabled: false });
    trayRecentGames.forEach(g => {
      menuTemplate.push({
        label: `  ${g.icon} ${g.name}`,
        click: () => { if (mainWindow) mainWindow.webContents.send('tray-action', { type: 'launch', id: g.id }); }
      });
    });
  }

  // Volume control
  menuTemplate.push({ type: 'separator' });
  const volPercent = Math.round(trayVolume * 100);
  menuTemplate.push({ label: `🔊 Volume: ${volPercent}%`, enabled: false });

  // Add "Run at Startup" option only on Windows/macOS
  if (supportsLoginItems) {
    menuTemplate.push({
      label: openAtLogin ? '✅ Run at Startup' : '⬜ Run at Startup',
      click: () => {
        try {
          const settings = app.getLoginItemSettings();
          app.setLoginItemSettings({
            openAtLogin: !settings.openAtLogin,
            path: app.getPath('exe')
          });
          updateTrayMenu();
        } catch (e) {
          console.log('Login item settings not supported');
        }
      }
    });
  }

  menuTemplate.push(
    { type: 'separator' },
    {
      label: '❌ Quit Completely',
      click: () => {
        isQuitting = true;
        if (mainWindow) mainWindow.destroy();
        app.quit();
      }
    }
  );

  const contextMenu = Menu.buildFromTemplate(menuTemplate);
  tray.setContextMenu(contextMenu);
}

function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  
  mainWindow = new BrowserWindow({
    width: 960,
    height: 700,
    show: false,
    frame: false,
    resizable: false,
    transparent: false,
    backgroundColor: '#050512',
    skipTaskbar: false,
    alwaysOnTop: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    }
  });

  mainWindow.loadFile('index.html');

  // Smooth startup: show window invisible, then fade in after content loads
  mainWindow.once('ready-to-show', () => {
    mainWindow.setOpacity(0);
    const isMinimized = process.argv.includes('--minimized');
    if (!isMinimized) {
        mainWindow.show();
        mainWindow.focus();
    }
  });

  mainWindow.webContents.once('did-finish-load', () => {
    // Content fully loaded — fade in
    setTimeout(() => {
      mainWindow.setOpacity(1);
      // Grace period: don't hide on blur during startup
      setTimeout(() => { isStartingUp = false; }, 2000);
    }, 50);
  });

  mainWindow.on('moved', () => saveWindowState());

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      saveWindowState();
      hideWindow();
    }
  });

  // Debounced blur handler — waits 200ms before hiding so regaining focus cancels it
  mainWindow.on('blur', () => {
    if (isStartingUp || isAnimating) return;
    if (!mainWindow || !mainWindow.isVisible()) return;

    clearTimeout(blurTimeout);
    blurTimeout = setTimeout(() => {
      if (mainWindow && mainWindow.isVisible() && !isAnimating && !isStartingUp) {
        hideWindow();
      }
    }, 200);
  });

  mainWindow.on('focus', () => {
    clearTimeout(blurTimeout);
  });

  mainWindow.on('minimize', (e) => {
    e.preventDefault();
    hideWindow();
  });
}

function createTray() {
  const iconSize = 16;
  const canvas = Buffer.alloc(iconSize * iconSize * 4);
  for (let y = 0; y < iconSize; y++) {
    for (let x = 0; x < iconSize; x++) {
      const idx = (y * iconSize + x) * 4;
      const isLightning = (
        (x >= 5 && x <= 10 && y >= 0 && y <= 3) ||
        (x >= 4 && x <= 9 && y >= 4 && y <= 6) ||
        (x >= 3 && x <= 11 && y >= 7 && y <= 8) ||
        (x >= 6 && x <= 10 && y >= 9 && y <= 11) ||
        (x >= 5 && x <= 9 && y >= 12 && y <= 13) ||
        (x >= 4 && x <= 8 && y >= 14 && y <= 15)
      );
      if (isLightning) {
        canvas[idx] = 0;
        canvas[idx + 1] = 255;
        canvas[idx + 2] = 255;
        canvas[idx + 3] = 255;
      } else {
        canvas[idx + 3] = 0;
      }
    }
  }
  const icon = nativeImage.createFromBuffer(canvas, { width: iconSize, height: iconSize });
  tray = new Tray(icon);
  tray.setToolTip('Lightning Games ⚡');
  updateTrayMenu();
  tray.on('click', toggleWindow);
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();
    globalShortcut.register('Ctrl+Alt+G', toggleWindow);
    if (process.platform === 'darwin') app.dock.hide();
  });
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});

ipcMain.on('close-window', toggleWindow);

let trayRecentGames = [];
let trayVolume = 0.7;

ipcMain.on('update-tray', (e, data) => {
    if (data.recentGames) trayRecentGames = data.recentGames.slice(0, 5);
    if (typeof data.volume === 'number') trayVolume = data.volume;
    updateTrayMenu();
});

ipcMain.on('quit-app', () => {
  isQuitting = true;
  if (mainWindow) mainWindow.destroy();
  app.quit();
});
