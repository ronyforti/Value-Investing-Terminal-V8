@echo off
title Create Desktop Shortcut for Terminal V8
echo ========================================================
echo   Creating Value Investing Terminal V8 Desktop Shortcut
echo ========================================================
echo.

set "SOURCE_BAT=%~dp0Start_Value_Investing_Terminal_V8.bat"
set "DESKTOP_BAT=%USERPROFILE%\Desktop\Start_Value_Investing_Terminal_V8.bat"

if not exist "%SOURCE_BAT%" (
    echo [ERROR] Could not find %SOURCE_BAT%
    pause
    exit /b 1
)

copy /Y "%SOURCE_BAT%" "%DESKTOP_BAT%" >nul

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Shortcut created successfully on your Desktop:
    echo   "%DESKTOP_BAT%"
    echo.
    echo You can now double-click "Start_Value_Investing_Terminal_V8.bat" on your Desktop anytime!
) else (
    echo [ERROR] Failed to copy shortcut to Desktop.
)

echo.
pause
