# Quick Start - Building the Installer

## For Developers

### Build the Installer

**Windows (Batch):**
```bash
build-installer.bat
```

**Windows (PowerShell):**
```powershell
.\build-installer.ps1
```

**Manual:**
```bash
cd installer
npm install
npm run build:win
```

### Find the Installer

After building, the installer executable will be in:
```
installer/dist/Restaurant POS Installer Setup.exe
```

## For End Users

1. **Run** `Restaurant POS Installer Setup.exe`
2. **Follow** the on-screen instructions
3. **Start** the app using the desktop shortcut

That's it! 🎉

## What Gets Installed

- ✅ All npm dependencies
- ✅ Configuration file (.env)
- ✅ Desktop shortcut
- ✅ Automatic prerequisite checks

## Notes

- **Node.js 18+** is required (installer will prompt if missing)
- **MongoDB** is optional (can use MongoDB Atlas cloud)
- **Printing works** without QZ certificate setup!

