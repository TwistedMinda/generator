// Simple LIVE button toggle
function initLiveButton() {
    const liveBtn = document.getElementById('live-btn');
    
    liveBtn.addEventListener('click', () => {
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
        const liveScale = calculateLiveScale();
        priceScale.updateScale(liveScale.min, liveScale.max, liveScale.base);
        createPriceScaleMarkers();
        
        // Start live tracking
        startLiveTracking();
    });
}

// Show controls when a story is selected
function showControlsForStory() {
    const controlsPanel = document.getElementById('controls-panel');
    controlsPanel.classList.remove('hidden');
}

// Initialize with simple sequence
function initDefaultSequence() {
    selectSequence('simple');
}

