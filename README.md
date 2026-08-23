# 🛰️ Satellite Pass JS-Python | 卫星过顶预测全栈方案

> **Full-stack satellite pass prediction system. JavaScript frontend calls Python backend for satellite orbit calculations. Multi-scenario support: ISS, weather satellites, custom TLE. Real-time pass predictions with visual maps.**
>
> 全栈卫星过顶预测系统。JavaScript 前端调用 Python 后端进行卫星轨道计算。多场景支持：ISS、气象卫星、自定义 TLE。实时过顶预测与可视化地图。

---

## 🌟 Features | 核心特性

- **JS + Python** — Frontend calls Python backend via API
- **TLE Support** — Two-Line Element orbit data
- **Multi-Satellite** — ISS, NOAA, custom satellites
- **Pass Prediction** — Calculate next passes for any location
- **Visualization** — Map-based pass trajectory display
- **Multi-Scenario** — Configurable observation points

---

## 🚀 Quick Start | 快速开始

```bash
# Start Python backend
pip install flask skyfield requests
python backend.py

# Open frontend
open index.html
# http://localhost:5000
```

---

## 📡 Supported Satellites | 支持卫星

| Satellite | Type | Update Frequency |
|-----------|------|-----------------|
| **ISS (ZARYA)** | Space Station | Daily |
| **NOAA 15/18/19** | Weather | Weekly |
| **METEOR M2** | Weather | Weekly |
| **Custom TLE** | Any | Manual |

---

## 📄 License | 许可证

MIT License.

[GitHub](https://github.com/Windyhhh/Satellite-Pass-JS-Python)
