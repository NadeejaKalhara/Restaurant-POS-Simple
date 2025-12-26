@echo off
REM QZ Tray Setup for Additional Terminal
REM This batch file runs the PowerShell setup script

echo ========================================
echo QZ Tray Setup for Additional Terminal
echo ========================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell is not available
    pause
    exit /b 1
)

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0setup-additional-terminal.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Setup failed. Please check the errors above.
    pause
    exit /b 1
)

echo.
echo Setup completed successfully!
pause



