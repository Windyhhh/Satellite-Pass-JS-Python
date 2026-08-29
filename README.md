<div align="center">

# 卫星过境预测 | Satellite-Pass-JS-Python

### Satellite pass prediction — JavaScript calling Python.

Three ways for JS to call a Python `find_satellite_overhead` backend computing passes from TLE orbital elements.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/JavaScript)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![REST](https://img.shields.io/badge/REST-API-2EA44F)](https://restfulapi.net/)

</div>

---

**Satellite-Pass-JS-Python** provides **three ways** for a **JavaScript frontend** to call a Python `find_satellite_overhead` function that computes when a satellite passes over a given ground station, using **TLE** two-line elements.

> [!NOTE]
> 中文项目：卫星过境预测——三种方式实现 JavaScript 前端调用 Python 后端（TLE 轨道根数 + 过顶判断），支持批量。

---

## Features

- **TLE-based orbit** — compute satellite orbits from two-line elements.
- **Overhead detection** — pass time when zenith angle ≤ threshold.
- **3 integration methods** — browser / REST API / wrapper examples.
- **Fast & batch** — 1 satellite / 30 days in ~0.5s; 100+ satellites concurrently.

---

## Quickstart

```bash
git clone https://github.com/Windyhhh/Satellite-Pass-JS-Python.git
cd Satellite-Pass-JS-Python

# 1. start the Python API
python python/satellite_api.py

# 2. open an example page
#    examples/satellite_call_browser.html  (browser)
#    examples/satellite_call_api.html      (REST)
```

Deployment guides in `docs/REST-API-Deployment-Guide.md`.

---

## Project Structure

```
Satellite-Pass-JS-Python/
├── python/                 # satellite_api.py, satellite_wrapper.py
├── src/demo.js
├── examples/               # browser / API examples
├── docs/                   # quickstart, deployment
└── package.json
```

---

## License

MIT — free to use, modify and distribute.
