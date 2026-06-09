const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    closeWindow: () => ipcRenderer.send('close-window'),
    quitApp: () => ipcRenderer.send('quit-app'),
    onWindowHiding: (callback) => ipcRenderer.on('window-hiding', callback),
    onWindowShowing: (callback) => ipcRenderer.on('window-showing', callback),
    updateTray: (data) => ipcRenderer.send('update-tray', data),
    onTrayAction: (callback) => ipcRenderer.on('tray-action', (e, action) => callback(action))
});
