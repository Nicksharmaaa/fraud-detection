@echo off
echo Starting Fraud Detection Application...

REM Start Backend
start cmd /k "cd fraud_backend && python -m uvicorn main:app --reload"

REM Wait a moment for backend to initialize
timeout /t 3

REM Start Frontend
start cmd /k "npm run dev"

echo Both services started successfully! 