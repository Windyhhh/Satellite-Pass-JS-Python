# Satellite Overhead REST API 部署与验证指南

本文档面向“方式二（REST API）”的本地/服务器部署与验证，结合仓库现有实现 satellite_api.py（Flask + CORS）。按本文操作可完成从零到可用的端到端验证。

## 1. 环境要求
- 操作系统：Windows 10/11（本文以 Windows 为例），Linux/Mac 同理
- Python：3.8 及以上（已在本机检测到 Python 3.12 可用）
- 网络：可访问 Python 官方镜像以安装依赖
- 端口：默认监听 5000（需确保未被占用）

## 2. 目录结构（关键文件）
- satellite_api.py：REST API 服务端
- weixingguibi2youhuasuduhanshufengzhuang.py：核心计算函数
- satellite_call_api.html / satellite_call_api.js：前端调用示例
- test_all.bat：Windows 一键自检与验证脚本

## 3. 快速开始（开发模式）
1) 打开 PowerShell，进入项目根目录
```powershell
cd C:\Users\32517\Desktop\js
```
2) 创建并激活虚拟环境（推荐）
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -U pip setuptools wheel
```
3) 安装依赖
```powershell
pip install sgp4 astropy numpy flask flask-cors
```
4) 启动 API（开发模式，含调试日志）
```powershell
python satellite_api.py
```
5) 浏览器访问健康检查
- 打开 http://localhost:5000/api/health 应返回：`{"status":"healthy","service":"satellite-overhead-api"}`

6) 期望的启动日志（示例）
```
============================================================
🛰️  Satellite Overhead API Server
============================================================
Server starting on http://localhost:5000

Available endpoints:
  GET  /                          - API information
  GET  /api/health                - Health check
  POST /api/satellite/overhead    - Calculate overhead
  POST /api/satellite/overhead/batch - Batch calculate

Press Ctrl+C to stop the server
============================================================
 * Running on http://127.0.0.1:5000
```
### 3.1 依赖安装常见加速/修复
- 升级 pip：
  ```powershell
  python -m pip install -U pip setuptools wheel
  ```
- 使用国内镜像（任选其一）：
  ```powershell
  pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
  # 或临时：pip install -i https://mirrors.aliyun.com/pypi/simple <pkg>
  ```
- 验证依赖安装是否成功（返回无输出即通过）：
  ```powershell
  python -c "import sgp4, astropy, numpy; print('deps ok')"
  ```
- 如果 astropy 安装失败：
  1) 先升级 pip；2) 确认是 64 位 Python；3) 使用镜像重试；4) 尝试降低版本如 `pip install astropy==6.0.*`。


## 4. 功能验证
- curl（或 PowerShell）调用单次计算端点：
- 用 Postman 验证（可选）：
  1) 新建请求：POST {{baseUrl}}/api/satellite/overhead（baseUrl= http://localhost:5000）
  2) Headers：Content-Type: application/json
  3) Body（raw, JSON）：粘贴上文 curl 中的 JSON
  4) 发送后应获得 200 与 JSON 结果；错误将返回 4xx/5xx 与 error 字段

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
    "t_end": "2024-05-04T00:00:00",
    "time_step": 10
  }'
```
- 浏览器页面测试：双击打开 satellite_call_api.html，点击页面按钮发起请求
- 批量接口示例：POST http://localhost:5000/api/satellite/overhead/batch（参见 使用说明.md 示例）

## 5. 一键验证（推荐）
在项目根目录执行测试脚本（任一方式）：
- 方式 A：资源管理器中双击 test_all.bat
- 方式 B：在 PowerShell 中运行：
```cmd
.\test_all.bat
```
脚本会自动完成：
- 检查 Python/Node 环境
- 自动安装缺失依赖
- 启动 Flask 服务并调用 /api/health
- 调用 /api/satellite/overhead 完成端到端验证

## 6. 生产部署建议（Windows）
开发阶段使用 python satellite_api.py 足够；生产建议使用 WSGI 服务器（如 Waitress）：
1) 安装 Waitress
```powershell
pip install waitress
```
2) 前台启动（无调试，稳定）
```powershell
waitress-serve --host=0.0.0.0 --port=5000 satellite_api:app
```
3) 后台常驻运行（二选一）
- 使用 PowerShell 后台任务、计划任务或 NSSM/WinSW 将命令注册为 Windows 服务
- 确保开机自启、崩溃自动拉起、日志持久化
4) 防火墙与端口
- 仅本机访问：默认即可
- 远程访问：开放入站 5000 端口或通过 Nginx/IIS 反向代理暴露 HTTP/HTTPS

## 7. 端口与跨域
- 端口修改：编辑 satellite_api.py 末尾的 `app.run(host='0.0.0.0', port=5000, debug=True)` 将 5000 改为所需端口
- CORS：已在代码中启用 `CORS(app)`，前端跨域可直接调用（注意协议与端口一致性）

## 8. 常见问题排查
- 依赖安装慢/失败：
  - 先升级 pip：`python -m pip install -U pip`
  - 使用国内镜像：`pip install -i https://pypi.tuna.tsinghua.edu.cn/simple ...`
- 启动失败（端口占用）：
  - 更换端口或终止占用进程（`netstat -ano | findstr :5000` 定位 PID）
- 400 参数错误：
  - 检查 lat/lon/alt 范围、overhead_theta (0,90]、time_step > 0、t_start < t_end、ISO 时间格式
- 500 内部错误：
  - 控制台会打印堆栈，多与依赖缺失或输入格式有关
- 浏览器跨域：
  - 确认访问的是 http://localhost:5000 且未混用 https
- 结果为空：
  - 调整时间范围、增大天顶角阈值、更新 TLE 数据

## 9. 运维与日志
- 开发：Flask 自带日志打印到控制台
- 生产：建议使用 Waitress 并将输出重定向到文件或引入日志管理（如 RotatingFileHandler）
- 监控：通过 GET /api/health 做探活；必要时在反向代理层配置健康检查

## 10. 清单回顾
- [ ] Python 可用，依赖已安装
- [ ] API 启动成功（本机 5000 端口）
- [ ] /api/health 返回 healthy
- [ ] /api/satellite/overhead 正常返回 2xx 与数据
- [ ] 如需远程访问，已开放端口或配置反向代理

如需我为你补充 Dockerfile/Compose、Windows 服务脚本（NSSM/WinSW）或 Postman 集合，请告知目标环境与端口策略。

