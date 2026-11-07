@echo off
title Pull Latest Updates from GitHub - Value Investing Terminal V8
cd /d %~dp0
echo ========================================================
echo   Pulling Latest Updates from GitHub...
echo   Repository: https://github.com/ronyforti/Value-Investing-Terminal-V8
echo ========================================================
echo.
git pull origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo [SUCCESS] Your local terminal is fully up-to-date!
    echo ========================================================
) else (
    echo ========================================================
    echo [ERROR] git pull encountered an issue. Please check above.
    echo ========================================================
)
echo.
pause
