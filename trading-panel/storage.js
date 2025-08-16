// Live candles storage management

// Get all live candles from localStorage
function getLiveCandles() {
    const candles = JSON.parse(localStorage.getItem(LIVE_CANDLES_KEY)) || [];
    return candles;
}

// Save all live candles to localStorage
function saveLiveCandles(candles) {
    localStorage.setItem(LIVE_CANDLES_KEY, JSON.stringify(candles));
}

// Add new price to last candle or create first candle
function addLivePrice(price) {
    let candles = getLiveCandles();
    
    if (candles.length === 0) {
        // First price - create complete initial candle with realistic OHLC
        const variance = price * 0.005; // 0.5% variance
        candles.push({
            open: price - variance * Math.random(),
            close: price,
            high: price + variance * Math.random(),
            low: price - variance * Math.random()
        });
    } else {
        // Update last candle
        const lastCandle = candles[candles.length - 1];
        lastCandle.close = price;
        lastCandle.high = Math.max(lastCandle.high, price);
        lastCandle.low = Math.min(lastCandle.low, price);
    }
    
    saveLiveCandles(candles);
    return candles;
}

// Create new candle starting with last close price
function addNewLiveCandle() {
    let candles = getLiveCandles();
    
    if (candles.length > 0) {
        const lastPrice = candles[candles.length - 1].close;
        
        // Add new candle starting with last close price
        candles.push({
            open: lastPrice,
            close: lastPrice,
            high: lastPrice,
            low: lastPrice
        });
        
        saveLiveCandles(candles);
    }
    
    return candles;
}

// Clear all live candles
function clearLiveCandles() {
    localStorage.removeItem(LIVE_CANDLES_KEY);
}