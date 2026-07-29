"use strict";
const electron = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    titleBarStyle: "hiddenInset",
    backgroundColor: "#0A0F1E",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Disable web security in dev to avoid CSP issues
      allowRunningInsecureContent: true, // Allow insecure content
      preload: path.join(__dirname, "../preload/preload.js")
    },
    show: false
  });

  // Load the appropriate URL based on environment
  const startUrl = process.env.NODE_ENV === "development" 
    ? "http://localhost:5173"  // Vite dev server
    : `file://${path.join(__dirname, "../dist/index.html")}`;  // Built app

  console.log(`🚀 Loading URL: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  // Set CSP for Electron
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self' 'unsafe-inline'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "connect-src 'self' http://localhost:5173 ws://localhost:5173 http://localhost:3000 http://localhost:8000 http://127.0.0.1:3000 http://127.0.0.1:8000",
            "font-src 'self' data:",
            "worker-src 'self' blob:",
            "frame-src 'self'"
          ].join('; ')
        }
      });
    });
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    if (process.env.NODE_ENV === "development") {
      mainWindow?.webContents.openDevTools({ mode: "detach" });
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Handle navigation
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', validatedURL, errorCode, errorDescription);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Window loaded successfully');
  });
}

electron.app.whenReady().then(createWindow);

electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});

electron.app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers
electron.ipcMain.handle("get-app-version", () => electron.app.getVersion());

// Additional error handling
electron.app.on('web-contents-created', (event, contents) => {
  contents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`Failed to load: ${validatedURL}`, errorDescription);
  });
});