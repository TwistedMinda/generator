// Mobile device handling and zoom prevention

function initMobileHandling() {
    // Only run mobile handling on mobile devices
    if (!isMobileDevice()) {
        return;
    }
    
    // Prevent zooming on mobile devices
    preventZoom();
    
    // Handle orientation changes
    handleOrientationChange();
}

function preventZoom() {
    // Prevent zoom on touch events
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Prevent double-tap zoom
    document.addEventListener('dblclick', (e) => {
        e.preventDefault();
    });
    
    // Prevent gesture zoom
    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('gesturechange', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('gestureend', (e) => {
        e.preventDefault();
    });
}

let touchStartDistance = 0;
let isMultiTouch = false;

function handleTouchStart(e) {
    if (e.touches.length > 1) {
        isMultiTouch = true;
        touchStartDistance = getTouchDistance(e.touches[0], e.touches[1]);
        e.preventDefault();
    } else {
        isMultiTouch = false;
    }
}

function handleTouchMove(e) {
    if (isMultiTouch && e.touches.length > 1) {
        const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
        
        // Prevent pinch zoom
        if (Math.abs(currentDistance - touchStartDistance) > 10) {
            e.preventDefault();
        }
    }
}

function handleTouchEnd(e) {
    isMultiTouch = false;
    touchStartDistance = 0;
}

function getTouchDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function handleOrientationChange() {
    window.addEventListener('orientationchange', () => {
        // Prevent zoom after orientation change
        setTimeout(() => {
            document.querySelector('meta[name="viewport"]').setAttribute(
                'content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
            );
        }, 100);
    });
}

// Check if device is mobile
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
}