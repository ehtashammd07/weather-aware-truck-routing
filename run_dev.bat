@echo off
echo ========================================================
echo   Weather-Aware Truck Routing - Development Launcher
echo ========================================================

echo [1/2] Starting Django REST Backend on http://127.0.0.1:8000...
start cmd /k "cd backend && python manage.py runserver 127.0.0.1:8000"

echo [2/2] Starting React Frontend on http://localhost:3000...
start cmd /k "cd frontend && npm run dev"

echo.
echo Application launched!
echo - Frontend: http://localhost:3000
echo - Backend API: http://127.0.0.1:8000/api/
echo.
