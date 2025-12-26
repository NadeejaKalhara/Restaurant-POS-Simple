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

// Storage keys for printer settings
const STORAGE_KEYS = {
  SELECTED_PRINTER: 'qz_selected_printer',
  PRINTER_SETTINGS: 'qz_printer_settings'
};

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
 * Get all available printers
 */
export async function getAllPrinters() {
  try {
    const connected = await connectQZ();
    if (!connected) {
      throw new Error('QZ Tray not available');
    }
    const printers = await qz.printers.find();
    return printers || [];
  } catch (error) {
    console.error('Error getting printers:', error);
    return [];
  }
}

/**
 * Get saved printer from localStorage
 */
export function getSavedPrinter() {
  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_PRINTER);
  } catch (error) {
    console.error('Error getting saved printer:', error);
    return null;
  }
}

/**
 * Save selected printer to localStorage
 */
export function savePrinter(printerName) {
  try {
    if (printerName) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PRINTER, printerName);
      defaultPrinterName = printerName;
    }
  } catch (error) {
    console.error('Error saving printer:', error);
  }
}

/**
 * Get printer settings from localStorage
 */
export function getPrinterSettings(printerName = null) {
  try {
    const printer = printerName || getSavedPrinter();
    if (!printer) return null;
    
    const settings = localStorage.getItem(STORAGE_KEYS.PRINTER_SETTINGS);
    if (settings) {
      const allSettings = JSON.parse(settings);
      return allSettings[printer] || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting printer settings:', error);
    return null;
  }
}

/**
 * Save printer settings to localStorage
 */
export function savePrinterSettings(printerName, settings) {
  try {
    if (!printerName || !settings) return;
    
    const existing = localStorage.getItem(STORAGE_KEYS.PRINTER_SETTINGS);
    const allSettings = existing ? JSON.parse(existing) : {};
    allSettings[printerName] = settings;
    localStorage.setItem(STORAGE_KEYS.PRINTER_SETTINGS, JSON.stringify(allSettings));
  } catch (error) {
    console.error('Error saving printer settings:', error);
  }
}

/**
 * Get default printer or prompt user to select
 * Prioritizes saved printer, then XP k200L printer if available
 */
export async function getPrinter() {
  try {
    const printers = await qz.printers.find();
    if (printers && printers.length > 0) {
      // Priority 0: Check for saved printer preference
      const savedPrinter = getSavedPrinter();
      if (savedPrinter) {
        const found = printers.find(p => 
          p.toLowerCase() === savedPrinter.toLowerCase() ||
          p.toLowerCase().includes(savedPrinter.toLowerCase())
        );
        if (found) return found;
      }
      
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
      
      // Priority 2: Other receipt/thermal printers (exclude virtual printers except PDF for testing)
      const virtualPrinters = ['anydesk', 'fax', 'onenote', 'snagit', 'xps', 'send to'];
      const receiptPrinter = printers.find(p => {
        const pLower = p.toLowerCase();
        // Skip virtual printers (but allow PDF for testing)
        if (virtualPrinters.some(vp => pLower.includes(vp))) return false;
        // Look for real printers
        return pLower.includes('receipt') || 
               pLower.includes('pos') ||
               pLower.includes('thermal') ||
               pLower.includes('xp');
      });
      if (receiptPrinter) return receiptPrinter;
      
      // Priority 3: PDF printer for testing (if no real printer found)
      const pdfPrinter = printers.find(p => {
        const pLower = p.toLowerCase();
        return pLower.includes('pdf') || pLower.includes('microsoft print to pdf');
      });
      if (pdfPrinter) {
        console.log('No real printer found. Using PDF printer for testing:', pdfPrinter);
        return pdfPrinter;
      }
      
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
 * Get default print settings for a printer
 * Includes required XPrinter settings for reliable printing
 */
function getDefaultPrintSettings(printer) {
  const isPDFPrinter = printer.toLowerCase().includes('pdf');
  const isXPrinter = printer.toLowerCase().includes('xp') || printer.toLowerCase().includes('k200l');
  const isThermalPrinter = isXPrinter || printer.toLowerCase().includes('thermal') || printer.toLowerCase().includes('receipt');
  
  // Base settings
  const baseSettings = {
    size: { 
      width: isPDFPrinter ? 595 : 80,  // A4 width (points) for PDF, 80mm for thermal
      height: isPDFPrinter ? 842 : 200  // A4 height for PDF, reasonable default for thermal (will auto-adjust)
    },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    orientation: 'portrait',
    colorType: isPDFPrinter ? 'color' : 'grayscale',
    interpolation: 'nearest-neighbor',
    jobName: isPDFPrinter ? 'POS Receipt (PDF Test)' : 'POS Receipt',
    copies: 1
  };
  
  // Add required settings for thermal printers
  if (!isPDFPrinter && isThermalPrinter) {
    baseSettings.rasterize = true;        // Required for reliable printing
    baseSettings.scaleContent = true;     // Ensures content scales properly
    baseSettings.units = 'mm';          // Use millimeters for size
    baseSettings.forceRaw = false;      // Use standard printing (not raw ESC/POS)
    baseSettings.density = 0;           // Default density
    baseSettings.duplex = false;       // No duplex for thermal
  }
  
  return baseSettings;
}

/**
 * Check printer status (if available)
 */
export async function checkPrinterStatus(printerName) {
  try {
    const connected = await connectQZ();
    if (!connected) {
      return { available: false, error: 'QZ Tray not connected' };
    }

    // Try to get printer info - this will fail if printer doesn't exist
    try {
      // List all printers to verify the printer exists
      const printers = await qz.printers.find();
      const exists = printers.some(p => p === printerName || p.toLowerCase() === printerName.toLowerCase());
      
      if (!exists) {
        return { 
          available: false, 
          error: `Printer "${printerName}" not found in available printers`,
          availablePrinters: printers
        };
      }

      // Try to get printer details (may not work on all systems)
      try {
        const printerInfo = await qz.printers.find(printerName);
        return { available: true, printerInfo };
      } catch (infoError) {
        // Printer exists but we can't get detailed info - that's okay
        return { available: true, note: 'Printer found but detailed status unavailable' };
      }
    } catch (error) {
      return { available: false, error: error.message || 'Failed to check printer status' };
    }
  } catch (error) {
    return { available: false, error: error.message || 'Failed to connect to QZ Tray' };
  }
}

/**
 * Print HTML content using QZ Tray
 * Returns a promise that resolves with success info or rejects with error
 */
export async function printWithQZ(htmlContent, printerName = null, options = {}) {
  let printer = null;
  try {
    const connected = await connectQZ();
    if (!connected) {
      throw new Error('QZ Tray not available');
    }

    // Get printer - if printerName is provided, use it directly; otherwise auto-detect
    if (printerName) {
      // Verify the specified printer exists
      const allPrinters = await qz.printers.find();
      const exactMatch = allPrinters.find(p => 
        p === printerName || 
        p.toLowerCase() === printerName.toLowerCase() ||
        p.toLowerCase().includes(printerName.toLowerCase())
      );
      
      if (exactMatch) {
        printer = exactMatch; // Use the exact match from QZ Tray
        console.log('[QZ Print] Using specified printer:', printer, '(matched from:', printerName, ')');
      } else {
        console.warn('[QZ Print] Specified printer not found:', printerName);
        console.warn('[QZ Print] Available printers:', allPrinters);
        printer = await getPrinter(); // Fallback to auto-detect
        console.warn('[QZ Print] Falling back to auto-detected printer:', printer);
      }
    } else {
      printer = await getPrinter();
    }
    
    if (!printer) {
      throw new Error('No printer found');
    }

    console.log('[QZ Print] Attempting to print to:', printer);
    console.log('[QZ Print] All available printers:', await qz.printers.find());

    // Check printer status before printing
    const status = await checkPrinterStatus(printer);
    if (!status.available) {
      console.warn('[QZ Print] Printer status check:', status);
      // Don't throw error, but log warning - some printers may not support status checking
      if (status.error && status.error.includes('not found')) {
        throw new Error(`Printer "${printer}" not found. Available printers: ${status.availablePrinters?.join(', ') || 'none'}`);
      }
    } else {
      console.log('[QZ Print] Printer status check passed:', status);
    }

    // Check if this is a PDF printer for testing
    const isPDFPrinter = printer.toLowerCase().includes('pdf');
    
    if (isPDFPrinter) {
      console.log('[QZ Print] Using PDF printer for testing:', printer);
    }

    // Get saved printer settings or use defaults
    const savedSettings = getPrinterSettings(printer);
    const defaultSettings = getDefaultPrintSettings(printer);
    const printSettings = savedSettings ? { ...defaultSettings, ...savedSettings } : defaultSettings;

    // Create print configuration
    // TESTING: Disable silent mode for PDF printers to show save dialog
    const configOptions = { ...printSettings };
    if (isPDFPrinter || printer.toLowerCase().includes('microsoft print to pdf')) {
      configOptions.silent = true; // Force save dialog to appear for testing
    }
    
    // Log the exact printer name being used (important for debugging)
    console.log('[QZ Print] Creating config for printer:', printer);
    console.log('[QZ Print] Printer name type:', typeof printer);
    console.log('[QZ Print] Config options:', JSON.stringify(configOptions, null, 2));
    
    // Validate printer name before creating config
    if (!printer || typeof printer !== 'string' || printer.trim().length === 0) {
      throw new Error(`Invalid printer name: ${printer}. Printer name must be a non-empty string.`);
    }
    
    let config;
    try {
      config = qz.configs.create(printer, configOptions);
      
      // Verify the config was created correctly
      if (!config) {
        throw new Error('Failed to create print configuration - config is null/undefined');
      }
      
      console.log('[QZ Print] Config created successfully');
      console.log('[QZ Print] Config type:', typeof config);
      console.log('[QZ Print] Config printer name:', config?.printer?.name || config?.printer || 'not set');
      console.log('[QZ Print] Config has options:', !!config?.options);
      
      // Verify printer name in config matches what we requested
      const configPrinterName = config?.printer?.name || config?.printer;
      if (configPrinterName && configPrinterName.toLowerCase() !== printer.toLowerCase()) {
        console.warn('[QZ Print] WARNING: Config printer name does not match requested printer');
        console.warn('[QZ Print] Requested:', printer);
        console.warn('[QZ Print] Config has:', configPrinterName);
      }
    } catch (configError) {
      console.error('[QZ Print] Error creating print configuration:', configError);
      console.error('[QZ Print] Config error details:', {
        message: configError?.message,
        name: configError?.name,
        printer: printer,
        options: configOptions
      });
      throw new Error(`Failed to create print configuration: ${configError?.message || String(configError)}`);
    }
    
    // Wrap HTML content optimized for thermal paper
    // If units is 'mm', width is already in millimeters; otherwise convert from points
    const paperWidth = printSettings.size?.width || (isPDFPrinter ? 595 : 80);
    const paperWidthMM = printSettings.units === 'mm' 
      ? paperWidth  // Already in mm
      : Math.round((paperWidth / 72) * 25.4); // Convert points to mm
    
    // For thermal printers, ensure we have a reasonable paper width
    // Note: paperWidthMM is already calculated above, this is just a validation check
    if (!isPDFPrinter && paperWidthMM < 50) {
      console.warn('[QZ Print] Paper width seems too small:', paperWidthMM, 'mm');
    }
    
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=${paperWidthMM}mm, initial-scale=1.0">
          <style>
            @page {
              margin: 0;
              size: ${paperWidthMM}mm auto;
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
              width: ${paperWidthMM}mm;
              max-width: ${paperWidthMM}mm;
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

    // Log print configuration for debugging
    console.log('[QZ Print] Print configuration:', {
      printer: printer,
      settings: printSettings,
      paperWidth: paperWidth,
      paperWidthMM: paperWidthMM,
      isPDFPrinter: isPDFPrinter
    });

    // Print and wait for completion
    // QZ Tray's print() returns a promise that resolves when print job is sent successfully
    // Note: This doesn't guarantee the printer actually printed, but that the job was sent
    console.log('[QZ Print] Sending print job to QZ Tray...');
    console.log('[QZ Print] Config object:', JSON.stringify(config, null, 2));
    
    // Create print data
    // ISSUE: QZ Tray is prepending the domain URL (https://shan.cynex.lk/) to HTML data
    // This happens when QZ Tray treats the HTML string as a relative URL
    // SOLUTION: Use base64 encoding to prevent URL resolution
    
    console.log('[QZ Print] HTML data length:', fullHtml.length);
    console.log('[QZ Print] HTML starts with:', fullHtml.substring(0, 50));
    
    // Ensure HTML starts correctly
    const trimmedHtml = fullHtml.trim();
    if (!trimmedHtml.startsWith('<!DOCTYPE') && !trimmedHtml.startsWith('<html')) {
      console.error('[QZ Print] ERROR: HTML does not start with expected tags:', trimmedHtml.substring(0, 100));
    }
    
    // Use raw HTML string - QZ Tray handles this better than data URIs
    // Data URIs can cause issues with large content or special characters
    // Raw HTML is the recommended approach for QZ Tray
    const htmlData = fullHtml;
    console.log('[QZ Print] Using raw HTML string (recommended for QZ Tray)');
    console.log('[QZ Print] HTML data length:', htmlData.length);
    console.log('[QZ Print] HTML starts with:', htmlData.substring(0, 100));
    
    // Validate HTML structure
    if (!htmlData.includes('<!DOCTYPE') && !htmlData.includes('<html')) {
      console.warn('[QZ Print] WARNING: HTML may not be properly formatted');
    }
    
    const printData = [
      {
        type: 'html',
        format: 'html',
        data: htmlData, // Raw HTML string - QZ Tray's preferred format
        options: {
          copies: options.copies || 1,
          jobName: printSettings.jobName || 'POS Receipt'
        }
      }
    ];
    
    console.log('[QZ Print] Print data prepared:', {
      type: printData[0].type,
      format: printData[0].format,
      dataLength: printData[0].data.length,
      dataFirstChars: printData[0].data.substring(0, 100),
      printer: printer,
      configOptions: Object.keys(config)
    });
    
    // Validate config before printing
    if (!config) {
      throw new Error('Print configuration is invalid');
    }
    
    console.log('[QZ Print] Calling qz.print()...');
    console.log('[QZ Print] Config details:', {
      printer: config.printer?.name || printer,
      hasOptions: !!config.options
    });

    try {
      // Wrap print call with better error handling
      const printPromise = qz.print(config, printData).catch(error => {
        // Catch any immediate errors
        console.error('[QZ Print] Print promise rejected immediately:', error);
        console.error('[QZ Print] Error details:', {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
          toString: String(error)
        });
        throw error;
      });
      
      // Log immediately after calling print
      console.log('[QZ Print] qz.print() called, waiting for response...');
      
      // Add timeout to prevent hanging (15 seconds - shorter timeout to catch issues faster)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.error('[QZ Print] TIMEOUT: Print job timed out after 15 seconds');
          console.error('[QZ Print] This usually means QZ Tray is not processing the job.');
          console.error('[QZ Print] Possible causes:');
          console.error('[QZ Print]   1. Printer driver issue');
          console.error('[QZ Print]   2. Invalid print configuration');
          console.error('[QZ Print]   3. QZ Tray internal error (check QZ Tray logs)');
          reject(new Error('Print job timed out after 15 seconds. The job was not queued. Check QZ Tray logs and printer configuration.'));
        }, 15000);
      });

      const printResult = await Promise.race([printPromise, timeoutPromise]);
      
      console.log('[QZ Print] Print job completed. QZ Tray response:', printResult);
      console.log('[QZ Print] Response type:', typeof printResult);
      
      // Log full response details
      if (printResult) {
        try {
          console.log('[QZ Print] Response details:', JSON.stringify(printResult, null, 2));
        } catch (e) {
          console.log('[QZ Print] Response (stringified):', String(printResult));
        }
      } else {
        console.warn('[QZ Print] WARNING: Print result is null/undefined - job may not have been queued');
      }
      
      // Check if there are any warnings or errors in the response
      if (printResult && typeof printResult === 'object') {
        if (printResult.error) {
          console.error('[QZ Print] Print job returned an error:', printResult.error);
          throw new Error(printResult.error);
        }
        if (printResult.warning) {
          console.warn('[QZ Print] Print job warning:', printResult.warning);
        }
        // Check for common error indicators
        if (printResult.success === false) {
          console.error('[QZ Print] Print job marked as failed:', printResult);
          throw new Error(printResult.message || printResult.error || 'Print job failed');
        }
      }
      
      // If result is null/undefined, this might indicate the job wasn't queued
      if (!printResult) {
        console.warn('[QZ Print] WARNING: No response from QZ Tray. Job may not have been queued.');
        console.warn('[QZ Print] Check QZ Tray logs for errors.');
      }
      
      // Return success information
      return {
        success: true,
        printer: printer,
        message: 'Print job sent successfully to QZ Tray',
        result: printResult || { success: true },
        note: 'Job sent to QZ Tray. If printing does not occur, check: 1) Windows print queue, 2) Printer is online, 3) QZ Tray logs for errors.'
      };
      
    } catch (printError) {
      console.error('[QZ Print] Error during print execution:', printError);
      console.error('[QZ Print] Error name:', printError?.name);
      console.error('[QZ Print] Error message:', printError?.message);
      console.error('[QZ Print] Error constructor:', printError?.constructor?.name);
      if (printError?.stack) {
        console.error('[QZ Print] Error stack:', printError.stack);
      }
      
      // Additional debugging info
      console.error('[QZ Print] Print configuration that failed:', {
        printer: printer,
        configType: typeof config,
        printDataType: typeof printData,
        printDataLength: printData?.[0]?.data?.length
      });
      
      throw printError;
    }
  } catch (error) {
    console.error('[QZ Print] Print error occurred:', error);
    console.error('[QZ Print] Error details:', {
      message: error.message,
      stack: error.stack,
      printer: printer || printerName || 'unknown',
      errorType: error.constructor?.name
    });
    
    // Return error information
    const errorInfo = {
      success: false,
      printer: printer || printerName || 'unknown',
      message: error.message || 'Print failed',
      error: error
    };
    
    // Add helpful troubleshooting info
    if (error.message && error.message.includes('not found')) {
      errorInfo.troubleshooting = 'Printer not found. Please verify the printer name in QZ Tray Settings.';
    } else if (error.message && error.message.includes('not available')) {
      errorInfo.troubleshooting = 'QZ Tray is not available. Please ensure QZ Tray is running.';
    } else {
      errorInfo.troubleshooting = 'Check QZ Tray logs for more details. Ensure printer is online and has paper.';
    }
    
    throw errorInfo;
  }
}

/**
 * Print receipt content - QZ Tray only (no browser print fallback)
 * Returns print success status via callbacks and promise
 */
export async function printReceipt(element, options = {}) {
  const { 
    printerName = null,
    onSuccess = null,
    onError = null,
    copies = 1
  } = options;

  try {
    const htmlContent = element.innerHTML;
    const result = await printWithQZ(htmlContent, printerName, { copies });
    
    // Call success callback with detailed information
    if (onSuccess) {
      onSuccess({
        success: true,
        printer: result.printer,
        message: result.message
      });
    }
    
    return result;
  } catch (error) {
    console.error('QZ Tray print failed:', error);
    
    // Call error callback with error information
    if (onError) {
      onError({
        success: false,
        printer: error.printer || printerName || 'unknown',
        message: error.message || 'Print failed',
        error: error.error || error
      });
    }
    
    throw error; // Re-throw so caller knows it failed
  }
}

/**
 * Test print - sends a simple test page to verify printer is working
 */
export async function testPrint(printerName = null) {
  const testHtml = `
    <div style="text-align: center; padding: 20px;">
      <h1>QZ Tray Test Print</h1>
      <p>If you can see this, printing is working!</p>
      <p>Printer: ${printerName || 'Default'}</p>
      <p>Time: ${new Date().toLocaleString()}</p>
    </div>
  `;
  
  return await printWithQZ(testHtml, printerName, { copies: 1 });
}

/**
 * Get detailed printer information for debugging
 */
export async function getPrinterDetails(printerName) {
  try {
    const connected = await connectQZ();
    if (!connected) {
      return { error: 'QZ Tray not connected' };
    }

    const printers = await qz.printers.find();
    const printer = printers.find(p => 
      p === printerName || 
      p.toLowerCase() === printerName.toLowerCase()
    );

    if (!printer) {
      return {
        error: 'Printer not found',
        availablePrinters: printers
      };
    }

    return {
      name: printer,
      exists: true,
      allPrinters: printers,
      note: 'Use Windows Print Queue to check if print jobs are queued'
    };
  } catch (error) {
    return {
      error: error.message || 'Failed to get printer details',
      originalError: error
    };
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

