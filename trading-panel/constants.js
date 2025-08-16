// Global constants for the trading panel

// Price scale settings
const PRICE_SCALE_WORLD_RANGE = 15;

// Live mode configuration
const LIVE_MODE = {
    PRICE_UPDATE_INTERVAL: 15000, // 15 seconds
    CANDLE_INTERVAL: 60000, // 1 minute
    STORAGE_KEY: 'liveCandles_v2',
    MARGIN_PERCENT: 0.06,
    MIN_MARGIN: 0.4,
    PRICE_VARIANCE: 0.005 // 0.5% variance for initial candle
};

// Animation timing
const ANIMATION = {
    CANDLE_DURATION: 300, // ms
    PRICE_UPDATE_INTERVAL: 1000 // ms
};