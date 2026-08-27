# 🛰️ 卫星过境预测 | Satellite Pass Prediction

> **JavaScript 前端 + Python 后端的卫星过境预测系统——TLE 轨道数据、过境计算、实时预报、多场景全栈方案。**
>
> *Satellite pass prediction system with JavaScript frontend + Python backend — TLE orbital data, pass calculation, real-time forecast, multi-scenario full-stack solution.*

---

## ⭐ 核心卖点 | Why Star This

| 卖点 | Feature | 一句话 |
|------|---------|--------|
| 🛰️ **过境预测** | Pass Prediction | 精确预测卫星过境时间、方位、高度角 |
| 🌐 **JS+Python** | Full-Stack | JavaScript 前端 + Python 计算引擎 |
| 📡 **TLE 数据** | TLE Data | 支持标准 TLE 轨道参数解析 |
| 📍 **地理定位** | Geolocation | 基于观测点经纬度的本地化预测 |
| 🗺️ **可视化** | Visualization | 轨迹图、过境表、雷达图可视化 |

---

## 🏆 技术栈 | Tech Stack

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-5.0+-red?logo=html5)
![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python)
![Skyfield](https://img.shields.io/badge/Skyfield-1.4+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-2.0+-black?logo=flask)

---

## 🚀 快速开始 | Quick Start

```bash
git clone https://github.com/Windyhhh/Satellite-Pass-JS-Python.git
cd Satellite-Pass-JS-Python

# 1. 安装 Python 依赖
cd backend
pip install -r requirements.txt

# 2. 启动后端计算服务
python app.py --port 5000

# 3. 打开前端
cd ../frontend
# 直接用浏览器打开 index.html
# 或启动本地服务器
python -m http.server 8080
# 访问 http://localhost:8080
```

---

## 📂 项目结构 | Project Structure

```
Satellite-Pass-JS-Python/
├── frontend/                  # 前端
│   ├── index.html            # 主页面
│   ├── css/style.css         # 样式
│   └── js/
│       ├── main.js           # 主逻辑
│       ├── map.js            # 地图可视化
│       └── api.js            # 后端调用
├── backend/                  # Python 后端
│   ├── app.py                # Flask 应用
│   ├── tle_loader.py         # TLE 数据加载
│   ├── pass_calculator.py    # 过境计算
│   └── sat_tracker.py        # 实时跟踪
├── data/                     # TLE 数据
└── requirements.txt
```

---

## 🔬 核心实现 | Core Implementation

### 过境计算 | Pass Calculation

```python
# 基于 Skyfield 的卫星过境计算
from skyfield.api import load, wgs84
from skyfield import api

def calculate_passes(sat_name, observer_lat, observer_lon, observer_elev=0, days=3):
    """计算卫星未来过境信息"""
    # 1. 加载星历和 TLE
    ts = load.timescale()
    satellites = load.tle_file('data/tle.txt')
    sat = next(s for s in satellites if s.name == sat_name)
    
    # 2. 设置观测点
    observer = wgs84.latlon(observer_lat, observer_lon, observer_elev)
    difference = sat - observer
    
    # 3. 计算未来过境
    passes = []
    t0 = ts.now()
    t1 = ts.tt + days
    
    # 查找地平线上方的时间区间
    t, events = sat.find_events(observer, t0, t1, altitude_degrees=10)
    
    for ti, event in zip(t, events):
        # event: 0=rise 1=culmination 2=set
        if event == 0:  # 升起
            current_pass = {'rise_time': ti.utc_datetime()}
        elif event == 1:  # 中天
            current_pass['culmination_time'] = ti.utc_datetime()
        elif event == 2:  # 落下
            current_pass['set_time'] = ti.utc_datetime()
            passes.append(current_pass)
    
    return passes
```

---

## 📊 过境输出示例 | Pass Output

```
🛰️ 国际空间站 (ISS) 未来过境预测
观测点: 北京 (39.9N, 116.4E)

📅 过境时间表:
  ┌────────────────┬────────────┬──────────┐
  │ 升起时间        │ 中天高度角  │ 落下时间  │
  ├────────────────┼────────────┼──────────┤
  │ 19:42:15       │ 45°        │ 19:48:22 │
  │ 21:18:30       │ 32°        │ 21:24:45 │
  │ 22:56:05       │ 61°        │ 23:02:18 │
  └────────────────┴────────────┴──────────┘
```

---

## 🎯 应用场景 | Use Cases

- 🔭 **天文观测**：卫星观测时间规划
- 📡 **无线电**：业余卫星通信窗口预测
- 🌐 **遥感应用**：对地观测卫星过境监测
- 🎓 **全栈教学**：JS + Python 跨语言项目

---

## 📄 License

MIT License — 自由使用、修改和分发。

---

> 💡 **JS + Python 卫星过境预测，Star ⭐ 探索浩瀚星空！**
