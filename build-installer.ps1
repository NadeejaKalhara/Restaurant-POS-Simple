Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Restaurant POS Installer Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location installer

Write-Host "Installing installer dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Building Windows installer..." -ForegroundColor Yellow
npm run build:win

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to build installer" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installer built successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "The installer can be found in: installer\dist\" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"

