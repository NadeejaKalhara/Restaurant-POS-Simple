@echo off
echo ========================================
echo Restaurant POS Installer Builder
echo ========================================
echo.

cd installer

echo Installing installer dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building Windows installer...
call npm run build:win

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to build installer
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installer built successfully!
echo ========================================
echo.
echo The installer can be found in: installer\dist\
echo.
pause



