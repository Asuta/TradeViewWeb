// js/ui.js
import { state } from './state.js';
import { initCandlestickChart, initLineChart, initAreaChart, initHistogramChart } from './chart.js';
import { startRealtime, stopRealtime } from './realtime.js';
import { addSMA20, addSMA50, addEMA12, addRSI, addBollingerBands, clearAllIndicators } from './indicators.js';

/**
 * 更新图例
 * @param {object} [param] - Crosshair move event parameter
 */
export function updateLegend(param) {
    const legend = state.legendElement;
    if (!legend) return;

    let html = '';
    const symbol = document.getElementById('symbol')?.value || 'BTC/USDT';
    const timeframe = document.getElementById('timeframe')?.options[document.getElementById('timeframe').selectedIndex]?.text || '1H';
    
    html += `<div><strong>${symbol}</strong>, ${timeframe}</div>`;

    let mainSeriesData = null;

    // Case 1: Crosshair is moving on the chart
    if (param && param.time && param.seriesData) {
        if (state.candlestickSeries && param.seriesData.has(state.candlestickSeries)) {
            mainSeriesData = param.seriesData.get(state.candlestickSeries);
            html += `<div>O:<span class="value">${mainSeriesData.open.toFixed(2)}</span> H:<span class="value">${mainSeriesData.high.toFixed(2)}</span> L:<span class="value">${mainSeriesData.low.toFixed(2)}</span> C:<span class="value">${mainSeriesData.close.toFixed(2)}</span></div>`;
        } else if (state.lineSeries && param.seriesData.has(state.lineSeries)) {
            mainSeriesData = param.seriesData.get(state.lineSeries);
            html += `<div>Value: <span class="value">${mainSeriesData.value.toFixed(2)}</span></div>`;
        } else if (state.areaSeries && param.seriesData.has(state.areaSeries)) {
            mainSeriesData = param.seriesData.get(state.areaSeries);
            html += `<div>Value: <span class="value">${mainSeriesData.value.toFixed(2)}</span></div>`;
        }

        if (mainSeriesData) {
             for (const indicatorInfo of state.indicatorSeries.values()) {
                if (Array.isArray(indicatorInfo.series)) { // For multi-series indicators like Bollinger Bands
                    indicatorInfo.series.forEach(s => {
                        if (param.seriesData.has(s)) {
                            const indicatorValue = param.seriesData.get(s).value;
                            const title = s.options().title;
                            html += `<div style="color: ${s.options().color}">${title}: ${indicatorValue.toFixed(2)}</div>`;
                        }
                    });
                } else { // For single-series indicators
                    const s = indicatorInfo.series;
                    if (s && param.seriesData.has(s)) {
                        const indicatorValue = param.seriesData.get(s).value;
                        const title = s.options().title;
                        html += `<div style="color: ${s.options().color}">${title}: ${indicatorValue.toFixed(2)}</div>`;
                    }
                }
            }
        } else {
            legend.innerHTML = `<div><strong>${symbol}</strong>, ${timeframe}</div>`;
            return;
        }

    } 
    // Case 2: No crosshair move, show latest data point
    else {
        let lastData = null;
        if (state.currentTab === 'candlestick' && state.candleDataGlobal.length > 0) {
            lastData = state.candleDataGlobal[state.candleDataGlobal.length - 1];
            html += `<div>O:<span class="value">${lastData.open.toFixed(2)}</span> H:<span class="value">${lastData.high.toFixed(2)}</span> L:<span class="value">${lastData.low.toFixed(2)}</span> C:<span class="value">${lastData.close.toFixed(2)}</span></div>`;
            
            // Show latest indicator values
            for (const indicatorInfo of state.indicatorSeries.values()) {
                if (indicatorInfo.data) {
                     if (Array.isArray(indicatorInfo.series)) { // Bollinger Bands
                        const upperData = indicatorInfo.data.upper;
                        const middleData = indicatorInfo.data.middle;
                        const lowerData = indicatorInfo.data.lower;
                        if(upperData && upperData.length > 0) {
                             html += `<div style="color: ${indicatorInfo.series[0].options().color}">${indicatorInfo.series[0].options().title}: ${upperData[upperData.length - 1].value.toFixed(2)}</div>`;
                             html += `<div style="color: ${indicatorInfo.series[1].options().color}">${indicatorInfo.series[1].options().title}: ${middleData[middleData.length - 1].value.toFixed(2)}</div>`;
                             html += `<div style="color: ${indicatorInfo.series[2].options().color}">${indicatorInfo.series[2].options().title}: ${lowerData[lowerData.length - 1].value.toFixed(2)}</div>`;
                        }
                     } else { // Single series indicators
                        if (indicatorInfo.data.length > 0) {
                             const lastValue = indicatorInfo.data[indicatorInfo.data.length - 1].value;
                             const s = indicatorInfo.series;
                             html += `<div style="color: ${s.options().color}">${s.options().title}: ${lastValue.toFixed(2)}</div>`;
                        }
                     }
                }
            }
        }
        // NOTE: We could add similar logic for line/area charts if their data were global.
    }

    legend.innerHTML = html;
}

/**
 * 更新指标计数显示
 */
function updateIndicatorCount() {
    const count = state.activeIndicators.size;
    const countElement = document.getElementById('indicatorCount');
    if (countElement) {
        countElement.textContent = `当前指标: ${count}`;
    }
}


/**
 * 初始化所有事件监听器
 */
export function initEventListeners() {
    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tab = btn.dataset.tab;
            state.currentTab = tab;
            
            stopRealtime();
            
            switch (tab) {
                case 'candlestick':
                    initCandlestickChart();
                    break;
                case 'line':
                    initLineChart();
                    break;
                case 'area':
                    initAreaChart();
                    break;
                case 'histogram':
                    initHistogramChart();
                    break;
                case 'realtime':
                    startRealtime();
                    break;
            }
        });
    });
    
    // 控制按钮
    document.getElementById('resetZoom').addEventListener('click', () => {
        if(state.chart) state.chart.timeScale().fitContent();
    });
    
    document.getElementById('toggleCrosshair').addEventListener('click', () => {
        if(state.chart) {
            state.crosshairVisible = !state.crosshairVisible;
            state.chart.applyOptions({
                crosshair: {
                    mode: state.crosshairVisible ? LightweightCharts.CrosshairMode.Normal : LightweightCharts.CrosshairMode.Hidden,
                }
            });
        }
    });
    
    document.getElementById('toggleGrid').addEventListener('click', () => {
        if(state.chart) {
            state.gridVisible = !state.gridVisible;
            state.chart.applyOptions({
                grid: {
                    vertLines: { visible: state.gridVisible },
                    horzLines: { visible: state.gridVisible },
                }
            });
        }
    });
    
    // 监听时间周期 / 交易对变化，重新初始化当前 Tab
    const reinitCurrentTab = () => {
        stopRealtime();
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            activeTab.click();
        }
    };
    
    document.getElementById('timeframe').addEventListener('change', reinitCurrentTab);
    document.getElementById('symbol').addEventListener('change', reinitCurrentTab);

    // 技术指标按钮事件监听器
    document.getElementById('addSMA20').addEventListener('click', () => addSMA20());
    document.getElementById('addSMA50').addEventListener('click', () => addSMA50());
    document.getElementById('addEMA12').addEventListener('click', () => addEMA12());
    document.getElementById('addRSI').addEventListener('click', () => addRSI());
    document.getElementById('addBB').addEventListener('click', () => addBollingerBands());
    document.getElementById('clearIndicators').addEventListener('click', () => clearAllIndicators());

    // 监听图表和指标变化事件以更新UI
    document.addEventListener('crosshairMove', (e) => updateLegend(e.detail));
    document.addEventListener('dataChanged', () => updateLegend());
    document.addEventListener('indicatorChanged', () => {
        updateLegend();
        updateIndicatorCount();
    });

    // 初始化指标计数
    updateIndicatorCount();
} 