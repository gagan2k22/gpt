@echo off
echo Restarting OPEX Management System...
echo.

REM Kill existing Node.js processes (optional - uncomment if needed)
REM taskkill /F /IM node.exe 2>nul

echo ==========================================
echo Starting Backend Server...
echo ==========================================
cd server
start "OPEX Server" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo Starting Frontend Client...
echo ==========================================
cd ../client
start "OPEX Client" cmd /k "npm run dev"

echo.
echo ==========================================
echo Application Restarted!
echo Backend running on http://localhost:5000
echo Frontend running on http://localhost:3000
echo.
echo Default Login: admin@example.com / password123
echo ==========================================
pause
