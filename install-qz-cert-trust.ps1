# Install QZ Tray Certificate as Trusted Root Certificate
# This fixes "Untrusted Website" and "Invalid crt" errors

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QZ Tray Certificate Trust Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Right-click and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Find project root
$projectRoot = $PSScriptRoot
$maxDepth = 5
$depth = 0

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

if (-not (Test-Path (Join-Path $projectRoot "package.json")) -and -not (Test-Path (Join-Path $projectRoot "server"))) {
    $projectRoot = $PSScriptRoot
}

$certFile = Join-Path $projectRoot "server\qz-keys\digital-certificate.txt"

Write-Host "Step 1: Finding certificate file..." -ForegroundColor Green
Write-Host "Looking for: $certFile" -ForegroundColor Cyan

if (-not (Test-Path $certFile)) {
    Write-Host "ERROR: Certificate file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run setup-qz-signing.ps1 first to download certificates." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "Found certificate file" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Reading certificate..." -ForegroundColor Green

try {
    $certContent = Get-Content $certFile -Raw
    
    # Extract certificate from text file (remove any extra text)
    if ($certContent -match '(-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----)') {
        $certPEM = $matches[1]
    } else {
        $certPEM = $certContent
    }
    
    # Clean up PEM format - remove headers, footers, and whitespace
    $base64String = $certPEM -replace '-----BEGIN CERTIFICATE-----','' -replace '-----END CERTIFICATE-----','' -replace '\r','' -replace '\n','' -replace ' ',''
    
    # Convert base64 string to byte array
    $certBytes = [System.Convert]::FromBase64String($base64String)
    
    # Create certificate from byte array
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certBytes, [string]::Empty, [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::PersistKeySet)
    
    Write-Host "Certificate loaded: $($cert.Subject)" -ForegroundColor Green
    Write-Host "Issuer: $($cert.Issuer)" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "ERROR: Failed to read certificate: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative method: use certutil to import directly
    try {
        # Create a temporary .cer file
        $tempCerFile = Join-Path $env:TEMP "qz-cert-temp.cer"
        Copy-Item $certFile $tempCerFile -Force
        
        # Try to install using certutil
        Write-Host "Installing certificate using certutil..." -ForegroundColor Cyan
        certutil -addstore -f "Root" $tempCerFile | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Certificate installed successfully using certutil!" -ForegroundColor Green
            Remove-Item $tempCerFile -Force -ErrorAction SilentlyContinue
            $cert = $null  # Skip the rest of the installation steps
        } else {
            throw "certutil failed"
        }
    } catch {
        Write-Host "ERROR: Both methods failed. Please check the certificate file format." -ForegroundColor Red
        Write-Host ""
        Write-Host "The certificate file should contain:" -ForegroundColor Yellow
        Write-Host "-----BEGIN CERTIFICATE-----" -ForegroundColor Gray
        Write-Host "[base64 encoded certificate]" -ForegroundColor Gray
        Write-Host "-----END CERTIFICATE-----" -ForegroundColor Gray
        pause
        exit 1
    }
}

if ($cert -ne $null) {
    Write-Host "Step 3: Installing certificate to Trusted Root Certificate Authorities..." -ForegroundColor Green

    try {
        # Open the LocalMachine Root store
        $store = New-Object System.Security.Cryptography.X509Certificates.X509Store([System.Security.Cryptography.X509Certificates.StoreName]::Root, [System.Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine)
        $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
        
        # Check if certificate already exists
        $existing = $store.Certificates | Where-Object { $_.Thumbprint -eq $cert.Thumbprint }
        
        if ($existing.Count -gt 0) {
            Write-Host "Certificate already installed (thumbprint: $($cert.Thumbprint))" -ForegroundColor Cyan
            Write-Host "Removing old certificate..." -ForegroundColor Yellow
            $store.Remove($existing[0])
        }
        
        # Add certificate to store
        $store.Add($cert)
        $store.Close()
        
        Write-Host "Certificate installed successfully!" -ForegroundColor Green
        Write-Host "Thumbprint: $($cert.Thumbprint)" -ForegroundColor Cyan
        Write-Host ""
        
    } catch {
        Write-Host "ERROR: Failed to install certificate: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Make sure you're running as Administrator" -ForegroundColor Yellow
        pause
        exit 1
    }
} else {
    Write-Host "Step 3: Certificate already installed via certutil" -ForegroundColor Green
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart QZ Tray (if running)" -ForegroundColor White
Write-Host "2. Restart your browser" -ForegroundColor White
Write-Host "3. Test printing - the 'Untrusted Website' error should be gone" -ForegroundColor White
Write-Host ""
Write-Host "The certificate is now trusted by Windows and QZ Tray." -ForegroundColor Green
Write-Host ""

pause

