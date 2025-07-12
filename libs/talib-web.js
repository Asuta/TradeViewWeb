// Talib-web wrapper for technical analysis
// This is a simplified wrapper that provides common TA-Lib functions

class TalibWeb {
    constructor() {
        this.initialized = false;
        this.module = null;
    }

    async init() {
        if (this.initialized) return;

        // For now, we'll provide a mock implementation
        // In a real implementation, you would load the actual talib-web WASM module
        this.initialized = true;
        console.log('Talib-web initialized (mock implementation)');
    }

    // Simple Moving Average
    SMA(data, period = 14) {
        if (!Array.isArray(data) || data.length < period) {
            throw new Error('Invalid data or period');
        }

        const result = [];
        for (let i = period - 1; i < data.length; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += data[i - j];
            }
            result.push(sum / period);
        }
        return result;
    }

    // Exponential Moving Average
    EMA(data, period = 14) {
        if (!Array.isArray(data) || data.length < period) {
            throw new Error('Invalid data or period');
        }

        const result = [];
        const multiplier = 2 / (period + 1);

        // First EMA is SMA
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += data[i];
        }
        result.push(sum / period);

        // Calculate EMA for remaining values
        for (let i = period; i < data.length; i++) {
            const ema = (data[i] * multiplier) + (result[result.length - 1] * (1 - multiplier));
            result.push(ema);
        }

        return result;
    }

    // Relative Strength Index
    RSI(data, period = 14) {
        if (!Array.isArray(data) || data.length < period + 1) {
            throw new Error('Invalid data or period');
        }

        const gains = [];
        const losses = [];

        // Calculate price changes
        for (let i = 1; i < data.length; i++) {
            const change = data[i] - data[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }

        const result = [];

        // Calculate initial average gain and loss
        let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

        // Calculate RSI for each subsequent period
        for (let i = period; i < gains.length; i++) {
            avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
            avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;

            const rs = avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));
            result.push(rsi);
        }

        return result;
    }

    // MACD (Moving Average Convergence Divergence)
    MACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        if (!Array.isArray(data) || data.length < slowPeriod) {
            throw new Error('Invalid data or period');
        }

        const fastEMA = this.EMA(data, fastPeriod);
        const slowEMA = this.EMA(data, slowPeriod);

        // Align arrays (slowEMA is shorter)
        const alignedFastEMA = fastEMA.slice(slowPeriod - fastPeriod);

        // Calculate MACD line
        const macdLine = [];
        for (let i = 0; i < slowEMA.length; i++) {
            macdLine.push(alignedFastEMA[i] - slowEMA[i]);
        }

        // Calculate signal line (EMA of MACD line)
        const signalLine = this.EMA(macdLine, signalPeriod);

        // Calculate histogram
        const histogram = [];
        const alignedMacdLine = macdLine.slice(signalPeriod - 1);
        for (let i = 0; i < signalLine.length; i++) {
            histogram.push(alignedMacdLine[i] - signalLine[i]);
        }

        return {
            macd: alignedMacdLine,
            signal: signalLine,
            histogram: histogram
        };
    }

    // Bollinger Bands
    BBANDS(data, period = 20, stdDev = 2) {
        if (!Array.isArray(data) || data.length < period) {
            throw new Error('Invalid data or period');
        }

        const sma = this.SMA(data, period);
        const upperBand = [];
        const lowerBand = [];

        for (let i = period - 1; i < data.length; i++) {
            const slice = data.slice(i - period + 1, i + 1);
            const mean = sma[i - period + 1];

            // Calculate standard deviation
            const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
            const standardDeviation = Math.sqrt(variance);

            upperBand.push(mean + (stdDev * standardDeviation));
            lowerBand.push(mean - (stdDev * standardDeviation));
        }

        return {
            upper: upperBand,
            middle: sma,
            lower: lowerBand
        };
    }

    // Stochastic Oscillator
    STOCH(high, low, close, kPeriod = 14, dPeriod = 3) {
        if (!Array.isArray(high) || !Array.isArray(low) || !Array.isArray(close)) {
            throw new Error('Invalid data arrays');
        }

        if (high.length !== low.length || low.length !== close.length) {
            throw new Error('Data arrays must have the same length');
        }

        if (high.length < kPeriod) {
            throw new Error('Insufficient data');
        }

        const kPercent = [];

        for (let i = kPeriod - 1; i < high.length; i++) {
            const highestHigh = Math.max(...high.slice(i - kPeriod + 1, i + 1));
            const lowestLow = Math.min(...low.slice(i - kPeriod + 1, i + 1));

            const k = ((close[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
            kPercent.push(k);
        }

        const dPercent = this.SMA(kPercent, dPeriod);

        return {
            k: kPercent.slice(dPeriod - 1),
            d: dPercent
        };
    }
}

// Create global instance
window.TalibWeb = new TalibWeb();
