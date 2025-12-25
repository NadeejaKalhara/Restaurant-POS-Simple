# QZ Tray Setup Guide

This POS system supports QZ Tray for direct printing to receipt printers without browser print dialogs.

## What is QZ Tray?

QZ Tray is a cross-platform application that enables web applications to print directly to local printers, bypassing browser print dialogs. This is essential for POS systems that need to print receipts and KOTs (Kitchen Order Tickets) automatically.

## Installation Steps

### 1. Download and Install QZ Tray

1. Visit [https://qz.io/download/](https://qz.io/download/)
2. Download QZ Tray for your operating system (Windows, macOS, or Linux)
3. Install QZ Tray on the POS terminal/computer
4. Launch QZ Tray (it will run in the system tray)

### 2. Configure QZ Tray

1. Right-click the QZ Tray icon in the system tray
2. Select "Options" or "Settings"
3. Ensure "Allow Remote Connections" is enabled (for network setups)
4. Note: QZ Tray will prompt for certificate permission when first connecting from the web app

### 3. Application Requirements

- **HTTPS Required**: QZ Tray requires HTTPS connection (except for localhost)
- **Localhost**: Works automatically on `localhost` or `127.0.0.1`
- **Production**: Deploy your application with HTTPS enabled

### 4. Printer Setup

#### XP k200L (80mm Thermal Printer)

The system is optimized for the **XP k200L** thermal receipt printer with 80mm paper width:

1. Ensure your XP k200L printer is installed and configured on the system
2. The system will automatically detect and prioritize the XP k200L printer
3. Print formatting is optimized for 80mm thermal paper
4. The printer will be automatically selected if found

#### Other Printers

1. Ensure your receipt printer is installed and configured on the system
2. QZ Tray will automatically detect available printers
3. The system will prefer printers with names containing "receipt", "pos", "thermal", or "xp"
4. If multiple printers are available, the first one will be used by default

#### Setting a Specific Printer

You can programmatically set the default printer name in your code:
```javascript
import { setDefaultPrinter } from '@/utils/qzPrint';
setDefaultPrinter('XP k200L'); // or your printer's exact name
```

## How It Works

1. **Automatic Detection**: The system checks if QZ Tray is available
2. **Connection**: When printing, the app connects to QZ Tray via WebSocket
3. **Printing**: Receipts and KOTs are sent directly to the printer
4. **Fallback**: If QZ Tray is not available, the system falls back to browser print dialog

## Troubleshooting

### QZ Tray Not Connecting

- **Check if QZ Tray is running**: Look for the QZ Tray icon in the system tray
- **Check HTTPS**: Ensure the application is served over HTTPS (or localhost)
- **Check certificate**: Grant permission when QZ Tray prompts for certificate access
- **Check firewall**: Ensure firewall allows QZ Tray connections

### Printer Not Found

- **Verify printer installation**: Check Windows/Mac/Linux printer settings
- **Check printer name**: Ensure printer is not offline or paused
- **Restart QZ Tray**: Sometimes restarting QZ Tray helps detect printers

### Browser Print Fallback

If QZ Tray is not available, the system will automatically use the browser's print dialog. This is a normal fallback behavior and ensures printing always works.

## Benefits

✅ **No Print Dialog**: Direct printing without user interaction  
✅ **Automatic Printing**: Receipts print automatically after checkout  
✅ **POS Features**: Supports receipt printer features (paper size, formatting)  
✅ **Reliable**: Works consistently across different browsers  
✅ **Fallback Support**: Always falls back to browser print if needed  

## Testing

1. Start QZ Tray application
2. Open the POS system in your browser
3. Complete a test order
4. The receipt should print automatically via QZ Tray
5. Check the browser console for any connection messages

## Support

For QZ Tray specific issues, visit:
- [QZ Tray Documentation](https://qz.io/docs/)
- [QZ Tray Support](https://qz.io/support/)

