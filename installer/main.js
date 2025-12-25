const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;

function createWindow() {
  // Try to load icon (ico or png)
  const iconPath = fs.existsSync(path.join(__dirname, 'assets', 'icon.ico'))
    ? path.join(__dirname, 'assets', 'icon.ico')
    : (fs.existsSync(path.join(__dirname, 'assets', 'icon.png'))
      ? path.join(__dirname, 'assets', 'icon.png')
      : null);

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: false,
    title: 'Restaurant POS Installer',
  });

  mainWindow.loadFile('index.html');
  
  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Check Node.js installation
ipcMain.handle('check-node', async () => {
  return new Promise((resolve) => {
    exec('node --version', (error, stdout) => {
      if (error) {
        resolve({ installed: false, version: null });
      } else {
        const version = stdout.trim();
        const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
        resolve({ 
          installed: true, 
          version: version,
          valid: majorVersion >= 18
        });
      }
    });
  });
});

// Check MongoDB installation
ipcMain.handle('check-mongodb', async () => {
  return new Promise((resolve) => {
    exec('mongod --version', (error, stdout) => {
      if (error) {
        // Try checking if MongoDB service is running
        exec('sc query MongoDB', (serviceError) => {
          if (serviceError) {
            resolve({ installed: false, running: false });
          } else {
            resolve({ installed: true, running: true });
          }
        });
      } else {
        resolve({ installed: true, running: true, version: stdout.split('\n')[0] });
      }
    });
  });
});

// Check npm installation
ipcMain.handle('check-npm', async () => {
  return new Promise((resolve) => {
    exec('npm --version', (error, stdout) => {
      if (error) {
        resolve({ installed: false, version: null });
      } else {
        resolve({ installed: true, version: stdout.trim() });
      }
    });
  });
});

// Get project path
ipcMain.handle('get-project-path', () => {
  // If installer is in a subdirectory, get parent
  // Otherwise, assume we're in the project root
  const currentDir = process.cwd();
  const installerDir = __dirname;
  
  // Check if we're in the installer subdirectory
  if (installerDir.includes('installer')) {
    return path.dirname(installerDir);
  }
  
  // Otherwise, use current directory
  return currentDir;
});

// Install dependencies
ipcMain.handle('install-dependencies', async (event, projectPath) => {
  return new Promise((resolve, reject) => {
    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const installProcess = spawn(npmCommand, ['install'], {
      cwd: projectPath,
      shell: true,
    });

    let output = '';
    let errorOutput = '';

    installProcess.stdout.on('data', (data) => {
      output += data.toString();
      event.sender.send('install-output', data.toString());
    });

    installProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      event.sender.send('install-output', data.toString());
    });

    installProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output });
      } else {
        reject({ success: false, error: errorOutput });
      }
    });

    installProcess.on('error', (error) => {
      reject({ success: false, error: error.message });
    });
  });
});

// Generate random secret
ipcMain.handle('generate-secret', async () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
});

// Create .env file
ipcMain.handle('create-env-file', async (event, projectPath, envData) => {
  return new Promise((resolve, reject) => {
    const envPath = path.join(projectPath, '.env');
    const envContent = Object.entries(envData)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFile(envPath, envContent, (error) => {
      if (error) {
        reject({ success: false, error: error.message });
      } else {
        resolve({ success: true });
      }
    });
  });
});

// Check if .env exists
ipcMain.handle('check-env-file', async (event, projectPath) => {
  const envPath = path.join(projectPath, '.env');
  return fs.existsSync(envPath);
});

// Create desktop shortcut script
ipcMain.handle('create-shortcut', async (event, projectPath) => {
  return new Promise((resolve) => {
    const desktopPath = path.join(os.homedir(), 'Desktop');
    
    // Create a batch file that starts the app
    const batchContent = `@echo off
title Restaurant POS System
echo ========================================
echo Restaurant POS System
echo ========================================
echo.
echo Starting server...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the server
echo Server starting on http://localhost:5000
echo Frontend will be available at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

start "" "http://localhost:3000"
cd /d "${projectPath}"
call npm start
`;
    
    const batchPath = path.join(desktopPath, 'Start Restaurant POS.bat');
    
    fs.writeFile(batchPath, batchContent, (error) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true, path: batchPath });
      }
    });
  });
});

