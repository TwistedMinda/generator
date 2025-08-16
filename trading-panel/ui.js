// Show controls when a story is selected
function showControlsForStory() {
    const controlsPanel = document.getElementById('controls-panel');
    controlsPanel.classList.remove('hidden');
}

// Initialize with simple sequence
function initDefaultSequence() {
    selectSequence('simple');
}

