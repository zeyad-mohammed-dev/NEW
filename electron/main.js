import { app, BrowserWindow, dialog, ipcMain, Notification, screen, shell, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

let mainWindow = null;
let timerWindow = null;
let httpServer = null;
let serverClosed = false;
let tray = null;
let isQuitting = false;

// ====== Single Instance Lock ======
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      showMainWindow();
    }
  });

  // ====== System Tray ======
  function createTray() {
    if (tray) return;

    // Use the app icon for the tray
    let iconPath;
    if (isDev) {
      // In dev, look for icon.ico in project root
      iconPath = path.join(__dirname, '..', 'icon.ico');
      if (!fs.existsSync(iconPath)) {
        // Fallback: use Electron's default or create a small canvas icon
        iconPath = null;
      }
    } else {
      iconPath = path.join(process.resourcesPath, 'icon.ico');
    }

    let trayIcon;
    if (iconPath && fs.existsSync(iconPath)) {
      trayIcon = nativeImage.createFromPath(iconPath);
      // Resize to 16x16 for tray (Windows recommends 16x16)
      if (trayIcon.isEmpty()) {
        trayIcon = null;
      } else if (trayIcon.getSize().width > 32) {
        trayIcon = trayIcon.resize({ width: 16, height: 16 });
      }
    }

    // Fallback: create a simple colored icon
    if (!trayIcon || trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty();
    }

    tray = new Tray(trayIcon);
    tray.setToolTip('NEW - Habit & Goal Tracker');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show NEW',
        click: () => showMainWindow(),
      },
      { type: 'separator' },
      {
        label: 'Exit',
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('click', () => showMainWindow());
  }

  function showMainWindow() {
    if (!mainWindow) {
      createWindow();
      return;
    }
    mainWindow.show();
    mainWindow.restore();
    mainWindow.focus();
  }

  // ====== Timer Window (Always on Top) ======
  function createTimerWindow() {
    if (timerWindow) {
      timerWindow.show();
      timerWindow.focus();
      return;
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth } = primaryDisplay.workAreaSize;

    timerWindow = new BrowserWindow({
      width: 200,
      height: 180,
      x: screenWidth - 220,
      y: 80,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      hasShadow: false,
      resizable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      level: 'floating',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'timer-preload.js'),
      },
    });

    const timerHTMLPath = path.join(__dirname, 'timer-window', 'timer.html');
    timerWindow.loadFile(timerHTMLPath);
    timerWindow.on('closed', () => { timerWindow = null; });
  }

  function closeTimerWindow() {
    if (timerWindow) {
      timerWindow.close();
      timerWindow = null;
    }
  }

  // ====== Start Backend (inside this process, no spawn) ======
  async function startBackend() {
    if (isDev) return;

    process.env.NODE_ENV = 'production';
    if (!process.env.PORT) process.env.PORT = '3456';
    if (!process.env.DB_URI) process.env.DB_URI = 'mongodb://localhost:27017/new';

    const frontendDir = path.join(process.resourcesPath, 'frontend', 'browser');
    process.env.FRONTEND_STATIC_PATH = frontendDir;

    const backendDir = path.join(process.resourcesPath, 'backend');
    const backendSrcDir = path.join(backendDir, 'src');
    const backendAppPath = path.join(backendSrcDir, 'app.js');
    if (!fs.existsSync(backendAppPath)) {
      throw new Error(`Backend file not found at ${backendAppPath}`);
    }

    if (!fs.existsSync(frontendDir)) {
      throw new Error(`Frontend files not found at ${frontendDir}`);
    }

    const nodeModulesPath = path.join(backendDir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      throw new Error(
        'Backend node_modules not found. Please run:\n' +
        '  cd backend && npm install\n' +
        'Then rebuild the app with: npm run dist'
      );
    }

    const backendURL = pathToFileURL(backendAppPath).href;
    const { bootstrap } = await import(backendURL);
    httpServer = await bootstrap();
  }

  // ====== Create Window ======
  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 1024,
      minHeight: 700,
      title: 'NEW',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      autoHideMenuBar: true,
      backgroundColor: '#090812',
    });

    if (isDev) {
      mainWindow.loadURL('http://localhost:5200');
    } else {
      mainWindow.loadURL('http://localhost:3456');
    }

    // Open external links in system browser instead of Electron window
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      // Only intercept http/https URLs, let about:blank etc. pass through
      if (url.startsWith('http://') || url.startsWith('https://')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
      return { action: 'allow' };
    });

    // Also intercept <a href> clicks that navigate the main window to external URLs
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      try {
        const parsedUrl = new URL(navigationUrl);
        const allowedOrigins = ['http://localhost:5200', 'http://localhost:3456'];
        if (!allowedOrigins.includes(parsedUrl.origin)) {
          event.preventDefault();
          shell.openExternal(navigationUrl);
        }
      } catch {
        // Invalid URL, allow default behavior
      }
    });

    // Close button (X) → hide to tray, not quit
    mainWindow.on('close', (event) => {
      if (!isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    });

    mainWindow.on('closed', () => { mainWindow = null; });
  }

  // ====== IPC Handlers ======
  ipcMain.on('show-notification', (_event, { title, body }) => {
    new Notification({ title, body, silent: false }).show();
    // Don't force-show main window on notification — user may want to stay in tray
  });

  // Timer window management
  ipcMain.on('show-timer-window', () => { createTimerWindow(); });
  ipcMain.on('close-timer-window', () => { closeTimerWindow(); });
  ipcMain.on('update-timer-state', (_event, state) => {
    if (timerWindow && !timerWindow.isDestroyed()) {
      timerWindow.webContents.send('timer-state', state);
    }
  });

  // Timer actions from the mini timer window
  ipcMain.on('timer-action', (_event, action) => {
    // Handle timer window resize (minimize/expand)
    if (action === 'resize-min' && timerWindow && !timerWindow.isDestroyed()) {
      timerWindow.setSize(140, 55, true);
      return;
    }
    if (action === 'resize-normal' && timerWindow && !timerWindow.isDestroyed()) {
      timerWindow.setSize(200, 180, true);
      return;
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('timer-action', action);
    }
  });

  // ====== Close Server Helper ======
  function closeServer() {
    if (httpServer && !serverClosed) {
      serverClosed = true;
      try { httpServer.close(); } catch {}
    }
  }

  // ====== App Lifecycle ======
  app.whenReady().then(async () => {
    if (!isDev) {
      try {
        await startBackend();
      } catch (e) {
        dialog.showErrorBox(
          'Backend Failed to Start',
          'Could not start the server. Make sure MongoDB is installed and running on localhost:27017.\n\nError: ' + (e.message || e)
        );
        app.quit();
        return;
      }
    }
    createTray();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  // Don't quit when all windows are closed — keep running for tray + floating timer
  app.on('window-all-closed', () => {
    // Keep app running for system tray and floating timer
    // User quits via tray right-click → Exit
  });

  app.on('before-quit', () => {
    isQuitting = true;
    closeServer();
    closeTimerWindow();
  });
} 