// Live candles storage management

// Get all live candles from localStorage
function getLiveCandles(symbol = 'solana') {
    const storageKey = `${LIVE_MODE.STORAGE_KEY}_${symbol}`;
    try {
        return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch (error) {
        console.error(`Failed to parse candles from storage for ${symbol}:`, error);
        return [];
    }
}

// Save all live candles to localStorage
function saveLiveCandles(candles, symbol = 'solana') {
    const storageKey = `${LIVE_MODE.STORAGE_KEY}_${symbol}`;
    try {
        localStorage.setItem(storageKey, JSON.stringify(candles));
        return true;
    } catch (error) {
        console.error(`Failed to save candles to storage for ${symbol}:`, error);
        return false;
    }
}

// Add new price to last candle or create first candle
function addLivePrice(price, symbol = 'solana') {
    let candles = getLiveCandles(symbol);
    
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
    
    saveLiveCandles(candles, symbol);
    return candles;
}

// Create new candle starting with last close price
function addNewLiveCandle(symbol = 'solana') {
    let candles = getLiveCandles(symbol);
    
    if (candles.length > 0) {
        const lastPrice = candles[candles.length - 1].close;
        
        // Add new candle starting with last close price
        candles.push({
            open: lastPrice,
            close: lastPrice,
            high: lastPrice,
            low: lastPrice
        });
        
        saveLiveCandles(candles, symbol);
    }
    
    return candles;
}

// Clear all live candles
function clearLiveCandles(symbol = 'solana') {
    const storageKey = `${LIVE_MODE.STORAGE_KEY}_${symbol}`;
    localStorage.removeItem(storageKey);
}