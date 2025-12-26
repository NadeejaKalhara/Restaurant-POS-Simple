/**
 * Local Printer API Utility
 * Communicates with local thermal printer server (localhost:3001)
 * Independent from QZ Tray - uses node-thermal-printer backend
 */

const API_BASE_URL = 'http://localhost:3001';

/**
 * Check if local printer server is available
 * Only checks if not in Electron (to avoid unnecessary HTTP calls)
 */
export async function isLocalPrinterAvailable() {
  // Don't check local server if Electron is available
  if (typeof window !== 'undefined' && window.electron !== undefined) {
    console.log('[Local Print] Electron detected, skipping local server check');
    return false;
  }
  
  try {
    console.log('[Local Print] Checking local server at', API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    const available = response.ok;
    console.log('[Local Print] Local server', available ? 'available' : 'not available');
    return available;
  } catch (error) {
    console.log('[Local Print] Local server not available:', error.message);
    return false;
  }
}

/**
 * Get server status
 */
export async function getServerStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Print test receipt
 */
export async function printTest(printerName = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/print/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ printerName })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Print failed');
    }

    return result;
  } catch (error) {
    console.error('[Local Print] Test print error:', error);
    throw error;
  }
}

/**
 * Print receipt from HTML element
 */
export async function printReceipt(element, options = {}) {
  const { 
    printerName = null,
    onSuccess = null,
    onError = null,
    copies = 1
  } = options;

  try {
    // Extract HTML content
    const htmlContent = element.innerHTML || element.outerHTML;
    
    console.log('[Local Print] Sending print request to local server...');
    console.log('[Local Print] Printer:', printerName || 'default');
    
    const response = await fetch(`${API_BASE_URL}/print/html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        htmlContent,
        printerName,
        options: { copies }
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Print failed');
    }

    console.log('[Local Print] Print successful:', result);

    if (onSuccess) {
      onSuccess({
        success: true,
        printer: printerName || 'default',
        message: result.message || 'Print sent successfully'
      });
    }

    return result;
  } catch (error) {
    console.error('[Local Print] Print error:', error);
    
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
  try {
    console.log('[Local Print] Sending receipt data to local server...');
    
    const response = await fetch(`${API_BASE_URL}/print/receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiptData,
        printerName
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Print failed');
    }

    return result;
  } catch (error) {
    console.error('[Local Print] Receipt print error:', error);
    throw error;
  }
}

/**
 * Print HTML content directly
 */
export async function printWithLocal(htmlContent, printerName = null, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/print/html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        htmlContent,
        printerName,
        options
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Print failed');
    }

    return result;
  } catch (error) {
    console.error('[Local Print] Print error:', error);
    throw error;
  }
}

/**
 * Get available printers (placeholder)
 */
export async function getAllPrinters() {
  try {
    const response = await fetch(`${API_BASE_URL}/printers`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('[Local Print] Error getting printers:', error);
    return { message: 'Use Windows Settings to find printer name' };
  }
}

