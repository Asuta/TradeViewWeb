// js/data.js

/**
 * 生成模拟数据
 * @param {string} type - 'candlestick', 'line', 'area', 'histogram'
 * @param {number} count - 数据点数量
 * @returns {Array}
 */
export function generateSampleData(type = 'candlestick', count = 100) {
    const data = [];
    let basePrice = 50000;
    let baseVolume = 1000;
    
    for (let i = 0; i < count; i++) {
        const time = Math.floor(Date.now() / 1000) - (count - i) * 3600; // 每小时一个数据点
        
        if (type === 'candlestick') {
            const open = basePrice + (Math.random() - 0.5) * 1000;
            const high = open + Math.random() * 500;
            const low = open - Math.random() * 500;
            const close = low + Math.random() * (high - low);
            
            data.push({
                time: time,
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
            });
            
            basePrice = close;
        } else if (type === 'line' || type === 'area') {
            const value = basePrice + (Math.random() - 0.5) * 1000;
            data.push({
                time: time,
                value: parseFloat(value.toFixed(2)),
            });
            basePrice = value;
        } else if (type === 'histogram') {
            const volume = baseVolume + (Math.random() - 0.5) * 500;
            data.push({
                time: time,
                value: parseFloat(volume.toFixed(0)),
                color: Math.random() > 0.5 ? '#26a69a' : '#ef5350',
            });
        }
    }
    
    return data;
} 