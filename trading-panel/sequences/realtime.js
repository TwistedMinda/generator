// Realtime Sequence
// Generates live candle data with realistic price movements

window.realtimeSequence = {
    name: "Realtime",
    description: "Live candle generation with realistic price movements",
    baseState: [
        { open: 50, close: 50.5, high: 50.8, low: 49.8 }
    ],
    stepChanges: [
        {} // Step 0: base state - will be dynamically updated
    ]
};

// Realtime data generator
class RealtimeDataGenerator {
    constructor() {
        this.currentPrice = 50.5;
        this.currentCandle = {
            open: 50,
            close: 50.5,
            high: 50.8,
            low: 49.8
        };
        this.candleStartTime = Date.now();
        this.lastUpdateTime = Date.now();
        this.volatility = 0.08; // 8% volatility (increased from 2%)
        this.trend = 0; // Slight upward trend
        this.isRunning = false;
    }

    // Generate realistic price movement
    generatePriceMovement() {
        // Random walk with trend and volatility
        const randomChange = (Math.random() - 0.5) * this.volatility;
        const trendChange = this.trend * 0.001; // Small trend component
        const priceChange = randomChange + trendChange;
        
        this.currentPrice *= (1 + priceChange);
        
        // Update current candle
        this.currentCandle.close = this.currentPrice;
        this.currentCandle.high = Math.max(this.currentCandle.high, this.currentPrice);
        this.currentCandle.low = Math.min(this.currentCandle.low, this.currentPrice);
        
        return this.currentCandle;
    }

    // Start new candle
    startNewCandle() {
        this.currentCandle = {
            open: this.currentPrice,
            close: this.currentPrice,
            high: this.currentPrice,
            low: this.currentPrice
        };
        this.candleStartTime = Date.now();
        
        // Slightly adjust trend and volatility for realism
        this.trend += (Math.random() - 0.5) * 0.2; // Increased trend variation
        this.volatility = Math.max(0.02, Math.min(0.15, this.volatility + (Math.random() - 0.5) * 0.02)); // Increased volatility range
    }

    // Get current candle data
    getCurrentCandle() {
        return { ...this.currentCandle };
    }

    // Check if it's time for a new candle (every 5 seconds)
    shouldStartNewCandle() {
        return Date.now() - this.candleStartTime >= 5000; // 5 seconds
    }

    // Check if it's time for an update (every 1 second)
    shouldUpdate() {
        return Date.now() - this.lastUpdateTime >= 1000; // 1 second
    }

    start() {
        this.isRunning = true;
    }

    stop() {
        this.isRunning = false;
    }
}

// Global realtime generator
let realtimeData = new RealtimeDataGenerator();
