@echo off
chcp 65001 >nul
title iAGS 2.0 — 首次安装

echo.
echo ╔══════════════════════════════════════════════╗
echo ║     iAGS 2.0 — 智慧农业管理系统 安装脚本    ║
echo ╚══════════════════════════════════════════════╝
echo.

cd /d "D:\iAGS2.0"

echo [1/2] 安装前端依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install 失败，请检查 Node.js 版本（需要 v18+）
    pause
    exit /b 1
)
echo ✅ 前端依赖安装完成

echo.
echo [2/2] 检查后端环境...
echo ── 后端需要:
echo    - MySQL 5.7+ (127.0.0.1:3306, 数据库: iags, 账号: root, 密码: 123456)
echo    - Node.js v8+ (启动 BizServer)
echo    - Redis (可选, IoT 数据缓存)
echo.
echo ── 后端命令:
echo    启动 BizServer:    cd D:\iAGS\tm.iags_biz ^&^& node start.js
echo    启动 PoolingServer: cd D:\iAGS\tm.iAGS.poolingServer ^&^& node start.js
echo.

echo ═══════════════════════════════════════════════
echo   安装完成！请运行 start-all.bat 启动全部服务
echo ═══════════════════════════════════════════════
pause
