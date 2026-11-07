@echo off
title Push Value-Investing-Terminal-V8 to GitHub
cd /d %~dp0
echo ========================================================
echo Pushing Value-Investing-Terminal-V8 to GitHub...
echo Repository: https://github.com/ronyforti/Value-Investing-Terminal-V8.git
echo ========================================================
echo.
echo If this is your first time, a browser tab will pop open to authorize GitHub.
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo [SUCCESS] Code successfully pushed to GitHub!
    echo ========================================================
) else (
    echo ========================================================
    echo [NOTICE] If authentication was needed, please complete it above.
    echo ========================================================
)
echo.
pause
