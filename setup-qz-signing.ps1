# QZ Tray Certificate Signing Setup Script
# This script sets up server-side certificate signing for QZ Tray

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QZ Tray Certificate Signing Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# Set paths
$defaultCertPath = "C:\Users\elkal\Downloads\QZ Tray Demo Cert"
$qzTrayPath = "C:\Program Files\QZ Tray\demo"
$qzTrayPathX86 = "C:\Program Files (x86)\QZ Tray\demo"
$targetDir = Join-Path $PSScriptRoot "server\qz-keys"

Write-Host "Step 1: Finding QZ Tray certificate files..." -ForegroundColor Green
Write-Host ""

# Find certificate files - check default location first
$demoPath = $null
if (Test-Path $defaultCertPath) {
    $demoPath = $defaultCertPath
    Write-Host "Found certificate files at: $defaultCertPath" -ForegroundColor Green
} elseif (Test-Path $qzTrayPath) {
    $demoPath = $qzTrayPath
    Write-Host "Found QZ Tray at: $qzTrayPath" -ForegroundColor Green
} elseif (Test-Path $qzTrayPathX86) {
    $demoPath = $qzTrayPathX86
    Write-Host "Found QZ Tray at: $qzTrayPathX86" -ForegroundColor Green
} else {
    Write-Host "Certificate files not found in standard locations." -ForegroundColor Yellow
    Write-Host "Default location checked: $defaultCertPath" -ForegroundColor Yellow
    Write-Host "Please enter path to certificate files:" -ForegroundColor Yellow
    $customPath = Read-Host "Path"
    if (Test-Path $customPath) {
        $demoPath = $customPath
    } else {
        Write-Host "Path not found. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Step 2: Checking for certificate files..." -ForegroundColor Green

$certFile = Join-Path $demoPath "digital-certificate.txt"
$keyFile = Join-Path $demoPath "private-key.pem"

if (-not (Test-Path $certFile)) {
    Write-Host "ERROR: digital-certificate.txt not found at: $certFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure QZ Tray is installed and demo folder exists." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $keyFile)) {
    Write-Host "ERROR: private-key.pem not found at: $keyFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure QZ Tray demo folder contains private-key.pem" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found certificate file: $certFile" -ForegroundColor Green
Write-Host "Found private key file: $keyFile" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Creating target directory..." -ForegroundColor Green

# Create target directory
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "Created directory: $targetDir" -ForegroundColor Green
} else {
    Write-Host "Directory already exists: $targetDir" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Step 4: Copying files..." -ForegroundColor Green

# Copy certificate
$targetCert = Join-Path $targetDir "digital-certificate.txt"
Copy-Item -Path $certFile -Destination $targetCert -Force
Write-Host "Copied certificate to: $targetCert" -ForegroundColor Green

# Copy private key
$targetKey = Join-Path $targetDir "private-key.pem"
Copy-Item -Path $keyFile -Destination $targetKey -Force
Write-Host "Copied private key to: $targetKey" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Setting file permissions..." -ForegroundColor Green

# Set permissions (private key should be readable only by owner)
try {
    $acl = Get-Acl $targetKey
    $acl.SetAccessRuleProtection($true, $false)
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        [System.Security.Principal.WindowsIdentity]::GetCurrent().Name,
        "Read",
        "Allow"
    )
    $acl.SetAccessRule($accessRule)
    Set-Acl -Path $targetKey -AclObject $acl
    Write-Host "Set permissions on private key" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not set permissions on private key: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 6: Updating App.jsx configuration..." -ForegroundColor Green

# Update App.jsx to enable signing
$appJsxPath = Join-Path $PSScriptRoot "src\App.jsx"
if (Test-Path $appJsxPath) {
    $content = Get-Content $appJsxPath -Raw
    
    # Check if already configured
    if ($content -match "signatureUrl.*'/api/qz/sign'") {
        Write-Host "App.jsx already configured for certificate signing" -ForegroundColor Cyan
    } else {
        # Update the configuration
        $oldConfig = 'configureQZSigning\(\{[^}]*\}\);'
        $newConfig = @"
configureQZSigning({
  certificateUrl: '/api/qz/certificate',
  signatureUrl: '/api/qz/sign',
  useDemoCert: false
});
"@
        
        if ($content -match $oldConfig) {
            $content = $content -replace $oldConfig, $newConfig
            Set-Content -Path $appJsxPath -Value $content -NoNewline
            Write-Host "Updated App.jsx to enable certificate signing" -ForegroundColor Green
        } else {
            Write-Host "Could not find configureQZSigning in App.jsx. Please update manually." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "App.jsx not found. Please update manually:" -ForegroundColor Yellow
    Write-Host "  configureQZSigning({"
    Write-Host "    certificateUrl: '/api/qz/certificate',"
    Write-Host "    signatureUrl: '/api/qz/sign',"
    Write-Host "    useDemoCert: false"
    Write-Host "  });"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files copied to: $targetDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your server" -ForegroundColor White
Write-Host "2. Restart your browser" -ForegroundColor White
Write-Host "3. Test printing from https://shan.cynex.lk/" -ForegroundColor White
Write-Host ""
Write-Host "Certificate signing is now enabled!" -ForegroundColor Green
Write-Host ""

