# Satellite Overhead REST API 部署手册（Windows 详版）

面向方式二（REST API）的“从零到上线”步骤说明。以 PowerShell 为例，默认仅本机访问；若需局域网/公网访问，见第 8 节。

适用环境：
- Windows 10/11（管理员或可安装软件的普通账户）
- Python 3.8+（建议 3.10~3.12）

——

## 1. 环境自检
在 PowerShell 执行（Win+X → Windows PowerShell）：
```powershell
python --version
```
输出形如 Python 3.12.x 即可。

如未安装 Python：
- 访问 https://www.python.org/downloads/ 下载 Windows x86-64 安装包，勾选“Add python.exe to PATH”。

——

## 2. 进入项目目录
```powershell
cd C:\Users\32517\Desktop\js
```

——

## 3. 创建并激活虚拟环境（推荐）
若激活时报脚本执行策略限制，可先在当前会话临时放开：
```powershell
# 仅当前 PowerShell 会话临时放开脚本执行限制（可选）
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 创建虚拟环境
python -m venv .venv

# 激活虚拟环境
.\.venv\Scripts\Activate.ps1

# 升级安装工具
python -m pip install -U pip setuptools wheel
```
>
> 退出虚拟环境：执行 `deactivate`

——

## 4. 安装依赖
```powershell
pip install sgp4 astropy numpy flask flask-cors
```
遇到下载慢/失败：
```powershell
# 设置清华镜像作为默认（推荐）
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
# 或单次使用镜像
a pip install -i https://mirrors.aliyun.com/pypi/simple <package>
```
验证依赖：
```powershell
python -c "import sgp4, astropy, numpy; print('deps ok')"
```

——

## 5. 启动 API（开发模式）
```powershell
python satellite_api.py
```
期望看到类似输出：
```
🛰️  Satellite Overhead API Server
Server starting on http://localhost:5000
Available endpoints:
  GET  /api/health
  POST /api/satellite/overhead
  POST /api/satellite/overhead/batch
 * Running on http://127.0.0.1:5000
```

——

## 6. 功能验证（三选一或全部）
A) 浏览器访问健康检查：
- 打开 http://localhost:5000/api/health 应返回 {"status":"healthy",...}

B) curl/PowerShell 发起请求：
```powershell
$body = @{
  tle_line1 = "1 25544U 98067A   24123.56789012  .00001234  00000-0  12345-3 0  9999"
  tle_line2 = "2 25544  51.6432 123.4567 0001234  78.9012 281.2345 15.5432123456789"
  lat = 39.9; lon = 116.4; alt = 0.05; overhead_theta = 10
  t_start = "2024-05-03T00:00:00"; t_end = "2024-05-04T00:00:00"; time_step = 10
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/satellite/overhead" -Method POST -Body $body -ContentType 'application/json'
```

C) 图形化页面：
- 双击打开 satellite_call_api.html → 填入参数 → 点击“计算卫星过顶”

——

## 7. 一键端到端测试（可选）
```powershell
.\test_all.bat
```
脚本会：检测 Python/Node → 安装依赖 → 启动 API → 调用 /api/health 与 /api/satellite/overhead → 结束服务。

——

## 8. 开放远程访问（可选）
默认仅本机访问即可。如果需要局域网/公网访问：
1) 服务绑定 0.0.0.0（代码中已是 0.0.0.0）：
   - satellite_api.py 末尾：`app.run(host='0.0.0.0', port=5000, debug=True)`
2) Windows 防火墙放行 5000 端口（管理员 PowerShell）：
```powershell
New-NetFirewallRule -DisplayName "SatelliteAPI-5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```
3) 在其他机器访问：`http://<本机局域网IP>:5000/api/health`

生产建议通过反向代理（Nginx/IIS）暴露 80/443 端口；示例 Nginx 片段：
```
server {
  listen 80;
  server_name your.domain;
  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

——

## 9. 生产模式运行（不带调试）
推荐使用 Waitress（Windows 友好）：
```powershell
pip install waitress
waitress-serve --host=0.0.0.0 --port=5000 satellite_api:app
```
如需开机自启/崩溃自拉起：
- 使用计划任务/NSSM/WinSW 将上述命令注册为 Windows 服务（NSSM 示例）
  1) 下载 NSSM：https://nssm.cc/download
  2) `nssm install SatelliteAPI`
  3) Application → Path: `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`
  4) Arguments: `-NoProfile -ExecutionPolicy Bypass -Command "waitress-serve --host=0.0.0.0 --port=5000 satellite_api:app"`
  5) 保存并启动服务

——

## 10. 参数与错误排查速查
- 400：参数不合法（lat/lon/alt/overhead_theta/time_step 范围、t_start<t_end、时间为 ISO 字符串）
- 500：依赖或运行时错误（查看启动窗口堆栈；确认依赖已按第 4 节安装）
- 跨域：本项目已启用 CORS，可直接从本地前端调用；注意协议与端口一致
- 端口占用：换端口或结束占用进程（`netstat -ano | findstr :5000` 定位 PID）
- astropy 安装难：升级 pip、用国内镜像、确认 64 位 Python；必要时尝试 `pip install astropy==6.0.*`

——

## 11. 回滚与清理
- 停止服务：Ctrl+C（开发）或停止 Windows 服务（生产）
- 退出虚拟环境：`deactivate`
- 删除虚拟环境目录：删除 `.venv/`

至此，Windows 环境下的部署与验证完成。如需 Linux/Docker 版本的部署文档，我可以再补充一个对应文件。

