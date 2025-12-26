/**
 * Electron Preload Script
 * Exposes safe APIs to renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Print functions
  print: {
    test: (printerName) => ipcRenderer.invoke('print:test', printerName),
    receipt: (receiptData, printerName) => ipcRenderer.invoke('print:receipt', receiptData, printerName),
    html: (htmlContent, printerName) => ipcRenderer.invoke('print:html', htmlContent, printerName),
    getPrinters: () => ipcRenderer.invoke('print:get-printers')
  },
  
  // Storage functions for printer settings
  storage: {
    get: (key) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    }
  },
  
  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    getPlatform: () => ipcRenderer.invoke('app:get-platform')
  },
  
  // Platform check
  platform: process.platform,
  isElectron: true
});

