const fs = require('fs');
const path = require('path');

console.log('?? Creating clean files without BOM...');

// Clean up
const toDelete = ['node_modules', 'package-lock.json', 'vite.config.ts', 'vite.config.js', 'tailwind.config.js', 'postcss.config.js'];
toDelete.forEach(item => {
    try {
        if (fs.existsSync(item)) {
            if (fs.statSync(item).isDirectory()) {
                fs.rmSync(item, { recursive: true, force: true });
            } else {
                fs.unlinkSync(item);
            }
            console.log(`Deleted: ${item}`);
        }
    } catch (e) {}
});

// Create package.json (NO BOM)
const packageJson = {
    name: "palmpay-desktop",
    version: "1.0.0",
    description: "PalmPay Desktop Application",
    main: "main.cjs",
    scripts: {
        "start": "vite",
        "build": "vite build",
        "electron": "electron ."
    },
    dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
    },
    devDependencies: {
        "@vitejs/plugin-react": "^4.0.0",
        "vite": "^5.0.0",
        "electron": "^28.0.0"
    }
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Created: package.json');

// Create vite.config.js
const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});`;
fs.writeFileSync('vite.config.js', viteConfig);
console.log('Created: vite.config.js');

// Create basic index.html
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PalmPay Desktop</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #0f172a; color: white; font-family: Arial, sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
fs.writeFileSync('index.html', html);
console.log('Created: index.html');

// Create src directory and files
const srcDir = 'src';
if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });

const mainJsx = `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
fs.writeFileSync(path.join(srcDir, 'main.jsx'), mainJsx);
console.log('Created: src/main.jsx');

const appJsx = `import React from "react";

export default function App() {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      textAlign: "center"
    }}>
      <div style={{ fontSize: "72px", marginBottom: "20px" }}>
        ???
      </div>
      <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "0 0 10px 0" }}>
        PalmPay Desktop
      </h1>
      <p style={{ fontSize: "20px", opacity: 0.9, marginBottom: "40px" }}>
        Biometric Payment System
      </p>
      <div style={{
        background: "rgba(255,255,255,0.1)",
        padding: "20px",
        borderRadius: "15px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.2)"
      }}>
        <p style={{ margin: "10px 0", fontSize: "18px" }}>? React is working</p>
        <p style={{ margin: "10px 0", fontSize: "18px" }}>? Vite is running</p>
        <p style={{ margin: "10px 0", fontSize: "18px" }}>? Electron ready</p>
      </div>
    </div>
  );
}`;
fs.writeFileSync(path.join(srcDir, 'App.jsx'), appJsx);
console.log('Created: src/App.jsx');

// Create main.cjs for Electron
const mainCjs = `const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false
  });

  mainWindow.loadURL("http://localhost:5173");
  mainWindow.webContents.openDevTools();
  
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    console.log("?? PalmPay Desktop is running!");
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log("Electron app ready");
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});`;
fs.writeFileSync('main.cjs', mainCjs);
console.log('Created: main.cjs');

console.log('\n? All files created successfully!');
console.log('\nNext steps:');
console.log('1. Run: npm install');
console.log('2. Run in TWO PowerShell windows:');
console.log('   Window 1: npm run start');
console.log('   Window 2: npm run electron');
