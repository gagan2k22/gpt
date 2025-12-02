@echo off
echo ========================================
echo OPEX Management System - Complete Setup
echo ========================================
echo.

cd server

echo Step 1: Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed!
    pause
    exit /b 1
)
echo.

echo Step 2: Running Database Migrations...
call npx prisma migrate dev --name complete_master_data_setup
if %errorlevel% neq 0 (
    echo ERROR: Migration failed!
    pause
    exit /b 1
)
echo.

echo Step 3: Seeding Database with Master Data...
call node seed.js
if %errorlevel% neq 0 (
    echo ERROR: Seeding failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo All master data has been added:
echo - 7 Towers (Infrastructure, ERP-SAP, Application, CyberSecurity, General, ERP-LN, Digital)
echo - 8 Budget Heads
echo - 14 PO Entities
echo - 2 Service Types
echo - 39 Allocation Bases
echo.
echo Please restart your backend server and refresh the browser.
echo.
pause
