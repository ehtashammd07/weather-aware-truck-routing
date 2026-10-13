#!/bin/bash
echo "========================================================"
echo "  Weather-Aware Truck Routing - Development Launcher"
echo "========================================================"

# Run backend in background
cd backend
python manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!
cd ..

# Run frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Servers running!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://127.0.0.1:8000/api/"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
