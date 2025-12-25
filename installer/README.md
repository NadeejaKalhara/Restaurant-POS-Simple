# Restaurant POS Installer

A simple, user-friendly installer for the Restaurant POS System.

## Features

- ✅ Checks for Node.js installation
- ✅ Checks for MongoDB installation  
- ✅ Automatically installs npm dependencies
- ✅ Creates configuration file (.env)
- ✅ Creates desktop shortcut
- ✅ Beautiful GUI with progress tracking

## Building the Installer

### Prerequisites

- Node.js 18+ installed
- npm installed

### Build Steps

1. **Install installer dependencies:**
   ```bash
   cd installer
   npm install
   ```

2. **Build the installer executable:**
   ```bash
   npm run build:win
   ```

3. **Find the installer:**
   The installer will be created in `installer/dist/` directory as a Windows installer (.exe file).

## Using the Installer

1. **Run the installer executable** (Restaurant POS Installer Setup.exe)
2. **Follow the on-screen instructions**
3. The installer will:
   - Check for Node.js (will prompt to install if missing)
   - Check for MongoDB (optional - can use MongoDB Atlas cloud)
   - Install all npm dependencies
   - Create configuration file
   - Create desktop shortcut

## Development

To run the installer in development mode:

```bash
cd installer
npm start
```

## Notes

- The installer checks for Node.js 18+ (required)
- MongoDB is optional - users can use MongoDB Atlas cloud service
- The installer creates a `.env` file with default settings
- Users can modify the `.env` file after installation if needed

