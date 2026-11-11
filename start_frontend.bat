@echo off
title Next.js Frontend (Port 3000)
cd /d "%~dp0frontend"

echo ========================================================
echo  Starting Next.js Frontend on http://localhost:3000
echo ========================================================

if not exist "node_modules" (
    echo [1/2] Installing npm packages, please wait...
    call npm.cmd install
)

echo.
echo ========================================================
echo  Frontend running at: http://localhost:3000
echo ========================================================
echo.

call npm.cmd run dev
pause
