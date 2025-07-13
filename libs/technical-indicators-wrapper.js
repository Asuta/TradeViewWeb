// TechnicalIndicators 包装器
// 提供与原有自制TA-Lib兼容的API接口，使用官方technicalindicators库
// 替换了原有的自制TA-Lib实现，使用真正的技术分析库

class TalibWebWrapper {
    constructor() {
        this.initialized = false;
        this.talib = null;
    }

    async init() {
        if (this.initialized) return;

        try {
            // 检查technicalindicators是否已加载
            if (typeof window.SMA === 'undefined' || typeof window.EMA === 'undefined') {
                throw new Error('technicalindicators library not loaded');
            }

            // technicalindicators库的所有指标都在全局作用域中
            this.talib = window;
            this.initialized = true;
            console.log('TechnicalIndicators library initialized successfully');
        } catch (error) {
            console.error('Failed to initialize TechnicalIndicators:', error);
            throw error;
        }
    }

    // 简单移动平均线 (SMA)
    SMA(data, period = 14) {
        if (!this.initialized || !this.talib) {
            throw new Error('TechnicalIndicators not initialized');
        }

        if (!Array.isArray(data) || data.length < period) {
            throw new Error('Invalid data or period');
        }

        try {
            const result = this.talib.SMA.calculate({
                period: period,
                values: data
            });

            return result;
        } catch (error) {
            console.error('SMA calculation error:', error);
            throw error;
        }
    }

    // 指数移动平均线 (EMA)
    EMA(data, period = 14) {
        if (!this.initialized || !this.talib) {
            throw new Error('TechnicalIndicators not initialized');
        }

        if (!Array.isArray(data) || data.length < period) {
            throw new Error('Invalid data or period');
        }

        try {
            const result = this.talib.EMA.calculate({
                period: period,
                values: data
            });

            return result;
        } catch (error) {
            console.error('EMA calculation error:', error);
            throw error;
        }
    }

    // 相对强弱指数 (RSI)
    RSI(data, period = 14) {
        if (!this.initialized || !this.talib) {
            throw new Error('TechnicalIndicators not initialized');
        }

        if (!Array.isArray(data) || data.length < period + 1) {
            throw new Error('Invalid data or period');
        }

        try {
            const result = this.talib.RSI.calculate({
                period: period,
                values: data
            });

            return result;
        } catch (error) {
            console.error('RSI calculation error:', error);
            throw error;
        }
    }

    // MACD (移动平均收敛散度)
    MACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        if (!this.initialized || !this.talib) {
            throw new Error('TechnicalIndicators not initialized');
        }

        if (!Array.isArray(data) || data.length < slowPeriod) {
            throw new Error('Invalid data or period');
        }

        try {
            const result = this.talib.MACD.calculate({
                values: data,
                fastPeriod: fastPeriod,
                slowPeriod: slowPeriod,
                signalPeriod: signalPeriod,
                SimpleMAOscillator: false,
                SimpleMASignal: false
            });

            return {
                macd: result.map(r => r.MACD),
                signal: result.map(r => r.signal),
                histogram: result.map(r => r.histogram)
            };
        } catch (error) {
            console.error('MACD calculation error:', error);
            throw error;
        }
    }

    // 布林带 (Bollinger Bands)
    BBANDS(data, period = 20, stdDev = 2) {
        if (!this.initialized || !this.talib) {
            throw new Error('TechnicalIndicators not initialized');
        }

        if (!Array.isArray(data) || data.length < period) {
            throw new Error('Invalid data or period');
        }

        try {
            const result = this.talib.BollingerBands.calculate({
                period: period,
                values: data,
                stdDev: stdDev
            });

            return {
                upper: result.map(r => r.upper),
                middle: result.map(r => r.middle),
                lower: result.map(r => r.lower)
            };
        } catch (error) {
            console.error('BBANDS calculation error:', error);
            throw error;
        }
    }

    // 随机振荡器 (Stochastic Oscillator)
    STOCH(high, low, close, kPeriod = 14, dPeriod = 3) {
        if (!this.initialized || !this.talib) {
            throw new Error('TechnicalIndicators not initialized');
        }

        if (!Array.isArray(high) || !Array.isArray(low) || !Array.isArray(close)) {
            throw new Error('Invalid data arrays');
        }

        if (high.length !== low.length || low.length !== close.length) {
            throw new Error('Data arrays must have the same length');
        }

        if (high.length < kPeriod) {
            throw new Error('Insufficient data');
        }

        try {
            const result = this.talib.Stochastic.calculate({
                high: high,
                low: low,
                close: close,
                period: kPeriod,
                signalPeriod: dPeriod
            });

            return {
                k: result.map(r => r.k),
                d: result.map(r => r.d)
            };
        } catch (error) {
            console.error('STOCH calculation error:', error);
            throw error;
        }
    }
}

// 创建全局实例，保持与原有代码的兼容性
window.TalibWeb = new TalibWebWrapper();
