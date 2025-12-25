@echo off
REM QZ Tray Certificate Signing Setup - Batch File
REM Double-click this file to set up certificate signing

echo ========================================
echo QZ Tray Certificate Signing Setup
echo ========================================
echo.

REM Check for admin (not required but helpful)
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Note: Running without admin privileges
    echo.
)

echo Running setup script...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0setup-qz-signing.ps1"

if %errorLevel% neq 0 (
    echo.
    echo ERROR: Setup failed. Please check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo Setup complete!
echo.
pause

