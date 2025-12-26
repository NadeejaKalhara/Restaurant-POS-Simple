/**
 * Test Print Utility
 * Helps test printing without a physical printer
 */

import { connectQZ, getPrinter, printWithQZ, isQZAvailable } from './qzPrint';

/**
 * List all available printers
 */
export async function listPrinters() {
  try {
    const connected = await connectQZ();
    if (!connected) {
      throw new Error('QZ Tray not available');
    }

    const qz = (await import('qz-tray')).default;
    const printers = await qz.printers.find();
    
    return {
      success: true,
      printers: printers || [],
      count: printers ? printers.length : 0
    };
  } catch (error) {
    console.error('Error listing printers:', error);
    return {
      success: false,
      printers: [],
      count: 0,
      error: error.message
    };
  }
}

/**
 * Test print to a specific printer (or PDF printer)
 */
export async function testPrint(printerName = null) {
  try {
    const testReceipt = `
      <div style="font-family: 'Courier New', monospace; width: 80mm; padding: 10px;">
        <h2 style="text-align: center; margin: 0;">TEST RECEIPT</h2>
        <hr style="border: 1px dashed #000; margin: 10px 0;">
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Test Print</strong></p>
        <hr style="border: 1px dashed #000; margin: 10px 0;">
        <p style="text-align: center; font-size: 12px;">This is a test print</p>
        <p style="text-align: center; font-size: 12px;">If you see this, printing works!</p>
      </div>
    `;

    await printWithQZ(testReceipt, printerName);
    return { success: true, message: 'Test print sent successfully' };
  } catch (error) {
    console.error('Test print failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get printer information for debugging
 */
export async function getPrinterInfo() {
  try {
    const connected = await connectQZ();
    if (!connected) {
      return {
        qzAvailable: false,
        message: 'QZ Tray not connected'
      };
    }

    const printers = await listPrinters();
    const selectedPrinter = await getPrinter();

    return {
      qzAvailable: true,
      printers: printers.printers,
      selectedPrinter: selectedPrinter,
      printerCount: printers.count
    };
  } catch (error) {
    return {
      qzAvailable: false,
      error: error.message
    };
  }
}


