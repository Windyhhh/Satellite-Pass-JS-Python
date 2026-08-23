/**
 * 方法3: 使用 Fetch API 调用 Flask REST API
 * 适用于浏览器和 Node.js (需要 node-fetch)
 */

// 如果在 Node.js 环境中运行，需要安装并导入 node-fetch
// npm install node-fetch
// const fetch = require('node-fetch');

/**
 * API 配置
 */
const API_CONFIG = {
    baseURL: 'http://localhost:5000',
    timeout: 30000  // 30秒超时
};

/**
 * 调用卫星过顶计算 API
 * @param {Object} params - 参数对象
 * @returns {Promise<Object>} 返回过顶信息
 */
async function findSatelliteOverhead(params) {
    const url = `${API_CONFIG.baseURL}/api/satellite/overhead`;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}

/**
 * 批量计算多个卫星的过顶时刻
 * @param {Object} params - 参数对象
 * @returns {Promise<Object>} 返回批量计算结果
 */
async function findSatelliteOverheadBatch(params) {
    const url = `${API_CONFIG.baseURL}/api/satellite/overhead/batch`;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout * 2);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}

/**
 * 检查 API 健康状态
 * @returns {Promise<Object>} 返回健康状态
 */
async function checkAPIHealth() {
    const url = `${API_CONFIG.baseURL}/api/health`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        throw new Error(`API is not available: ${error.message}`);
    }
}

/**
 * 示例1: 单个卫星计算
 */
async function example1_SingleSatellite() {
    console.log('示例1: 单个卫星过顶计算');
    console.log('='.repeat(60));
    
    try {
        // 检查 API 是否可用
        console.log('检查 API 状态...');
        const health = await checkAPIHealth();
        console.log('✓ API 状态:', health.status);
        console.log();
        
        // 调用计算函数
        console.log('开始计算卫星过顶时刻...');
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
        
        console.log('✓ 计算完成！');
        console.log();
        
        // 显示结果
        if (result.overhead_times && result.overhead_times.length > 0) {
            console.log('卫星过顶信息:');
            console.log(`  起始时间: ${result.start_time}`);
            console.log(`  结束时间: ${result.end_time}`);
            console.log(`  持续时间: ${result.duration_seconds} 秒`);
            console.log(`  过顶时刻数量: ${result.overhead_times.length} 个`);
            console.log();
            console.log('前5个过顶时刻:');
            result.overhead_times.slice(0, 5).forEach((time, index) => {
                console.log(`  ${index + 1}. ${time}`);
            });
        } else {
            console.log('✗ 在指定时间区间内，卫星没有过顶时刻');
        }
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
    }
    
    console.log('='.repeat(60));
}

/**
 * 示例2: 批量计算多个卫星
 */
async function example2_BatchSatellites() {
    console.log('\n示例2: 批量计算多个卫星');
    console.log('='.repeat(60));
    
    try {
        console.log('开始批量计算...');
        
        const result = await findSatelliteOverheadBatch({
            satellites: [
                {
                    name: "ISS (国际空间站)",
                    tle_line1: "1 25544U 98067A   24123.56789012  .00001234  00000-0  12345-3 0  9999",
                    tle_line2: "2 25544  51.6432 123.4567 0001234  78.9012 281.2345 15.5432123456789"
                },
                {
                    name: "Hubble (哈勃望远镜)",
                    tle_line1: "1 20580U 90037B   24123.12345678  .00000987  00000-0  54321-4 0  9998",
                    tle_line2: "2 20580  28.4699 234.5678 0002345 123.4567 236.6543 15.0987654321098"
                }
            ],
            location: {
                lat: 39.9,
                lon: 116.4,
                alt: 0.05
            },
            overhead_theta: 15,
            t_start: "2024-05-03T00:00:00",
            t_end: "2024-05-04T00:00:00",
            time_step: 10
        });
        
        console.log(`✓ 批量计算完成！共处理 ${result.total} 个卫星`);
        console.log();
        
        // 显示每个卫星的结果
        result.results.forEach((satResult, index) => {
            console.log(`${index + 1}. ${satResult.name}`);
            
            if (satResult.success) {
                const data = satResult.result;
                if (data.overhead_times && data.overhead_times.length > 0) {
                    console.log(`   ✓ 过顶时刻: ${data.overhead_times.length} 个`);
                    console.log(`   起始: ${data.start_time}`);
                    console.log(`   结束: ${data.end_time}`);
                } else {
                    console.log(`   - 无过顶时刻`);
                }
            } else {
                console.log(`   ✗ 计算失败: ${satResult.error}`);
            }
            console.log();
        });
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
    }
    
    console.log('='.repeat(60));
}

/**
 * 示例3: 错误处理
 */
async function example3_ErrorHandling() {
    console.log('\n示例3: 错误处理演示');
    console.log('='.repeat(60));
    
    try {
        console.log('尝试使用无效参数...');
        
        await findSatelliteOverhead({
            tle_line1: "invalid tle",
            tle_line2: "invalid tle",
            lat: 200,  // 无效纬度
            lon: 116.4,
            alt: 0.05,
            overhead_theta: 10,
            t_start: "2024-05-03T00:00:00",
            t_end: "2024-05-16T00:00:00",
            time_step: 10
        });
        
    } catch (error) {
        console.log('✓ 成功捕获错误:', error.message);
    }
    
    console.log('='.repeat(60));
}

/**
 * 主函数 - 运行所有示例
 */
async function main() {
    console.log('\n🛰️  卫星过顶计算 - REST API 调用示例\n');
    
    // 运行示例1
    await example1_SingleSatellite();
    
    // 运行示例2
    await example2_BatchSatellites();
    
    // 运行示例3
    await example3_ErrorHandling();
    
    console.log('\n所有示例运行完成！\n');
}

// 如果在 Node.js 环境中直接运行
if (typeof require !== 'undefined' && require.main === module) {
    // Node.js 环境需要 node-fetch
    const fetch = require('node-fetch');
    global.fetch = fetch;
    
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        findSatelliteOverhead,
        findSatelliteOverheadBatch,
        checkAPIHealth,
        API_CONFIG
    };
}

