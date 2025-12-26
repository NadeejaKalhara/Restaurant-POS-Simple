/**
 * Electron Print Utility
 * Uses Electron IPC to communicate with main process for printing
 * This is used when running as Electron app
 */

/**
 * Check if running in Electron
 */
export function isElectron() {
  const isElectronEnv = typeof window !== 'undefined' && window.electron !== undefined;
  if (isElectronEnv) {
    console.log('[Electron Print] Electron IPC bridge detected');
  }
  return isElectronEnv;
}

/**
 * Print test receipt
 */
export async function printTest(printerName = null) {
  if (!isElectron()) {
    throw new Error('Not running in Electron');
  }

  try {
    const result = await window.electron.print.test(printerName);
    if (!result.success) {
      throw new Error(result.error || 'Print failed');
    }
    return result;
  } catch (error) {
    console.error('[Electron Print] Error:', error);
    throw error;
  }
}

/**
 * Print receipt from HTML element
 */
export async function printReceipt(element, options = {}) {
  if (!isElectron()) {
    throw new Error('Not running in Electron');
  }

  const {
    printerName = null,
    onSuccess = null,
    onError = null,
    copies = 1
  } = options;

  try {
    const htmlContent = element.innerHTML || element.outerHTML;
    
    console.log('[Electron Print] Sending print request...');
    console.log('[Electron Print] Printer:', printerName || 'default');
    
    const result = await window.electron.print.html(htmlContent, printerName);
    
    if (!result.success) {
      throw new Error(result.error || 'Print failed');
    }

    console.log('[Electron Print] Print successful:', result);

    if (onSuccess) {
      onSuccess({
        success: true,
        printer: printerName || 'default',
        message: result.result?.message || 'Print sent successfully'
      });
    }

    return result;
  } catch (error) {
    console.error('[Electron Print] Print error:', error);
    
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
 * Print receipt from structured data
 */
export async function printReceiptData(receiptData, printerName = null) {
  if (!isElectron()) {
    throw new Error('Not running in Electron');
  }

  try {
    const result = await window.electron.print.receipt(receiptData, printerName);
    
    if (!result.success) {
      throw new Error(result.error || 'Print failed');
    }

    return result;
  } catch (error) {
    console.error('[Electron Print] Receipt print error:', error);
    throw error;
  }
}

/**
 * Get available printers
 */
export async function getAllPrinters() {
  if (!isElectron()) {
    return { message: 'Not running in Electron', printers: [] };
  }

  try {
    const result = await window.electron.print.getPrinters();
    return {
      printers: result.printers || [],
      message: result.message || 'No printers found',
      note: result.note || ''
    };
  } catch (error) {
    console.error('[Electron Print] Error getting printers:', error);
    return { error: error.message, printers: [] };
  }
}

/**
 * Get saved printer name from localStorage
 */
export function getSavedPrinter() {
  if (typeof window !== 'undefined' && window.electron?.storage) {
    return window.electron.storage.get('selectedPrinter');
  }
  return localStorage.getItem('selectedPrinter');
}

/**
 * Save printer name to localStorage
 */
export function savePrinter(printerName) {
  if (typeof window !== 'undefined' && window.electron?.storage) {
    window.electron.storage.set('selectedPrinter', printerName);
  } else {
    localStorage.setItem('selectedPrinter', printerName);
  }
}

/**
 * Check if printing is available
 */
export function isPrintAvailable() {
  return isElectron();
}

