@echo off
title iAGS 2.0 - Frontend

echo.
echo ============================================
echo   iAGS 2.0 - Start Vue 3 Dev Server
echo ============================================
echo.

cd /d "D:\iAGS2.0"

REM Check node_modules
if not exist "node_modules\" (
    echo [WARN] Dependencies not installed. Auto-installing...
    call npm install
    if %errorlevel% neq 0 (
        echo [FAIL] Install failed. Run setup.bat first.
        pause
        exit /b 1
    )
)

REM Show Node version
echo [Env] Node.js version:
node -v
echo.

echo ============================================
echo   Starting Vite Dev Server (port 5173)...
echo   Frontend: http://localhost:5173
echo   API Proxy: /app -> http://localhost:4000
echo ============================================
echo.

start "iAGS-VueFrontend" cmd /k "cd /d D:\iAGS2.0 && npm run dev"

echo   Waiting for Vite startup (3s)...
timeout /t 3 /nobreak >nul

echo   Opening browser...
start http://localhost:5173

echo.
echo [OK] Frontend started. Browser opened: http://localhost:5173
echo     If the page is blank, make sure the backend is running (start-backend.bat).
pause
