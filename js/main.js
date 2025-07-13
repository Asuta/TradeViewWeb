// js/main.js
import { state } from './state.js';
import { initChart } from './chart.js';
import { initEventListeners } from './ui.js';

/**
 * 应用初始化函数
 */
async function main() {
    // 1. 初始化talib-web
    if (window.TalibWeb) {
        try {
            await window.TalibWeb.init();
            console.log('Talib-web initialized successfully');
        } catch (error) {
            console.error('Failed to initialize talib-web:', error);
        }
    } else {
        console.error('Talib-web library not found.');
    }

    // 2. 确保TradingView库已加载
    if (typeof LightweightCharts === 'undefined') {
        console.error('TradingView Lightweight Charts library not loaded');
        document.getElementById('chart').innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 18px;">TradingView库加载失败，请检查网络连接</div>';
        return;
    }

    // 3. 初始化应用状态
    state.legendElement = document.getElementById('legend');
    
    // 4. 初始化图表
    const chartContainer = document.getElementById('chart');
    try {
        initChart(chartContainer);
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
    
    // 5. 初始化所有事件监听器
    initEventListeners();

    console.log('Application initialized successfully.');
}

// 当DOM内容加载完毕后执行main函数
document.addEventListener('DOMContentLoaded', main); 