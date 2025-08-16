// Live price tracking functionality

// Live price tracking intervals
let livePriceInterval = null;
let liveCandleInterval = null;
let currentSymbol = 'solana'; // Default symbol

// Calculate dynamic live scale based on stored candle data
function calculateLiveScale(symbol = currentSymbol) {
    const candles = getLiveCandles(symbol);
    
    if (candles.length === 0) {
        // Default scale when no data
        return {
            min: 0,
            max: 100,
            base: 50,
            markers: [100, 75, 50, 25, 0]
        };
    }
    
    // Find min and max from all candles
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    
    candles.forEach(candle => {
        minPrice = Math.min(minPrice, candle.low);
        maxPrice = Math.max(maxPrice, candle.high);
    });
    
    // Add margin on each side
    const priceRange = maxPrice - minPrice;
    const margin = Math.max(priceRange * LIVE_MODE.MARGIN_PERCENT, LIVE_MODE.MIN_MARGIN);
    
    const min = Math.floor(minPrice - margin);
    const max = Math.ceil(maxPrice + margin);
    
    // If range is too small for 5 distinct integer markers, use decimals
    if (max - min < 4) {
        const step = (max - min) / 4;
        const markers = [
            Number(max.toFixed(2)),
            Number((max - step).toFixed(2)),
            Number((max - step * 2).toFixed(2)),
            Number((max - step * 3).toFixed(2)),
            Number(min.toFixed(2))
        ];
        return {
            min,
            max,
            base: markers[2],
            markers
        };
    }
    
    // Create 5 unique markers
    const markers = [
        max,
        max - 1,
        max - 2,
        max - 3,
        min
    ];
    
    // Base is always the middle marker (index 2)
    const base = markers[2];
    
    return { min, max, base, markers };
}

function startLiveTracking(symbol = 'solana') {
    // Stop any existing intervals
    stopLiveTracking();
    
    // Set current symbol
    currentSymbol = symbol;
    
    // Load chart from storage
    loadLiveChartFromStorage(symbol);
    
    // Fetch price immediately when starting
    updateLivePrice(symbol);
    
    // Fetch price every 15 seconds
    livePriceInterval = setInterval(() => updateLivePrice(symbol), LIVE_MODE.PRICE_UPDATE_INTERVAL);
    
    // Create new candle every 1 minute
    liveCandleInterval = setInterval(() => {
        addNewLiveCandle(symbol);
        loadLiveChartFromStorage(symbol);
    }, LIVE_MODE.CANDLE_INTERVAL);
}

function stopLiveTracking() {
    if (livePriceInterval) {
        clearInterval(livePriceInterval);
        livePriceInterval = null;
    }
    if (liveCandleInterval) {
        clearInterval(liveCandleInterval);
        liveCandleInterval = null;
    }
}

// Update live price from API
async function updateLivePrice(symbol = currentSymbol) {
    try {
        const price = await fetchCryptoPrice(symbol);
        if (price) {
            addLivePrice(price, symbol);
            loadLiveChartFromStorage(symbol);
        }
    } catch (error) {
        console.error(`Failed to update live price for ${symbol}:`, error);
    }
}

// Load live chart from storage
function loadLiveChartFromStorage(symbol = currentSymbol) {
    const liveCandles = getLiveCandles(symbol);
    
    // Recalculate scale based on current data
    const liveScale = calculateLiveScale(symbol);
    priceScale.updateScale(liveScale.min, liveScale.max, liveScale.base);
    createPriceScaleMarkers();
    
    // Clear current chart
    chart.candles = [];
    
    // Only add candles if we have data in storage
    if (liveCandles.length > 0) {
        liveCandles.forEach(candleData => {
            chart.addCandle(candleData.open, candleData.close, candleData.high, candleData.low);
        });
    }
    
    updateCandles();
}