// js/state.js

/**
 * 应用的共享状态
 */
export const state = {
    chart: null,
    legendElement: null,
    currentTab: 'candlestick',
    isRealtime: false,
    realtimeInterval: null,
    candleDataGlobal: [], // 缓存K线数据
    gridVisible: true,
    crosshairVisible: true,
    indicatorSeries: new Map(), // 存储所有技术指标系列 { id: { series, type, params, data } }
    activeIndicators: new Set(), // 当前激活的指标ID
    
    // 主图上的系列
    candlestickSeries: null,
    lineSeries: null,
    areaSeries: null,
    histogramSeries: null,
    volumeSeries: null
}; 