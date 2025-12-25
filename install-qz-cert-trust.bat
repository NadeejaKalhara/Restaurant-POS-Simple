@echo off
REM Install QZ Tray Certificate as Trusted Root Certificate
REM This fixes "Untrusted Website" and "Invalid crt" errors

echo ========================================
echo QZ Tray Certificate Trust Installation
echo ========================================
echo.
echo This script must be run as Administrator!
echo.
echo Right-click and select "Run as Administrator"
echo.

REM Check if PowerShell is available
where powershell >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell is not available
    pause
    exit /b 1
)

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0install-qz-cert-trust.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Installation failed. Please check the errors above.
    pause
    exit /b 1
)

