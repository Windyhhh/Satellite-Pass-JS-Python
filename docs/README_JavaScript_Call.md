# JavaScript 调用 Python 卫星过顶函数

本项目提供了三种方式从 JavaScript 调用 Python 的 `find_satellite_overhead` 函数。

## 📁 文件说明

- `weixingguibi2youhuasuduhanshufengzhuang.py` - 原始 Python 函数
- `satellite_wrapper.py` - Python 包装脚本（用于 Node.js 调用）
- `satellite_call_nodejs.js` - Node.js 调用示例
- `satellite_call_browser.html` - 浏览器调用示例（使用 Pyodide）

## 🚀 方法一：Node.js 调用（推荐用于服务端）

### 前置要求
- 安装 Node.js
- 安装 Python 3.x
- 安装 Python 依赖包：
  ```bash
  pip install sgp4 astropy numpy
  ```

### 使用方法

#### 1. 直接运行示例
```bash
node satellite_call_nodejs.js
```

#### 2. 在你的代码中使用
```javascript
const { findSatelliteOverhead } = require('./satellite_call_nodejs.js');

async function myFunction() {
    const result = await findSatelliteOverhead({
        tle_line1: "1 25544U 98067A   24123.56789012  .00001234  00000-0  12345-3 0  9999",
        tle_line2: "2 25544  51.6432 123.4567 0001234  78.9012 281.2345 15.5432123456789",
        lat: 39.9,           // 纬度（度）
        lon: 116.4,          // 经度（度）
        alt: 0.05,           // 海拔（千米）
        overhead_theta: 10,  // 天顶角阈值（度）
        t_start: "2024-05-03T00:00:00",
        t_end: "2024-05-16T00:00:00",
        time_step: 10        // 时间步长（秒）
    });

    console.log(result);
    // 输出格式:
    // {
    //   overhead_times: ['2024-05-03T12:34:56.000', ...],
    //   start_time: '2024-05-03T12:34:56.000',
    //   end_time: '2024-05-03T12:45:06.000',
    //   duration_seconds: 610
    // }
}
```

### 优点
- ✅ 性能好，直接调用 Python
- ✅ 适合服务端应用
- ✅ 可以使用完整的 Python 生态

### 缺点
- ❌ 需要服务器安装 Python 环境
- ❌ 不能在纯前端环境使用

---

## 🌐 方法二：浏览器调用（使用 Pyodide）

### 使用方法

1. 直接在浏览器中打开 `satellite_call_browser.html`
2. 填写参数
3. 点击"计算卫星过顶"按钮

### 优点
- ✅ 纯前端运行，无需后端
- ✅ 用户友好的界面
- ✅ 跨平台，任何浏览器都可以运行

### 缺点
- ❌ 首次加载较慢（需要下载 Pyodide 和 Python 包）
- ❌ 性能不如原生 Python
- ❌ 需要网络连接（加载 CDN 资源）

---

## 🔧 方法三：REST API（生产环境推荐）

如果需要在生产环境中使用，建议创建一个 Flask/FastAPI 服务。

### 创建 Flask API 服务

```python
# satellite_api.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from astropy.time import Time
from weixingguibi2youhuasuduhanshufengzhuang import find_satellite_overhead

app = Flask(__name__)
CORS(app)  # 允许跨域请求

@app.route('/api/satellite/overhead', methods=['POST'])
def calculate_overhead():
    try:
        data = request.json
        
        result = find_satellite_overhead(
            tle_line1=data['tle_line1'],
            tle_line2=data['tle_line2'],
            lat=float(data['lat']),
            lon=float(data['lon']),
            alt=float(data['alt']),
            overhead_theta=float(data['overhead_theta']),
            t_start=Time(data['t_start'], format='isot', scale='utc'),
            t_end=Time(data['t_end'], format='isot', scale='utc'),
            time_step=int(data['time_step'])
        )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### JavaScript 调用 API

```javascript
async function findSatelliteOverhead(params) {
    const response = await fetch('http://localhost:5000/api/satellite/overhead', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// 使用示例
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
```

### 安装依赖并运行
```bash
pip install flask flask-cors
python satellite_api.py
```

---

## 📊 参数说明

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `tle_line1` | string | TLE第一行数据 | "1 25544U 98067A..." |
| `tle_line2` | string | TLE第二行数据 | "2 25544  51.6432..." |
| `lat` | number | 地面站纬度（度） | 39.9 |
| `lon` | number | 地面站经度（度） | 116.4 |
| `alt` | number | 地面站海拔（千米） | 0.05 |
| `overhead_theta` | number | 过顶阈值-天顶角（度） | 10 |
| `t_start` | string | 搜索起始时间（ISO格式） | "2024-05-03T00:00:00" |
| `t_end` | string | 搜索结束时间（ISO格式） | "2024-05-16T00:00:00" |
| `time_step` | number | 搜索时间步长（秒） | 10 |

## 📤 返回值说明

```javascript
{
    overhead_times: [        // 所有过顶时刻的数组
        "2024-05-03T12:34:56.000",
        "2024-05-03T12:35:06.000",
        ...
    ],
    start_time: "2024-05-03T12:34:56.000",  // 首个过顶时刻
    end_time: "2024-05-03T12:45:06.000",    // 最后过顶时刻
    duration_seconds: 610                    // 过顶总持续时间（秒）
}
```

## 🎯 选择建议

- **开发测试**: 使用 Node.js 方法（方法一）
- **演示/原型**: 使用浏览器方法（方法二）
- **生产环境**: 使用 REST API 方法（方法三）

## 📝 注意事项

1. TLE 数据需要定期更新以保证准确性
2. 时间步长越小，计算越精确但耗时越长
3. 天顶角阈值通常设置为 10-30 度
4. 确保时间格式为 ISO 8601 标准格式

## 🐛 故障排除

### Node.js 方法报错 "Python not found"
- 确保 Python 已安装并添加到系统 PATH
- Windows 用户可能需要使用 `python3` 而不是 `python`

### 浏览器方法加载缓慢
- 首次加载需要下载约 50MB 的资源
- 建议使用本地缓存或自建 Pyodide CDN

### 计算结果为空
- 检查 TLE 数据是否有效
- 确认时间范围是否合理
- 尝试增大天顶角阈值或扩大时间范围

