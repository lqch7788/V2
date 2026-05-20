@echo off
title iAGS 2.0 - Backend

echo.
echo ============================================
echo   iAGS 2.0 - Start Backend Services
echo ============================================
echo.

REM Check MySQL
echo [Check] MySQL service...
sc query MySQL 2>nul | find "RUNNING" >nul
if %errorlevel% neq 0 (
    sc query MySQL80 2>nul | find "RUNNING" >nul
    if %errorlevel% neq 0 (
        echo [WARN] MySQL might not be running.
        echo        DB: 127.0.0.1:3306 / iags / root / 123456
        echo.
    ) else (
        echo [OK] MySQL80 is running.
    )
) else (
    echo [OK] MySQL is running.
)

echo.
echo ============================================
echo   Starting iAGS BizServer (port 4000)...
echo ============================================
start "iAGS-BizServer" cmd /k "cd /d D:\iAGS\tm.iags_biz && echo BizServer starting... && node start.js"
echo [OK] BizServer launched in separate window.

echo   Waiting for BizServer init (5s)...
timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo   Starting iAGS PoolingServer (port 3088)...
echo ============================================
start "iAGS-PoolingServer" cmd /k "cd /d D:\iAGS\tm.iAGS.poolingServer && echo PoolingServer starting... && node start.js"
echo [OK] PoolingServer launched in separate window.

echo.
echo ============================================
echo   Backend services started.
echo   BizServer:      http://localhost:4000
echo   PoolingServer:  http://localhost:3088
echo ============================================
echo.
echo Close each window to stop the service, or run stop-all.bat
pause
