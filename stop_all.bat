@echo off
title Stop NOVA E-Commerce Servers
echo ========================================================
echo  Stopping NOVA E-Commerce Servers
echo ========================================================
echo.

echo [1/2] Terminating backend process on port 8000 (FastAPI / Uvicorn)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Stopping PID: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo [2/2] Terminating frontend process on port 3000 (Next.js / Node)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Stopping PID: %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo Closing console windows...
taskkill /fi "WINDOWTITLE eq FastAPI Backend*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq Next.js Frontend*" /f >nul 2>&1

echo.
echo ========================================================
echo  Successfully stopped all frontend and backend servers!
echo ========================================================
pause

