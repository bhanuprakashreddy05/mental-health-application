@echo off
echo ===================================================
echo Peaceful Mind - Starting Frontend and Backend Servers
echo ===================================================

echo Starting Express API Backend on http://localhost:5000...
start "Peaceful Mind Backend" cmd /k "cd backend && npm start"

echo Starting React Frontend on http://localhost:3000...
start "Peaceful Mind Frontend" cmd /k "cd frontend && npm run dev"

echo ===================================================
echo Both servers are starting up in separate windows.
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000 (Open in your browser)
echo ===================================================
pause
