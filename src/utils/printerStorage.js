/**
 * Printer Storage Utility
 * Handles saving/loading printer preferences
 */

const STORAGE_KEY = 'selectedPrinter';

/**
 * Get saved printer name
 */
export function getSavedPrinter() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('[Printer Storage] Error getting saved printer:', error);
    return null;
  }
}

/**
 * Save printer name
 */
export function savePrinter(printerName) {
  try {
    if (printerName) {
      localStorage.setItem(STORAGE_KEY, printerName);
      console.log('[Printer Storage] Saved printer:', printerName);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[Printer Storage] Cleared saved printer');
    }
    return true;
  } catch (error) {
    console.error('[Printer Storage] Error saving printer:', error);
    return false;
  }
}

