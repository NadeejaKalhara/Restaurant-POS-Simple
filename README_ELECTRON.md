# Restaurant POS - Electron Application

This is a complete Electron application that bundles the React POS system with integrated thermal printing.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all dependencies including Electron and electron-builder.

### 2. Development Mode

Run the app in development mode:

```bash
npm run dev:electron
```

This will:
- Start Vite dev server on port 5173
- Wait for server to be ready
- Launch Electron window

### 3. Build for Production

```bash
# Build React app
npm run build

# Build Electron app (creates installer)
npm run build:electron
```

The built app will be in the `release/` folder.

## 📦 What's Included

- ✅ **React POS System** - Full-featured restaurant POS
- ✅ **Thermal Printing** - Direct printer access via node-thermal-printer
- ✅ **No QZ Tray Needed** - Everything bundled in Electron
- ✅ **Single Executable** - Easy distribution
- ✅ **Cross-Platform** - Windows, macOS, Linux

## 🏗️ Architecture

```
Electron App
├── Main Process (electron/main.js)
│   ├── Manages BrowserWindow
│   ├── IPC handlers for printing
│   └── Direct printer access
│
├── Renderer Process (React App)
│   ├── Uses electronPrint.js
│   └── Communicates via IPC
│
└── Thermal Printer Script
    └── Integrated printing functions
```

## 🖨️ Printing

The app uses Electron IPC to communicate between renderer and main process:

1. User clicks print in React app
2. `printReceipt()` calls Electron IPC
3. Main process receives IPC call
4. Direct print via `node-thermal-printer`
5. Response sent back via IPC

**No HTTP server needed!** Everything runs in-process.

## 📝 Scripts

- `npm run dev:electron` - Run in development mode
- `npm run electron` - Run Electron (after build)
- `npm run build` - Build React app
- `npm run build:electron` - Build Electron installer

## 🔧 Configuration

### Change App Name

Edit `package.json`:
```json
{
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

## 📁 File Structure

```
resturantPOS/
├── electron/
│   ├── main.js          # Main process
│   └── preload.js       # IPC bridge
├── src/
│   └── utils/
│       ├── print.js           # Unified print utility
│       ├── electronPrint.js   # Electron IPC print
│       ├── localPrint.js      # Local server print (fallback)
│       └── qzPrint.js         # QZ Tray print (fallback)
├── thermal-printer-script/
│   └── print.js         # Printing functions
└── package.json
```

## 🎯 Benefits

- **Standalone** - No browser, no QZ Tray, no separate server
- **Native** - Better performance, OS integration
- **Offline** - Works without internet
- **Easy Distribution** - Single installer file
- **Direct Printing** - No HTTP overhead

## 🐛 Troubleshooting

### Electron won't start
- Check Node.js version (v16+)
- Run `npm install` again
- Check port 5173 is available

### Printing doesn't work
- Check printer is online
- Verify printer name (case-sensitive)
- Check Windows Print Queue
- Run as Administrator if needed

### Build fails
- Make sure `npm run build` succeeds first
- Check electron-builder is installed
- Verify all dependencies installed

## 📦 Distribution

After building, find the installer in `release/`:
- **Windows**: `Restaurant POS Setup.exe`
- **macOS**: `Restaurant POS.dmg`
- **Linux**: `Restaurant POS.AppImage`

Distribute the installer file to users!

## 🔐 Security

- Context isolation enabled
- Node integration disabled in renderer
- IPC communication via preload script
- No direct access to Node.js from renderer

## 📄 License

Same as main project.

