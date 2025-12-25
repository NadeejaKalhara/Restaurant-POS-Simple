# Testing QZ Tray Without a Physical Printer

Since your setup is working (you saw the successful print!), here are options for testing without a physical printer:

## ✅ Your Setup is Already Working!

The logs showed:
- ✅ `Valid signature from QZ Tray Demo Cert` - Certificate signing works
- ✅ `Found 7 printers` - Printers detected
- ✅ It actually printed - Everything is functional!

## Options for Testing Without Physical Printer

### Option 1: Use Microsoft Print to PDF (Windows)

1. **Install Microsoft Print to PDF** (usually pre-installed on Windows)
   - Go to Settings > Devices > Printers & scanners
   - Click "Add a printer or scanner"
   - Select "Microsoft Print to PDF"

2. **Test with PDF printer**:
   - When printing, select "Microsoft Print to PDF" as the printer
   - The receipt will be saved as a PDF file
   - You can verify the formatting and content

### Option 2: Use a Virtual Printer

**Recommended Virtual Printers:**
- **PDF24** (Free): https://www.pdf24.org/
- **CutePDF** (Free): https://www.cutepdf.com/
- **doPDF** (Free): https://www.dopdf.com/

These create PDF files instead of printing to paper.

### Option 3: Check Available Printers

You can see all available printers in QZ Tray:
1. Right-click QZ Tray icon in system tray
2. Select "Printer List"
3. See all 7 detected printers

### Option 4: Use Browser Console to Test

Open browser console (F12) and run:

```javascript
// List all printers
import { listPrinters } from './utils/testPrint';
listPrinters().then(result => {
  console.log('Available printers:', result.printers);
});

// Test print to PDF printer
import { testPrint } from './utils/testPrint';
testPrint('Microsoft Print to PDF').then(result => {
  console.log('Print result:', result);
});
```

## What You Can Verify

Even without a physical printer, you can verify:

1. ✅ **Certificate signing works** - Already confirmed by logs
2. ✅ **Printers are detected** - 7 printers found
3. ✅ **Printing works** - You saw it print
4. ✅ **Server signing works** - No signature errors

## For Production Deployment

When you deploy to production terminals:

1. **Each terminal needs**:
   - QZ Tray installed
   - Certificate files in `server\qz-keys\`
   - Access to your server (`https://shan.cynex.lk`)

2. **Physical printer setup**:
   - Connect XP k200L printer via USB
   - Install printer drivers
   - QZ Tray will auto-detect it
   - Your code will automatically select it (priority for "k200l" in name)

## Quick Test Commands

### In Browser Console:

```javascript
// Check QZ Tray status
import { isQZAvailable, connectQZ } from './utils/qzPrint';
isQZAvailable(); // Should return true
connectQZ(); // Should connect successfully

// List printers
import { getPrinter } from './utils/qzPrint';
getPrinter().then(printer => {
  console.log('Selected printer:', printer);
});
```

## Summary

**Your setup is complete and working!** 

- ✅ Certificate signing configured
- ✅ Server-side signing working
- ✅ Printers detected
- ✅ Printing successful

For additional terminals, just:
1. Copy certificate files
2. Run `setup-additional-terminal.ps1`
3. Install QZ Tray
4. Connect printer

You're all set! 🎉

