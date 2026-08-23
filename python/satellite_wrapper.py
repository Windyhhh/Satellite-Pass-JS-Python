#!/usr/bin/env python3
"""
Python 包装脚本，用于从 JavaScript 调用 find_satellite_overhead 函数
"""

import sys
import json
from astropy.time import Time
from weixingguibi2youhuasuduhanshufengzhuang import find_satellite_overhead


def main():
    try:
        # 从命令行参数读取 JSON 数据
        if len(sys.argv) < 2:
            raise ValueError("Missing parameters")
        
        params = json.loads(sys.argv[1])
        
        # 提取参数
        tle_line1 = params['tle_line1']
        tle_line2 = params['tle_line2']
        lat = float(params['lat'])
        lon = float(params['lon'])
        alt = float(params['alt'])
        overhead_theta = float(params['overhead_theta'])
        t_start = Time(params['t_start'], format='isot', scale='utc')
        t_end = Time(params['t_end'], format='isot', scale='utc')
        time_step = int(params['time_step'])
        
        # 调用函数
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
        
        # 输出 JSON 结果
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        # 输出错误信息到 stderr
        sys.stderr.write(f"Error: {str(e)}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()

