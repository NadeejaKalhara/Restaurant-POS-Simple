# Thermal Printer Script & Server

Standalone Node.js script and server for printing receipts to thermal printers using `node-thermal-printer`.

**Two ways to use:**
1. **Command Line** - Direct printing via CLI
2. **Server Mode** - HTTP API server for web app integration (recommended)

## Installation

1. Extract this folder
2. Open terminal/command prompt in this folder
3. Run:
   ```bash
   npm install
   ```

## Server Mode (Recommended for Web Apps)

Start the HTTP server to allow your web app to print:

```bash
npm start
```
or
```bash
node server.js
```
or double-click `start-server.bat` on Windows

The server will run on **http://localhost:3001**

### Server Endpoints:

- `GET /health` - Check server status
- `GET /printers` - Get printer info  
- `POST /print/test` - Print test receipt
  ```json
  { "printerName": "XP-76C" }
  ```
- `POST /print/receipt` - Print structured receipt
- `POST /print/html` - Print HTML content

Your web app can now call these endpoints instead of using QZ Tray!

## Command Line Usage

### Print Test Receipt
```bash
node print.js
```
or
```bash
node print.js test
```

### Print to Specific Printer
```bash
node print.js test "Printer Name"
```

Example:
```bash
node print.js test "XP-76C"
```

### List Printers
```bash
node print.js list
```

### Print Custom Receipt

1. Create a `receipt.json` file:
```json
{
  "header": "RESTAURANT POS",
  "storeName": "My Restaurant",
  "address": "123 Main St",
  "phone": "123-456-7890",
  "orderNumber": "001",
  "tableNumber": "5",
  "date": "12/26/2025, 7:00 PM",
  "items": [
    {
      "name": "Chicken Curry",
      "quantity": 2,
      "price": "500.00",
      "total": "1000.00"
    },
    {
      "name": "Rice",
      "quantity": 2,
      "price": "100.00",
      "total": "200.00"
    }
  ],
  "subtotal": "1200.00",
  "tax": "120.00",
  "total": "1320.00"
}
```

2. Print it:
```bash
node print.js receipt receipt.json "Printer Name"
```

## Finding Your Printer Name

1. Open **Windows Settings** → **Printers & scanners**
2. Find your thermal printer
3. Note the **exact name** (case-sensitive)
4. Use that name in the command

## Supported Printers

- **Epson** thermal printers (default)
- **Star** thermal printers (change type in code)
- Most ESC/POS compatible printers

## Troubleshooting

### Printer Not Found
- Make sure printer is turned on and connected
- Check printer name is exact (case-sensitive)
- Try running as administrator

### Print Job Fails
- Check Windows Print Queue for errors
- Verify printer driver is installed
- Try printing from Notepad to test printer

### Permission Errors
- Run command prompt as Administrator
- Check Windows Firewall settings

## Printer Types

If you have a **Star** printer instead of Epson, edit `print.js` and change:
```javascript
type: PrinterTypes.EPSON,
```
to:
```javascript
type: PrinterTypes.STAR,
```

## Integration with POS System

You can use this script from your POS system by:

1. **Calling from Node.js backend:**
```javascript
const { printReceipt } = require('./thermal-printer-script/print.js');
await printReceipt(receiptData, 'XP-76C');
```

2. **Calling from command line:**
```javascript
const { exec } = require('child_process');
exec(`node thermal-printer-script/print.js receipt receipt.json "XP-76C"`);
```

3. **Using as API endpoint:**
Create an Express route that calls the print functions.

## Files

- `print.js` - Main printing script
- `package.json` - Dependencies
- `README.md` - This file
- `receipt.json` - Example receipt data (create your own)

## Notes

- This script works independently of QZ Tray
- No browser or web server required
- Direct printer communication via Node.js
- Works on Windows, macOS, and Linux

