@echo off
echo ========================================
echo   3D柴犬AI聊天服务器启动程序
echo ========================================
echo.
echo 正在启动后端服务器...
echo 服务器将在 http://localhost:3000 运行
echo 请勿关闭此窗口，否则服务器将停止
echo.
echo 前端请用浏览器打开 index.html
echo 或使用 Live Server 打开
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

node server.js

if errorlevel 1 (
    echo.
    echo ========================================
    echo 服务器启动失败！
    echo 可能的原因：
    echo 1. 端口3000被占用
    echo 2. .env文件中的API_KEY无效
    echo 3. Node.js依赖未安装
    echo ========================================
    echo.
    pause
)