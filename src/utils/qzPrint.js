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
 * Convert HTML element/content to image (base64 data URI)
 * Uses html2canvas if available, otherwise uses canvas with text rendering
 */
async function htmlToImage(htmlContent, widthMM = 80) {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary container with proper styling
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = widthMM + 'mm';
      container.style.maxWidth = widthMM + 'mm';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '8mm 5mm';
      container.style.fontFamily = "'Courier New', monospace";
      container.style.fontSize = '12pt';
      container.style.lineHeight = '1.4';
      container.style.color = '#000000';
      container.style.whiteSpace = 'pre-wrap';
      container.style.wordWrap = 'break-word';
      container.innerHTML = htmlContent;
      document.body.appendChild(container);
      
      // Wait for styles to apply
      setTimeout(() => {
        try {
          const widthPx = Math.round((widthMM / 25.4) * 96 * 2); // 2x scale for quality
          const heightPx = Math.max(container.scrollHeight * 2, 200);
          
          // Use html2canvas if available (better quality)
          if (window.html2canvas && typeof html2canvas === 'function') {
            html2canvas(container, {
              width: widthPx,
              height: heightPx,
              backgroundColor: '#ffffff',
              scale: 2,
              useCORS: true,
              logging: false,
              allowTaint: true
            }).then(canvas => {
              const base64 = canvas.toDataURL('image/png');
              document.body.removeChild(container);
              resolve(base64);
            }).catch(error => {
              console.warn('[QZ Print] html2canvas failed, using fallback:', error);
              // Fall through to canvas fallback
              renderWithCanvas();
            });
          } else {
            // Fallback: Use canvas with text rendering
            renderWithCanvas();
          }
          
          function renderWithCanvas() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const widthPx = Math.round((widthMM / 25.4) * 96 * 2);
            const heightPx = Math.max(container.scrollHeight * 2, 200);
            
            canvas.width = widthPx;
            canvas.height = heightPx;
            
            // Fill white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, widthPx, heightPx);
            
            // Draw text content
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 24px monospace'; // 2x scale
            ctx.textBaseline = 'top';
            
            const text = container.textContent || container.innerText || '';
            const lines = text.split('\n');
            let y = 40;
            const lineHeight = 30;
            const padding = 40;
            
            lines.forEach(line => {
              if (line.trim()) {
                // Handle long lines by wrapping
                const maxWidth = widthPx - (padding * 2);
                const words = line.split(' ');
                let currentLine = '';
                
                words.forEach(word => {
                  const testLine = currentLine + (currentLine ? ' ' : '') + word;
                  const metrics = ctx.measureText(testLine);
                  
                  if (metrics.width > maxWidth && currentLine) {
                    ctx.fillText(currentLine, padding, y);
                    y += lineHeight;
                    currentLine = word;
                  } else {
                    currentLine = testLine;
                  }
                });
                
                if (currentLine) {
                  ctx.fillText(currentLine, padding, y);
                  y += lineHeight;
                }
              } else {
                y += lineHeight / 2; // Empty line spacing
              }
            });
            
            const base64 = canvas.toDataURL('image/png');
            document.body.removeChild(container);
            resolve(base64);
          }
        } catch (error) {
          document.body.removeChild(container);
          reject(error);
        }
      }, 100); // Small delay for rendering
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Print HTML content using QZ Tray
 * Returns a promise that resolves with success info or rejects with error
 */
export async function printWithQZ(htmlContent, printerName = null, options = {}) {
  const { 
    useImageFormat = true, // Default to image format for reliability
    imageWidth = 80 // Width in mm
  } = options;
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
    // For pixel/image format, Windows Print API requires specific options
    const configOptions = {};
    
    // Job name - always safe to add
    if (printSettings.jobName) {
      configOptions.jobName = printSettings.jobName;
    }
    
    // For image/pixel format, Windows Print API needs size and interpolation
    // These are REQUIRED for image format to work with Windows Print API
    const configPaperWidth = printSettings.size?.width || (isPDFPrinter ? 595 : 80);
    const configPaperHeight = printSettings.size?.height || (isPDFPrinter ? 842 : null);
    
    // Convert to points if needed (QZ Tray expects points for size)
    const widthPoints = printSettings.units === 'mm' 
      ? Math.round((configPaperWidth / 25.4) * 72) // Convert mm to points
      : configPaperWidth;
    
    const heightPoints = configPaperHeight 
      ? (printSettings.units === 'mm' ? Math.round((configPaperHeight / 25.4) * 72) : configPaperHeight)
      : null;
    
    // Size is REQUIRED for image format - Windows Print API needs it
    configOptions.size = {
      width: widthPoints
    };
    if (heightPoints) {
      configOptions.size.height = heightPoints;
    }
    
    // Interpolation is REQUIRED for image format - tells Windows how to scale the image
    configOptions.interpolation = printSettings.interpolation || 'nearest-neighbor';
    
    // Color type - grayscale for thermal printers, color for PDF
    configOptions.colorType = printSettings.colorType || (isPDFPrinter ? 'color' : 'grayscale');
    
    // Orientation
    if (printSettings.orientation === 'portrait' || printSettings.orientation === 'landscape') {
      configOptions.orientation = printSettings.orientation;
    }
    
    // Margins - set to 0 for thermal printers
    configOptions.margins = {
      top: printSettings.margins?.top || 0,
      bottom: printSettings.margins?.bottom || 0,
      left: printSettings.margins?.left || 0,
      right: printSettings.margins?.right || 0
    };
    
    // For thermal printers, add rasterize option (helps Windows Print API process the image)
    if (!isPDFPrinter) {
      configOptions.rasterize = true; // Required for Windows Print API to accept image jobs
    }
    
    console.log('[QZ Print] Config options for image format:', {
      size: configOptions.size,
      interpolation: configOptions.interpolation,
      colorType: configOptions.colorType,
      rasterize: configOptions.rasterize
    });
    
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
      // Try creating config with options first
      if (Object.keys(configOptions).length > 0) {
        console.log('[QZ Print] Creating config with options:', configOptions);
        config = qz.configs.create(printer, configOptions);
      } else {
        // If no options, create minimal config
        console.log('[QZ Print] Creating config with no options (absolute minimal)');
        config = qz.configs.create(printer);
      }
      
      // Verify the config was created correctly
      if (!config) {
        throw new Error('Failed to create print configuration - config is null/undefined');
      }
      
      // Validate config structure
      if (typeof config !== 'object') {
        throw new Error(`Invalid config type: ${typeof config}. Expected object.`);
      }
      
      console.log('[QZ Print] Config created successfully');
      console.log('[QZ Print] Config type:', typeof config);
      console.log('[QZ Print] Config keys:', Object.keys(config));
      console.log('[QZ Print] Config printer name:', config?.printer?.name || config?.printer || 'not set');
      
      // Check if config has the expected structure
      const hasPrinter = !!(config.printer || (config.printer && config.printer.name));
      if (!hasPrinter) {
        console.warn('[QZ Print] WARNING: Config does not have printer property');
      }
      
      // Verify printer name in config matches what we requested
      const configPrinterName = config?.printer?.name || config?.printer;
      if (configPrinterName && configPrinterName.toLowerCase() !== printer.toLowerCase()) {
        console.warn('[QZ Print] WARNING: Config printer name does not match requested printer');
        console.warn('[QZ Print] Requested:', printer);
        console.warn('[QZ Print] Config has:', configPrinterName);
        // Try to fix it by recreating with exact printer name
        console.log('[QZ Print] Attempting to recreate config with exact printer name...');
        config = qz.configs.create(configPrinterName || printer, configOptions);
      }
    } catch (configError) {
      console.error('[QZ Print] Error creating print configuration:', configError);
      console.error('[QZ Print] Config error details:', {
        message: configError?.message,
        name: configError?.name,
        stack: configError?.stack,
        printer: printer,
        options: configOptions,
        optionsKeys: Object.keys(configOptions)
      });
      
      // Try fallback: create config with no options at all
      try {
        console.log('[QZ Print] Attempting fallback: config with no options...');
        config = qz.configs.create(printer);
        if (config) {
          console.log('[QZ Print] Fallback config created successfully');
        }
      } catch (fallbackError) {
        console.error('[QZ Print] Fallback config also failed:', fallbackError);
        throw new Error(`Failed to create print configuration: ${configError?.message || String(configError)}`);
      }
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
    
    // Convert HTML to image format for more reliable printing
    // Image format avoids HTML rendering issues in QZ Tray
    let printData;
    
    console.log('[QZ Print] Converting HTML to image format for reliable printing...');
    try {
      // Convert HTML content to image
      const imageData = await htmlToImage(htmlContent, paperWidthMM);
      console.log('[QZ Print] Image conversion successful');
      console.log('[QZ Print] Image data length:', imageData.length);
      console.log('[QZ Print] Image preview:', imageData.substring(0, 80) + '...');
      
      // Use pixel/image format - more reliable than HTML
      printData = [
        {
          type: 'pixel',
          format: 'image',
          data: imageData, // Base64 data URI (data:image/png;base64,...)
          options: {
            copies: options.copies || 1
          }
        }
      ];
      
      console.log('[QZ Print] Using pixel/image format for printing');
    } catch (imageError) {
      console.warn('[QZ Print] Image conversion failed, falling back to HTML:', imageError);
      
      // Fallback to HTML if image conversion fails
      const htmlData = fullHtml;
      printData = [
        {
          type: 'html',
          data: htmlData,
          options: {
            copies: options.copies || 1
          }
        }
      ];
      console.log('[QZ Print] Using HTML format (fallback)');
    }
    
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
 * Diagnostic function to check QZ Tray and printer status
 * Use this to troubleshoot why jobs aren't being queued
 */
export async function diagnoseQZPrint(printerName = null) {
  const diagnostics = {
    qzAvailable: false,
    qzConnected: false,
    printerFound: false,
    printerName: null,
    allPrinters: [],
    websocketActive: false,
    configCreated: false,
    error: null
  };
  
  try {
    diagnostics.qzAvailable = isQZAvailable();
    console.log('[QZ Diagnose] QZ Available:', diagnostics.qzAvailable);
    
    if (!diagnostics.qzAvailable) {
      diagnostics.error = 'QZ Tray is not available';
      return diagnostics;
    }
    
    diagnostics.qzConnected = await connectQZ();
    console.log('[QZ Diagnose] QZ Connected:', diagnostics.qzConnected);
    
    if (!diagnostics.qzConnected) {
      diagnostics.error = 'Failed to connect to QZ Tray';
      return diagnostics;
    }
    
    diagnostics.websocketActive = qz.websocket.isActive();
    console.log('[QZ Diagnose] Websocket Active:', diagnostics.websocketActive);
    
    diagnostics.allPrinters = await qz.printers.find();
    console.log('[QZ Diagnose] Available Printers:', diagnostics.allPrinters);
    
    let printer = printerName;
    if (!printer && diagnostics.allPrinters.length > 0) {
      printer = diagnostics.allPrinters[0];
    }
    
    if (printer) {
      const found = diagnostics.allPrinters.find(p => 
        p === printer || p.toLowerCase() === printer.toLowerCase()
      );
      if (found) {
        diagnostics.printerFound = true;
        diagnostics.printerName = found;
        console.log('[QZ Diagnose] Printer Found:', found);
        
        try {
          const config = qz.configs.create(found);
          diagnostics.configCreated = !!config;
          console.log('[QZ Diagnose] Config Created:', diagnostics.configCreated);
        } catch (configError) {
          diagnostics.error = `Config creation failed: ${configError.message}`;
        }
      } else {
        diagnostics.error = `Printer "${printer}" not found`;
      }
    } else {
      diagnostics.error = 'No printer available';
    }
    
  } catch (error) {
    diagnostics.error = error.message || String(error);
    console.error('[QZ Diagnose] Error:', error);
  }
  
  return diagnostics;
}

/**
 * Test print - sends a simple test page to verify printer is working
 * Uses raw text format for better reliability and faster printing
 */
export async function testPrint(printerName = null) {
  try {
    const connected = await connectQZ();
    if (!connected) {
      throw new Error('QZ Tray not available');
    }

    // Get printer - use getPrinter() function from this file
    let printer = printerName;
    if (!printer) {
      // Call getPrinter function (defined earlier in this file)
      printer = await getPrinter();
    }
    
    if (!printer) {
      throw new Error('No printer found');
    }

    // Verify printer exists
    const allPrinters = await qz.printers.find();
    const exactPrinter = allPrinters.find(p => 
      p === printer || 
      p.toLowerCase() === printer.toLowerCase()
    );
    
    if (!exactPrinter) {
      throw new Error(`Printer "${printer}" not found. Available: ${allPrinters.join(', ')}`);
    }
    
    printer = exactPrinter; // Use exact match
    
    console.log('[QZ Test Print] Using printer:', printer);
    
    // Verify websocket is active before printing
    if (!qz.websocket.isActive()) {
      console.warn('[QZ Test Print] Websocket not active, attempting to reconnect...');
      await qz.websocket.connect();
    }
    
    console.log('[QZ Test Print] Websocket status:', {
      isActive: qz.websocket.isActive(),
      isConnecting: qz.websocket.isConnecting()
    });
    
    // Create absolute minimal config - no options at all
    console.log('[QZ Test Print] Creating minimal config...');
    const config = qz.configs.create(printer);
    
    if (!config) {
      throw new Error('Failed to create config');
    }
    
    console.log('[QZ Test Print] Config created:', {
      hasPrinter: !!config.printer,
      printerName: config.printer?.name || config.printer,
      configType: typeof config
    });
    
    // ABSOLUTE MINIMAL: Simplest possible text - just "TEST\n"
    const testText = 'TEST\n';
    
    console.log('[QZ Test Print] Sending ABSOLUTE MINIMAL raw text...');
    console.log('[QZ Test Print] Text:', JSON.stringify(testText));
    
    // ABSOLUTE MINIMAL: Just type and data, nothing else
    const printData = [{ type: 'raw', data: testText }];
    
    console.log('[QZ Test Print] About to call qz.print()...');
    console.log('[QZ Test Print] Config keys:', Object.keys(config));
    console.log('[QZ Test Print] PrintData:', JSON.stringify(printData));
    
    // Shorter timeout - if this doesn't work, QZ Tray has a fundamental issue
    const printPromise = qz.print(config, printData).catch(error => {
      console.error('[QZ Test Print] Print promise rejected immediately:', error);
      throw error;
    });
    
    console.log('[QZ Test Print] qz.print() called, waiting for response...');
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.error('[QZ Test Print] TIMEOUT: QZ Tray did not respond after 8 seconds');
        console.error('[QZ Test Print] This means QZ Tray received the request but did not process it');
        console.error('[QZ Test Print] TROUBLESHOOTING STEPS:');
        console.error('[QZ Test Print]   1. Check QZ Tray logs: %APPDATA%\\qz or C:\\ProgramData\\qz');
        console.error('[QZ Test Print]   2. Verify printer is online in Windows Settings');
        console.error('[QZ Test Print]   3. Try printing from Notepad to test printer');
        console.error('[QZ Test Print]   4. Check Windows Print Queue for stuck jobs');
        console.error('[QZ Test Print]   5. Restart QZ Tray application');
        console.error('[QZ Test Print]   6. Update QZ Tray to latest version');
        reject(new Error('QZ Tray timeout - job not queued. See console for troubleshooting steps.'));
      }, 8000);
    });
    
    const result = await Promise.race([printPromise, timeoutPromise]);
    console.log('[QZ Test Print] SUCCESS! Print result:', result);
    
    return {
      success: true,
      printer: printer,
      message: 'Test print queued successfully',
      result: result
    };
  } catch (error) {
    console.error('[QZ Test Print] Error:', error);
    
    // If raw text fails, try HTML as fallback
    console.log('[QZ Test Print] Raw text failed, trying HTML fallback...');
    try {
      const testHtml = `
        <div style="text-align: center; padding: 20px;">
          <h1>QZ Tray Test Print</h1>
          <p>If you can see this, printing is working!</p>
          <p>Printer: ${printerName || 'Default'}</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `;
      
      return await printWithQZ(testHtml, printerName, { copies: 1 });
    } catch (htmlError) {
      console.error('[QZ Test Print] HTML fallback also failed:', htmlError);
      throw error; // Throw original error
    }
  }
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

