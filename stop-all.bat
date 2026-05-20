@echo off
title iAGS 2.0 - Stop Services

echo.
echo ============================================
echo   iAGS 2.0 - Stop All Services
echo ============================================
echo.

echo Shutting down service windows...

REM Kill BizServer window
taskkill /fi "WINDOWTITLE eq iAGS-BizServer*" 2>nul
if %errorlevel% equ 0 (echo [OK] BizServer stopped) else (echo [--] BizServer not running)

REM Kill PoolingServer window
taskkill /fi "WINDOWTITLE eq iAGS-PoolingServer*" 2>nul
if %errorlevel% equ 0 (echo [OK] PoolingServer stopped) else (echo [--] PoolingServer not running)

REM Kill Vue frontend window
taskkill /fi "WINDOWTITLE eq iAGS-VueFrontend*" 2>nul
if %errorlevel% equ 0 (echo [OK] Vue Frontend stopped) else (echo [--] Vue Frontend not running)

REM Release ports
echo.
echo -- Releasing ports...

for /f "tokens=5" %%a in ('netstat -ano ^| find ":5173" ^| find "LISTENING" 2^>nul') do (
    taskkill /f /pid %%a 2>nul && echo [OK] Port 5173 released (PID: %%a)
)

for /f "tokens=5" %%a in ('netstat -ano ^| find ":3000" ^| find "LISTENING" 2^>nul') do (
    taskkill /f /pid %%a 2>nul && echo [OK] Port 3000 released (PID: %%a)
)

for /f "tokens=5" %%a in ('netstat -ano ^| find ":3088" ^| find "LISTENING" 2^>nul') do (
    taskkill /f /pid %%a 2>nul && echo [OK] Port 3088 released (PID: %%a)
)

echo.
echo [OK] All services stopped.
pause
