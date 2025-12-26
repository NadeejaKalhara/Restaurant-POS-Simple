# 🚀 Restaurant POS Installer Guide

## Overview

The Restaurant POS Installer is a user-friendly Windows application that automates the setup process for non-technical users. It checks prerequisites, installs dependencies, and configures the application.

## 📦 Building the Installer

### Quick Build (Windows)

1. **Double-click** `build-installer.bat`
2. Wait for the build to complete
3. Find the installer in `installer/dist/` folder

### Manual Build

1. **Navigate to installer directory:**
   ```bash
   cd installer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the installer:**
   ```bash
   npm run build:win
   ```

4. **Find the installer:**
   The installer executable will be in `installer/dist/` directory.

## 🎯 What the Installer Does

### 1. Prerequisites Check
- ✅ Checks for Node.js 18+ installation
- ✅ Checks for MongoDB installation (optional)
- ✅ Checks for npm installation

### 2. Dependency Installation
- ✅ Installs all npm packages automatically
- ✅ Shows real-time progress
- ✅ Displays installation output

### 3. Configuration
- ✅ Creates `.env` file with default settings
- ✅ Generates secure JWT secret
- ✅ Sets up MongoDB connection string

### 4. Desktop Shortcut
- ✅ Creates "Start Restaurant POS.bat" on desktop
- ✅ Easy one-click startup

## 👥 For End Users

### Installation Steps

1. **Run the installer** (`Restaurant POS Installer Setup.exe`)
2. **Follow the on-screen instructions**
3. The installer will:
   - Check if Node.js is installed (prompts to install if missing)
   - Check if MongoDB is installed (optional - can use cloud)
   - Install all required packages
   - Create configuration file
   - Create desktop shortcut

### After Installation

1. **Start MongoDB** (if using local MongoDB):
   ```bash
   net start MongoDB
   ```

2. **Start the application:**
   - Double-click "Start Restaurant POS.bat" on desktop
   - OR run: `npm start` in the project folder

3. **Access the application:**
   - Open browser: `http://localhost:3000`
   - Register your first admin account
   - Start using the POS system!

## 🔧 Customization

### Adding an Icon

1. Create or download a `.ico` file (256x256 recommended)
2. Replace `installer/assets/icon.ico` with your icon
3. Rebuild the installer

### Modifying Default Configuration

Edit `installer/index.html` and modify the `envData` object:

```javascript
const envData = {
  PORT: '5000',
  MONGODB_URI: 'mongodb://localhost:27017/restaurant-pos',
  JWT_SECRET: secret,
  VITE_API_URL: 'http://localhost:5000/api'
};
```

## 📝 Notes

- **Node.js is required** - Users will be prompted to install if missing
- **MongoDB is optional** - Users can use MongoDB Atlas (cloud) instead
- **Printing works without QZ certificates** - No certificate setup needed!
- The installer creates a `.env` file - users can edit it later if needed

## 🐛 Troubleshooting

### Installer won't build
- Make sure Node.js 18+ is installed
- Run `npm install` in the installer directory first

### Installation fails
- Check that Node.js is properly installed
- Ensure you have write permissions to the project folder
- Check the installer output for specific error messages

### MongoDB connection issues
- Make sure MongoDB service is running: `net start MongoDB`
- Or update `.env` file to use MongoDB Atlas connection string

## 📄 Files Structure

```
installer/
├── main.js              # Electron main process
├── index.html           # Installer GUI
├── package.json         # Installer dependencies
├── assets/
│   └── icon.ico        # Installer icon
└── dist/               # Built installer (after build)
```

---

**Need help?** Check the main README.md or open an issue on GitHub.


