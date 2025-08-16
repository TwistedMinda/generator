// Live candles storage management

// Get all live candles from localStorage
function getLiveCandles() {
    try {
        return JSON.parse(localStorage.getItem(LIVE_MODE.STORAGE_KEY)) || [];
    } catch (error) {
        console.error('Failed to parse candles from storage:', error);
        return [];
    }
}

// Save all live candles to localStorage
function saveLiveCandles(candles) {
    try {
        localStorage.setItem(LIVE_MODE.STORAGE_KEY, JSON.stringify(candles));
        return true;
    } catch (error) {
        console.error('Failed to save candles to storage:', error);
        return false;
    }
}

// Add new price to last candle or create first candle
function addLivePrice(price) {
    let candles = getLiveCandles();
    
    if (candles.length === 0) {
        // First price - create complete initial candle with realistic OHLC
        const variance = price * LIVE_MODE.PRICE_VARIANCE;
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
    localStorage.removeItem(LIVE_MODE.STORAGE_KEY);
}