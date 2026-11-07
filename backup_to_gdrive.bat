@echo off
if exist "c:\Users\Ronald\antigravity\Value-Investing-Terminal-V8\package.json" (
    cd /d "c:\Users\Ronald\antigravity\Value-Investing-Terminal-V8"
) else (
    cd /d %~dp0
)
echo ========================================================
echo Backing up Value Investing Terminal V8 to Google Drive (G:)
echo ========================================================
node scripts/backup.cjs
pause