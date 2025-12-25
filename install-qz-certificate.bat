@echo off
REM QZ Tray Certificate Installer - Batch Script
REM Run this as Administrator

echo ========================================
echo QZ Tray Certificate Installer
echo ========================================
echo.

REM Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click and select "Run as Administrator"
    pause
    exit /b 1
)

echo Step 1: Checking for certificate file...
set CERT_FILE=%USERPROFILE%\Desktop\qz-certificate.p12

if not exist "%CERT_FILE%" (
    echo Certificate file not found: %CERT_FILE%
    echo.
    echo Please generate the certificate first using:
    echo   1. QZ Tray GUI (Options ^> Security ^> Generate Certificate)
    echo   2. Or run: generate-qz-certificate.ps1
    echo.
    pause
    exit /b 1
)

echo Certificate file found: %CERT_FILE%
echo.

echo Step 2: Installing certificate to Trusted Root...
echo.

REM Install certificate using certutil
certutil -addstore -f "Root" "%CERT_FILE%"

if %errorLevel% equ 0 (
    echo.
    echo ========================================
    echo Certificate installed successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Restart QZ Tray
    echo 2. Restart your browser
    echo 3. Test printing from https://shan.cynex.lk/
    echo.
) else (
    echo.
    echo ERROR: Failed to install certificate
    echo.
    echo Try installing manually:
    echo 1. Double-click the certificate file
    echo 2. Click "Install Certificate"
    echo 3. Select "Local Machine"
    echo 4. Choose "Trusted Root Certification Authorities"
    echo.
)

pause

