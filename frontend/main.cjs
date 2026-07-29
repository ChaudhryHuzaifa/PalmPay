const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;
let retryCount = 0;
const MAX_RETRIES = 30;
const PORT = 5173; // ✅ CHANGED TO 5173

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0A0F1E',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src/preload/preload.js'),
    },
  });

  // Loading screen
  mainWindow.loadURL(`data:text/html,
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { background: #0A0F1E; color: #00D4AA; font-family: Inter; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .spinner { width: 40px; height: 40px; border: 4px solid rgba(0,212,170,0.3); border-top-color: #00D4AA; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div>
          <div class="spinner"></div>
          <p style="text-align: center; margin-top: 20px;">Connecting to PalmPay on port ${PORT}...</p>
          <p style="text-align: center; font-size: 12px;">Attempt ${retryCount}/${MAX_RETRIES}</p>
        </div>
      </body>
    </html>
  `);
  
  mainWindow.show();

  function tryConnect() {
    retryCount++;
    console.log(`[Electron] Attempt ${retryCount}/${MAX_RETRIES} to connect to http://localhost:${PORT}`);
    
    fetch(`http://localhost:${PORT}`)
      .then(() => {
        console.log(`[Electron] ✅ Port ${PORT} is active!`);
        mainWindow.loadURL(`http://localhost:${PORT}`)
          .then(() => {
            console.log('[Electron] App loaded successfully!');
            mainWindow.webContents.openDevTools({ mode: 'detach' });
          });
      })
      .catch(() => {
        console.log(`[Electron] ⏳ Port ${PORT} not ready, retrying...`);
        if (retryCount < MAX_RETRIES) {
          setTimeout(tryConnect, 1000);
        } else {
          mainWindow.loadFile('public/error.html');
        }
      });
  }

  tryConnect();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log('[Electron] App ready');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});