@echo off
SETLOCAL EnableDelayedExpansion

echo ========================================
echo OPEX Management System - Test Suite
echo ========================================
echo.

cd /d "%~dp0server"

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)
echo OK: Node.js is installed
echo.

echo [2/5] Running Database Tests...
echo.
node test_comprehensive.js
if errorlevel 1 (
    echo.
    echo WARNING: Some database tests failed
    echo Attempting to fix issues...
    echo.
    node fix_database.js
    if errorlevel 1 (
        echo ERROR: Database repair failed
        pause
        exit /b 1
    )
    echo.
    echo Re-running database tests...
    node test_comprehensive.js
)
echo.

echo [3/5] Checking if server is running...
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo Server is not running. Please start it manually:
    echo   cd server
    echo   npm run dev
    echo.
    echo Then run this test script again.
    pause
    exit /b 1
)
echo OK: Server is running
echo.

echo [4/5] Running API Endpoint Tests...
echo.
node test_api_endpoints.js
if errorlevel 1 (
    echo.
    echo WARNING: Some API tests failed
    echo Please check the server logs for details
)
echo.

echo [5/5] Generating Summary Report...
echo.
echo ========================================
echo Test Suite Completed
echo ========================================
echo Timestamp: %date% %time%
echo.
echo Next Steps:
echo 1. Review any errors above
echo 2. Check server logs for details
echo 3. Run 'node fix_database.js' if needed
echo.

pause
