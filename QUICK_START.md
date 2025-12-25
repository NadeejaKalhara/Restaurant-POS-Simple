# Quick Start Guide

## Entry Files to Run

### 1. **First Time Setup (Main Terminal)**
   ```bash
   setup-qz-signing.bat
   ```
   - Downloads QZ Tray certificates
   - Sets up certificate signing
   - Configures App.jsx automatically

### 2. **Install Certificate Trust (Fixes "Untrusted Website" Error)**
   ```bash
   install-qz-cert-trust.bat
   ```
   - **Run as Administrator** (Right-click → Run as Administrator)
   - Installs certificate to Windows Trusted Root
   - Fixes "Untrusted Website" and "Invalid crt" errors
   - **Required on each terminal/PC**

### 3. **Additional Terminals**
   ```bash
   setup-additional-terminal.bat
   ```
   - Downloads certificates automatically
   - Sets up for new terminal/PC
   - **Then run step 2** to install certificate trust

### 4. **Run Application**
   ```bash
   npm run dev
   ```
   - Starts server + client
   - Opens at http://localhost:5173

### 5. **Build Installer (Optional)**
   ```bash
   build-installer.bat
   ```
   - Creates Windows installer

---

**Quick Setup:**
1. Run `setup-qz-signing.bat`
2. Run `install-qz-cert-trust.bat` **as Administrator**
3. Run `npm run dev`
