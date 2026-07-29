const { contextBridge, webFrame } = require('electron');

// Security: Remove Electron access from renderer
webFrame.executeJavaScript(`
  window._electron = undefined;
  delete window.require;
  delete window.exports;
  delete window.module;
`);

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron,
});

// Security: Disable eval() - already disabled by default
// This is just for explicit security
webFrame.executeJavaScript(`
  window.eval = undefined;
`);