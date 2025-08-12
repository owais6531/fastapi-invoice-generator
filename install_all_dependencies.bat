@echo off
REM FBR Invoicing App - Complete Dependencies Installation Script
REM This script installs all dependencies for both backend and frontend
REM Run this from the project root directory

echo ================================================================
echo FBR Invoicing App - Complete Dependencies Installation
echo ================================================================
echo.

REM Check if we're in the correct directory
if not exist "backend" (
    echo Error: backend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo Error: frontend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo Error: Failed to create virtual environment!
        echo Please ensure Python 3.11+ is installed.
        pause
        exit /b 1
    )
)

echo ================================================================
echo Step 1: Installing Backend Dependencies
echo ================================================================
echo.

REM Activate virtual environment and install backend dependencies
echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Changing to backend directory...
cd backend

echo Installing backend dependencies...
python install_dependencies.py
if errorlevel 1 (
    echo Error: Backend dependency installation failed!
    pause
    exit /b 1
)

echo Backend dependencies installed successfully!
echo.

REM Return to project root
cd ..

echo ================================================================
echo Step 2: Installing Frontend Dependencies
echo ================================================================
echo.

REM Install frontend dependencies
echo Changing to frontend directory...
cd frontend

echo Installing frontend dependencies...
npm run install-deps
if errorlevel 1 (
    echo Error: Frontend dependency installation failed!
    pause
    exit /b 1
)

echo Frontend dependencies installed successfully!
echo.

REM Return to project root
cd ..

echo ================================================================
echo Step 3: Verification
echo ================================================================
echo.

echo Verifying backend installation...
cd backend
call .venv\Scripts\activate.bat
python -c "import fastapi, sqlmodel, jwt, passlib, emails; print('✅ Backend verification successful')"
if errorlevel 1 (
    echo ❌ Backend verification failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo Verifying frontend installation...
cd frontend
if exist "node_modules" (
    echo ✅ Frontend verification successful
) else (
    echo ❌ Frontend verification failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo ================================================================
echo Installation Complete!
echo ================================================================
echo.
echo All dependencies have been installed successfully!
echo.
echo To start the application:
echo.
echo 1. Backend Server:
echo    cd backend
echo    .venv\Scripts\activate.bat
echo    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
echo 2. Frontend Server (in a new terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Access the application:
echo    Frontend: http://localhost:5173
echo    Backend API: http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo For more information, see:
echo - DEPENDENCY_INSTALLATION.md
echo - DEPENDENCIES_README.md
echo.
pause