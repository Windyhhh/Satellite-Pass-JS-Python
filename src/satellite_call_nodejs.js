/**
 * 方法1: 使用 Node.js child_process 调用 Python 脚本
 * 需要安装: 无需额外依赖，Node.js 内置
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * 调用 Python 函数查找卫星过顶时刻
 * @param {Object} params - 参数对象
 * @param {string} params.tle_line1 - TLE第一行数据
 * @param {string} params.tle_line2 - TLE第二行数据
 * @param {number} params.lat - 地面站纬度（度）
 * @param {number} params.lon - 地面站经度（度）
 * @param {number} params.alt - 地面站海拔（千米）
 * @param {number} params.overhead_theta - 过顶阈值（天顶角，度）
 * @param {string} params.t_start - 搜索起始时间（ISO格式）
 * @param {string} params.t_end - 搜索结束时间（ISO格式）
 * @param {number} params.time_step - 搜索时间步长（秒）
 * @returns {Promise<Object>} 返回过顶信息
 */
function findSatelliteOverhead(params) {
    return new Promise((resolve, reject) => {
        // 创建 Python 进程
        const pythonProcess = spawn('python', [
            path.join(__dirname, 'satellite_wrapper.py'),
            JSON.stringify(params)
        ]);

        let dataString = '';
        let errorString = '';

        // 收集标准输出
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        // 收集错误输出
        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        // 进程结束
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}\n${errorString}`));
                return;
            }

            try {
                const result = JSON.parse(dataString);
                resolve(result);
            } catch (error) {
                reject(new Error(`Failed to parse Python output: ${error.message}\n${dataString}`));
            }
        });

        // 进程错误
        pythonProcess.on('error', (error) => {
            reject(new Error(`Failed to start Python process: ${error.message}`));
        });
    });
}

/**
 * 示例调用
 */
async function example() {
    try {
        console.log('开始调用卫星过顶计算函数...\n');

        const result = await findSatelliteOverhead({
            tle_line1: "1 25544U 98067A   24123.56789012  .00001234  00000-0  12345-3 0  9999",
            tle_line2: "2 25544  51.6432 123.4567 0001234  78.9012 281.2345 15.5432123456789",
            lat: 39.9,           // 北京纬度
            lon: 116.4,          // 北京经度
            alt: 0.05,           // 海拔 50米
            overhead_theta: 10,  // 天顶角阈值 10度
            t_start: "2024-05-03T00:00:00",
            t_end: "2024-05-16T00:00:00",
            time_step: 10        // 10秒步长
        });

        console.log('计算结果：');
        console.log('='.repeat(50));
        
        if (result.overhead_times && result.overhead_times.length > 0) {
            console.log(`✓ 找到卫星过顶时刻`);
            console.log(`  起始时间: ${result.start_time}`);
            console.log(`  结束时间: ${result.end_time}`);
            console.log(`  持续时间: ${result.duration_seconds} 秒`);
            console.log(`  过顶时刻数量: ${result.overhead_times.length} 个`);
            console.log(`\n前5个过顶时刻:`);
            result.overhead_times.slice(0, 5).forEach((time, index) => {
                console.log(`  ${index + 1}. ${time}`);
            });
        } else {
            console.log('✗ 在指定时间区间内，卫星没有过顶时刻');
        }

        console.log('='.repeat(50));

    } catch (error) {
        console.error('错误:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本，执行示例
if (require.main === module) {
    example();
}

// 导出函数供其他模块使用
module.exports = { findSatelliteOverhead };

