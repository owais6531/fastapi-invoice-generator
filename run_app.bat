@echo off

rem Navigate to backend directory and start the backend server
start cmd /k "cd backend && .\.venv\Scripts\activate && uvicorn app.main:app --reload"

rem Navigate to frontend directory and start the frontend server
start cmd /k "cd frontend && npm run dev"

echo Both frontend and backend are starting. Check the opened command windows for details.
pause