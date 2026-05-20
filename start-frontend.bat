@echo off
chcp 65001 >nul
title iAGS 2.0 — 前端服务

echo.
echo ╔══════════════════════════════════════════════╗
echo ║   iAGS 2.0 — 启动 Vue 3 前端开发服务器    ║
echo ╚══════════════════════════════════════════════╝
echo.

cd /d "D:\iAGS2.0"

REM ===== 检查 node_modules =====
if not exist "node_modules\" (
    echo ⚠️  依赖未安装，正在自动安装...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 安装失败，请先运行 setup.bat
        pause
        exit /b 1
    )
)

REM ===== 检查 Node 版本 =====
echo [环境] Node.js 版本:
node -v
echo.

REM ===== 启动 Vite =====
echo ═══════════════════════════════════════════════
echo   启动 Vite 开发服务器 (端口 5173)...
echo   前端地址: http://localhost:5173
echo   API 代理: /app → http://localhost:3000
echo ═══════════════════════════════════════════════
echo.

start "iAGS-VueFrontend" cmd /k "cd /d D:\iAGS2.0 && npm run dev"

REM ===== 等待 Vite 启动后打开浏览器 =====
echo ── 等待 Vite 启动 (3秒)...
timeout /t 3 /nobreak >nul

echo ── 打开浏览器...
start http://localhost:5173

echo.
echo ✅ 前端已启动！浏览器已打开 http://localhost:5173
echo    提示: 如果页面空白，请确认后端已启动 (运行 start-backend.bat)
pause
