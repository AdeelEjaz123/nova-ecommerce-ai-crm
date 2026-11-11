@echo off
title Launch NOVA E-Commerce Suite
echo ========================================================
echo  Launching NOVA E-Commerce Platform
echo  Backend:  FastAPI + PostgreSQL / SQLite (Port 8000)
echo  Frontend: Next.js + Tailwind CSS + Stripe (Port 3000)
echo ========================================================
echo.

echo Starting Backend server...
start "FastAPI Backend (Port 8000)" cmd /k "%~dp0start_backend.bat"

echo Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo Starting Frontend server...
start "Next.js Frontend (Port 3000)" cmd /k "%~dp0start_frontend.bat"

echo.
echo ========================================================
echo  Both servers have been launched in separate windows!
echo.
echo  * Frontend: http://localhost:3000
echo  * Backend API Docs: http://localhost:8000/docs
echo.
echo  To stop everything, run: stop_all.bat
echo ========================================================
timeout /t 5

