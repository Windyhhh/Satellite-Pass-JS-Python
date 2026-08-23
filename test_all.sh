#!/bin/bash

# 测试所有 JavaScript 调用方式的脚本

echo "=========================================="
echo "🛰️  卫星过顶计算 - 完整测试脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Python
echo "1️⃣  检查 Python 环境..."
if command -v python &> /dev/null; then
    PYTHON_CMD=python
elif command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
else
    echo -e "${RED}❌ Python 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python 版本: $($PYTHON_CMD --version)${NC}"
echo ""

# 检查 Python 依赖
echo "2️⃣  检查 Python 依赖..."
REQUIRED_PACKAGES=("sgp4" "astropy" "numpy")
MISSING_PACKAGES=()

for package in "${REQUIRED_PACKAGES[@]}"; do
    if ! $PYTHON_CMD -c "import $package" 2>/dev/null; then
        MISSING_PACKAGES+=($package)
    fi
done

if [ ${#MISSING_PACKAGES[@]} -ne 0 ]; then
    echo -e "${YELLOW}⚠️  缺少以下 Python 包: ${MISSING_PACKAGES[*]}${NC}"
    echo "正在安装..."
    $PYTHON_CMD -m pip install "${MISSING_PACKAGES[@]}"
else
    echo -e "${GREEN}✓ 所有 Python 依赖已安装${NC}"
fi
echo ""

# 检查 Node.js
echo "3️⃣  检查 Node.js 环境..."
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js 版本: $(node --version)${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js 未安装，跳过 Node.js 测试${NC}"
fi
echo ""

# 测试 Python 函数
echo "4️⃣  测试原始 Python 函数..."
$PYTHON_CMD weixingguibi2youhuasuduhanshufengzhuang.py > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Python 函数测试通过${NC}"
else
    echo -e "${RED}❌ Python 函数测试失败${NC}"
fi
echo ""

# 测试 Node.js 调用
if command -v node &> /dev/null; then
    echo "5️⃣  测试 Node.js 调用..."
    
    # 检查 node-fetch
    if ! node -e "require('node-fetch')" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  node-fetch 未安装，正在安装...${NC}"
        npm install node-fetch
    fi
    
    # 运行测试
    node satellite_call_nodejs.js > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Node.js 调用测试通过${NC}"
    else
        echo -e "${RED}❌ Node.js 调用测试失败${NC}"
    fi
else
    echo "5️⃣  跳过 Node.js 测试（未安装 Node.js）"
fi
echo ""

# 测试 Flask API
echo "6️⃣  测试 Flask API..."

# 检查 Flask
if ! $PYTHON_CMD -c "import flask" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Flask 未安装，正在安装...${NC}"
    $PYTHON_CMD -m pip install flask flask-cors
fi

echo "启动 Flask 服务（5秒后自动停止）..."
$PYTHON_CMD satellite_api.py > /dev/null 2>&1 &
API_PID=$!

sleep 3

# 测试 API
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Flask API 启动成功${NC}"
    
    # 测试计算接口
    RESPONSE=$(curl -s -X POST http://localhost:5000/api/satellite/overhead \
      -H "Content-Type: application/json" \
      -d '{
        "tle_line1": "1 25544U 98067A   24123.56789012  .00001234  00000-0  12345-3 0  9999",
        "tle_line2": "2 25544  51.6432 123.4567 0001234  78.9012 281.2345 15.5432123456789",
        "lat": 39.9,
        "lon": 116.4,
        "alt": 0.05,
        "overhead_theta": 10,
        "t_start": "2024-05-03T00:00:00",
        "t_end": "2024-05-04T00:00:00",
        "time_step": 10
      }')
    
    if [ ! -z "$RESPONSE" ]; then
        echo -e "${GREEN}✓ API 计算接口测试通过${NC}"
    else
        echo -e "${RED}❌ API 计算接口测试失败${NC}"
    fi
else
    echo -e "${RED}❌ Flask API 启动失败${NC}"
fi

# 停止 Flask 服务
kill $API_PID 2>/dev/null
echo ""

# 总结
echo "=========================================="
echo "📊 测试总结"
echo "=========================================="
echo ""
echo "✅ 可用的调用方式:"
echo ""
echo "1. Node.js 直接调用:"
echo "   node satellite_call_nodejs.js"
echo ""
echo "2. REST API 调用:"
echo "   python satellite_api.py"
echo "   然后在浏览器打开 satellite_call_api.html"
echo ""
echo "3. 浏览器 Pyodide:"
echo "   直接在浏览器打开 satellite_call_browser.html"
echo ""
echo "=========================================="
echo "📚 详细文档: README_JavaScript_Call.md"
echo "🚀 快速开始: QUICKSTART.md"
echo "=========================================="

