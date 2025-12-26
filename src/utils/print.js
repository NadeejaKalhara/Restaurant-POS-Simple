/**
 * Unified Print Utility
 * Priority: Electron > Local Server
 * Uses direct node-thermal-printer (no QZ Tray)
 */

import { printReceipt as printReceiptElectron, isElectron, getSavedPrinter as getSavedPrinterElectron } from './electronPrint';
import { printReceipt as printReceiptLocal, isLocalPrinterAvailable } from './localPrint';

// Storage key for saved printer
const STORAGE_KEY_PRINTER = 'selectedPrinter';

let printMethod = null; // 'electron' or 'local' or null (auto-detect)

/**
 * Detect which print method to use
 */
export async function detectPrintMethod() {
  // ALWAYS check Electron first (best option - direct printer access via IPC bridge)
  if (isElectron()) {
    console.log('[Print] Using Electron IPC bridge (direct printer access)');
    return 'electron';
  }

  // Only check local printer server if NOT in Electron
  // This prevents unnecessary HTTP calls when Electron is available
  console.log('[Print] Not in Electron, checking local printer server...');
  const localAvailable = await isLocalPrinterAvailable();
  if (localAvailable) {
    console.log('[Print] Using local printer server (localhost:3001)');
    return 'local';
  }

  console.warn('[Print] No print method available. Run Electron app or start local printer server.');
  return null;
}

/**
 * Get current print method
 */
export async function getPrintMethod() {
  if (printMethod) {
    return printMethod;
  }
  
  printMethod = await detectPrintMethod();
  return printMethod;
}

/**
 * Set print method manually
 */
export function setPrintMethod(method) {
  if (method === 'electron' || method === 'local' || method === 'auto') {
    printMethod = method === 'auto' ? null : method;
    console.log(`[Print] Print method set to: ${printMethod || 'auto-detect'}`);
  }
}

/**
 * Check if printing is available
 */
export async function isPrintAvailable() {
  const method = await getPrintMethod();
  return method !== null;
}

/**
 * Print receipt - unified interface
 * Uses Electron IPC bridge or local printer server
 */
export async function printReceipt(element, options = {}) {
  const {
    printerName = null,
    onSuccess = null,
    onError = null,
    copies = 1,
    forceMethod = null // 'electron' or 'local' to force a specific method
  } = options;

  try {
    // Determine which method to use
    let method = forceMethod || printMethod;
    
    if (!method || method === 'auto') {
      method = await detectPrintMethod();
    }

    if (!method) {
      const error = new Error('No print method available. Please run Electron app or start local printer server.');
      if (onError) {
        onError({
          success: false,
          printer: printerName || 'unknown',
          message: error.message,
          error: error
        });
      }
      throw error;
    }

    // Get printer name - use provided, saved, or null
    let finalPrinterName = printerName;
    if (!finalPrinterName && method === 'electron') {
      finalPrinterName = getSavedPrinterElectron();
    } else if (!finalPrinterName) {
      finalPrinterName = localStorage.getItem(STORAGE_KEY_PRINTER);
    }

    console.log(`[Print] Using print method: ${method}`);
    console.log(`[Print] Printer: ${finalPrinterName || 'default'}`);

    // Use appropriate print method
    if (method === 'electron') {
      return await printReceiptElectron(element, {
        printerName: finalPrinterName,
        onSuccess,
        onError,
        copies
      });
    } else {
      // Local printer server
      return await printReceiptLocal(element, {
        printerName: finalPrinterName,
        onSuccess,
        onError,
        copies
      });
    }
  } catch (error) {
    console.error('[Print] Print error:', error);
    
    // Try fallback if one method fails
    if (!forceMethod) {
      const currentMethod = await getPrintMethod();
      let fallbackMethod = null;
      
      // Determine fallback order: electron > local
      if (currentMethod === 'electron') {
        fallbackMethod = 'local';
      } else if (currentMethod === 'local') {
        // Try electron if available
        if (isElectron()) {
          fallbackMethod = 'electron';
        }
      }
      
      if (fallbackMethod) {
        console.log(`[Print] Trying fallback method: ${fallbackMethod}`);
        
        try {
          if (fallbackMethod === 'electron' && isElectron()) {
            return await printReceiptElectron(element, {
              printerName: finalPrinterName,
              onSuccess,
              onError,
              copies
            });
          } else if (fallbackMethod === 'local') {
            const localAvailable = await isLocalPrinterAvailable();
            if (localAvailable) {
              return await printReceiptLocal(element, {
                printerName: finalPrinterName,
                onSuccess,
                onError,
                copies
              });
            }
          }
        } catch (fallbackError) {
          console.error('[Print] Fallback also failed:', fallbackError);
        }
      }
    }

    if (onError) {
      onError({
        success: false,
        printer: printerName || 'unknown',
        message: error.message || 'Print failed',
        error: error
      });
    }

    throw error;
  }
}

/**
 * Print test page
 */
export async function testPrint(printerName = null) {
  const method = await getPrintMethod();
  
  if (method === 'electron') {
    const { printTest } = await import('./electronPrint');
    return await printTest(printerName);
  } else {
    const { printTest } = await import('./localPrint');
    return await printTest(printerName);
  }
}

/**
 * Get available printers
 */
export async function getAllPrinters() {
  const method = await getPrintMethod();
  
  if (method === 'electron') {
    const { getAllPrinters } = await import('./electronPrint');
    return await getAllPrinters();
  } else {
    const { getAllPrinters } = await import('./localPrint');
    return await getAllPrinters();
  }
}

/**
 * Check print server status
 */
export async function getPrintStatus() {
  const electronAvailable = isElectron();
  const localAvailable = await isLocalPrinterAvailable();
  
  return {
    electron: electronAvailable,
    local: localAvailable,
    method: printMethod || (electronAvailable ? 'electron' : (localAvailable ? 'local' : null)),
    available: electronAvailable || localAvailable
  };
}

