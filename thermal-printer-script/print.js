#!/usr/bin/env node

/**
 * Thermal Printer Script
 * Standalone script to print receipts using node-thermal-printer
 * 
 * Usage:
 *   node print.js                    - Print test receipt
 *   node print.js "Printer Name"     - Print to specific printer
 *   node print.js list               - List all available printers
 *   node print.js test "Printer"     - Print test page
 */

const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'test';
const printerName = args[1] || null;

/**
 * List all available printers
 */
async function listPrinters() {
  try {
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: 'printer',
    });
    
    console.log('Available Printers:');
    console.log('==================');
    
    // Note: node-thermal-printer doesn't have a built-in list function
    // You'll need to specify the printer name manually
    console.log('\nTo find your printer name:');
    console.log('1. Open Windows Settings > Printers & scanners');
    console.log('2. Note the exact printer name');
    console.log('3. Use: node print.js "Printer Name"\n');
    
    return [];
  } catch (error) {
    console.error('Error listing printers:', error.message);
    return [];
  }
}

/**
 * Print test receipt
 */
async function printTest(printerNameArg = null) {
  try {
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON, // Change to STAR if using Star printer
      interface: 'printer',
      characterSet: CharacterSet.PC852_LATIN2,
      removeSpecialCharacters: false,
      lineCharacter: '-',
      breakLine: BreakLine.WORD,
      options: {
        timeout: 5000,
      },
    });

    // Set printer name if provided
    if (printerNameArg) {
      printer.printer = printerNameArg;
    }

    // Check if printer is connected
    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      throw new Error(`Printer "${printerNameArg || 'default'}" is not connected or not found`);
    }

    console.log('Printing test receipt...');
    console.log(`Printer: ${printerNameArg || 'Default'}`);

    // Create test receipt
    printer.alignCenter();
    printer.setTextDoubleHeight();
    printer.setTextDoubleWidth();
    printer.println('TEST RECEIPT');
    printer.setTextNormal();
    printer.drawLine();
    
    printer.alignLeft();
    printer.println('This is a test print');
    printer.println('from thermal-printer-script');
    printer.println('');
    
    printer.println(`Date: ${new Date().toLocaleString()}`);
    printer.println(`Printer: ${printerNameArg || 'Default'}`);
    printer.println('');
    
    printer.drawLine();
    printer.alignCenter();
    printer.println('Thank you!');
    printer.cut();
    
    // Execute print
    await printer.execute();
    
    console.log('✓ Print job sent successfully!');
    return { success: true, message: 'Print job sent' };
    
  } catch (error) {
    console.error('✗ Print failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure printer is turned on and connected');
    console.error('2. Check printer name is correct (case-sensitive)');
    console.error('3. Try running as administrator');
    console.error('4. Check Windows Print Queue for errors');
    throw error;
  }
}

/**
 * Print custom receipt from JSON data
 */
async function printReceipt(receiptData, printerNameArg = null) {
  try {
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: 'printer',
      characterSet: CharacterSet.PC852_LATIN2,
      removeSpecialCharacters: false,
      lineCharacter: '-',
      breakLine: BreakLine.WORD,
      options: {
        timeout: 5000,
      },
    });

    if (printerNameArg) {
      printer.printer = printerNameArg;
    }

    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      throw new Error(`Printer "${printerNameArg || 'default'}" is not connected`);
    }

    // Header
    printer.alignCenter();
    printer.setTextDoubleHeight();
    printer.println(receiptData.header || 'RESTAURANT POS');
    printer.setTextNormal();
    printer.drawLine();

    // Store info
    if (receiptData.storeName) {
      printer.alignCenter();
      printer.println(receiptData.storeName);
    }
    if (receiptData.address) {
      printer.alignCenter();
      printer.println(receiptData.address);
    }
    if (receiptData.phone) {
      printer.alignCenter();
      printer.println(`Tel: ${receiptData.phone}`);
    }
    printer.drawLine();

    // Order info
    printer.alignLeft();
    if (receiptData.orderNumber) {
      printer.println(`Order #: ${receiptData.orderNumber}`);
    }
    if (receiptData.tableNumber) {
      printer.println(`Table: ${receiptData.tableNumber}`);
    }
    printer.println(`Date: ${receiptData.date || new Date().toLocaleString()}`);
    printer.drawLine();

    // Items
    if (receiptData.items && receiptData.items.length > 0) {
      receiptData.items.forEach(item => {
        printer.println(`${item.name || item.item}`);
        if (item.quantity) {
          printer.println(`  Qty: ${item.quantity} x ${item.price || item.amount || '0.00'}`);
        }
        if (item.total) {
          printer.println(`  Total: ${item.total}`);
        }
        printer.println('');
      });
    }

    // Totals
    printer.drawLine();
    if (receiptData.subtotal) {
      printer.println(`Subtotal: ${receiptData.subtotal}`);
    }
    if (receiptData.tax) {
      printer.println(`Tax: ${receiptData.tax}`);
    }
    if (receiptData.total) {
      printer.setTextDoubleHeight();
      printer.println(`TOTAL: ${receiptData.total}`);
      printer.setTextNormal();
    }

    // Footer
    printer.drawLine();
    printer.alignCenter();
    printer.println('Thank you for your visit!');
    printer.cut();

    await printer.execute();
    console.log('✓ Receipt printed successfully!');
    return { success: true, message: 'Receipt printed' };

  } catch (error) {
    console.error('✗ Print failed:', error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Thermal Printer Script');
  console.log('======================\n');

  try {
    switch (command.toLowerCase()) {
      case 'list':
        await listPrinters();
        break;

      case 'test':
        await printTest(printerName);
        break;

      case 'receipt':
        // For custom receipt, you can pass JSON file path
        const fs = require('fs');
        const path = require('path');
        const receiptFile = args[1] || 'receipt.json';
        
        if (fs.existsSync(receiptFile)) {
          const receiptData = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
          await printReceipt(receiptData, args[2] || null);
        } else {
          console.error(`Receipt file not found: ${receiptFile}`);
          console.log('\nCreate a receipt.json file with this structure:');
          console.log(JSON.stringify({
            header: 'RESTAURANT POS',
            storeName: 'My Restaurant',
            address: '123 Main St',
            phone: '123-456-7890',
            orderNumber: '001',
            tableNumber: '5',
            date: new Date().toLocaleString(),
            items: [
              { name: 'Item 1', quantity: 2, price: '10.00', total: '20.00' }
            ],
            subtotal: '20.00',
            tax: '2.00',
            total: '22.00'
          }, null, 2));
        }
        break;

      default:
        // If first arg looks like a printer name, print test
        if (command && !command.match(/^(list|test|receipt)$/i)) {
          await printTest(command);
        } else {
          await printTest();
        }
    }
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { printTest, printReceipt, listPrinters };

