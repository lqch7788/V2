@echo off
chcp 65001 >nul
title iAGS 2.0 — 后端服务

echo.
echo ╔══════════════════════════════════════════════╗
echo ║   iAGS 2.0 — 启动后端服务                  ║
echo ╚══════════════════════════════════════════════╝
echo.

REM ===== 检查 MySQL =====
echo [检查] MySQL 服务状态...
sc query MySQL 2>nul | find "RUNNING" >nul
if %errorlevel% neq 0 (
    sc query MySQL80 2>nul | find "RUNNING" >nul
    if %errorlevel% neq 0 (
        echo ⚠️  MySQL 似乎未运行，请先启动 MySQL 服务
        echo    数据库: 127.0.0.1:3306 / iags / root / 123456
        echo.
    ) else (
        echo ✅ MySQL80 运行中
    )
) else (
    echo ✅ MySQL 运行中
)

echo.
echo ═══════════════════════════════════════════════
echo   启动 iAGS BizServer (端口 3000)...
echo ═══════════════════════════════════════════════
start "iAGS-BizServer" cmd /k "cd /d D:\iAGS\tm.iags_biz && echo BizServer 启动中... && node start.js"
echo ✅ BizServer 已在独立窗口启动

REM 等待 BizServer 初始化
echo ── 等待 BizServer 初始化 (5秒)...
timeout /t 5 /nobreak >nul

echo.
echo ═══════════════════════════════════════════════
echo   启动 iAGS PoolingServer (端口 3088)...
echo ═══════════════════════════════════════════════
start "iAGS-PoolingServer" cmd /k "cd /d D:\iAGS\tm.iAGS.poolingServer && echo PoolingServer 启动中... && node start.js"
echo ✅ PoolingServer 已在独立窗口启动

echo.
echo ═══════════════════════════════════════════════
echo   后端服务启动完成！
echo   BizServer:      http://localhost:3000
echo   PoolingServer:  http://localhost:3088
echo ═══════════════════════════════════════════════
echo.
echo 提示: 输入 Ctrl+C 可停止各窗口的服务
pause
