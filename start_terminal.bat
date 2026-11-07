@echo off
title Value Investing Terminal
echo ===================================================
echo           Starting Value Investing Terminal
echo ===================================================
echo.

cd /d "c:\Users\Ronald\antigravity\Value-Investing-Terminal"

echo Opening browser to http://localhost:3000 ...
start "" "http://localhost:3000"

echo Starting server (npm run dev)...
echo.
npm run dev

pause
