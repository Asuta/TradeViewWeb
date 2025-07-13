// 全局变量
let chart;
let candlestickSeries;
let lineSeries;
let areaSeries;
let histogramSeries;
let volumeSeries;
let legendElement;
let currentTab = 'candlestick';
let isRealtime = false;
let realtimeInterval;
// 新增：全局状态及缓存
let candleDataGlobal = []; // 缓存当前蜡烛数据，便于实时更新/技术指标
let gridVisible = true;
let crosshairVisible = true;
let ma20Series;
let ma50Series;

// 技术指标系列存储
let indicatorSeries = new Map(); // 存储所有技术指标系列
let activeIndicators = new Set(); // 当前激活的指标

// 初始化图表
function initChart() {
    const chartContainer = document.getElementById('chart');
    legendElement = document.getElementById('legend');

    if (!chartContainer) {
        console.error('Chart container not found');
        return;
    }

    console.log('Initializing chart...');

    try {
        chart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 500,
        layout: {
            background: {
                type: 'solid',
                color: '#ffffff',
            },
            textColor: '#333',
        },
        grid: {
            vertLines: {
                color: '#e1e1e1',
            },
            horzLines: {
                color: '#e1e1e1',
            },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: '#cccccc',
        },
        timeScale: {
            borderColor: '#cccccc',
            timeVisible: true,
            secondsVisible: false,
        },
    });

        chart.subscribeCrosshairMove(updateLegend);

        // 响应式处理
        window.addEventListener('resize', () => {
            chart.applyOptions({ width: chartContainer.clientWidth });
        });

        // 初始化蜡烛图
        console.log('Chart created successfully, initializing candlestick chart...');
        initCandlestickChart();
        console.log('Chart initialization completed');

    } catch (error) {
        console.error('Error creating chart:', error);
        const chartContainer = document.getElementById('chart');
        if (chartContainer) {
            chartContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">图表加载失败，请刷新页面重试</div>';
        }
    }
}

// 生成模拟数据
function generateSampleData(type = 'candlestick', count = 100) {
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

// 初始化蜡烛图
function initCandlestickChart() {
    clearChart();
    
    candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        wickUpColor: '#26a69a',
    });

    // 使用全局缓存数组，便于后续实时更新/技术指标
    candleDataGlobal = generateSampleData('candlestick');
    candlestickSeries.setData(candleDataGlobal);
    
    // 添加成交量
    volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
            type: 'volume',
        },
        priceScaleId: 'volume',
    });
    
    chart.priceScale('volume').applyOptions({
        scaleMargins: {
            top: 0.8,
            bottom: 0,
        },
    });
    
    const volumeData = generateSampleData('histogram');
    volumeSeries.setData(volumeData);
    
    updateLegend();
}

// 初始化线图
function initLineChart() {
    clearChart();
    
    lineSeries = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
    });

    const data = generateSampleData('line');
    lineSeries.setData(data);
    
    updateLegend();
}

// 初始化面积图
function initAreaChart() {
    clearChart();
    
    areaSeries = chart.addAreaSeries({
        topColor: 'rgba(33, 150, 243, 0.56)',
        bottomColor: 'rgba(33, 150, 243, 0.04)',
        lineColor: 'rgba(33, 150, 243, 1)',
        lineWidth: 2,
    });

    const data = generateSampleData('area');
    areaSeries.setData(data);
    
    updateLegend();
}

// 初始化柱状图
function initHistogramChart() {
    clearChart();
    
    histogramSeries = chart.addHistogramSeries({
        color: '#26a69a',
    });

    const data = generateSampleData('histogram');
    histogramSeries.setData(data);
}

// 清除图表
function clearChart() {
    if (candlestickSeries) {
        chart.removeSeries(candlestickSeries);
        candlestickSeries = null;
    }
    if (lineSeries) {
        chart.removeSeries(lineSeries);
        lineSeries = null;
    }
    if (areaSeries) {
        chart.removeSeries(areaSeries);
        areaSeries = null;
    }
    if (histogramSeries) {
        chart.removeSeries(histogramSeries);
        histogramSeries = null;
    }
    if (volumeSeries) {
        chart.removeSeries(volumeSeries);
        volumeSeries = null;
    }
    // 新增：清除技术指标线
    if (ma20Series) {
        chart.removeSeries(ma20Series);
        ma20Series = null;
    }
    if (ma50Series) {
        chart.removeSeries(ma50Series);
        ma50Series = null;
    }
}

// 更新图例
function updateLegend(param) {
    const legend = legendElement;
    if (!legend) return;

    let html = '';
    const symbol = document.getElementById('symbol')?.value || 'BTC/USDT';
    const timeframe = document.getElementById('timeframe')?.options[document.getElementById('timeframe').selectedIndex]?.text || '1H';
    
    html += `<div><strong>${symbol}</strong>, ${timeframe}</div>`;

    // Case 1: Crosshair is moving on the chart
    if (param && param.time && param.seriesData) {
        let mainSeriesData = null;
        if (candlestickSeries && param.seriesData.has(candlestickSeries)) {
            mainSeriesData = param.seriesData.get(candlestickSeries);
            html += `<div>O:<span class="value">${mainSeriesData.open.toFixed(2)}</span> H:<span class="value">${mainSeriesData.high.toFixed(2)}</span> L:<span class="value">${mainSeriesData.low.toFixed(2)}</span> C:<span class="value">${mainSeriesData.close.toFixed(2)}</span></div>`;
        } else if (lineSeries && param.seriesData.has(lineSeries)) {
            mainSeriesData = param.seriesData.get(lineSeries);
            html += `<div>Value: <span class="value">${mainSeriesData.value.toFixed(2)}</span></div>`;
        } else if (areaSeries && param.seriesData.has(areaSeries)) {
            mainSeriesData = param.seriesData.get(areaSeries);
            html += `<div>Value: <span class="value">${mainSeriesData.value.toFixed(2)}</span></div>`;
        }

        if (mainSeriesData) {
             for (const [id, indicatorInfo] of indicatorSeries.entries()) {
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
            legend.innerHTML = ''; // Clear legend if cursor is not over a main series data point
            return;
        }

    } 
    // Case 2: No crosshair move, show latest data point
    else {
        let lastData = null;
        if (currentTab === 'candlestick' && candleDataGlobal.length > 0) {
            lastData = candleDataGlobal[candleDataGlobal.length - 1];
            html += `<div>O:<span class="value">${lastData.open.toFixed(2)}</span> H:<span class="value">${lastData.high.toFixed(2)}</span> L:<span class="value">${lastData.low.toFixed(2)}</span> C:<span class="value">${lastData.close.toFixed(2)}</span></div>`;
            
            // Show latest indicator values
            for (const [id, indicatorInfo] of indicatorSeries.entries()) {
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

// 实时数据模拟
function startRealtime() {
    if (isRealtime) return;
    
    isRealtime = true;
    initCandlestickChart();
    
    realtimeInterval = setInterval(() => {
        if (candlestickSeries && candleDataGlobal.length) {
            const last = candleDataGlobal[candleDataGlobal.length - 1];
            const newPrice = last.close + (Math.random() - 0.5) * 100;
            
            const newData = {
                time: Math.floor(Date.now() / 1000),
                open: last.close,
                high: Math.max(last.close, newPrice) + Math.random() * 50,
                low: Math.min(last.close, newPrice) - Math.random() * 50,
                close: newPrice,
            };
            
            candleDataGlobal.push(newData);
            candlestickSeries.update(newData);
            updateLegend();
        }
    }, 1000);
}

function stopRealtime() {
    isRealtime = false;
    if (realtimeInterval) {
        clearInterval(realtimeInterval);
        realtimeInterval = null;
    }
}

// 事件监听器
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化talib-web
    if (window.TalibWeb) {
        try {
            await window.TalibWeb.init();
            console.log('Talib-web initialized successfully');
        } catch (error) {
            console.error('Failed to initialize talib-web:', error);
        }
    }

    // 确保TradingView库已加载
    if (typeof LightweightCharts === 'undefined') {
        console.error('TradingView Lightweight Charts library not loaded');
        // 尝试延迟加载
        setTimeout(() => {
            if (typeof LightweightCharts !== 'undefined') {
                initChart();
            } else {
                document.getElementById('chart').innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 18px;">TradingView库加载失败，请检查网络连接</div>';
            }
        }, 2000);
        return;
    }

    try {
        initChart();
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
    
    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tab = btn.dataset.tab;
            currentTab = tab;
            
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
                case 'indicators':
                    initCandlestickChart();
                    addTechnicalIndicators();
                    break;
            }
        });
    });
    
    // 控制按钮
    document.getElementById('resetZoom').addEventListener('click', () => {
        chart.timeScale().fitContent();
    });
    
    // 十字线开关
    document.getElementById('toggleCrosshair').addEventListener('click', () => {
        crosshairVisible = !crosshairVisible;
        chart.applyOptions({
            crosshair: {
                mode: crosshairVisible ? LightweightCharts.CrosshairMode.Normal : LightweightCharts.CrosshairMode.Hidden,
            }
        });
    });
    
    // 网格开关
    document.getElementById('toggleGrid').addEventListener('click', () => {
        gridVisible = !gridVisible;
        chart.applyOptions({
            grid: {
                vertLines: { visible: gridVisible },
                horzLines: { visible: gridVisible },
            }
        });
    });
    
    // 新增：监听时间周期 / 交易对变化，重新初始化当前 Tab
    const reinitCurrentTab = () => {
        stopRealtime();
        switch (currentTab) {
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
            case 'indicators':
                initCandlestickChart();
                addTechnicalIndicators();
                break;
        }
    };
    
    document.getElementById('timeframe').addEventListener('change', reinitCurrentTab);
    document.getElementById('symbol').addEventListener('change', reinitCurrentTab);

    // 技术指标按钮事件监听器
    document.getElementById('addSMA20').addEventListener('click', () => {
        addSMA20();
        updateIndicatorCount();
    });

    document.getElementById('addSMA50').addEventListener('click', () => {
        addSMA50();
        updateIndicatorCount();
    });

    document.getElementById('addEMA12').addEventListener('click', () => {
        addEMA12();
        updateIndicatorCount();
    });

    document.getElementById('addRSI').addEventListener('click', () => {
        addRSI();
        updateIndicatorCount();
    });

    document.getElementById('addBB').addEventListener('click', () => {
        addBollingerBands();
        updateIndicatorCount();
    });

    document.getElementById('clearIndicators').addEventListener('click', () => {
        clearAllIndicators();
        updateIndicatorCount();
    });

    // 测试技术指标功能（开发时使用）
    // setTimeout(() => {
    //     testIndicators();
    // }, 2000);
});

// 添加技术指标
function addTechnicalIndicators() {
    // 若已存在则先移除，避免叠加
    if (ma20Series) {
        chart.removeSeries(ma20Series);
        ma20Series = null;
    }
    if (ma50Series) {
        chart.removeSeries(ma50Series);
        ma50Series = null;
    }
    
    // 添加移动平均线
    ma20Series = chart.addLineSeries({
        color: '#FF6B6B',
        lineWidth: 1,
        title: 'MA20',
    });
    
    ma50Series = chart.addLineSeries({
        color: '#4ECDC4',
        lineWidth: 1,
        title: 'MA50',
    });
    
    // 直接基于当前 K 线数据计算
    const ma20Data = calculateMA(candleDataGlobal, 20);
    const ma50Data = calculateMA(candleDataGlobal, 50);
    
    ma20Series.setData(ma20Data);
    ma50Series.setData(ma50Data);
}

// 计算移动平均线
function calculateMA(data, period) {
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        
        result.push({
            time: data[i].time,
            value: sum / period,
        });
    }
    
    return result;
}

// ==================== 技术指标功能 ====================

// 技术指标计算函数
const TechnicalIndicators = {
    // 简单移动平均线 (SMA)
    calculateSMA: function(data, period) {
        if (!window.TalibWeb || !window.TalibWeb.initialized) {
            console.error('Talib-web library not loaded or initialized');
            return [];
        }

        const prices = data.map(item => item.close);
        const smaValues = window.TalibWeb.SMA(prices, period);

        // 转换为图表格式
        const result = [];
        for (let i = 0; i < smaValues.length; i++) {
            result.push({
                time: data[i + period - 1].time,
                value: parseFloat(smaValues[i].toFixed(2))
            });
        }

        return result;
    },

    // 指数移动平均线 (EMA)
    calculateEMA: function(data, period) {
        if (!window.TalibWeb || !window.TalibWeb.initialized) {
            console.error('Talib-web library not loaded or initialized');
            return [];
        }

        const prices = data.map(item => item.close);
        const emaValues = window.TalibWeb.EMA(prices, period);

        const result = [];
        for (let i = 0; i < emaValues.length; i++) {
            result.push({
                time: data[i + period - 1].time,
                value: parseFloat(emaValues[i].toFixed(2))
            });
        }

        return result;
    },

    // 相对强弱指数 (RSI)
    calculateRSI: function(data, period = 14) {
        if (!window.TalibWeb || !window.TalibWeb.initialized) {
            console.error('Talib-web library not loaded or initialized');
            return [];
        }

        const prices = data.map(item => item.close);
        const rsiValues = window.TalibWeb.RSI(prices, period);

        const result = [];
        for (let i = 0; i < rsiValues.length; i++) {
            result.push({
                time: data[i + period].time,
                value: parseFloat(rsiValues[i].toFixed(2))
            });
        }

        return result;
    },

    // MACD
    calculateMACD: function(data) {
        if (!window.TalibWeb || !window.TalibWeb.initialized) {
            console.error('Talib-web library not loaded or initialized');
            return { macd: [], signal: [], histogram: [] };
        }

        const prices = data.map(item => item.close);
        const macdData = window.TalibWeb.MACD(prices, 12, 26, 9);

        const macdLine = [];
        const signalLine = [];
        const histogram = [];

        for (let i = 0; i < macdData.macd.length; i++) {
            const timeIndex = i + 25; // MACD需要26个数据点才开始计算
            if (timeIndex < data.length) {
                macdLine.push({
                    time: data[timeIndex].time,
                    value: parseFloat(macdData.macd[i].toFixed(4))
                });

                signalLine.push({
                    time: data[timeIndex].time,
                    value: parseFloat(macdData.signal[i].toFixed(4))
                });

                histogram.push({
                    time: data[timeIndex].time,
                    value: parseFloat(macdData.histogram[i].toFixed(4))
                });
            }
        }

        return { macd: macdLine, signal: signalLine, histogram: histogram };
    },

    // 布林带
    calculateBollingerBands: function(data, period = 20, stdDev = 2) {
        if (!window.TalibWeb || !window.TalibWeb.initialized) {
            console.error('Talib-web library not loaded or initialized');
            return { upper: [], middle: [], lower: [] };
        }

        const prices = data.map(item => item.close);
        const bbData = window.TalibWeb.BBANDS(prices, period, stdDev);

        const upper = [];
        const middle = [];
        const lower = [];

        for (let i = 0; i < bbData.upper.length; i++) {
            const timeIndex = i + period - 1;
            if (timeIndex < data.length) {
                upper.push({
                    time: data[timeIndex].time,
                    value: parseFloat(bbData.upper[i].toFixed(2))
                });

                middle.push({
                    time: data[timeIndex].time,
                    value: parseFloat(bbData.middle[i].toFixed(2))
                });

                lower.push({
                    time: data[timeIndex].time,
                    value: parseFloat(bbData.lower[i].toFixed(2))
                });
            }
        }

        return { upper: upper, middle: middle, lower: lower };
    }
};

// 指标管理函数
function addIndicator(type, params = {}) {
    if (!candleDataGlobal || candleDataGlobal.length === 0) {
        console.warn('No data available for indicator calculation');
        return;
    }

    const indicatorId = `${type}_${Date.now()}`;

    try {
        switch (type) {
            case 'SMA':
                const period = params.period || 20;
                const smaData = TechnicalIndicators.calculateSMA(candleDataGlobal, period);
                const smaSeries = chart.addLineSeries({
                    color: params.color || '#FF6B6B',
                    lineWidth: 2,
                    title: `SMA(${period})`
                });
                smaSeries.setData(smaData);
                indicatorSeries.set(indicatorId, { series: smaSeries, type: type, params: params, data: smaData });
                activeIndicators.add(indicatorId);
                break;

            case 'EMA':
                const emaPeriod = params.period || 20;
                const emaData = TechnicalIndicators.calculateEMA(candleDataGlobal, emaPeriod);
                const emaSeries = chart.addLineSeries({
                    color: params.color || '#4ECDC4',
                    lineWidth: 2,
                    title: `EMA(${emaPeriod})`
                });
                emaSeries.setData(emaData);
                indicatorSeries.set(indicatorId, { series: emaSeries, type: type, params: params, data: emaData });
                activeIndicators.add(indicatorId);
                break;

            case 'RSI':
                const rsiPeriod = params.period || 14;
                const rsiData = TechnicalIndicators.calculateRSI(candleDataGlobal, rsiPeriod);
                // RSI需要单独的价格轴
                const rsiSeries = chart.addLineSeries({
                    color: params.color || '#9B59B6',
                    lineWidth: 2,
                    priceScaleId: 'rsi',
                    title: `RSI(${rsiPeriod})`
                });

                // 设置RSI价格轴
                chart.priceScale('rsi').applyOptions({
                    scaleMargins: {
                        top: 0.1,
                        bottom: 0.8,
                    },
                    borderVisible: false,
                });

                rsiSeries.setData(rsiData);
                indicatorSeries.set(indicatorId, { series: rsiSeries, type: type, params: params, data: rsiData });
                activeIndicators.add(indicatorId);
                break;

            case 'BOLLINGER':
                const bbPeriod = params.period || 20;
                const bbStdDev = params.stdDev || 2;
                const bbData = TechnicalIndicators.calculateBollingerBands(candleDataGlobal, bbPeriod, bbStdDev);

                // 上轨
                const upperSeries = chart.addLineSeries({
                    color: params.upperColor || '#E74C3C',
                    lineWidth: 1,
                    title: `BB Upper(${bbPeriod})`
                });
                upperSeries.setData(bbData.upper);

                // 中轨
                const middleSeries = chart.addLineSeries({
                    color: params.middleColor || '#F39C12',
                    lineWidth: 1,
                    title: `BB Middle(${bbPeriod})`
                });
                middleSeries.setData(bbData.middle);

                // 下轨
                const lowerSeries = chart.addLineSeries({
                    color: params.lowerColor || '#27AE60',
                    lineWidth: 1,
                    title: `BB Lower(${bbPeriod})`
                });
                lowerSeries.setData(bbData.lower);

                indicatorSeries.set(indicatorId, {
                    series: [upperSeries, middleSeries, lowerSeries],
                    type: type,
                    params: params,
                    data: bbData
                });
                activeIndicators.add(indicatorId);
                break;

            default:
                console.warn(`Unknown indicator type: ${type}`);
                return;
        }

        console.log(`Added ${type} indicator with ID: ${indicatorId}`);
        return indicatorId;

    } catch (error) {
        console.error(`Error adding ${type} indicator:`, error);
    }
}

// 移除指标
function removeIndicator(indicatorId) {
    if (!indicatorSeries.has(indicatorId)) {
        console.warn(`Indicator ${indicatorId} not found`);
        return;
    }

    const indicator = indicatorSeries.get(indicatorId);

    if (Array.isArray(indicator.series)) {
        // 多个系列（如布林带）
        indicator.series.forEach(series => {
            chart.removeSeries(series);
        });
    } else {
        // 单个系列
        chart.removeSeries(indicator.series);
    }

    indicatorSeries.delete(indicatorId);
    activeIndicators.delete(indicatorId);

    console.log(`Removed indicator: ${indicatorId}`);
}

// 清除所有指标
function clearAllIndicators() {
    activeIndicators.forEach(indicatorId => {
        removeIndicator(indicatorId);
    });
    console.log('All indicators cleared');
}

// 预设指标快捷函数
function addSMA20() {
    return addIndicator('SMA', { period: 20, color: '#FF6B6B' });
}

function addSMA50() {
    return addIndicator('SMA', { period: 50, color: '#4ECDC4' });
}

function addEMA12() {
    return addIndicator('EMA', { period: 12, color: '#9B59B6' });
}

function addRSI() {
    return addIndicator('RSI', { period: 14, color: '#E67E22' });
}

function addBollingerBands() {
    return addIndicator('BOLLINGER', {
        period: 20,
        stdDev: 2,
        upperColor: '#E74C3C',
        middleColor: '#F39C12',
        lowerColor: '#27AE60'
    });
}

// 测试技术指标功能
function testIndicators() {
    console.log('Testing technical indicators...');

    // 检查库是否加载
    if (typeof window.SMA === 'undefined') {
        console.error('Technical indicators library not loaded!');
        return;
    }

    console.log('Technical indicators library loaded successfully');
    console.log('Available indicators:', Object.keys(window).filter(key =>
        ['SMA', 'EMA', 'RSI', 'MACD', 'BollingerBands'].includes(key)
    ));

    // 添加一些示例指标
    if (candleDataGlobal && candleDataGlobal.length > 0) {
        console.log('Adding sample indicators...');
        addSMA20();
        addSMA50();
        // addRSI();
        // addBollingerBands();
    } else {
        console.warn('No candle data available for indicators');
    }
}

// 更新指标计数显示
function updateIndicatorCount() {
    const count = activeIndicators.size;
    const countElement = document.getElementById('indicatorCount');
    if (countElement) {
        countElement.textContent = `当前指标: ${count}`;
    }
}
