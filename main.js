const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, nativeImage } = require('electron');
const path = require('path');

// Performance & GPU Optimization
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-oop-rasterization');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-gpu-compositing');
app.commandLine.appendSwitch('disable-background-timer-throttle');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('force-color-profile', 'srgb');

// Disable DNS prefetching and external DNS requests
app.commandLine.appendSwitch('disable-dns-prefetch');
app.commandLine.appendSwitch('disable-features', 'DnsOverHttps,SecureDns');
app.commandLine.appendSwitch('no-proxy-server');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Shared functions
function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.webContents.send('window-hiding');
    setTimeout(() => {
      if (mainWindow) mainWindow.hide();
    }, 350);
  } else {
    mainWindow.center();
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('window-showing');
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
    transparent: true,
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

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.webContents.send('window-hiding');
      setTimeout(() => {
        if (mainWindow) mainWindow.hide();
      }, 350);
    }
  });

  mainWindow.on('blur', () => {
    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.webContents.send('window-hiding');
      setTimeout(() => {
        if (mainWindow) mainWindow.hide();
      }, 350);
    }
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

ipcMain.on('quit-app', () => {
  isQuitting = true;
  if (mainWindow) mainWindow.destroy();
  app.quit();
});
