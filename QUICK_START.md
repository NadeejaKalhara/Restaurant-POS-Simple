# Quick Start - Generate & Install QZ Tray Certificate

## 🚀 Easiest Method (Recommended)

### Option 1: Run Batch File (Auto-elevates to Admin)

1. **Double-click:** `run-cert-generator.bat`
2. Click **"Yes"** when Windows asks for admin permission
3. Done! Certificate is generated and installed automatically

---

### Option 2: Run PowerShell Script

**Right-click** `generate-qz-cert.ps1` → **"Run with PowerShell"** → Click **"Yes"** to admin prompt

**OR** open PowerShell as Administrator and run:
```powershell
cd C:\Users\elkal\resturantPOS
.\generate-qz-cert.ps1
```

---

### Option 3: Install Existing Certificate

If you already have `qz-certificate.p12` file:

**Right-click** `install-qz-certificate.ps1` → **"Run with PowerShell"** → Click **"Yes"** to admin prompt

**OR** open PowerShell as Administrator and run:
```powershell
cd C:\Users\elkal\resturantPOS
.\install-qz-certificate.ps1
```

---

## ⚠️ Important Notes

### Batch Files (.bat) vs PowerShell (.ps1)

- **Batch files (.bat)** must be run in **Command Prompt (cmd.exe)**, NOT PowerShell
- **PowerShell scripts (.ps1)** must be run in **PowerShell**

### How to Run Batch Files:

1. **Double-click** the `.bat` file (easiest)
2. **OR** open Command Prompt and run:
   ```cmd
   cd C:\Users\elkal\resturantPOS
   install-qz-certificate.bat
   ```

### How to Run PowerShell Scripts:

1. **Right-click** `.ps1` file → **"Run with PowerShell"**
2. **OR** open PowerShell as Administrator and run:
   ```powershell
   cd C:\Users\elkal\resturantPOS
   .\generate-qz-cert.ps1
   ```

---

## 📋 Available Scripts

| File | Type | Purpose |
|------|------|---------|
| `run-cert-generator.bat` | Batch | Auto-generate & install (easiest) |
| `generate-qz-cert.ps1` | PowerShell | Generate & install certificate |
| `install-qz-certificate.ps1` | PowerShell | Install existing certificate |
| `install-qz-certificate.bat` | Batch | Install existing certificate |

---

## ✅ After Installation

1. ✅ Restart QZ Tray
2. ✅ Restart your browser
3. ✅ Test printing from https://shan.cynex.lk/
4. ✅ "Allow" button should work now!

---

**Need help?** See `CERTIFICATE_CMD_GUIDE.md` for detailed instructions.

