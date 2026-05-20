@echo off
chcp 65001 >nul
title iAGS 2.0 — 全部服务

echo.
echo ╔══════════════════════════════════════════════╗
echo ║  iAGS 2.0 — 启动全部服务 (后端 + 前端)    ║
echo ╚══════════════════════════════════════════════╝
echo.

cd /d "D:\iAGS2.0"

REM ===== 检查前端依赖 =====
if not exist "node_modules\" (
    echo 🔧 首次运行，正在安装前端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
    echo.
)

REM ===== 检查 MySQL =====
echo [1/3] 检查 MySQL 服务...
sc query MySQL 2>nul | find "RUNNING" >nul
if %errorlevel% neq 0 (
    sc query MySQL80 2>nul | find "RUNNING" >nul
    if %errorlevel% neq 0 (
        echo ⚠️  MySQL 似乎未运行
        echo    iAGS 后端需要 MySQL 才能正常启动
        echo    数据库: 127.0.0.1:3306 / iags / root / 123456
        echo.
        choice /c YN /m "是否继续启动 (后端可能报错)?"
        if errorlevel 2 exit /b 0
    ) else (
        echo ✅ MySQL80 运行中
        echo.
    )
) else (
    echo ✅ MySQL 运行中
    echo.
)

REM ===== 启动后端 =====
echo [2/3] 启动 iAGS 后端服务...

REM 启动 BizServer (端口 3000)
start "iAGS-BizServer" cmd /k "cd /d D:\iAGS\tm.iags_biz && echo iAGS BizServer (端口3000) && echo. && node start.js"
echo   ✅ BizServer 窗口已打开 (端口 3000)

REM 启动 PoolingServer (端口 3088)
start "iAGS-PoolingServer" cmd /k "cd /d D:\iAGS\tm.iAGS.poolingServer && echo iAGS PoolingServer (端口3088) && echo. && node start.js"
echo   ✅ PoolingServer 窗口已打开 (端口 3088)

echo ── 等待后端初始化 (8秒)...
timeout /t 8 /nobreak >nul
echo.

REM ===== 启动前端 =====
echo [3/3] 启动 Vue 3 前端...
start "iAGS-VueFrontend" cmd /k "cd /d D:\iAGS2.0 && echo iAGS 2.0 Vue 3 前端 (端口5173) && echo. && npm run dev"

echo   ✅ 前端窗口已打开 (端口 5173)

echo ── 等待 Vite 启动 (5秒)...
timeout /t 5 /nobreak >nul

REM ===== 打开浏览器 =====
echo ── 打开浏览器...
start http://localhost:5173

echo.
echo ╔══════════════════════════════════════════════╗
echo ║          全部服务启动完成！                ║
echo ╠══════════════════════════════════════════════╣
echo ║  前端:  http://localhost:5173              ║
echo ║  后端:  http://localhost:3000              ║
echo ║  IoT:   http://localhost:3088              ║
echo ╠══════════════════════════════════════════════╣
echo ║  浏览器已自动打开，请登录 iAGS 账号        ║
echo ╚══════════════════════════════════════════════╝
echo.
echo ┌──────────────────────────────────────────────┐
echo │  各服务运行在独立窗口中                      │
echo │  关闭窗口即可停止对应服务                    │
echo │  或运行 stop-all.bat 关闭全部              │
echo └──────────────────────────────────────────────┘
echo.
pause
