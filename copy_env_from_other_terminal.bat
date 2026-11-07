@echo off
title Copy Environment & API Keys from Previous Terminal
echo ========================================================
echo   Copying .env Credentials from Previous Terminal
echo ========================================================
echo.

set "TARGET_DIR=%~dp0"
set "COPIED=0"

if exist "c:\Users\Ronald\antigravity\Value-Investing-Terminal\.env" (
    echo [FOUND] Found .env in c:\Users\Ronald\antigravity\Value-Investing-Terminal
    copy /Y "c:\Users\Ronald\antigravity\Value-Investing-Terminal\.env" "%TARGET_DIR%.env" >nul
    set "COPIED=1"
) else if exist "c:\Users\Ronald\antigravity\Value-Investing-Terminal-App\.env" (
    echo [FOUND] Found .env in c:\Users\Ronald\antigravity\Value-Investing-Terminal-App
    copy /Y "c:\Users\Ronald\antigravity\Value-Investing-Terminal-App\.env" "%TARGET_DIR%.env" >nul
    set "COPIED=1"
) else if exist "G:\My Drive\Company Data\GTD_terminal\.env" (
    echo [FOUND] Found .env in Google Drive GTD_terminal
    copy /Y "G:\My Drive\Company Data\GTD_terminal\.env" "%TARGET_DIR%.env" >nul
    set "COPIED=1"
)

if "%COPIED%"=="1" (
    echo.
    echo [SUCCESS] .env file copied successfully to:
    echo   "%TARGET_DIR%.env"
    echo.
    echo All API keys, credentials, and tokens are now active in Terminal V8!
) else (
    echo.
    echo [WARNING] Could not automatically locate the previous .env file.
    echo Please manually copy the .env file from your previous terminal into:
    echo   "%TARGET_DIR%.env"
)

echo.
pause
