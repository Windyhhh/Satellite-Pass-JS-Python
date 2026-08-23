@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==========================================
echo 🛰️  卫星过顶计算 - 完整测试脚本
echo ==========================================
echo.

REM 检查 Python
echo 1️⃣  检查 Python 环境...
where python >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
    goto :python_found
)

where python3 >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python3
    goto :python_found
)

echo ❌ Python 未安装
exit /b 1

:python_found
for /f "tokens=*" %%i in ('%PYTHON_CMD% --version') do set PYTHON_VERSION=%%i
echo ✓ Python 版本: %PYTHON_VERSION%
echo.

REM 检查 Python 依赖
echo 2️⃣  检查 Python 依赖...
%PYTHON_CMD% -c "import sgp4" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  正在安装 sgp4...
    %PYTHON_CMD% -m pip install sgp4
)

%PYTHON_CMD% -c "import astropy" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  正在安装 astropy...
    %PYTHON_CMD% -m pip install astropy
)

%PYTHON_CMD% -c "import numpy" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  正在安装 numpy...
    %PYTHON_CMD% -m pip install numpy
)

echo ✓ 所有 Python 依赖已安装
echo.

REM 检查 Node.js
echo 3️⃣  检查 Node.js 环境...
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✓ Node.js 版本: !NODE_VERSION!
    set HAS_NODE=1
) else (
    echo ⚠️  Node.js 未安装，跳过 Node.js 测试
    set HAS_NODE=0
)
echo.

REM 测试 Python 函数
echo 4️⃣  测试原始 Python 函数...
%PYTHON_CMD% weixingguibi2youhuasuduhanshufengzhuang.py >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Python 函数测试通过
) else (
    echo ❌ Python 函数测试失败
)
echo.

REM 测试 Node.js 调用
if %HAS_NODE% equ 1 (
    echo 5️⃣  测试 Node.js 调用...
    
    REM 检查 node-fetch
    node -e "require('node-fetch')" >nul 2>&1
    if !errorlevel! neq 0 (
        echo ⚠️  node-fetch 未安装，正在安装...
        call npm install node-fetch
    )
    
    REM 运行测试
    node satellite_call_nodejs.js >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✓ Node.js 调用测试通过
    ) else (
        echo ❌ Node.js 调用测试失败
    )
) else (
    echo 5️⃣  跳过 Node.js 测试（未安装 Node.js）
)
echo.

REM 测试 Flask API
echo 6️⃣  测试 Flask API...

REM 检查 Flask
%PYTHON_CMD% -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Flask 未安装，正在安装...
    %PYTHON_CMD% -m pip install flask flask-cors
)

echo 启动 Flask 服务（5秒后自动停止）...
start /b %PYTHON_CMD% satellite_api.py >nul 2>&1

REM 等待服务启动
timeout /t 3 /nobreak >nul

REM 测试 API（使用 PowerShell）
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Flask API 启动成功
    
    REM 测试计算接口
    powershell -Command "$body = @{tle_line1='1 25544U 98067A   24123.56789012  .00001234  00000-0  12345-3 0  9999';tle_line2='2 25544  51.6432 123.4567 0001234  78.9012 281.2345 15.5432123456789';lat=39.9;lon=116.4;alt=0.05;overhead_theta=10;t_start='2024-05-03T00:00:00';t_end='2024-05-04T00:00:00';time_step=10} | ConvertTo-Json; try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/satellite/overhead' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✓ API 计算接口测试通过
    ) else (
        echo ❌ API 计算接口测试失败
    )
) else (
    echo ❌ Flask API 启动失败
)

REM 停止 Flask 服务
taskkill /f /im python.exe /fi "WINDOWTITLE eq satellite_api.py*" >nul 2>&1
echo.

REM 总结
echo ==========================================
echo 📊 测试总结
echo ==========================================
echo.
echo ✅ 可用的调用方式:
echo.
echo 1. Node.js 直接调用:
echo    node satellite_call_nodejs.js
echo.
echo 2. REST API 调用:
echo    python satellite_api.py
echo    然后在浏览器打开 satellite_call_api.html
echo.
echo 3. 浏览器 Pyodide:
echo    直接在浏览器打开 satellite_call_browser.html
echo.
echo ==========================================
echo 📚 详细文档: README_JavaScript_Call.md
echo 🚀 快速开始: QUICKSTART.md
echo ==========================================

pause

