/**
 * Electron Main Process
 * Handles application lifecycle and printer server
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getWindowsPrinters } = require('./getPrinters');

// Import thermal printer functions
// Use dynamic require to handle both dev and production paths
let printTest, printReceipt;
let printerModuleLoaded = false;

function loadPrinterModule() {
  if (printerModuleLoaded) {
    return; // Already loaded
  }

  try {
    // Try multiple possible paths
    const fs = require('fs');
    
    // Get project root - electron folder is in project root, so go up one level
    const projectRoot = path.resolve(__dirname, '..');
    
    const possiblePaths = [
      path.join(projectRoot, 'thermal-printer-script/print.js'), // From project root (most reliable)
      path.join(__dirname, '../thermal-printer-script/print.js'), // Relative to electron folder
      path.join(process.cwd(), 'thermal-printer-script/print.js'), // From current working directory
      path.resolve(__dirname, '../thermal-printer-script/print.js'), // Absolute from electron
      '../thermal-printer-script/print.js' // Simple relative
    ];
    
    console.log('[Electron] Project root:', projectRoot);
    console.log('[Electron] Electron dir:', __dirname);
    console.log('[Electron] Process CWD:', process.cwd());

    let loaded = false;
    let lastError = null;
    
    for (const printerPath of possiblePaths) {
      try {
        const resolvedPath = path.resolve(printerPath);
        console.log('[Electron] Trying to load printer module from:', resolvedPath);
        
        // Check if file exists first
        if (!fs.existsSync(resolvedPath)) {
          console.log('[Electron] File does not exist:', resolvedPath);
          continue;
        }
        
        // Clear require cache to force reload
        try {
          const cacheKey = require.resolve(resolvedPath);
          if (require.cache[cacheKey]) {
            delete require.cache[cacheKey];
          }
        } catch (resolveError) {
          // Ignore resolve errors, will try require anyway
        }
        
        console.log('[Electron] Requiring module...');
        const printerModule = require(resolvedPath);
        console.log('[Electron] Module required, checking exports...');
        printTest = printerModule.printTest || printerModule.testPrint;
        printReceipt = printerModule.printReceipt;
        
        if (printTest && printReceipt) {
          console.log('[Electron] ✓ Printer module loaded successfully from:', resolvedPath);
          printerModuleLoaded = true;
          loaded = true;
          break;
        } else {
          console.log('[Electron] Module loaded but functions missing. printTest:', !!printTest, 'printReceipt:', !!printReceipt);
        }
      } catch (pathError) {
        lastError = pathError;
        console.error('[Electron] ✗ Failed to load from', printerPath);
        console.error('[Electron] Error:', pathError.message);
        if (pathError.stack) {
          console.error('[Electron] Stack:', pathError.stack.split('\n').slice(0, 5).join('\n'));
        }
        continue;
      }
    }

    if (!loaded) {
      const errorMsg = lastError 
        ? `Could not load printer module. Last error: ${lastError.message}`
        : 'Could not load printer module from any path';
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('[Electron] ✗✗✗ Failed to load printer module ✗✗✗');
    console.error('[Electron] Error:', error.message);
    console.error('[Electron] Error details:', {
      message: error.message,
      stack: error.stack,
      __dirname: __dirname,
      cwd: process.cwd(),
      electronDir: path.join(__dirname),
      projectRoot: process.cwd()
    });
    
    // Fallback functions that throw descriptive errors
    printTest = async (printerName) => { 
      throw new Error(`Printer module not loaded. Error: ${error.message}. Please ensure thermal-printer-script/print.js exists and run: cd thermal-printer-script && npm install`); 
    };
    printReceipt = async (receiptData, printerName) => { 
      throw new Error(`Printer module not loaded. Error: ${error.message}. Please ensure thermal-printer-script/print.js exists and run: cd thermal-printer-script && npm install`); 
    };
  }
}

// Load module immediately
loadPrinterModule();

// Keep a global reference of the window object
let mainWindow;
let isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Start printer server (integrated)
let printerServer = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true, // Enable web security for HTTPS backend
      allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, '../public/icon.png'), // Add icon if available
    show: false // Don't show until ready
  });

  // Load the app
  if (isDev) {
    // Development: Load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Allow navigation to backend API (for CORS/API calls)
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    // Add CORS headers if needed
    callback({ requestHeaders: { ...details.requestHeaders } });
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on window
    if (isDev) {
      mainWindow.focus();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// IPC Handlers for printing
ipcMain.handle('print:test', async (event, printerName) => {
  try {
    // Ensure module is loaded
    if (!printerModuleLoaded) {
      loadPrinterModule();
    }
    
    if (!printTest) {
      throw new Error('Printer module not available. Please run: cd thermal-printer-script && npm install');
    }
    
    const result = await printTest(printerName || null);
    return { success: true, result };
  } catch (error) {
    console.error('[Electron] Print test error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('print:receipt', async (event, receiptData, printerName) => {
  try {
    // Ensure module is loaded
    if (!printerModuleLoaded) {
      loadPrinterModule();
    }
    
    if (!printReceipt) {
      throw new Error('Printer module not available. Please run: cd thermal-printer-script && npm install');
    }
    
    const result = await printReceipt(receiptData, printerName || null);
    return { success: true, result };
  } catch (error) {
    console.error('[Electron] Print receipt error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('print:html', async (event, htmlContent, printerName) => {
  try {
    // Ensure module is loaded
    if (!printerModuleLoaded) {
      loadPrinterModule();
    }
    
    if (!printReceipt) {
      throw new Error('Printer module not available. Please run: cd thermal-printer-script && npm install');
    }
    
    // Parse HTML and print
    const receiptData = parseHtmlToReceipt(htmlContent);
    const result = await printReceipt(receiptData, printerName || null);
    return { success: true, result };
  } catch (error) {
    console.error('[Electron] Print HTML error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('print:get-printers', async () => {
  try {
    const printers = await getWindowsPrinters();
    return {
      success: true,
      printers: printers,
      message: printers.length > 0 
        ? `Found ${printers.length} printer(s)` 
        : 'No printers found. Use Windows Settings > Printers & scanners to find printer name',
      note: 'Printer name is case-sensitive'
    };
  } catch (error) {
    console.error('[Electron] Error getting printers:', error);
    return { 
      success: false, 
      error: error.message,
      printers: []
    };
  }
});

ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});

ipcMain.handle('app:get-platform', () => {
  return process.platform;
});

/**
 * Parse HTML content to extract receipt data
 */
function parseHtmlToReceipt(htmlContent) {
  const receiptData = {
    header: 'RESTAURANT POS',
    storeName: '',
    address: '',
    phone: '',
    orderNumber: '',
    tableNumber: '',
    date: new Date().toLocaleString(),
    items: [],
    subtotal: '',
    tax: '',
    total: ''
  };
  
  // Extract header/store name
  const headerMatch = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (headerMatch) {
    receiptData.header = headerMatch[1].trim();
  }
  
  const storeMatch = htmlContent.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  if (storeMatch) {
    receiptData.storeName = storeMatch[1].trim();
  }
  
  const orderMatch = htmlContent.match(/Order\s*#?[:\s]*([^<\n]+)/i);
  if (orderMatch) {
    receiptData.orderNumber = orderMatch[1].trim();
  }
  
  const tableMatch = htmlContent.match(/Table[:\s]*([^<\n]+)/i);
  if (tableMatch) {
    receiptData.tableNumber = tableMatch[1].trim();
  }
  
  // Extract items
  const itemPattern = /(\d+)x\s*([^<\n]+)/gi;
  let itemMatch;
  while ((itemMatch = itemPattern.exec(htmlContent)) !== null) {
    receiptData.items.push({
      name: itemMatch[2].trim(),
      quantity: parseInt(itemMatch[1]) || 1,
      price: '0.00',
      total: '0.00'
    });
  }
  
  const totalMatch = htmlContent.match(/TOTAL[:\s]*([^<\n]+)/i);
  if (totalMatch) {
    receiptData.total = totalMatch[1].trim().replace(/[^\d.]/g, '');
  }
  
  return receiptData;
}

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Cleanup printer server if running
  if (printerServer) {
    printerServer.close();
  }
});

// Handle certificate errors in development
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

