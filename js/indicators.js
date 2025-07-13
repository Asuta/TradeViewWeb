// js/indicators.js
import { state } from './state.js';
// import { updateLegend } from './ui.js'; // Temporarily remove to avoid circular dependency

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
export function addIndicator(type, params = {}) {
    if (!state.candleDataGlobal || state.candleDataGlobal.length === 0) {
        console.warn('No data available for indicator calculation');
        return;
    }

    const indicatorId = `${type}_${Date.now()}`;

    try {
        switch (type) {
            case 'SMA':
                const period = params.period || 20;
                const smaData = TechnicalIndicators.calculateSMA(state.candleDataGlobal, period);
                const smaSeries = state.chart.addLineSeries({
                    color: params.color || '#FF6B6B',
                    lineWidth: 2,
                    title: `SMA(${period})`
                });
                smaSeries.setData(smaData);
                state.indicatorSeries.set(indicatorId, { series: smaSeries, type: type, params: params, data: smaData });
                state.activeIndicators.add(indicatorId);
                break;

            case 'EMA':
                const emaPeriod = params.period || 20;
                const emaData = TechnicalIndicators.calculateEMA(state.candleDataGlobal, emaPeriod);
                const emaSeries = state.chart.addLineSeries({
                    color: params.color || '#4ECDC4',
                    lineWidth: 2,
                    title: `EMA(${emaPeriod})`
                });
                emaSeries.setData(emaData);
                state.indicatorSeries.set(indicatorId, { series: emaSeries, type: type, params: params, data: emaData });
                state.activeIndicators.add(indicatorId);
                break;

            case 'RSI':
                const rsiPeriod = params.period || 14;
                const rsiData = TechnicalIndicators.calculateRSI(state.candleDataGlobal, rsiPeriod);
                // RSI需要单独的价格轴
                const rsiSeries = state.chart.addLineSeries({
                    color: params.color || '#9B59B6',
                    lineWidth: 2,
                    priceScaleId: 'rsi',
                    title: `RSI(${rsiPeriod})`
                });

                // 设置RSI价格轴
                state.chart.priceScale('rsi').applyOptions({
                    scaleMargins: {
                        top: 0.1,
                        bottom: 0.8,
                    },
                    borderVisible: false,
                });

                rsiSeries.setData(rsiData);
                state.indicatorSeries.set(indicatorId, { series: rsiSeries, type: type, params: params, data: rsiData });
                state.activeIndicators.add(indicatorId);
                break;

            case 'BOLLINGER':
                const bbPeriod = params.period || 20;
                const bbStdDev = params.stdDev || 2;
                const bbData = TechnicalIndicators.calculateBollingerBands(state.candleDataGlobal, bbPeriod, bbStdDev);

                // 上轨
                const upperSeries = state.chart.addLineSeries({
                    color: params.upperColor || '#E74C3C',
                    lineWidth: 1,
                    title: `BB Upper(${bbPeriod})`
                });
                upperSeries.setData(bbData.upper);

                // 中轨
                const middleSeries = state.chart.addLineSeries({
                    color: params.middleColor || '#F39C12',
                    lineWidth: 1,
                    title: `BB Middle(${bbPeriod})`
                });
                middleSeries.setData(bbData.middle);

                // 下轨
                const lowerSeries = state.chart.addLineSeries({
                    color: params.lowerColor || '#27AE60',
                    lineWidth: 1,
                    title: `BB Lower(${bbPeriod})`
                });
                lowerSeries.setData(bbData.lower);

                state.indicatorSeries.set(indicatorId, {
                    series: [upperSeries, middleSeries, lowerSeries],
                    type: type,
                    params: params,
                    data: bbData
                });
                state.activeIndicators.add(indicatorId);
                break;

            default:
                console.warn(`Unknown indicator type: ${type}`);
                return;
        }

        console.log(`Added ${type} indicator with ID: ${indicatorId}`);
        // Dispatch event for UI update
        document.dispatchEvent(new CustomEvent('indicatorChanged'));
        return indicatorId;

    } catch (error) {
        console.error(`Error adding ${type} indicator:`, error);
    }
}

// 移除指标
export function removeIndicator(indicatorId) {
    if (!state.indicatorSeries.has(indicatorId)) {
        console.warn(`Indicator ${indicatorId} not found`);
        return;
    }

    const indicator = state.indicatorSeries.get(indicatorId);

    if (Array.isArray(indicator.series)) {
        // 多个系列（如布林带）
        indicator.series.forEach(series => {
            state.chart.removeSeries(series);
        });
    } else {
        // 单个系列
        state.chart.removeSeries(indicator.series);
    }

    state.indicatorSeries.delete(indicatorId);
    state.activeIndicators.delete(indicatorId);
    
    // Dispatch event for UI update
    document.dispatchEvent(new CustomEvent('indicatorChanged'));
    console.log(`Removed indicator: ${indicatorId}`);
}

// 清除所有指标
export function clearAllIndicators() {
    // 使用Array.from()复制Set，防止在迭代时修改Set导致的问题
    Array.from(state.activeIndicators).forEach(indicatorId => {
        removeIndicator(indicatorId);
    });
    console.log('All indicators cleared');
}

// 预设指标快捷函数
export function addSMA20() {
    return addIndicator('SMA', { period: 20, color: '#FF6B6B' });
}

export function addSMA50() {
    return addIndicator('SMA', { period: 50, color: '#4ECDC4' });
}

export function addEMA12() {
    return addIndicator('EMA', { period: 12, color: '#9B59B6' });
}

export function addRSI() {
    return addIndicator('RSI', { period: 14, color: '#E67E22' });
}

export function addBollingerBands() {
    return addIndicator('BOLLINGER', {
        period: 20,
        stdDev: 2,
        upperColor: '#E74C3C',
        middleColor: '#F39C12',
        lowerColor: '#27AE60'
    });
}

// Listen for chart clearing events to auto-clear indicators
document.addEventListener('beforeClearChart', () => {
    clearAllIndicators();
}); 