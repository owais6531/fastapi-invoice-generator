@echo off
REM This script will run Alembic migrations, then start the backend and frontend for development

REM Activate your Python environment here if needed
REM call venv\Scripts\activate

cd backend
alembic upgrade head
start "FastAPI Backend" cmd /k "fastapi dev app/main.py"
cd ..
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo Backend and frontend servers are starting in new windows.
pause
