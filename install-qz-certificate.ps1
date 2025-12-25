# QZ Tray Certificate Installer - PowerShell Script
# Run this as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QZ Tray Certificate Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for admin privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Step 1: Checking for certificate file..." -ForegroundColor Green
$certFile = "$env:USERPROFILE\Desktop\qz-certificate.p12"

if (-not (Test-Path $certFile)) {
    Write-Host "Certificate file not found: $certFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please generate the certificate first using:" -ForegroundColor Yellow
    Write-Host "  1. QZ Tray GUI (Options > Security > Generate Certificate)" -ForegroundColor White
    Write-Host "  2. Or run: .\generate-qz-cert.ps1" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host "Certificate file found: $certFile" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Installing certificate to Trusted Root..." -ForegroundColor Green
Write-Host ""

# Install certificate using certutil
try {
    certutil -addstore -f "Root" $certFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Certificate installed successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Restart QZ Tray" -ForegroundColor White
        Write-Host "2. Restart your browser" -ForegroundColor White
        Write-Host "3. Test printing from https://shan.cynex.lk/" -ForegroundColor White
        Write-Host ""
    } else {
        throw "certutil failed"
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to install certificate" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try installing manually:" -ForegroundColor Yellow
    Write-Host "1. Double-click the certificate file: $certFile" -ForegroundColor White
    Write-Host "2. Click 'Install Certificate'" -ForegroundColor White
    Write-Host "3. Select 'Local Machine'" -ForegroundColor White
    Write-Host "4. Choose 'Trusted Root Certification Authorities'" -ForegroundColor White
    Write-Host ""
}

pause

