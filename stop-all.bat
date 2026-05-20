@echo off
chcp 65001 >nul
title iAGS 2.0 — 停止服务

echo.
echo ╔══════════════════════════════════════════════╗
echo ║   停止 iAGS 2.0 全部服务                   ║
echo ╚══════════════════════════════════════════════╝
echo.

echo 正在关闭各服务窗口...

REM 关闭 BizServer
taskkill /fi "WINDOWTITLE eq iAGS-BizServer*" 2>nul
if %errorlevel% equ 0 (echo ✅ BizServer 已停止) else (echo ⚠️ BizServer 未在运行)

REM 关闭 PoolingServer
taskkill /fi "WINDOWTITLE eq iAGS-PoolingServer*" 2>nul
if %errorlevel% equ 0 (echo ✅ PoolingServer 已停止) else (echo ⚠️ PoolingServer 未在运行)

REM 关闭 Vue 前端
taskkill /fi "WINDOWTITLE eq iAGS-VueFrontend*" 2>nul
if %errorlevel% equ 0 (echo ✅ Vue 前端 已停止) else (echo ⚠️ Vue 前端 未在运行)

REM 也关闭占用端口的进程
echo.
echo ── 检查并释放端口...

for /f "tokens=5" %%a in ('netstat -ano ^| find ":5173" ^| find "LISTENING" 2^>nul') do (
    taskkill /f /pid %%a 2>nul && echo ✅ 端口 5173 已释放 (PID: %%a)
)

for /f "tokens=5" %%a in ('netstat -ano ^| find ":3000" ^| find "LISTENING" 2^>nul') do (
    taskkill /f /pid %%a 2>nul && echo ✅ 端口 3000 已释放 (PID: %%a)
)

for /f "tokens=5" %%a in ('netstat -ano ^| find ":3088" ^| find "LISTENING" 2^>nul') do (
    taskkill /f /pid %%a 2>nul && echo ✅ 端口 3088 已释放 (PID: %%a)
)

echo.
echo ✅ 所有服务已停止
pause
