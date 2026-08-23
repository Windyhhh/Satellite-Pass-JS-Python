# 快速开始指南

## 📦 文件清单

```
├── weixingguibi2youhuasuduhanshufengzhuang.py  # 原始 Python 函数
├── satellite_wrapper.py                         # Python 包装脚本
├── satellite_api.py                             # Flask REST API 服务
├── satellite_call_nodejs.js                     # Node.js 调用示例
├── satellite_call_api.js                        # REST API 调用示例
├── satellite_call_browser.html                  # Pyodide 浏览器版
├── satellite_call_api.html                      # REST API 网页版
├── package.json                                 # Node.js 配置
├── README_JavaScript_Call.md                    # 详细文档
└── QUICKSTART.md                                # 本文件
```

## 🚀 三种使用方式

### 方式 1️⃣: Node.js 直接调用 Python（最简单）

**适用场景**: 本地开发、脚本自动化

```bash
# 1. 安装 Python 依赖
pip install sgp4 astropy numpy

# 2. 安装 Node.js 依赖（可选）
npm install

# 3. 运行示例
node satellite_call_nodejs.js
```

**在代码中使用**:
```javascript
const { findSatelliteOverhead } = require('./satellite_call_nodejs.js');

const result = await findSatelliteOverhead({
    tle_line1: "1 25544U 98067A   24123.56789012  .00001234  00000-0  12345-3 0  9999",
    tle_line2: "2 25544  51.6432 123.4567 0001234  78.9012 281.2345 15.5432123456789",
    lat: 39.9,
    lon: 116.4,
    alt: 0.05,
    overhead_theta: 10,
    t_start: "2024-05-03T00:00:00",
    t_end: "2024-05-16T00:00:00",
    time_step: 10
});

console.log(result);
```

---

### 方式 2️⃣: REST API（推荐生产环境）

**适用场景**: Web 应用、微服务、跨语言调用

```bash
# 1. 安装 Python 依赖
pip install sgp4 astropy numpy flask flask-cors

# 2. 启动 API 服务
python satellite_api.py

# 服务将在 http://localhost:5000 启动
```

**测试 API**:

方法 A - 使用网页界面:
```bash
# 在浏览器中打开
satellite_call_api.html
```

方法 B - 使用 Node.js:
```bash
# 安装依赖
npm install node-fetch

# 运行示例
node satellite_call_api.js
```

方法 C - 使用 curl:
```bash
curl -X POST http://localhost:5000/api/satellite/overhead \
  -H "Content-Type: application/json" \
  -d '{
    "tle_line1": "1 25544U 98067A   24123.56789012  .00001234  00000-0  12345-3 0  9999",
    "tle_line2": "2 25544  51.6432 123.4567 0001234  78.9012 281.2345 15.5432123456789",
    "lat": 39.9,
    "lon": 116.4,
    "alt": 0.05,
    "overhead_theta": 10,
    "t_start": "2024-05-03T00:00:00",
    "t_end": "2024-05-16T00:00:00",
    "time_step": 10
  }'
```

**在 JavaScript 中调用**:
```javascript
const response = await fetch('http://localhost:5000/api/satellite/overhead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        tle_line1: "1 25544U 98067A   24123.56789012  .00001234  00000-0  12345-3 0  9999",
        tle_line2: "2 25544  51.6432 123.4567 0001234  78.9012 281.2345 15.5432123456789",
        lat: 39.9,
        lon: 116.4,
        alt: 0.05,
        overhead_theta: 10,
        t_start: "2024-05-03T00:00:00",
        t_end: "2024-05-16T00:00:00",
        time_step: 10
    })
});

const result = await response.json();
console.log(result);
```

---

### 方式 3️⃣: 浏览器 Pyodide（纯前端）

**适用场景**: 演示、原型、离线应用

```bash
# 直接在浏览器中打开
satellite_call_browser.html
```

**特点**:
- ✅ 无需后端服务器
- ✅ 纯前端运行
- ⚠️ 首次加载较慢（约 50MB）
- ⚠️ 需要网络连接（加载 Pyodide）

---

## 📊 API 端点说明

### 1. 健康检查
```
GET /api/health
```

### 2. 单个卫星计算
```
POST /api/satellite/overhead
Content-Type: application/json

{
  "tle_line1": "...",
  "tle_line2": "...",
  "lat": 39.9,
  "lon": 116.4,
  "alt": 0.05,
  "overhead_theta": 10,
  "t_start": "2024-05-03T00:00:00",
  "t_end": "2024-05-16T00:00:00",
  "time_step": 10
}
```

### 3. 批量计算
```
POST /api/satellite/overhead/batch
Content-Type: application/json

{
  "satellites": [
    {
      "name": "ISS",
      "tle_line1": "...",
      "tle_line2": "..."
    }
  ],
  "location": {
    "lat": 39.9,
    "lon": 116.4,
    "alt": 0.05
  },
  "overhead_theta": 10,
  "t_start": "2024-05-03T00:00:00",
  "t_end": "2024-05-16T00:00:00",
  "time_step": 10
}
```

---

## 🔍 返回值格式

```javascript
{
  "overhead_times": [
    "2024-05-03T12:34:56.000",
    "2024-05-03T12:35:06.000",
    ...
  ],
  "start_time": "2024-05-03T12:34:56.000",
  "end_time": "2024-05-03T12:45:06.000",
  "duration_seconds": 610
}
```

---

## 🛠️ 常见问题

### Q1: Python 找不到模块
```bash
# 确保安装了所有依赖
pip install sgp4 astropy numpy flask flask-cors
```

### Q2: Node.js 报错 "fetch is not defined"
```bash
# 安装 node-fetch
npm install node-fetch

# 或使用 Node.js 18+ (内置 fetch)
```

### Q3: API 连接失败
```bash
# 检查 Flask 服务是否运行
python satellite_api.py

# 检查端口是否被占用
netstat -an | grep 5000
```

### Q4: CORS 错误
```bash
# 确保安装了 flask-cors
pip install flask-cors

# 或在 API 代码中添加 CORS 支持
```

---

## 📝 参数说明

| 参数 | 类型 | 范围 | 说明 |
|------|------|------|------|
| `tle_line1` | string | - | TLE第一行（69字符） |
| `tle_line2` | string | - | TLE第二行（69字符） |
| `lat` | number | -90 ~ 90 | 纬度（度） |
| `lon` | number | -180 ~ 180 | 经度（度） |
| `alt` | number | ≥ 0 | 海拔（千米） |
| `overhead_theta` | number | 0 ~ 90 | 天顶角阈值（度） |
| `t_start` | string | ISO 8601 | 起始时间 |
| `t_end` | string | ISO 8601 | 结束时间 |
| `time_step` | number | > 0 | 时间步长（秒） |

---

## 🎯 推荐配置

### 开发环境
```javascript
{
  overhead_theta: 10,    // 较小的天顶角，更精确
  time_step: 10          // 10秒步长，平衡精度和速度
}
```

### 生产环境
```javascript
{
  overhead_theta: 15,    // 适中的天顶角
  time_step: 30          // 30秒步长，提高性能
}
```

### 快速预览
```javascript
{
  overhead_theta: 30,    // 较大的天顶角
  time_step: 60          // 60秒步长，快速计算
}
```

---

## 📚 更多信息

详细文档请参阅: [README_JavaScript_Call.md](README_JavaScript_Call.md)

---

## 🤝 支持

如有问题，请检查:
1. Python 和 Node.js 版本是否符合要求
2. 所有依赖是否正确安装
3. TLE 数据格式是否正确
4. 时间格式是否为 ISO 8601 标准

祝使用愉快！🚀

