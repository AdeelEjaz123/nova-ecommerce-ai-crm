@echo off
title NOVA Admin Portal Launcher
echo ========================================================
echo  Launching NOVA Admin Portal
echo  URL: http://localhost:3000/admin
echo  Default Passcode: admin123
echo ========================================================
echo.

rem Check if backend is running on port 8000
netstat -ano | findstr ":8000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [1/3] Backend is not running. Starting FastAPI Backend on port 8000...
    start "FastAPI Backend (Port 8000)" cmd /k "%~dp0start_backend.bat"
    timeout /t 3 /nobreak >nul
) else (
    echo [1/3] Backend is already active on port 8000.
)

rem Check if frontend is running on port 3000
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [2/3] Frontend is not running. Starting Next.js Frontend on port 3000...
    start "Next.js Frontend (Port 3000)" cmd /k "%~dp0start_frontend.bat"
    timeout /t 4 /nobreak >nul
) else (
    echo [2/3] Frontend is already active on port 3000.
)

echo [3/3] Opening Admin Portal in your default browser...
start http://localhost:3000/admin

echo.
echo ========================================================
echo  Admin Portal successfully launched!
echo.
echo  Direct URL: http://localhost:3000/admin
echo  Passcode:   admin123 (or click One-Click Demo Login)
echo.
echo  To stop everything, run: stop_admin.bat
echo ========================================================
timeout /t 5

