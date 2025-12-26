# Generate QZ Tray Certificate via Command Line

Quick guide to generate and install QZ Tray certificate using command line tools.

---

## 🚀 Quick Method (Recommended)

### Option 1: Run the Batch File (Easiest)

1. **Double-click:** `run-cert-generator.bat`
2. **Click "Yes"** when Windows asks for administrator permission
3. **Wait for completion** - certificate will be generated and installed automatically

---

### Option 2: Run PowerShell Script Manually

1. **Right-click** `generate-qz-cert.ps1`
2. Select **"Run with PowerShell"** → **"Yes"** to admin prompt
3. Or open PowerShell as Administrator and run:
   ```powershell
   cd C:\Users\elkal\resturantPOS
   .\generate-qz-cert.ps1
   ```

---

## 📋 Manual Command Line Method

### Step 1: Generate Certificate

Open **PowerShell as Administrator** and run:

```powershell
# Generate self-signed certificate
$cert = New-SelfSignedCertificate `
    -Subject "CN=QZ Tray" `
    -KeyAlgorithm RSA `
    -KeyLength 2048 `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -KeyExportPolicy Exportable `
    -NotAfter (Get-Date).AddYears(10) `
    -FriendlyName "QZ Tray Certificate"

# Export to PFX file
$certFile = "$env:USERPROFILE\Desktop\qz-certificate.p12"
$securePassword = ConvertTo-SecureString -String "" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $certFile -Password $securePassword
```

### Step 2: Install Certificate

```powershell
# Install to Trusted Root
$store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
$store.Open("ReadWrite")
$myStore = New-Object System.Security.Cryptography.X509Certificates.X509Store("My", "CurrentUser")
$myStore.Open("Read")
$cert = $myStore.Certificates | Where-Object { $_.FriendlyName -eq "QZ Tray Certificate" } | Select-Object -First 1
$store.Add($cert)
$myStore.Close()
$store.Close()
Write-Host "Certificate installed successfully!"
```

### Step 3: Verify Installation

```powershell
# Check if certificate is installed
$rootStore = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
$rootStore.Open("Read")
$installedCert = $rootStore.Certificates | Where-Object { $_.Subject -like "*QZ Tray*" } | Select-Object -First 1
if ($installedCert) {
    Write-Host "✓ Certificate found: $($installedCert.Subject)"
} else {
    Write-Host "✗ Certificate not found"
}
$rootStore.Close()
```

---

## 🔧 Alternative: Using certutil

If PowerShell method doesn't work, use certutil:

### Generate Certificate (requires OpenSSL or existing cert)

```cmd
REM If you have an existing certificate file
certutil -importPFX "C:\path\to\certificate.p12"
```

### Install Certificate

```cmd
REM Install to Trusted Root store
certutil -addstore -f "Root" "%USERPROFILE%\Desktop\qz-certificate.p12"
```

---

## ✅ Verification

After installation, verify the certificate:

```powershell
# List all QZ Tray certificates
Get-ChildItem Cert:\LocalMachine\Root | Where-Object { $_.Subject -like "*QZ Tray*" } | Format-List Subject, Thumbprint, FriendlyName
```

---

## 📝 Files Created

- `generate-qz-cert.ps1` - PowerShell script (main generator)
- `run-cert-generator.bat` - Batch file to run with admin elevation
- `install-qz-certificate.bat` - Installer for existing certificate
- `qz-certificate.p12` - Generated certificate file (saved to Desktop)

---

## 🆘 Troubleshooting

### "Access Denied" Error
- **Solution:** Run PowerShell as Administrator
- Right-click PowerShell → "Run as Administrator"

### "Execution Policy" Error
- **Solution:** Run with bypass:
  ```powershell
  powershell -ExecutionPolicy Bypass -File generate-qz-cert.ps1
  ```

### Certificate Not Found After Installation
- **Solution:** Restart QZ Tray and browser
- Or manually install: Double-click `qz-certificate.p12` → Install to Trusted Root

---

## 🎯 Next Steps

After certificate is installed:

1. ✅ Restart QZ Tray
2. ✅ Restart your browser  
3. ✅ Test printing from https://shan.cynex.lk/
4. ✅ "Allow" button should work now!

---

**That's it! Certificate is now generated and installed via command line.** 🎉



