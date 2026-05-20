@echo off
title iAGS 2.0 - All Services

echo.
echo ============================================
echo   iAGS 2.0 - Start All Services
echo ============================================
echo.

cd /d "D:\iAGS2.0"

REM ===== Check frontend deps =====
if not exist "node_modules\" (
    echo [Setup] Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [FAIL] Dependency install failed.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed.
    echo.
)

REM ===== Check MySQL =====
echo [1/3] Checking MySQL service...
sc query MySQL 2>nul | find "RUNNING" >nul
if %errorlevel% neq 0 (
    sc query MySQL80 2>nul | find "RUNNING" >nul
    if %errorlevel% neq 0 (
        echo [WARN] MySQL might not be running.
        echo        DB: 127.0.0.1:3306 / iags / root / 123456
        echo.
        choice /c YN /m "Continue anyway (backend may fail)?"
        if errorlevel 2 exit /b 0
    ) else (
        echo [OK] MySQL80 is running.
        echo.
    )
) else (
    echo [OK] MySQL is running.
    echo.
)

REM ===== Start backend =====
echo [2/3] Starting iAGS backend...

start "iAGS-BizServer" cmd /k "cd /d D:\iAGS\tm.iags_biz && echo iAGS BizServer (port 4000) && echo. && node start.js"
echo   [OK] BizServer launched (port 4000)

start "iAGS-PoolingServer" cmd /k "cd /d D:\iAGS\tm.iAGS.poolingServer && echo iAGS PoolingServer (port 3088) && echo. && node start.js"
echo   [OK] PoolingServer launched (port 3088)

echo   Waiting for backend init (8s)...
timeout /t 8 /nobreak >nul
echo.

REM ===== Start frontend =====
echo [3/3] Starting Vue 3 frontend...
start "iAGS-VueFrontend" cmd /k "cd /d D:\iAGS2.0 && echo iAGS 2.0 Vue 3 Frontend (port 5173) && echo. && npm run dev"
echo   [OK] Frontend launched (port 5173)

echo   Waiting for Vite startup (5s)...
timeout /t 5 /nobreak >nul

REM ===== Open browser =====
echo   Opening browser...
start http://localhost:5173

echo.
echo ============================================
echo        All services started!
echo ============================================
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:4000
echo   IoT:       http://localhost:3088
echo ============================================
echo   Browser opened. Login with iAGS account.
echo ============================================
echo.
echo   Each service runs in its own window.
echo   Close a window to stop that service,
echo   or run stop-all.bat to stop everything.
echo.
pause
