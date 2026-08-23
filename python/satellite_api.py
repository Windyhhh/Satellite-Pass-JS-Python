#!/usr/bin/env python3
"""
Flask REST API 服务 - 卫星过顶计算
提供 HTTP API 接口供 JavaScript 调用
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from astropy.time import Time
from weixingguibi2youhuasuduhanshufengzhuang import find_satellite_overhead
import traceback

app = Flask(__name__)
CORS(app)  # 允许跨域请求


@app.route('/', methods=['GET'])
def index():
    """API 首页"""
    return jsonify({
        'name': 'Satellite Overhead API',
        'version': '1.0.0',
        'endpoints': {
            'POST /api/satellite/overhead': '计算卫星过顶时刻',
            'GET /api/health': '健康检查'
        }
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'healthy',
        'service': 'satellite-overhead-api'
    })


@app.route('/api/satellite/overhead', methods=['POST'])
def calculate_overhead():
    """
    计算卫星过顶时刻
    
    请求体 (JSON):
    {
        "tle_line1": "TLE第一行",
        "tle_line2": "TLE第二行",
        "lat": 纬度（度）,
        "lon": 经度（度）,
        "alt": 海拔（千米）,
        "overhead_theta": 天顶角阈值（度）,
        "t_start": "起始时间（ISO格式）",
        "t_end": "结束时间（ISO格式）",
        "time_step": 时间步长（秒）
    }
    
    返回 (JSON):
    {
        "overhead_times": ["时刻1", "时刻2", ...],
        "start_time": "首个过顶时刻",
        "end_time": "最后过顶时刻",
        "duration_seconds": 持续时间（秒）
    }
    """
    try:
        # 验证请求数据
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type must be application/json'
            }), 400
        
        data = request.json
        
        # 验证必需参数
        required_fields = [
            'tle_line1', 'tle_line2', 'lat', 'lon', 'alt',
            'overhead_theta', 't_start', 't_end', 'time_step'
        ]
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # 参数类型转换和验证
        try:
            tle_line1 = str(data['tle_line1']).strip()
            tle_line2 = str(data['tle_line2']).strip()
            lat = float(data['lat'])
            lon = float(data['lon'])
            alt = float(data['alt'])
            overhead_theta = float(data['overhead_theta'])
            t_start_str = str(data['t_start'])
            t_end_str = str(data['t_end'])
            time_step = int(data['time_step'])
            
            # 参数范围验证
            if not (-90 <= lat <= 90):
                return jsonify({'error': 'Latitude must be between -90 and 90'}), 400
            
            if not (-180 <= lon <= 180):
                return jsonify({'error': 'Longitude must be between -180 and 180'}), 400
            
            if alt < 0:
                return jsonify({'error': 'Altitude must be non-negative'}), 400
            
            if not (0 < overhead_theta <= 90):
                return jsonify({'error': 'Overhead theta must be between 0 and 90'}), 400
            
            if time_step <= 0:
                return jsonify({'error': 'Time step must be positive'}), 400
            
            # 转换时间对象
            t_start = Time(t_start_str, format='isot', scale='utc')
            t_end = Time(t_end_str, format='isot', scale='utc')
            
            if t_start >= t_end:
                return jsonify({'error': 'Start time must be before end time'}), 400
            
        except ValueError as e:
            return jsonify({
                'error': f'Invalid parameter value: {str(e)}'
            }), 400
        
        # 调用计算函数
        result = find_satellite_overhead(
            tle_line1=tle_line1,
            tle_line2=tle_line2,
            lat=lat,
            lon=lon,
            alt=alt,
            overhead_theta=overhead_theta,
            t_start=t_start,
            t_end=t_end,
            time_step=time_step
        )
        
        # 返回结果
        return jsonify(result), 200
    
    except Exception as e:
        # 记录详细错误信息
        error_trace = traceback.format_exc()
        print(f"Error occurred:\n{error_trace}")
        
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@app.route('/api/satellite/overhead/batch', methods=['POST'])
def calculate_overhead_batch():
    """
    批量计算多个卫星的过顶时刻
    
    请求体 (JSON):
    {
        "satellites": [
            {
                "name": "卫星名称（可选）",
                "tle_line1": "TLE第一行",
                "tle_line2": "TLE第二行"
            },
            ...
        ],
        "location": {
            "lat": 纬度（度）,
            "lon": 经度（度）,
            "alt": 海拔（千米）
        },
        "overhead_theta": 天顶角阈值（度）,
        "t_start": "起始时间（ISO格式）",
        "t_end": "结束时间（ISO格式）",
        "time_step": 时间步长（秒）
    }
    """
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.json
        
        # 验证必需参数
        if 'satellites' not in data or not isinstance(data['satellites'], list):
            return jsonify({'error': 'Missing or invalid "satellites" field'}), 400
        
        if 'location' not in data:
            return jsonify({'error': 'Missing "location" field'}), 400
        
        location = data['location']
        lat = float(location['lat'])
        lon = float(location['lon'])
        alt = float(location['alt'])
        overhead_theta = float(data['overhead_theta'])
        t_start = Time(data['t_start'], format='isot', scale='utc')
        t_end = Time(data['t_end'], format='isot', scale='utc')
        time_step = int(data['time_step'])

        # 参数范围校验（与单次计算保持一致）
        if not (-90 <= lat <= 90):
            return jsonify({'error': 'Latitude must be between -90 and 90'}), 400
        if not (-180 <= lon <= 180):
            return jsonify({'error': 'Longitude must be between -180 and 180'}), 400
        if alt < 0:
            return jsonify({'error': 'Altitude must be non-negative'}), 400
        if not (0 < overhead_theta <= 90):
            return jsonify({'error': 'Overhead theta must be between 0 and 90'}), 400
        if time_step <= 0:
            return jsonify({'error': 'Time step must be positive'}), 400
        if t_start >= t_end:
            return jsonify({'error': 'Start time must be before end time'}), 400

        # 批量计算
        results = []
        for sat_data in data['satellites']:
            try:
                result = find_satellite_overhead(
                    tle_line1=sat_data['tle_line1'],
                    tle_line2=sat_data['tle_line2'],
                    lat=lat,
                    lon=lon,
                    alt=alt,
                    overhead_theta=overhead_theta,
                    t_start=t_start,
                    t_end=t_end,
                    time_step=time_step
                )
                
                results.append({
                    'name': sat_data.get('name', 'Unknown'),
                    'success': True,
                    'result': result
                })
            except Exception as e:
                results.append({
                    'name': sat_data.get('name', 'Unknown'),
                    'success': False,
                    'error': str(e)
                })
        
        return jsonify({
            'total': len(data['satellites']),
            'results': results
        }), 200
    
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Error occurred:\n{error_trace}")
        
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


if __name__ == '__main__':
    print("=" * 60)
    print("🛰️  Satellite Overhead API Server")
    print("=" * 60)
    print("Server starting on http://localhost:5000")
    print("\nAvailable endpoints:")
    print("  GET  /                          - API information")
    print("  GET  /api/health                - Health check")
    print("  POST /api/satellite/overhead    - Calculate overhead")
    print("  POST /api/satellite/overhead/batch - Batch calculate")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)

