<div align="center">

# 🛰️ Satellite-Pass-JS-Python

### Satellite pass prediction — JavaScript calling Python.

A full-stack solution where a JavaScript frontend calls a Python backend for satellite pass prediction.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/JavaScript)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![REST](https://img.shields.io/badge/REST-API-2EA44F)](https://restfulapi.net/)

</div>

---

**Satellite-Pass-JS-Python** predicts satellite passes with a **JavaScript frontend calling a Python backend** — a multi-scenario full-stack solution (browser and API).

> [!NOTE]
> 中文项目：卫星过境预测——JavaScript 前端调用 Python 后端，多场景全栈方案。

---

## Quickstart

```bash
git clone https://github.com/Windyhhh/Satellite-Pass-JS-Python.git
cd Satellite-Pass-JS-Python

# 1. Start the Python API
python python/satellite_api.py

# 2. Open the example page
#    examples/satellite_call_browser.html  (browser)
#    examples/satellite_call_api.html      (API)
```

Deployment guides are in `docs/REST-API-Deployment-Guide.md`.

---

## Features

- **JS frontend + Python backend** — cross-language full-stack.
- **Multi-scenario** — browser and REST-API examples.
- **Pass prediction** — orbit-based satellite pass computation.

---

## Project Structure

```
Satellite-Pass-JS-Python/
├── python/                 # satellite_api.py, satellite_wrapper.py
├── src/demo.js             # frontend logic
├── examples/               # satellite_call_browser.html, satellite_call_api.html
├── docs/                   # quickstart, deployment guides
└── package.json
```

---

## License

MIT — free to use, modify and distribute.
