// BTC Live Price Sequence
// Real-time Bitcoin price tracking with dynamic scaling

window.btcSequence = {
    name: "BTC Live",
    description: "Real-time Bitcoin price tracking",
    isLive: true,
    symbol: "BTC",
    scale: {
        min: 0,
        max: 100000,
        base: 50000,
        markers: [100000, 75000, 50000, 25000, 0]
    },
    baseState: [],
    stepChanges: [],
    
    // Live-specific methods
    startTracking: function() {
        startLiveTracking('bitcoin');
    },
    
    stopTracking: function() {
        stopLiveTracking();
    },
    
    updateScale: function() {
        return calculateLiveScale('bitcoin');
    },
    
    loadData: function() {
        loadLiveChartFromStorage('bitcoin');
    }
};
