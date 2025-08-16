// Price scaling system
// y=0 world coordinate = $50
// 100 world units = $200 price difference
// Therefore: 1 world unit = $2

class PriceScale {
    constructor() {
        this.basePrice = 50; // $50 at y=0
        this.unitsPerDollar = 0.5; // 1 world unit = $2, so 0.5 units per $1
    }

    // Convert price to world Y coordinate
    priceToWorldY(price) {
        return (price - this.basePrice) * this.unitsPerDollar;
    }

    // Convert world Y coordinate to price
    worldYToPrice(worldY) {
        return worldY / this.unitsPerDollar + this.basePrice;
    }

    // Convert a candle's prices to world coordinates
    candleToWorld(candle) {
        return {
            open: this.priceToWorldY(candle.open),
            close: this.priceToWorldY(candle.close),
            high: this.priceToWorldY(candle.high),
            low: this.priceToWorldY(candle.low)
        };
    }

    // Format price for display
    formatPrice(price) {
        return `$${price.toFixed(2)}`;
    }
}

// Global price scale instance
let priceScale = new PriceScale();
