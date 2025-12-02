@echo off
echo Starting OPEX Management System...

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

echo.
echo ==========================================
echo Setting up Server...
echo ==========================================
cd server

if not exist node_modules (
    echo Installing server dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error installing server dependencies.
        pause
        exit /b
    )
    
    echo Setting up Database...
    call npx prisma generate
    call npx prisma migrate dev --name init
    call node seed.js
)

echo Starting Backend Server...
start "OPEX Server" cmd /k "npm run dev"

echo.
echo ==========================================
echo Setting up Client...
echo ==========================================
cd ../client

if not exist node_modules (
    echo Installing client dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error installing client dependencies.
        pause
        exit /b
    )
)

echo Starting Frontend Client...
start "OPEX Client" cmd /k "npm run dev"

echo.
echo ==========================================
echo Application Started!
echo Backend running on http://localhost:5000
echo Frontend running on http://localhost:3000
echo.
echo If the browser does not open automatically, please visit http://localhost:3000
echo Default Login: admin@example.com / password123
echo ==========================================
pause
