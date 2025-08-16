// Simple LIVE button toggle
function initLiveButton() {
    const liveBtn = document.getElementById('live-btn');
    const liveInfo = document.getElementById('live-info');
    
    liveBtn.addEventListener('click', () => {
        liveInfo.classList.toggle('hidden');
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