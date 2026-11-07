@echo off
title Value Investing Terminal V8 (Port 3001)
echo ========================================================
echo       Starting Value Investing Terminal V8 (Port 3001)
echo       Modes: Slingshot Triage ^| Full Dossier ^| Sentinel
echo ========================================================
echo.

:: 1. Navigate to repository directory
if exist "c:\Users\Ronald\antigravity\Value-Investing-Terminal-V8\package.json" (
    cd /d "c:\Users\Ronald\antigravity\Value-Investing-Terminal-V8"
) else if exist "c:\Users\Ronald\antigravity\terminal-v8\package.json" (
    cd /d "c:\Users\Ronald\antigravity\terminal-v8"
) else if exist "%~dp0package.json" (
    cd /d "%~dp0"
) else (
    echo [ERROR] Could not find Value-Investing-Terminal-V8 folder!
    echo Please make sure the repository is located in:
    echo   c:\Users\Ronald\antigravity\Value-Investing-Terminal-V8
    echo.
    pause
    exit /b 1
)

echo Working Directory: %CD%
echo.

:: 2. Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [INFO] First-time setup detected: Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install encountered an error.
        pause
        exit /b %ERRORLEVEL%
    )
)

:: 3. Check for .env credentials, copy from previous terminal if missing
if not exist "node_modules\.env" if not exist ".env" (
    if exist "c:\Users\Ronald\antigravity\Value-Investing-Terminal\.env" (
        echo [INFO] Found .env credentials in Value-Investing-Terminal, copying...
        copy /Y "c:\Users\Ronald\antigravity\Value-Investing-Terminal\.env" "%CD%\.env" >nul
        echo [SUCCESS] Copied .env credentials to Terminal V8!
    ) else if exist "c:\Users\Ronald\antigravity\Value-Investing-Terminal-App\.env" (
        echo [INFO] Found .env credentials in Value-Investing-Terminal-App, copying...
        copy /Y "c:\Users\Ronald\antigravity\Value-Investing-Terminal-App\.env" "%CD%\.env" >nul
        echo [SUCCESS] Copied .env credentials to Terminal V8!
    ) else if exist "G:\My Drive\Company Data\GTD_terminal\.env" (
        echo [INFO] Found .env in Google Drive GTD_terminal, copying...
        copy /Y "G:\My Drive\Company Data\GTD_terminal\.env" "%CD%\.env" >nul
        echo [SUCCESS] Copied .env credentials to Terminal V8!
    )
)

:: 4. Launch browser directly to Port 3001
echo Opening browser to http://localhost:3001 ...
start "" "http://localhost:3001"

:: 5. Start the Terminal V8 development server
echo Starting Terminal V8 server (npm run dev)...
echo.
call npm run dev

pause
