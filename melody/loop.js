// Main Game Loop

let gameLoopId = null;
let fpsCounter = 0;
let lastFpsTime = 0;

function gameLoop() {
    // Update game state
    updateGame();
    
    // Performance monitoring
    updateFPS();
    
    // Check for milestones
    checkMilestones();
    
    // Performance cleanup
    if (performance.now() % 1000 < 16) {
        checkPerformance();
    }
    
    // Continue loop
    gameLoopId = requestAnimationFrame(gameLoop);
}

function startGameLoop() {
    if (gameLoopId !== null) {
        stopGameLoop();
    }
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

function stopGameLoop() {
    if (gameLoopId !== null) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
}

function updateFPS() {
    fpsCounter++;
    const currentTime = performance.now();
    
    if (currentTime >= lastFpsTime + 1000) {
        const fps = Math.round((fpsCounter * 1000) / (currentTime - lastFpsTime));
        
        // Update UI
        updateFPSDisplay(fps);
        
        fpsCounter = 0;
        lastFpsTime = currentTime;
    }
}

// Auto-start when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all resources are loaded
    setTimeout(() => {
        startGame();
        startGameLoop();
    }, 100);
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    stopGameLoop();
    pauseGame();
});

// Handle window focus/blur
window.addEventListener('focus', () => {
    if (!gameLoopId) {
        startGameLoop();
    }
    resumeGame();
});

window.addEventListener('blur', () => {
    pauseGame();
});

// Error handling
window.addEventListener('error', (event) => {
    // Try to recover
    try {
        stopGameLoop();
        setTimeout(() => {
            if (gameState.initialized) {
                startGameLoop();
            } else {
                showMessage('⚠️ Game error - please refresh', 5000);
            }
        }, 1000);
    } catch (e) {
        showMessage('⚠️ Game error - please refresh', 5000);
    }
});

// Performance observer (if available)
if (window.PerformanceObserver) {
    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'measure' && entry.duration > 16) {
                    console.warn(`Slow operation: ${entry.name} took ${entry.duration}ms`);
                }
            }
        });
        
        observer.observe({ entryTypes: ['measure'] });
    } catch (e) {
        // Performance observer not supported
    }
}

// Debug helpers (only in development)
function debugInfo() {
    console.log('🐛 Debug Info:');
    console.log('- Scene objects:', gameState.scene?.children.length || 0);
    console.log('- Particles:', gameState.particles.length);
    console.log('- Notes played:', gameState.notesPlayed);
    console.log('- Player position:', gameState.player.currentPosition);
    console.log('- Player moving:', gameState.player.isMoving);
}

// Make debug function available globally
window.debugInfo = debugInfo;
window.resetGame = resetGame;
window.gameState = gameState;
