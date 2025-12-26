@echo off
REM QZ Tray Certificate Generator - Auto-elevate to Admin
echo ========================================
echo QZ Tray Certificate Generator
echo ========================================
echo.
echo This will generate and install QZ Tray certificate
echo.
pause

REM Check for admin, if not, elevate
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo Running certificate generator...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0generate-qz-cert.ps1"
echo.
pause


