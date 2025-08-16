// Simple LIVE button toggle
function initLiveButton() {
    const liveBtn = document.getElementById('live-btn');
    const liveInfo = document.getElementById('live-info');
    
    liveBtn.addEventListener('click', () => {
        liveInfo.classList.toggle('hidden');
        
        // Start live mode - deselect any active sequence
        if (storyData.currentSequence) {
            // Stop any running story
            if (storyData.isRunning) {
                storyData.stop();
                stopPriceUpdates();
            }
            
            // Clear current sequence
            storyData.currentSequence = null;
            updateSequenceButtonStyles();
            
            // Hide controls
            const controlsPanel = document.getElementById('controls-panel');
            controlsPanel.classList.add('hidden');
        }
        
        // Set live mode flag
        window.isLiveMode = true;
        
        // Update price scale for live mode 
        priceScale.updateScale(liveScale.min, liveScale.max, liveScale.base);
        createPriceScaleMarkers();
        
        // Start live tracking
        startLiveTracking();
    });
    
    // Close info box when clicking outside
    document.addEventListener('click', (e) => {
        if (!liveBtn.contains(e.target) && !liveInfo.contains(e.target)) {
            liveInfo.classList.add('hidden');
        }
    });
}

// Show controls when a story is selected
function showControlsForStory() {
    const controlsPanel = document.getElementById('controls-panel');
    controlsPanel.classList.remove('hidden');
}

// Live price tracking
let livePriceInterval = null;
let liveCandleInterval = null;

// Live mode scale configuration
const liveScale = {
    min: 150,
    max: 250,
    base: 200,
    markers: [150, 175, 200, 225, 250]
};

function startLiveTracking() {
    // Stop any existing intervals
    if (livePriceInterval) clearInterval(livePriceInterval);
    if (liveCandleInterval) clearInterval(liveCandleInterval);
    
    
    // Load chart from storage
    loadLiveChartFromStorage();
    
    // Fetch price every 30 seconds
    livePriceInterval = setInterval(async () => {
        const price = await fetchSolanaPrice();
        if (price) {
            addLivePrice(price);
            loadLiveChartFromStorage();
        }
    }, 30000);
    
    // Create new candle every 2 minutes
    liveCandleInterval = setInterval(() => {
        addNewLiveCandle();
        loadLiveChartFromStorage();
    }, 120000);
}

// Load live chart from storage
function loadLiveChartFromStorage() {
    const liveCandles = getLiveCandles();
    
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