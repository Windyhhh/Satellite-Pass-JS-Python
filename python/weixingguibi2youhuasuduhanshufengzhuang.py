from sgp4.api import Satrec
from astropy.time import Time
from astropy.coordinates import EarthLocation, ICRS, ITRS, CartesianRepresentation
import numpy as np
from astropy import units as u


def find_satellite_overhead(tle_line1, tle_line2, lat, lon, alt, overhead_theta, t_start, t_end, time_step):
    """
    查找卫星在指定时间区间内过顶（天顶角≤阈值）的时刻

    参数:
        tle_line1 (str): TLE第一行数据
        tle_line2 (str): TLE第二行数据
        lat (float): 地面站纬度（度）
        lon (float): 地面站经度（度）
        alt (float): 地面站海拔（千米）
        overhead_theta (float): 过顶阈值（天顶角，度）
        t_start (Time): 搜索起始时间（astropy Time对象）
        t_end (Time): 搜索结束时间（astropy Time对象）
        time_step (int): 搜索时间步长（秒）

    返回:
        dict: 包含过顶信息的字典，键包括：
            - 'overhead_times': 过顶时刻列表（ISO格式字符串）
            - 'start_time': 首个过顶时刻（ISO格式字符串，无则为None）
            - 'end_time': 最后过顶时刻（ISO格式字符串，无则为None）
            - 'duration_seconds': 过顶总持续时间（秒，无则为0）
    """
    # 初始化卫星和地面点
    sat = Satrec.twoline2rv(tle_line1, tle_line2)
    ground_loc = EarthLocation(
        lat=lat * u.deg,
        lon=lon * u.deg,
        height=alt * 1000 * u.m  # 转换为米
    )

    # 批量生成时间数组
    dt_jd = time_step / 86400  # 时间步长转换为儒略日
    jd_array = np.arange(t_start.jd, t_end.jd, dt_jd)
    t_array = Time(jd_array, format="jd", scale="utc")

    # 批量计算卫星位置
    jd_int = jd_array.astype(int)
    fr_array = jd_array - jd_int
    rs = []  # 卫星位置(km)
    valid_indices = []  # 有效时间索引

    for i in range(len(jd_array)):
        e, r, _ = sat.sgp4(jd_int[i], fr_array[i])
        if e == 0:  # 有效轨道数据
            rs.append(r)
            valid_indices.append(i)

    if not rs:
        return {
            'overhead_times': [],
            'start_time': None,
            'end_time': None,
            'duration_seconds': 0
        }

    # 坐标转换（ICRS→ITRS）
    r_meters = np.array(rs) * 1000  # 转换为米
    t_valid = t_array[valid_indices]

    sat_icrs = ICRS(CartesianRepresentation(
        x=r_meters[:, 0] * u.m,
        y=r_meters[:, 1] * u.m,
        z=r_meters[:, 2] * u.m
    ))
    sat_itrs = sat_icrs.transform_to(ITRS(obstime=t_valid))

    # 计算天顶角
    gp = np.array([ground_loc.x.value, ground_loc.y.value, ground_loc.z.value])
    z_mag = np.linalg.norm(gp)  # 地面点到地心距离

    sat_xyz = np.column_stack([
        sat_itrs.x.value,
        sat_itrs.y.value,
        sat_itrs.z.value
    ])

    # 矢量运算计算天顶角
    rho = sat_xyz - gp
    rho_mag = np.linalg.norm(rho, axis=1)
    dot_product = np.dot(rho, gp)

    # 过滤无效值
    valid_mask = (rho_mag != 0) & (z_mag != 0)
    if not np.any(valid_mask):
        return {
            'overhead_times': [],
            'start_time': None,
            'end_time': None,
            'duration_seconds': 0
        }

    # 计算天顶角并筛选过顶时刻
    cos_theta = dot_product[valid_mask] / (rho_mag[valid_mask] * z_mag)
    cos_theta = np.clip(cos_theta, -1.0, 1.0)  # 处理数值误差
    theta = np.degrees(np.arccos(cos_theta))

    overhead_mask = theta <= overhead_theta
    overhead_times = t_valid[valid_mask][overhead_mask].isot

    # 整理返回结果
    return {
        'overhead_times': list(overhead_times),
        'start_time': overhead_times[0] if len(overhead_times) > 0 else None,
        'end_time': overhead_times[-1] if len(overhead_times) > 0 else None,
        'duration_seconds': len(overhead_times) * time_step if len(overhead_times) > 0 else 0
    }


# 例程调用
if __name__ == "__main__":
    # 输入参数设置
    tle_line1 = "1 25544U 98067A   24123.56789012  .00001234  00000-0  12345-3 0  9999"
    tle_line2 = "2 25544  51.6432 123.4567 0001234  78.9012 281.2345 15.5432123456789"
    lat = 39.9  # 纬度（°）
    lon = 116.4  # 经度（°）
    alt = 0.05  # 海拔（km）
    overhead_theta = 10  # 过顶阈值（天顶角≤10°）
    t_start = Time("2024-05-03T00:00:00", format="isot", scale="utc")
    t_end = Time("2024-05-16T00:00:00", format="isot", scale="utc")
    time_step = 10  # 搜索步长（秒）

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

    # 输出结果
    if result['overhead_times']:
        print(f"卫星过顶信息：")
        print(f"起始时间：{result['start_time']}")
        print(f"结束时间：{result['end_time']}")
        print(f"持续时间：{result['duration_seconds']}秒")
        print(f"过顶时刻数量：{len(result['overhead_times'])}个")
    else:
        print("在指定时间区间内，卫星没有过顶时刻（天顶角≤10°）")