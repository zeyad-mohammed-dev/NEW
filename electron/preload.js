const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendNotification: (title, body) =>
    ipcRenderer.send('show-notification', { title, body }),
  // Floating timer window (always-on-top, works above other apps)
  showTimerWindow: () => ipcRenderer.send('show-timer-window'),
  closeTimerWindow: () => ipcRenderer.send('close-timer-window'),
  updateTimerState: (state) => ipcRenderer.send('update-timer-state', state),
  onTimerAction: (callback) =>
    ipcRenderer.on('timer-action', (_event, action) => callback(action)),
});
