@echo off
title FastAPI Backend (Port 8000)
cd /d "%~dp0backend"

set DISABLE_SQLALCHEMY_CEXT=1

echo ========================================================
echo  Starting FastAPI Backend on http://localhost:8000
echo ========================================================

if not exist "venv" (
    echo [1/3] Creating Python virtual environment...
    python -m venv venv
)

echo [2/3] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/3] Checking dependencies and seeding database...
pip install -r requirements.txt
python -m scripts.seed_data

echo.
echo ========================================================
echo  FastAPI running at: http://localhost:8000
echo  Interactive Swagger Docs: http://localhost:8000/docs
echo ========================================================
echo.

uvicorn app.main:app --reload --port 8000
pause
