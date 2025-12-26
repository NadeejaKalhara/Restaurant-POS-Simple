# QZ Tray Certificate Generator and Installer
# Run as Administrator: Right-click PowerShell -> Run as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QZ Tray Certificate Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Set certificate details
$certFile = "$env:USERPROFILE\Desktop\qz-certificate.p12"
$certPassword = ""

Write-Host "Step 1: Generating QZ Tray Certificate..." -ForegroundColor Green

# Generate certificate using PowerShell (self-signed)
try {
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
    
    # Export certificate to PFX file
    $securePassword = ConvertTo-SecureString -String $certPassword -Force -AsPlainText
    Export-PfxCertificate -Cert $cert -FilePath $certFile -Password $securePassword | Out-Null
    
    Write-Host "Certificate exported to: $certFile" -ForegroundColor Green
    
} catch {
    Write-Host "Error generating certificate: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Installing certificate to Trusted Root..." -ForegroundColor Green

# Install certificate to Trusted Root Certification Authorities
try {
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
    $store.Open("ReadWrite")
    
    $myStore = New-Object System.Security.Cryptography.X509Certificates.X509Store("My", "CurrentUser")
    $myStore.Open("Read")
    $cert = $myStore.Certificates | Where-Object { $_.FriendlyName -eq "QZ Tray Certificate" } | Select-Object -First 1
    $store.Add($cert)
    $myStore.Close()
    $store.Close()
    
    Write-Host "Certificate installed successfully!" -ForegroundColor Green
    Write-Host "Certificate installed to: Trusted Root Certification Authorities" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error installing certificate: $_" -ForegroundColor Red
    Write-Host "Trying alternative method with certutil..." -ForegroundColor Yellow
    
    try {
        certutil -importPFX $certFile
        Write-Host "Certificate installed using certutil!" -ForegroundColor Green
    } catch {
        Write-Host "Error with certutil: $_" -ForegroundColor Red
        Write-Host "Please install manually by double-clicking: $certFile" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Step 3: Verifying installation..." -ForegroundColor Green

# Verify certificate is installed
$rootStore = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
$rootStore.Open("Read")
$installedCert = $rootStore.Certificates | Where-Object { $_.Subject -like "*QZ Tray*" -or $_.FriendlyName -like "*QZ Tray*" } | Select-Object -First 1
$rootStore.Close()

if ($installedCert) {
    Write-Host "Certificate verified in Trusted Root store" -ForegroundColor Green
    Write-Host "  Subject: $($installedCert.Subject)" -ForegroundColor Cyan
    Write-Host "  Thumbprint: $($installedCert.Thumbprint)" -ForegroundColor Cyan
} else {
    Write-Host "Warning: Certificate not found in Trusted Root store" -ForegroundColor Yellow
}

Write-Host ""
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


