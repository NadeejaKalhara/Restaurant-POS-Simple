/**
 * Thermal Printer Server
 * Express server that handles print requests from the POS app
 * Runs on localhost:3001 (or specified port)
 */

const express = require('express');
const cors = require('cors');
const { printTest, printReceipt } = require('./print');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'thermal-printer-server',
    timestamp: new Date().toISOString()
  });
});

// List available printers (placeholder - node-thermal-printer doesn't have list function)
app.get('/printers', async (req, res) => {
  try {
    // Return message about finding printer name
    res.json({
      message: 'Use Windows Settings > Printers & scanners to find printer name',
      note: 'Printer name is case-sensitive'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Print test receipt
app.post('/print/test', async (req, res) => {
  try {
    const { printerName } = req.body;
    
    console.log(`[Server] Test print requested for: ${printerName || 'default'}`);
    
    const result = await printTest(printerName || null);
    
    res.json({
      success: true,
      message: 'Test print sent successfully',
      result: result
    });
  } catch (error) {
    console.error('[Server] Test print error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      troubleshooting: [
        '1. Make sure printer is turned on and connected',
        '2. Check printer name is correct (case-sensitive)',
        '3. Try running server as administrator',
        '4. Check Windows Print Queue for errors'
      ]
    });
  }
});

// Print receipt
app.post('/print/receipt', async (req, res) => {
  try {
    const { receiptData, printerName } = req.body;
    
    if (!receiptData) {
      return res.status(400).json({
        success: false,
        error: 'receiptData is required'
      });
    }
    
    console.log(`[Server] Receipt print requested for: ${printerName || 'default'}`);
    console.log(`[Server] Order: ${receiptData.orderNumber || 'N/A'}`);
    
    const result = await printReceipt(receiptData, printerName || null);
    
    res.json({
      success: true,
      message: 'Receipt printed successfully',
      result: result
    });
  } catch (error) {
    console.error('[Server] Receipt print error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      troubleshooting: [
        '1. Make sure printer is turned on and connected',
        '2. Check printer name is correct (case-sensitive)',
        '3. Verify receipt data format is correct',
        '4. Check Windows Print Queue for errors'
      ]
    });
  }
});

// Print HTML content (converts HTML to receipt format)
app.post('/print/html', async (req, res) => {
  try {
    const { htmlContent, printerName, options = {} } = req.body;
    
    if (!htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'htmlContent is required'
      });
    }
    
    console.log(`[Server] HTML print requested for: ${printerName || 'default'}`);
    
    // Parse HTML content to extract receipt data
    // This is a simple parser - you may want to improve it
    const receiptData = parseHtmlToReceipt(htmlContent);
    
    const result = await printReceipt(receiptData, printerName || null);
    
    res.json({
      success: true,
      message: 'Print job sent successfully',
      result: result
    });
  } catch (error) {
    console.error('[Server] HTML print error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Parse HTML content to extract receipt data
 * Extracts structured data from HTML for thermal printing
 */
function parseHtmlToReceipt(htmlContent) {
  const receiptData = {
    header: 'RESTAURANT POS',
    storeName: '',
    address: '',
    phone: '',
    orderNumber: '',
    tableNumber: '',
    date: new Date().toLocaleString(),
    items: [],
    subtotal: '',
    tax: '',
    total: ''
  };
  
  // Extract header/store name
  const headerMatch = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (headerMatch) {
    receiptData.header = headerMatch[1].trim();
  }
  
  // Extract store name
  const storeMatch = htmlContent.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  if (storeMatch) {
    receiptData.storeName = storeMatch[1].trim();
  }
  
  // Extract order number
  const orderMatch = htmlContent.match(/Order\s*#?[:\s]*([^<\n]+)/i);
  if (orderMatch) {
    receiptData.orderNumber = orderMatch[1].trim();
  }
  
  // Extract table number
  const tableMatch = htmlContent.match(/Table[:\s]*([^<\n]+)/i);
  if (tableMatch) {
    receiptData.tableNumber = tableMatch[1].trim();
  }
  
  // Extract items (look for quantity x name pattern)
  const itemPattern = /(\d+)x\s*([^<\n]+)/gi;
  let itemMatch;
  while ((itemMatch = itemPattern.exec(htmlContent)) !== null) {
    receiptData.items.push({
      name: itemMatch[2].trim(),
      quantity: parseInt(itemMatch[1]) || 1,
      price: '0.00',
      total: '0.00'
    });
  }
  
  // Extract totals
  const totalMatch = htmlContent.match(/TOTAL[:\s]*([^<\n]+)/i);
  if (totalMatch) {
    receiptData.total = totalMatch[1].trim().replace(/[^\d.]/g, '');
  }
  
  const subtotalMatch = htmlContent.match(/Subtotal[:\s]*([^<\n]+)/i);
  if (subtotalMatch) {
    receiptData.subtotal = subtotalMatch[1].trim().replace(/[^\d.]/g, '');
  }
  
  // If no items found, try to extract all text lines
  if (receiptData.items.length === 0) {
    const textContent = htmlContent.replace(/<[^>]+>/g, '\n')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^(Order|Table|Date|Total|Subtotal|Tax)/i));
    
    receiptData.items = textContent.slice(0, 20).map(line => ({
      name: line,
      quantity: 1,
      price: '0.00',
      total: '0.00'
    }));
  }
  
  return receiptData;
}

// Start server
app.listen(PORT, () => {
  console.log('========================================');
  console.log('Thermal Printer Server');
  console.log('========================================');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  GET  http://localhost:${PORT}/printers`);
  console.log(`  POST http://localhost:${PORT}/print/test`);
  console.log(`  POST http://localhost:${PORT}/print/receipt`);
  console.log(`  POST http://localhost:${PORT}/print/html`);
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('========================================');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

module.exports = app;

