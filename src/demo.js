/**
 * 简单演示脚本 - 展示如何使用 JavaScript 调用 Python 卫星过顶函数
 */

const { findSatelliteOverhead } = require('./satellite_call_nodejs.js');

// 示例 TLE 数据（国际空间站 ISS）
const ISS_TLE = {
    line1: "1 25544U 98067A   24123.56789012  .00001234  00000-0  12345-3 0  9999",
    line2: "2 25544  51.6432 123.4567 0001234  78.9012 281.2345 15.5432123456789"
};

// 地面站位置（北京）
const BEIJING = {
    lat: 39.9,    // 纬度
    lon: 116.4,   // 经度
    alt: 0.05     // 海拔（千米）
};

/**
 * 演示1: 基本使用
 */
async function demo1_BasicUsage() {
    console.log('\n' + '='.repeat(60));
    console.log('演示1: 基本使用');
    console.log('='.repeat(60));
    
    const result = await findSatelliteOverhead({
        tle_line1: ISS_TLE.line1,
        tle_line2: ISS_TLE.line2,
        lat: BEIJING.lat,
        lon: BEIJING.lon,
        alt: BEIJING.alt,
        overhead_theta: 10,                    // 天顶角 ≤ 10度
        t_start: "2024-05-03T00:00:00",
        t_end: "2024-05-16T00:00:00",
        time_step: 10                          // 10秒步长
    });
    
    console.log(`\n找到 ${result.overhead_times.length} 个过顶时刻`);
    if (result.overhead_times.length > 0) {
        console.log(`首次过顶: ${result.start_time}`);
        console.log(`最后过顶: ${result.end_time}`);
        console.log(`总持续时间: ${result.duration_seconds} 秒`);
    }
}

/**
 * 演示2: 不同天顶角对比
 */
async function demo2_CompareAngles() {
    console.log('\n' + '='.repeat(60));
    console.log('演示2: 不同天顶角对比');
    console.log('='.repeat(60));
    
    const angles = [5, 10, 15, 20, 30];
    
    console.log('\n天顶角阈值 | 过顶次数 | 总持续时间');
    console.log('-'.repeat(40));
    
    for (const angle of angles) {
        const result = await findSatelliteOverhead({
            tle_line1: ISS_TLE.line1,
            tle_line2: ISS_TLE.line2,
            lat: BEIJING.lat,
            lon: BEIJING.lon,
            alt: BEIJING.alt,
            overhead_theta: angle,
            t_start: "2024-05-03T00:00:00",
            t_end: "2024-05-04T00:00:00",      // 只查询1天
            time_step: 10
        });
        
        console.log(`${String(angle).padStart(10)}° | ${String(result.overhead_times.length).padStart(8)} | ${String(result.duration_seconds).padStart(10)}秒`);
    }
}

/**
 * 演示3: 不同城市对比
 */
async function demo3_CompareCities() {
    console.log('\n' + '='.repeat(60));
    console.log('演示3: 不同城市过顶时刻对比');
    console.log('='.repeat(60));
    
    const cities = {
        '北京': { lat: 39.9, lon: 116.4, alt: 0.05 },
        '上海': { lat: 31.2, lon: 121.5, alt: 0.004 },
        '广州': { lat: 23.1, lon: 113.3, alt: 0.021 },
        '成都': { lat: 30.7, lon: 104.1, alt: 0.5 }
    };
    
    console.log('\n城市   | 过顶次数 | 首次过顶时间');
    console.log('-'.repeat(60));
    
    for (const [city, location] of Object.entries(cities)) {
        const result = await findSatelliteOverhead({
            tle_line1: ISS_TLE.line1,
            tle_line2: ISS_TLE.line2,
            lat: location.lat,
            lon: location.lon,
            alt: location.alt,
            overhead_theta: 15,
            t_start: "2024-05-03T00:00:00",
            t_end: "2024-05-04T00:00:00",
            time_step: 10
        });
        
        const firstTime = result.start_time ? result.start_time.substring(11, 19) : '无';
        console.log(`${city.padEnd(6)} | ${String(result.overhead_times.length).padStart(8)} | ${firstTime}`);
    }
}

/**
 * 演示4: 时间步长对性能的影响
 */
async function demo4_TimeStepPerformance() {
    console.log('\n' + '='.repeat(60));
    console.log('演示4: 时间步长对性能的影响');
    console.log('='.repeat(60));
    
    const timeSteps = [5, 10, 30, 60];
    
    console.log('\n时间步长 | 计算时间 | 过顶次数');
    console.log('-'.repeat(40));
    
    for (const step of timeSteps) {
        const startTime = Date.now();
        
        const result = await findSatelliteOverhead({
            tle_line1: ISS_TLE.line1,
            tle_line2: ISS_TLE.line2,
            lat: BEIJING.lat,
            lon: BEIJING.lon,
            alt: BEIJING.alt,
            overhead_theta: 10,
            t_start: "2024-05-03T00:00:00",
            t_end: "2024-05-04T00:00:00",
            time_step: step
        });
        
        const elapsed = Date.now() - startTime;
        console.log(`${String(step).padStart(7)}秒 | ${String(elapsed).padStart(7)}ms | ${String(result.overhead_times.length).padStart(8)}`);
    }
}

/**
 * 演示5: 查找最佳观测时间
 */
async function demo5_BestObservationTime() {
    console.log('\n' + '='.repeat(60));
    console.log('演示5: 查找未来7天的最佳观测时间');
    console.log('='.repeat(60));
    
    const result = await findSatelliteOverhead({
        tle_line1: ISS_TLE.line1,
        tle_line2: ISS_TLE.line2,
        lat: BEIJING.lat,
        lon: BEIJING.lon,
        alt: BEIJING.alt,
        overhead_theta: 10,
        t_start: "2024-05-03T00:00:00",
        t_end: "2024-05-10T00:00:00",
        time_step: 10
    });
    
    if (result.overhead_times.length > 0) {
        console.log(`\n✓ 找到 ${result.overhead_times.length} 个观测时刻`);
        console.log(`\n最佳观测时间（前10个）:`);
        console.log('-'.repeat(40));
        
        result.overhead_times.slice(0, 10).forEach((time, index) => {
            const date = new Date(time);
            const dateStr = date.toISOString().substring(0, 10);
            const timeStr = date.toISOString().substring(11, 19);
            console.log(`${index + 1}. ${dateStr} ${timeStr}`);
        });
        
        console.log(`\n总观测时长: ${(result.duration_seconds / 60).toFixed(1)} 分钟`);
    } else {
        console.log('\n✗ 未找到观测时刻');
    }
}

/**
 * 主函数
 */
async function main() {
    console.log('\n🛰️  卫星过顶计算 - JavaScript 调用演示\n');
    
    try {
        await demo1_BasicUsage();
        await demo2_CompareAngles();
        await demo3_CompareCities();
        await demo4_TimeStepPerformance();
        await demo5_BestObservationTime();
        
        console.log('\n' + '='.repeat(60));
        console.log('所有演示完成！');
        console.log('='.repeat(60) + '\n');
        
    } catch (error) {
        console.error('\n❌ 错误:', error.message);
        console.error('\n请确保:');
        console.error('1. 已安装 Python 和必要的包 (sgp4, astropy, numpy)');
        console.error('2. satellite_wrapper.py 文件存在');
        console.error('3. weixingguibi2youhuasuduhanshufengzhuang.py 文件存在\n');
        process.exit(1);
    }
}

// 运行演示
if (require.main === module) {
    main();
}

module.exports = {
    demo1_BasicUsage,
    demo2_CompareAngles,
    demo3_CompareCities,
    demo4_TimeStepPerformance,
    demo5_BestObservationTime
};

