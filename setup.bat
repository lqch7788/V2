@echo off
title iAGS 2.0 - First Time Setup

echo.
echo ============================================
echo   iAGS 2.0 - First Time Setup
echo ============================================
echo.

cd /d "D:\iAGS2.0"

echo [1/2] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [FAIL] npm install failed. Check Node.js version (v18+ required).
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed.

echo.
echo [2/2] Backend environment check...
echo   Requires: MySQL 5.7+, Node.js v8+
echo   Database: 127.0.0.1:3306 / iags / root / 123456
echo.
echo   Backend commands:
echo     BizServer:    cd D:\iAGS\tm.iags_biz ^&^& node start.js
echo     PoolingServer: cd D:\iAGS\tm.iAGS.poolingServer ^&^& node start.js
echo.

echo ============================================
echo   Setup complete. Run start-all.bat to launch.
echo ============================================
pause
