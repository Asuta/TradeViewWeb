// js/chart.js
import { state } from './state.js';
import { generateSampleData } from './data.js';
// import { updateLegend } from './ui.js'; // Removed to break circular dependency
// import { clearAllIndicators } from './indicators.js'; // Removed to break circular dependency

/**
 * 清除所有图表系列
 */
function clearChartSeries() {
    // Dispatch a custom event before clearing indicators
    document.dispatchEvent(new CustomEvent('beforeClearChart'));

    // 清除主图系列
    if (state.candlestickSeries) {
        state.chart.removeSeries(state.candlestickSeries);
        state.candlestickSeries = null;
    }
    if (state.lineSeries) {
        state.chart.removeSeries(state.lineSeries);
        state.lineSeries = null;
    }
    if (state.areaSeries) {
        state.chart.removeSeries(state.areaSeries);
        state.areaSeries = null;
    }
    if (state.histogramSeries) {
        state.chart.removeSeries(state.histogramSeries);
        state.histogramSeries = null;
    }
    if (state.volumeSeries) {
        state.chart.removeSeries(state.volumeSeries);
        state.volumeSeries = null;
    }
    
    // 清除所有技术指标 - This will be handled by an event listener in the indicators module
    // clearAllIndicators(); 
}

/**
 * 初始化主图表
 * @param {HTMLElement} chartContainer - 图表容器DOM元素
 */
export function initChart(chartContainer) {
    if (!chartContainer) {
        console.error('Chart container not found');
        return;
    }
    console.log('Initializing chart...');

    try {
        state.chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: 500,
            layout: {
                background: { type: 'solid', color: '#ffffff' },
                textColor: '#333',
            },
            grid: {
                vertLines: { color: '#e1e1e1' },
                horzLines: { color: '#e1e1e1' },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            rightPriceScale: { borderColor: '#cccccc' },
            timeScale: {
                borderColor: '#cccccc',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        state.chart.subscribeCrosshairMove((param) => {
            // Dispatch event for legend update
            document.dispatchEvent(new CustomEvent('crosshairMove', { detail: param }));
        });

        window.addEventListener('resize', () => {
            state.chart.applyOptions({ width: chartContainer.clientWidth });
        });

        console.log('Chart created successfully, initializing candlestick chart...');
        initCandlestickChart(); // 默认加载K线图
        console.log('Chart initialization completed');

    } catch (error) {
        console.error('Error creating chart:', error);
        if (chartContainer) {
            chartContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">图表加载失败，请刷新页面重试</div>';
        }
    }
}

/**
 * 初始化蜡烛图
 */
export function initCandlestickChart() {
    clearChartSeries();
    
    state.candlestickSeries = state.chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        wickUpColor: '#26a69a',
    });

    state.candleDataGlobal = generateSampleData('candlestick');
    state.candlestickSeries.setData(state.candleDataGlobal);
    
    // 添加成交量
    state.volumeSeries = state.chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
    });
    
    state.chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
    });
    
    const volumeData = generateSampleData('histogram');
    state.volumeSeries.setData(volumeData);
    
    // Dispatch event for legend update
    document.dispatchEvent(new CustomEvent('dataChanged'));
}

/**
 * 初始化线图
 */
export function initLineChart() {
    clearChartSeries();
    
    state.lineSeries = state.chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
    });

    const data = generateSampleData('line');
    state.lineSeries.setData(data);
    
    // Dispatch event for legend update
    document.dispatchEvent(new CustomEvent('dataChanged'));
}

/**
 * 初始化面积图
 */
export function initAreaChart() {
    clearChartSeries();
    
    state.areaSeries = state.chart.addAreaSeries({
        topColor: 'rgba(33, 150, 243, 0.56)',
        bottomColor: 'rgba(33, 150, 243, 0.04)',
        lineColor: 'rgba(33, 150, 243, 1)',
        lineWidth: 2,
    });

    const data = generateSampleData('area');
    state.areaSeries.setData(data);
    
    // Dispatch event for legend update
    document.dispatchEvent(new CustomEvent('dataChanged'));
}

/**
 * 初始化柱状图
 */
export function initHistogramChart() {
    clearChartSeries();
    
    state.histogramSeries = state.chart.addHistogramSeries({
        color: '#26a69a',
    });

    const data = generateSampleData('histogram');
    state.histogramSeries.setData(data);
} 