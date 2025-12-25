# QZ Tray Certificate Generator and Installer - All in One
# Run as Administrator: Right-click PowerShell -> Run as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QZ Tray Certificate Generator & Installer" -ForegroundColor Cyan
Write-Host "All-in-One Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Set certificate details
# Ensure Desktop directory exists, create if needed
try {
    $desktopPath = [Environment]::GetFolderPath("Desktop")
} catch {
    $desktopPath = "$env:USERPROFILE\Desktop"
}

# Create directory if it doesn't exist
if (-not (Test-Path $desktopPath)) {
    try {
        New-Item -ItemType Directory -Path $desktopPath -Force | Out-Null
    } catch {
        # Fallback to Documents if Desktop can't be created
        $desktopPath = [Environment]::GetFolderPath("MyDocuments")
        Write-Host "Using Documents folder instead of Desktop" -ForegroundColor Yellow
    }
}

$certFile = Join-Path $desktopPath "qz-certificate.p12"
$certPassword = ""

Write-Host "Certificate will be saved to: $certFile" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Generating QZ Tray Certificate..." -ForegroundColor Green
Write-Host ""

# Generate certificate using PowerShell (self-signed)
try {
    Write-Host "Creating self-signed certificate..." -ForegroundColor Yellow
    
    $cert = New-SelfSignedCertificate `
        -Subject "CN=QZ Tray" `
        -KeyAlgorithm RSA `
        -KeyLength 2048 `
        -CertStoreLocation "Cert:\CurrentUser\My" `
        -KeyExportPolicy Exportable `
        -NotAfter (Get-Date).AddYears(10) `
        -FriendlyName "QZ Tray Certificate"
    
    Write-Host "Certificate generated successfully!" -ForegroundColor Green
    Write-Host "Certificate Thumbprint: $($cert.Thumbprint)" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Exporting certificate to file..." -ForegroundColor Yellow
    
    # Ensure directory exists before exporting
    $certDir = Split-Path -Parent $certFile
    if (-not (Test-Path $certDir)) {
        Write-Host "Creating directory: $certDir" -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $certDir -Force | Out-Null
    }
    
    # Normalize the path
    $certFile = [System.IO.Path]::GetFullPath($certFile)
    
    # Export certificate to PFX file
    # PFX files require a password, so use a minimal default password
    if ([string]::IsNullOrWhiteSpace($certPassword)) {
        $certPassword = "qz"  # Default minimal password
    }
    $securePassword = ConvertTo-SecureString -String $certPassword -Force -AsPlainText
    
    try {
        Export-PfxCertificate -Cert $cert -FilePath $certFile -Password $securePassword | Out-Null
        Write-Host "Certificate exported to: $certFile" -ForegroundColor Green
    } catch {
        Write-Host "Error exporting certificate: $_" -ForegroundColor Red
        Write-Host "Trying alternative export method..." -ForegroundColor Yellow
        
        # Alternative: Export to current directory
        $altCertFile = Join-Path $PSScriptRoot "qz-certificate.p12"
        if ($PSScriptRoot) {
            Export-PfxCertificate -Cert $cert -FilePath $altCertFile -Password $securePassword | Out-Null
            Write-Host "Certificate exported to: $altCertFile" -ForegroundColor Green
            $certFile = $altCertFile
        } else {
            throw "Could not export certificate to any location"
        }
    }
    
    Write-Host ""
    
} catch {
    Write-Host "Error generating certificate: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "Step 2: Installing certificate to Trusted Root..." -ForegroundColor Green
Write-Host ""

# Install certificate to Trusted Root Certification Authorities
try {
    Write-Host "Installing to Trusted Root Certification Authorities..." -ForegroundColor Yellow
    
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
    $store.Open("ReadWrite")
    
    $myStore = New-Object System.Security.Cryptography.X509Certificates.X509Store("My", "CurrentUser")
    $myStore.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadOnly)
    $cert = $myStore.Certificates | Where-Object { $_.FriendlyName -eq "QZ Tray Certificate" } | Select-Object -First 1
    
    if ($cert) {
        $store.Add($cert)
        Write-Host "Certificate installed successfully!" -ForegroundColor Green
    } else {
        throw "Certificate not found in store"
    }
    
    $myStore.Close()
    $store.Close()
    
    Write-Host "Certificate installed to: Trusted Root Certification Authorities" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "Error installing certificate: $_" -ForegroundColor Red
    Write-Host "Trying alternative method with certutil..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Try importing with password using PowerShell Import-PfxCertificate
        Write-Host "Attempting to import certificate with password..." -ForegroundColor Yellow
        $securePassword = ConvertTo-SecureString -String "qz" -Force -AsPlainText
        Import-PfxCertificate -FilePath $certFile -CertStoreLocation "Cert:\LocalMachine\Root" -Password $securePassword | Out-Null
        
        Write-Host "Certificate installed using Import-PfxCertificate!" -ForegroundColor Green
    } catch {
        Write-Host "Error with certutil: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install manually:" -ForegroundColor Yellow
        Write-Host "1. Double-click: $certFile" -ForegroundColor White
        Write-Host "2. When asked for password, enter: qz" -ForegroundColor Cyan
        Write-Host "3. Click 'Install Certificate'" -ForegroundColor White
        Write-Host "4. Select 'Local Machine'" -ForegroundColor White
        Write-Host "5. Choose 'Trusted Root Certification Authorities'" -ForegroundColor White
        Write-Host ""
        Write-Host "Certificate Password: qz" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
}

Write-Host "Step 3: Verifying installation..." -ForegroundColor Green
Write-Host ""

# Verify certificate is installed
$rootStore = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
$rootStore.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadOnly)
$installedCert = $rootStore.Certificates | Where-Object { $_.Subject -like "*QZ Tray*" -or $_.FriendlyName -like "*QZ Tray*" } | Select-Object -First 1
$rootStore.Close()

if ($installedCert) {
    Write-Host "Certificate verified in Trusted Root store" -ForegroundColor Green
    Write-Host "  Subject: $($installedCert.Subject)" -ForegroundColor Cyan
    Write-Host "  Thumbprint: $($installedCert.Thumbprint)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Warning: Certificate not found in Trusted Root store" -ForegroundColor Yellow
    Write-Host "You may need to restart QZ Tray and browser" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Certificate Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart QZ Tray (if running)" -ForegroundColor White
Write-Host "2. Restart your browser" -ForegroundColor White
Write-Host "3. Test printing from https://shan.cynex.lk/" -ForegroundColor White
Write-Host ""
Write-Host "Certificate file saved to: $certFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

