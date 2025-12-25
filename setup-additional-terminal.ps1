# QZ Tray Setup for Additional Terminal/PC
# This script sets up QZ Tray certificate signing on additional terminals
# It copies the certificate files from the main server setup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QZ Tray Setup for Additional Terminal" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set paths
$certZipUrl = "https://supabase.cynex.lk/storage/v1/object/sign/dbackups/QZ%20Tray%20Demo%20Cert.zip?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkYmFja3Vwcy9RWiBUcmF5IERlbW8gQ2VydC56aXAiLCJpYXQiOjE3NjY3MDE1NTksImV4cCI6MTc2OTI5MzU1OX0.k8AgjEzOJ_16SN5TJN-mWXxvTH02KXxVtOOU5KHHDg8"
$defaultCertPath = "C:\Users\elkal\Downloads\QZ Tray Demo Cert"
$tempDir = Join-Path $env:TEMP "qz-cert-setup"
$zipFile = Join-Path $tempDir "QZ-Tray-Demo-Cert.zip"

# Find project root directory (where package.json or server folder exists)
$projectRoot = $PSScriptRoot
$maxDepth = 5
$depth = 0

# Try to find project root by looking for package.json or server directory
while ($depth -lt $maxDepth) {
    if ((Test-Path (Join-Path $projectRoot "package.json")) -or (Test-Path (Join-Path $projectRoot "server"))) {
        break
    }
    $parent = Split-Path $projectRoot -Parent
    if ($parent -eq $projectRoot) {
        break
    }
    $projectRoot = $parent
    $depth++
}

# If still not found, use script directory
if (-not (Test-Path (Join-Path $projectRoot "package.json")) -and -not (Test-Path (Join-Path $projectRoot "server"))) {
    $projectRoot = $PSScriptRoot
}

$targetDir = Join-Path $projectRoot "server\qz-keys"

Write-Host "Step 1: Downloading QZ Tray certificate files..." -ForegroundColor Green
Write-Host ""

# Create temp directory
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
}

# Try to download certificate zip file
$downloadSuccess = $false
$sourceCertPath = $null

try {
    Write-Host "Downloading certificate files from Supabase storage..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $certZipUrl -OutFile $zipFile -UseBasicParsing -ErrorAction Stop
    Write-Host "Download complete: $zipFile" -ForegroundColor Green
    
    # Extract zip file
    Write-Host "Extracting certificate files..." -ForegroundColor Cyan
    $extractPath = Join-Path $tempDir "extracted"
    if (Test-Path $extractPath) {
        Remove-Item -Path $extractPath -Recurse -Force
    }
    Expand-Archive -Path $zipFile -DestinationPath $extractPath -Force
    
    # Find the certificate folder in extracted files
    $certFolder = Get-ChildItem -Path $extractPath -Directory -Filter "*QZ*Tray*Demo*Cert*" | Select-Object -First 1
    if ($certFolder) {
        $sourceCertPath = $certFolder.FullName
        Write-Host "Extracted certificate files to: $sourceCertPath" -ForegroundColor Green
        $downloadSuccess = $true
    } else {
        # Try direct path
        $directPath = Join-Path $extractPath "QZ Tray Demo Cert"
        if (Test-Path $directPath) {
            $sourceCertPath = $directPath
            $downloadSuccess = $true
        }
    }
} catch {
    Write-Host "Download failed: $_" -ForegroundColor Yellow
    Write-Host "Trying local certificate files..." -ForegroundColor Yellow
}

# Fallback to local files if download failed
if (-not $downloadSuccess) {
    Write-Host ""
    Write-Host "Checking local certificate files..." -ForegroundColor Green
    
    if (Test-Path $defaultCertPath) {
        $sourceCertPath = $defaultCertPath
        Write-Host "Found certificate files at: $defaultCertPath" -ForegroundColor Green
    } else {
        Write-Host "Certificate source not found at: $defaultCertPath" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please enter the path to the certificate files:" -ForegroundColor Yellow
        Write-Host "  (Should contain digital-certificate.txt and private-key.pem)" -ForegroundColor Gray
        $customPath = Read-Host "Path"
        if (Test-Path $customPath) {
            $sourceCertPath = $customPath
        } else {
            Write-Host "Path not found. Exiting." -ForegroundColor Red
            exit 1
        }
    }
}

$certFile = Join-Path $sourceCertPath "digital-certificate.txt"
$keyFile = Join-Path $sourceCertPath "private-key.pem"

if (-not (Test-Path $certFile)) {
    Write-Host "ERROR: digital-certificate.txt not found at: $certFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $keyFile)) {
    Write-Host "ERROR: private-key.pem not found at: $keyFile" -ForegroundColor Red
    exit 1
}

Write-Host "Found certificate files at: $sourceCertPath" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Creating target directory..." -ForegroundColor Green

# Create target directory
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "Created directory: $targetDir" -ForegroundColor Green
} else {
    Write-Host "Directory already exists: $targetDir" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Step 3: Copying certificate files..." -ForegroundColor Green

# Copy certificate
$targetCert = Join-Path $targetDir "digital-certificate.txt"
Copy-Item -Path $certFile -Destination $targetCert -Force
Write-Host "Copied certificate to: $targetCert" -ForegroundColor Green

# Copy private key
$targetKey = Join-Path $targetDir "private-key.pem"
Copy-Item -Path $keyFile -Destination $targetKey -Force
Write-Host "Copied private key to: $targetKey" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Setting file permissions..." -ForegroundColor Green

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
Write-Host "Step 5: Verifying configuration..." -ForegroundColor Green

# Check if this is a production deployment (no src folder) or development
$isProduction = -not (Test-Path (Join-Path $projectRoot "src"))
$appJsxPath = Join-Path $projectRoot "src\App.jsx"

if ($isProduction) {
    Write-Host "Production deployment detected (no src folder)" -ForegroundColor Cyan
    Write-Host "Certificate files are in place for server-side signing." -ForegroundColor Green
    Write-Host "For production at shan.cynex.lk, the app is already compiled." -ForegroundColor Cyan
} elseif (Test-Path $appJsxPath) {
    Write-Host "Development mode - checking App.jsx..." -ForegroundColor Cyan
    $content = Get-Content $appJsxPath -Raw
    
    if ($content -match "certificateUrl.*'/api/qz/certificate'" -and $content -match "signatureUrl.*'/api/qz/sign'") {
        Write-Host "App.jsx is already configured for certificate signing" -ForegroundColor Green
    } else {
        Write-Host "App.jsx found but may need configuration." -ForegroundColor Yellow
    }
} else {
    Write-Host "App.jsx not found - this is normal for production deployments" -ForegroundColor Cyan
    Write-Host "Certificate files are in place for server-side signing." -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 6: Cleaning up temporary files..." -ForegroundColor Green

# Clean up temp files
try {
    if (Test-Path $tempDir) {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Cleaned up temporary files" -ForegroundColor Green
    }
} catch {
    Write-Host "Note: Could not clean up temp files (this is okay)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Certificate files copied to: $targetDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure your server is running and accessible" -ForegroundColor White
Write-Host "2. Restart your browser" -ForegroundColor White
Write-Host "3. Test printing from your POS application" -ForegroundColor White
Write-Host ""
Write-Host "Note: This terminal will use the same certificate as your main setup." -ForegroundColor Cyan
Write-Host "All terminals connecting to the same server can share the same certificate." -ForegroundColor Cyan
Write-Host ""

