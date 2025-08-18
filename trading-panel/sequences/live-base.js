// Live Sequence Base Class
// Reusable base for all live cryptocurrency sequences

class LiveSequence {
    constructor(config) {
        this.name = config.name;
        this.description = config.description;
        this.symbol = config.symbol;
        this.apiSymbol = config.apiSymbol;
        this.scale = config.scale;
        this.isLive = true;
        this.baseState = [];
        this.stepChanges = [];
    }
    
    // Live-specific methods
    startTracking() {
        startLiveTracking(this.apiSymbol);
        // Set live mode flag
        window.isLiveMode = true;
        // Initialize scale immediately
        const scale = this.updateScale();
        priceScale.updateScale(scale.min, scale.max, scale.base);
        createPriceScaleMarkers();
        this.loadData();
    }
    
    stopTracking() {
        stopLiveTracking();
    }
    
    updateScale() {
        return calculateLiveScale(this.apiSymbol);
    }
    
    loadData() {
        loadLiveChartFromStorage(this.apiSymbol);
    }
}

// Factory function to create live sequences
function createLiveSequence(config) {
    return new LiveSequence(config);
}
