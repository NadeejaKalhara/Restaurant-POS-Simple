import qz from 'qz-tray';

/**
 * QZ Tray Print Utility
 * Handles POS printing exclusively via QZ Tray (no browser print fallback)
 * Uses QZ Tray certificate signing to eliminate warnings
 * 
 * SETUP REQUIREMENTS:
 * 1. Install QZ Tray application from https://qz.io/download/
 * 2. QZ Tray must be running on the user's machine
 * 3. Application must be served over HTTPS or localhost
 * 4. Set up certificate signing (see QZ_TRAY_SIGNING_SETUP.md)
 */

let qzConnected = false;
let qzConnecting = false;
let defaultPrinterName = null; // Can be set to 'XP k200L' or specific printer name
let certificateSigningConfigured = false;

/**
 * QZ Tray Demo Certificate (for testing)
 * In production, load from server or use your own certificate
 */
const DEMO_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIECzCCAvOgAwIBAgIGAZtViVA9MA0GCSqGSIb3DQEBCwUAMIGiMQswCQYDVQQG
EwJVUzELMAkGA1UECAwCTlkxEjAQBgNVBAcMCUNhbmFzdG90YTEbMBkGA1UECgwS
UVogSW5kdXN0cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMx
HDAaBgkqhkiG9w0BCQEWDXN1cHBvcnRAcXouaW8xGjAYBgNVBAMMEVFaIFRyYXkg
RGVtbyBDZXJ0MB4XDTI1MTIyNDEyNDM0MFoXDTQ1MTIyNDEyNDM0MFowgaIxCzAJ
BgNVBAYTAlVTMQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYD
VQQKDBJRWiBJbmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMs
IExMQzEcMBoGCSqGSIb3DQEJARYNc3VwcG9ydEBxei5pbzEaMBgGA1UEAwwRUVog
VHJheSBEZW1vIENlcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDs
Iiin4yhPy7Un58YZDf73BiXr6tZ9m1yzyQYE7hqCTA+n5Rvk56BH2IVcDcdpUZ6j
W0FTfQNq9zix6G61aKeVw1ejbtT+edlbhTmjNEqQPjcE42IhnAhlb0Pf2umMTLQF
hJ0GZ7/cg+gStM13KTdrUGdylLbnxH2mYE9gnwiROgasgIB4bzrddm0Rkf/V1vx6
//5ww4CA7Xj9rIyFcXwUP9pdIaswdSlvo6067oRfgUPvj1a0eFa4vxZoTxm7HJoC
5sTN9gAfD6+eA99ysfume8bGdbCWfx1u07a1XgzsBxhSulutpkfpCcp3lSIujixy
y5MgAkz1qu+mmwNxQsaHAgMBAAGjRTBDMBIGA1UdEwEB/wQIMAYBAf8CAQEwDgYD
VR0PAQH/BAQDAgEGMB0GA1UdDgQWBBSrOWBT3cWoJnKCG2CJ15dpr75W5DANBgkq
hkiG9w0BAQsFAAOCAQEATnk17mK+ivD7pB+W9sb2e8wOwU/9sy1upPZLyfzVfQiG
B9xK+PefjsjYOs+sQVRA3/JXTeAmbDCu0CjHOCTvAPFVDtoGl7RX2dsym8QTDk/f
Qbod96cn6x7a7Y3C1rxrUwuBLiENeVieGhu2cUDPMSZLcvDz9YyqNEKj1iEB0Jwc
0AxQ6ttfyBOPyRU6gDjqC4KiCw+KpeNMVgUE7F8KHIljl36X7h6xe5Nz1tU2LpV9
lgTPShTYXbXG63321uSF1aEaWhfAFR8wdoEC1++3MyQllIoX1IAOkWrgFpgMfeYZ
S99J5w5gWK6hdfB40sLsP0onoFkT99BBZ9afQfJMsQ==
-----END CERTIFICATE-----`;

/**
 * Configure QZ Tray certificate signing
 * Call this once before using QZ Tray
 */
export function configureQZSigning(options = {}) {
  if (certificateSigningConfigured) {
    return; // Already configured
  }

  const {
    certificate = DEMO_CERTIFICATE, // Use demo cert by default
    certificateUrl = null, // URL to fetch certificate from server
    signatureUrl = null, // URL to sign messages (server-side signing)
    useDemoCert = true // Use demo certificate if no URL provided
  } = options;

  // Only set certificate if we have signing capability
  // QZ Tray requires signatures when a certificate is set
  if (signatureUrl) {
    // We have signing capability - set both certificate and signature
    
    // Set certificate promise
    if (certificateUrl) {
      // Fetch certificate from server (recommended)
      qz.security.setCertificatePromise(function(resolve, reject) {
        fetch(certificateUrl, {
          cache: 'no-store',
          headers: { 'Content-Type': 'text/plain' }
        })
          .then(function(data) {
            data.ok ? resolve(data.text()) : reject(data.text());
          })
          .catch(reject);
      });
    } else if (useDemoCert) {
      // Use demo certificate
      qz.security.setCertificatePromise(function(resolve, reject) {
        resolve(certificate);
      });
    }

    // Set signature promise (server-side signing)
    qz.security.setSignatureAlgorithm("SHA512");
    qz.security.setSignaturePromise(function(toSign) {
      return function(resolve, reject) {
        fetch(signatureUrl + "?request=" + encodeURIComponent(toSign), {
          cache: 'no-store',
          headers: { 'Content-Type': 'text/plain' }
        })
          .then(function(data) {
            data.ok ? resolve(data.text()) : reject(data.text());
          })
          .catch(reject);
      };
    });
  } else {
    // No signing URL - don't set certificate to avoid signature requirement
    // QZ Tray will work without certificate (may show warnings but printing works)
    console.warn('QZ Tray: No signature URL configured. Certificate signing disabled. Printing will work but may show warnings. For production, set up server-side signing.');
    // Don't set certificate or signature - allows printing without signature errors
  }

  certificateSigningConfigured = true;
}

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
    
    // Configure certificate signing if not already done
    if (!certificateSigningConfigured) {
      configureQZSigning({ useDemoCert: true });
    }
    
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }
    
    qzConnected = true;
    qzConnecting = false;
    return true;
  } catch (error) {
    console.warn('QZ Tray not available:', error.message);
    
    // Check for certificate-related errors
    if (error.message && (
      error.message.includes('certificate') || 
      error.message.includes('untrusted') ||
      error.message.includes('invalid certificate')
    )) {
      console.warn('Certificate signing not configured. Using demo certificate. For production, set up proper certificate signing.');
    }
    
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
      
      // Priority 2: Other receipt/thermal printers (exclude virtual printers)
      const virtualPrinters = ['anydesk', 'pdf', 'fax', 'microsoft print to pdf', 'onenote', 'snagit', 'xps', 'send to'];
      const receiptPrinter = printers.find(p => {
        const pLower = p.toLowerCase();
        // Skip virtual printers
        if (virtualPrinters.some(vp => pLower.includes(vp))) return false;
        // Look for real printers
        return pLower.includes('receipt') || 
               pLower.includes('pos') ||
               pLower.includes('thermal') ||
               pLower.includes('xp');
      });
      if (receiptPrinter) return receiptPrinter;
      
      // Fallback: first non-virtual printer
      const realPrinter = printers.find(p => {
        const pLower = p.toLowerCase();
        return !virtualPrinters.some(vp => pLower.includes(vp));
      });
      return realPrinter || printers[0];
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
    // Note: QZ Tray expects numeric values for size, not strings
    const config = qz.configs.create(printer, {
      // Paper size: 80mm width (3.15 inches = 302.4 points)
      // QZ Tray uses points (1/72 inch) as default unit
      // 80mm = 3.1496 inches = 226.77 points
      size: { 
        width: 226.77,  // 80mm in points
        height: null     // Auto height (null instead of 'auto')
      },
      // Margins optimized for thermal paper (in points)
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      // Units: points (default, no need to specify)
      // Orientation: portrait (default)
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
 * Print receipt content - QZ Tray only (no browser print fallback)
 */
export async function printReceipt(element, options = {}) {
  const { 
    printerName = null,
    onSuccess = null,
    onError = null
  } = options;

  try {
    const htmlContent = element.innerHTML;
    await printWithQZ(htmlContent, printerName);
    if (onSuccess) onSuccess('Printed via QZ Tray');
    return true;
  } catch (error) {
    console.error('QZ Tray print failed:', error);
    if (onError) onError(error);
    throw error; // Re-throw so caller knows it failed
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

