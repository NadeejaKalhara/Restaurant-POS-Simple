import qz from 'qz-tray';

/**
 * QZ Tray Print Utility
 * Handles POS printing via QZ Tray with fallback to browser print
 * 
 * SETUP REQUIREMENTS:
 * 1. Install QZ Tray application from https://qz.io/download/
 * 2. QZ Tray must be running on the user's machine
 * 3. Application must be served over HTTPS or localhost
 * 4. User must grant permission when QZ Tray prompts for certificate
 * 
 * The system will automatically fall back to browser print if QZ Tray is not available.
 */

let qzConnected = false;
let qzConnecting = false;
let defaultPrinterName = null; // Can be set to 'XP k200L' or specific printer name

/**
 * Check if QZ Tray is available and connect
 */
export async function connectQZ() {
  if (qzConnected) {
    return true;
  }

  if (qzConnecting) {
    // Wait for connection attempt to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!qzConnecting) {
          clearInterval(checkInterval);
          resolve(qzConnected);
        }
      }, 100);
    });
  }

  try {
    qzConnecting = true;
    
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }
    
    qzConnected = true;
    qzConnecting = false;
    return true;
  } catch (error) {
    console.warn('QZ Tray not available:', error.message);
    qzConnected = false;
    qzConnecting = false;
    return false;
  }
}

/**
 * Check if QZ Tray is available (without connecting)
 */
export function isQZAvailable() {
  try {
    return qz.websocket.isActive() || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  } catch (error) {
    return false;
  }
}

/**
 * Set the default printer name (e.g., 'XP k200L')
 */
export function setDefaultPrinter(printerName) {
  defaultPrinterName = printerName;
}

/**
 * Get default printer or prompt user to select
 * Prioritizes XP k200L printer if available
 */
export async function getPrinter() {
  try {
    const printers = await qz.printers.find();
    if (printers && printers.length > 0) {
      // If default printer name is set, try to find exact match first
      if (defaultPrinterName) {
        const exactMatch = printers.find(p => 
          p.toLowerCase() === defaultPrinterName.toLowerCase() ||
          p.toLowerCase().includes(defaultPrinterName.toLowerCase())
        );
        if (exactMatch) return exactMatch;
      }
      
      // Priority 1: XP k200L printer (specific model)
      const xpK200L = printers.find(p => 
        p.toLowerCase().includes('k200l') || 
        p.toLowerCase().includes('xp k200l') ||
        p.toLowerCase().includes('xp-k200l')
      );
      if (xpK200L) return xpK200L;
      
      // Priority 2: Other receipt/thermal printers
      const receiptPrinter = printers.find(p => 
        p.toLowerCase().includes('receipt') || 
        p.toLowerCase().includes('pos') ||
        p.toLowerCase().includes('thermal') ||
        p.toLowerCase().includes('xp')
      );
      if (receiptPrinter) return receiptPrinter;
      
      // Fallback: first available printer
      return printers[0];
    }
    return null;
  } catch (error) {
    console.error('Error getting printer:', error);
    return null;
  }
}

/**
 * Print HTML content using QZ Tray
 */
export async function printWithQZ(htmlContent, printerName = null) {
  try {
    const connected = await connectQZ();
    if (!connected) {
      throw new Error('QZ Tray not available');
    }

    const printer = printerName || await getPrinter();
    if (!printer) {
      throw new Error('No printer found');
    }

    // Create print configuration optimized for 80mm thermal printer (XP k200L)
    const config = qz.configs.create(printer, {
      // Paper size: 80mm width (3.15 inches)
      size: { width: '80mm', height: 'auto' },
      // Margins optimized for thermal paper
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      // Units in millimeters
      units: 'mm',
      // Orientation: portrait
      orientation: 'portrait',
      // Color mode: grayscale (thermal printers)
      colorType: 'grayscale',
      // Interpolation: nearest neighbor for crisp text
      interpolation: 'nearest-neighbor',
      // Job name
      jobName: 'POS Receipt'
    });
    
    // Wrap HTML content optimized for 80mm thermal paper
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=80mm, initial-scale=1.0">
          <style>
            @page {
              margin: 0;
              size: 80mm auto;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 8mm 5mm;
              font-family: 'Courier New', monospace;
              font-size: 12pt;
              line-height: 1.4;
              width: 80mm;
              max-width: 80mm;
              color: #000;
              background: #fff;
            }
            /* Optimize for thermal printer - ensure black text on white */
            h1, h2, h3, p, div, span {
              color: #000 !important;
              background: transparent !important;
            }
            /* Remove any background colors that won't print well */
            * {
              background-color: transparent !important;
            }
            /* Ensure borders print */
            table, tr, td {
              border-color: #000 !important;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    await qz.print(config, [
      {
        type: 'html',
        format: 'html',
        data: fullHtml,
        options: {
          copies: 1,
          jobName: 'POS Receipt - XP k200L'
        }
      }
    ]);
    
    return true;
  } catch (error) {
    console.error('QZ Print error:', error);
    throw error;
  }
}

/**
 * Print receipt content - tries QZ Tray first, falls back to browser print
 */
export async function printReceipt(element, options = {}) {
  const { 
    useQZ = true, 
    printerName = null,
    onSuccess = null,
    onError = null
  } = options;

  // Try QZ Tray first if enabled
  if (useQZ) {
    try {
      const htmlContent = element.innerHTML;
      await printWithQZ(htmlContent, printerName);
      if (onSuccess) onSuccess('Printed via QZ Tray');
      return true;
    } catch (error) {
      console.warn('QZ Tray print failed, falling back to browser print:', error);
      if (onError) onError(error);
    }
  }

  // Fallback to browser print
  try {
    window.print();
    if (onSuccess) onSuccess('Printed via browser');
    return true;
  } catch (error) {
    console.error('Browser print failed:', error);
    if (onError) onError(error);
    return false;
  }
}

/**
 * Disconnect from QZ Tray
 */
export async function disconnectQZ() {
  try {
    if (qz.websocket.isActive()) {
      await qz.websocket.disconnect();
    }
    qzConnected = false;
  } catch (error) {
    console.error('Error disconnecting QZ:', error);
  }
}

