# 📂 项目结构说明

## 文件组织

```
js/
│
├── 📚 文档文件
│   ├── README.md                          # 项目主文档（从这里开始）
│   ├── 使用说明.md                         # 中文使用指南
│   ├── QUICKSTART.md                      # 快速开始指南
│   ├── README_JavaScript_Call.md          # 详细技术文档
│   └── PROJECT_STRUCTURE.md               # 本文件
│
├── 🐍 Python 文件
│   ├── weixingguibi2youhuasuduhanshufengzhuang.py  # 原始 Python 函数
│   ├── satellite_wrapper.py               # Python 包装脚本
│   └── satellite_api.py                   # Flask REST API 服务
│
├── 💻 JavaScript 文件
│   ├── satellite_call_nodejs.js           # Node.js 调用示例
│   ├── satellite_call_api.js              # REST API 调用示例
│   └── demo.js                            # 完整演示脚本
│
├── 🌐 HTML 文件
│   ├── satellite_call_browser.html        # Pyodide 浏览器版
│   └── satellite_call_api.html            # REST API 网页界面
│
├── ⚙️ 配置文件
│   └── package.json                       # Node.js 项目配置
│
└── 🧪 测试脚本
    ├── test_all.sh                        # Linux/Mac 测试脚本
    └── test_all.bat                       # Windows 测试脚本
```

---

## 文件详细说明

### 📚 文档文件

#### README.md
- **用途**：项目主文档，提供项目概览
- **内容**：快速开始、文件导航、使用示例
- **适合**：首次接触项目的用户

#### 使用说明.md
- **用途**：详细的中文使用指南
- **内容**：三种调用方式、参数说明、示例代码、常见问题
- **适合**：需要详细了解如何使用的用户

#### QUICKSTART.md
- **用途**：快速开始指南
- **内容**：最简化的安装和使用步骤
- **适合**：想快速上手的用户

#### README_JavaScript_Call.md
- **用途**：详细技术文档
- **内容**：三种方式的技术细节、API 规范、故障排除
- **适合**：需要深入了解技术细节的开发者

---

### 🐍 Python 文件

#### weixingguibi2youhuasuduhanshufengzhuang.py
- **用途**：原始 Python 函数
- **功能**：计算卫星过顶时刻
- **依赖**：sgp4, astropy, numpy
- **可独立运行**：是

#### satellite_wrapper.py
- **用途**：Python 包装脚本
- **功能**：接收 JSON 参数，调用原始函数，返回 JSON 结果
- **被调用者**：satellite_call_nodejs.js
- **可独立运行**：是（需要命令行参数）

#### satellite_api.py
- **用途**：Flask REST API 服务
- **功能**：提供 HTTP API 接口
- **端口**：5000
- **端点**：
  - `GET /api/health` - 健康检查
  - `POST /api/satellite/overhead` - 单个卫星计算
  - `POST /api/satellite/overhead/batch` - 批量计算
- **可独立运行**：是

---

### 💻 JavaScript 文件

#### satellite_call_nodejs.js
- **用途**：Node.js 调用示例（方式一）
- **功能**：通过 child_process 调用 Python
- **依赖**：satellite_wrapper.py
- **环境**：Node.js
- **可独立运行**：是

#### satellite_call_api.js
- **用途**：REST API 调用示例（方式二）
- **功能**：通过 HTTP 调用 Flask API
- **依赖**：satellite_api.py（需先启动）
- **环境**：Node.js 或浏览器
- **可独立运行**：是（需要 node-fetch）

#### demo.js
- **用途**：完整演示脚本
- **功能**：5个演示示例
- **依赖**：satellite_call_nodejs.js
- **环境**：Node.js
- **可独立运行**：是

---

### 🌐 HTML 文件

#### satellite_call_browser.html
- **用途**：Pyodide 浏览器版（方式三）
- **功能**：在浏览器中运行 Python 代码
- **依赖**：Pyodide CDN（自动加载）
- **环境**：现代浏览器
- **可独立运行**：是（需要网络连接）

#### satellite_call_api.html
- **用途**：REST API 网页界面
- **功能**：提供友好的网页界面调用 API
- **依赖**：satellite_api.py（需先启动）
- **环境**：现代浏览器
- **可独立运行**：是

---

### ⚙️ 配置文件

#### package.json
- **用途**：Node.js 项目配置
- **内容**：项目信息、依赖、脚本
- **脚本**：
  - `npm test` - 运行 Node.js 测试
  - `npm run test:api` - 运行 API 测试
  - `npm run start:api` - 启动 API 服务

---

### 🧪 测试脚本

#### test_all.sh
- **用途**：Linux/Mac 测试脚本
- **功能**：自动检查环境、安装依赖、运行测试
- **环境**：Linux, macOS
- **运行**：`bash test_all.sh`

#### test_all.bat
- **用途**：Windows 测试脚本
- **功能**：自动检查环境、安装依赖、运行测试
- **环境**：Windows
- **运行**：`test_all.bat`

---

## 依赖关系图

```
┌─────────────────────────────────────────────────────────┐
│                    调用方式一：Node.js                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  satellite_call_nodejs.js                               │
│           ↓                                             │
│  satellite_wrapper.py                                   │
│           ↓                                             │
│  weixingguibi2youhuasuduhanshufengzhuang.py             │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   调用方式二：REST API                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  satellite_call_api.js / satellite_call_api.html        │
│           ↓ (HTTP)                                      │
│  satellite_api.py                                       │
│           ↓                                             │
│  weixingguibi2youhuasuduhanshufengzhuang.py             │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 调用方式三：浏览器 Pyodide                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  satellite_call_browser.html                            │
│           ↓ (内嵌 Python 代码)                          │
│  Pyodide (浏览器中的 Python)                            │
│           ↓                                             │
│  sgp4, astropy, numpy (通过 Pyodide 加载)              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 使用流程

### 方式一：Node.js 直接调用

```
1. 安装 Python 依赖
   ↓
2. 运行 satellite_call_nodejs.js
   ↓
3. JavaScript 调用 Python 子进程
   ↓
4. 返回 JSON 结果
```

### 方式二：REST API

```
1. 安装 Python 依赖（包括 Flask）
   ↓
2. 启动 satellite_api.py
   ↓
3. 打开 satellite_call_api.html 或运行 satellite_call_api.js
   ↓
4. 发送 HTTP POST 请求
   ↓
5. 返回 JSON 结果
```

### 方式三：浏览器 Pyodide

```
1. 打开 satellite_call_browser.html
   ↓
2. 浏览器加载 Pyodide（首次较慢）
   ↓
3. 填写参数并点击计算
   ↓
4. 在浏览器中运行 Python 代码
   ↓
5. 显示结果
```

---

## 快速查找

### 我想...

- **快速开始** → 阅读 `QUICKSTART.md`
- **了解详细用法** → 阅读 `使用说明.md`
- **查看技术细节** → 阅读 `README_JavaScript_Call.md`
- **运行示例** → 执行 `node demo.js`
- **测试环境** → 运行 `test_all.sh` 或 `test_all.bat`
- **在 Node.js 中使用** → 参考 `satellite_call_nodejs.js`
- **创建 Web 应用** → 参考 `satellite_api.py` 和 `satellite_call_api.html`
- **纯前端使用** → 打开 `satellite_call_browser.html`

---

## 文件大小估算

| 文件 | 大小 | 说明 |
|------|------|------|
| Python 文件 | ~10 KB | 代码文件 |
| JavaScript 文件 | ~20 KB | 代码文件 |
| HTML 文件 | ~30 KB | 包含样式和脚本 |
| 文档文件 | ~50 KB | Markdown 文档 |
| **总计** | **~110 KB** | 不包括依赖包 |

---

## 外部依赖

### Python 依赖（需要安装）
- sgp4 (~500 KB)
- astropy (~50 MB)
- numpy (~20 MB)
- flask (~1 MB, 仅 API 需要)
- flask-cors (~100 KB, 仅 API 需要)

### JavaScript 依赖（需要安装）
- node-fetch (~100 KB, 仅 Node.js 需要)

### 浏览器依赖（自动加载）
- Pyodide (~50 MB, 首次加载)

---

## 版本要求

- **Python**: ≥ 3.7
- **Node.js**: ≥ 14.0
- **浏览器**: 支持 ES6+ 的现代浏览器

---

**提示**：建议从 `README.md` 开始阅读，然后根据需要查看其他文档。

