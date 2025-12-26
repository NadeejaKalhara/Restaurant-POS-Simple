@echo off
REM QZ Tray Certificate Generator & Installer - All in One
REM Double-click this file to generate and install certificate automatically

echo ========================================
echo QZ Tray Certificate Generator ^& Installer
echo All-in-One Script
echo ========================================
echo.

REM Check for admin, if not, elevate
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo Running certificate generator and installer...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0generate-and-install-cert.ps1"

if %errorLevel% neq 0 (
    echo.
    echo ERROR: Script failed. Please check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo Done! Certificate has been generated and installed.
echo.
pause


