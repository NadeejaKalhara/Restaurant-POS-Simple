# Install QZ Tray Certificate with Password
# Run as Administrator

param(
    [string]$CertFile = "$env:USERPROFILE\OneDrive\Desktop\qz-certificate.p12",
    [string]$Password = "qz"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QZ Tray Certificate Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Check if certificate file exists
if (-not (Test-Path $CertFile)) {
    Write-Host "Certificate file not found: $CertFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please specify the correct path:" -ForegroundColor Yellow
    Write-Host ".\install-cert-with-password.ps1 -CertFile 'C:\path\to\certificate.p12'" -ForegroundColor White
    exit 1
}

Write-Host "Installing certificate..." -ForegroundColor Green
Write-Host "Certificate file: $CertFile" -ForegroundColor Cyan
Write-Host "Password: $Password" -ForegroundColor Cyan
Write-Host ""

try {
    $securePassword = ConvertTo-SecureString -String $Password -Force -AsPlainText
    Import-PfxCertificate -FilePath $CertFile -CertStoreLocation "Cert:\LocalMachine\Root" -Password $securePassword | Out-Null
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Certificate installed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Restart QZ Tray" -ForegroundColor White
    Write-Host "2. Restart your browser" -ForegroundColor White
    Write-Host "3. Test printing from https://shan.cynex.lk/" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "Error installing certificate: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try installing manually:" -ForegroundColor Yellow
    Write-Host "1. Double-click: $CertFile" -ForegroundColor White
    Write-Host "2. When asked for password, enter: $Password" -ForegroundColor Cyan
    Write-Host "3. Click 'Install Certificate'" -ForegroundColor White
    Write-Host "4. Select 'Local Machine'" -ForegroundColor White
    Write-Host "5. Choose 'Trusted Root Certification Authorities'" -ForegroundColor White
    exit 1
}

