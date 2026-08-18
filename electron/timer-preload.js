const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('timerAPI', {
  onUpdateState: (callback) => ipcRenderer.on('timer-state', (_event, state) => callback(state)),
  onAction: (callback) => ipcRenderer.on('timer-action', (_event, action) => callback(action)),
  sendAction: (action) => ipcRenderer.send('timer-action', action),
});
