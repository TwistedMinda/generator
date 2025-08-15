// Mobile touch controls for Melody game

function initMobileControls() {
    const canvas = document.getElementById('gameCanvas');
    
    // Prevent default touch behaviors
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Prevent scrolling and zooming
    document.addEventListener('touchstart', preventDefaultTouch, { passive: false });
    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
}

function preventDefaultTouch(e) {
    // Prevent scrolling when touching the canvas
    if (e.target.id === 'gameCanvas') {
        e.preventDefault();
    }
}

function handleTouchStart(event) {
    event.preventDefault();
    
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        const rect = event.target.getBoundingClientRect();
        
        // Convert touch coordinates to normalized device coordinates
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Use raycaster to find world position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x, y }, gameState.camera);
        
        // Intersect with a plane at y=0 (ground level)
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersection = new THREE.Vector3();
        
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            // Start moving towards touch position
            gameState.mouse.isPressed = true;
            gameState.mouse.worldTarget.copy(intersection);
            
            // Resume audio context on first touch interaction
            if (gameState.audioContext && gameState.audioContext.state === 'suspended') {
                gameState.audioContext.resume();
            }
        }
    }
}

function handleTouchMove(event) {
    event.preventDefault();
    
    if (gameState.mouse.isPressed && event.touches.length > 0) {
        const touch = event.touches[0];
        const rect = event.target.getBoundingClientRect();
        
        // Convert touch coordinates to normalized device coordinates
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Use raycaster to find world position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x, y }, gameState.camera);
        
        // Intersect with a plane at y=0 (ground level)
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersection = new THREE.Vector3();
        
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            // Update target position as finger moves
            gameState.mouse.worldTarget.copy(intersection);
        }
    }
}

function handleTouchEnd(event) {
    event.preventDefault();
    
    // Stop movement when touch ends
    gameState.mouse.isPressed = false;
    gameState.player.isMoving = false;
}

// Add touch indicators for better UX
function addTouchFeedback() {
    const style = document.createElement('style');
    style.textContent = `
        #gameCanvas {
            touch-action: none;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        }
        
        /* Touch feedback */
        .touch-indicator {
            position: absolute;
            width: 60px;
            height: 60px;
            border: 2px solid rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            animation: touchPulse 0.3s ease-out;
            z-index: 1000;
        }
        
        @keyframes touchPulse {
            0% {
                transform: translate(-50%, -50%) scale(0.5);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

function showTouchIndicator(x, y) {
    const indicator = document.createElement('div');
    indicator.className = 'touch-indicator';
    indicator.style.left = x + 'px';
    indicator.style.top = y + 'px';
    document.body.appendChild(indicator);
    
    // Remove after animation
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }, 300);
}
