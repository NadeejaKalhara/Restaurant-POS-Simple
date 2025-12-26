@echo off
title Restaurant POS System
echo ========================================
echo Restaurant POS System
echo ========================================
echo.
echo Starting server...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the server
echo Server starting on http://localhost:5000
echo Frontend will be available at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

start "" "http://localhost:3000"
call npm start



