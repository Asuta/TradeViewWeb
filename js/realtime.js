// js/realtime.js
import { state } from './state.js';
// import { initCandlestickChart } from './chart.js';
// import { updateLegend } from './ui.js';

/**
 * 启动实时数据模拟
 */
export function startRealtime() {
    if (state.isRealtime) return;
    
    state.isRealtime = true;
    // 重新初始化K线图以获取一个干净的起点
    // initCandlestickChart(); // Will be called from UI module
    
    state.realtimeInterval = setInterval(() => {
        if (state.candlestickSeries && state.candleDataGlobal.length > 0) {
            const last = state.candleDataGlobal[state.candleDataGlobal.length - 1];
            const newPrice = last.close + (Math.random() - 0.5) * 100;
            
            const newData = {
                time: Math.floor(Date.now() / 1000),
                open: last.close,
                high: Math.max(last.close, newPrice) + Math.random() * 50,
                low: Math.min(last.close, newPrice) - Math.random() * 50,
                close: newPrice,
            };
            
            state.candleDataGlobal.push(newData);
            state.candlestickSeries.update(newData);
            
            // TODO: 更新指标
            
            // updateLegend(); // This will be handled by an event listener later
        }
    }, 1000);
}

/**
 * 停止实时数据模拟
 */
export function stopRealtime() {
    state.isRealtime = false;
    if (state.realtimeInterval) {
        clearInterval(state.realtimeInterval);
        state.realtimeInterval = null;
    }
} 