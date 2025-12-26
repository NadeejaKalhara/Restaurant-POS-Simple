# Electron Application Setup

This Restaurant POS system can run as a standalone Electron application with integrated thermal printing.

## Architecture

```
Electron App
├── Main Process (electron/main.js)
│   ├── Manages BrowserWindow
│   ├── Handles IPC for printing
│   └── Direct printer access via node-thermal-printer
│
├── Renderer Process (Vite React App)
│   ├── Uses electronPrint.js utility
│   └── Communicates via IPC
│
└── Thermal Printer Script
    └── Integrated printing functions
```

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Electron Dependencies

```bash
npm install --save-dev electron electron-builder wait-on
```

### 3. Run in Development Mode

**Option A: Run Electron with Vite dev server**
```bash
npm run dev:electron
```

**Option B: Run separately**
```bash
# Terminal 1: Start Vite dev server
npm run dev:client

# Terminal 2: Start Electron
npm run electron:dev
```

### 4. Build for Production

```bash
# Build React app
npm run build

# Build Electron app
npm run build:electron
```

The built app will be in the `release` folder.

## How It Works

### Print Flow

1. **User clicks print** in React app
2. **Renderer process** calls `printReceipt()` from `src/utils/print.js`
3. **Print utility** detects Electron environment
4. **IPC call** sent to main process via `window.electron.print.html()`
5. **Main process** receives IPC, calls `printReceipt()` from thermal-printer-script
6. **Direct print** to thermal printer via node-thermal-printer
7. **Response** sent back via IPC
8. **UI updates** with success/error

### Benefits

- ✅ **No QZ Tray needed** - Direct printer access
- ✅ **No browser dependencies** - Standalone app
- ✅ **Single executable** - Easy distribution
- ✅ **Native OS integration** - Better performance
- ✅ **Offline capable** - Works without internet

## Building Distribution

### Windows

```bash
npm run build:electron
```

Creates:
- `release/Restaurant POS Setup.exe` - Installer
- `release/win-unpacked/` - Portable app

### macOS

```bash
npm run build:electron
```

Creates:
- `release/Restaurant POS.dmg` - Disk image

### Linux

```bash
npm run build:electron
```

Creates:
- `release/Restaurant POS.AppImage` - AppImage

## Configuration

### Change App Name/ID

Edit `package.json`:
```json
{
  "name": "restaurant-pos-sri-lanka",
  "productName": "Restaurant POS",
  "build": {
    "appId": "com.restaurant.pos"
  }
}
```

### Change Window Size

Edit `electron/main.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1400,
  height: 900,
  // ...
});
```

### Set Default Printer

The app will use printer from settings, or you can set default in code.

## File Structure

```
resturantPOS/
├── electron/
│   ├── main.js          # Main process
│   └── preload.js       # Preload script (IPC bridge)
├── src/
│   └── utils/
│       ├── print.js           # Unified print utility
│       ├── electronPrint.js   # Electron IPC print
│       ├── localPrint.js      # Local server print
│       └── qzPrint.js         # QZ Tray print
├── thermal-printer-script/
│   ├── print.js         # Printing functions
│   └── server.js        # HTTP server (optional)
└── package.json
```

## Troubleshooting

### Electron won't start
- Check Node.js version (v16+ required)
- Run `npm install` again
- Check for port conflicts (5173 for Vite)

### Printing doesn't work
- Check printer is connected and online
- Verify printer name is correct (case-sensitive)
- Check Windows Print Queue for errors
- Run Electron as Administrator if needed

### Build fails
- Make sure `npm run build` succeeds first
- Check electron-builder is installed
- Verify all dependencies are installed

## Distribution

### Create Installer

1. Build the app: `npm run build:electron`
2. Find installer in `release/` folder
3. Distribute the installer file

### Portable Version

Use the unpacked folder from `release/` - no installation needed!

## Notes

- Electron app includes everything - no separate server needed
- Printing works directly via IPC - no HTTP calls
- App can run offline (if backend is also bundled)
- Single executable makes distribution easy

