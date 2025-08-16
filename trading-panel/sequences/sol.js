// SOL Live Price Sequence
// Real-time Solana price tracking with dynamic scaling

window.solSequence = {
    name: "SOL Live",
    description: "Real-time Solana price tracking",
    isLive: true,
    symbol: "SOL",
    scale: {
        min: 0,
        max: 100,
        base: 50,
        markers: [100, 75, 50, 25, 0]
    },
    baseState: [],
    stepChanges: [],
    
    // Live-specific methods
    startTracking: function() {
        startLiveTracking('solana');
    },
    
    stopTracking: function() {
        stopLiveTracking();
    },
    
    updateScale: function() {
        return calculateLiveScale('solana');
    },
    
    loadData: function() {
        loadLiveChartFromStorage('solana');
    }
};
