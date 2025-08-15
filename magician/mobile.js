// Mobile controls for touch devices

// Version and testing/mobile helpers are now defined in constants.js

// Flag is automatically global when declared at top level

let isMobile = false;
let virtualJoystick = null;
let touchControls = {
    movement: { x: 0, y: 0 },
    camera: { x: 0, y: 0 },
    spells: { fireball: false, lightning: false }
};

function initMobileControls() {
    // Determine mobile mode using shared helper
    isMobile = (typeof isMobileActive === 'function') ? isMobileActive() : false;
    
    if (isMobile) {
        
        createMovementJoystick();
        createCameraJoystick();
        createSpellButtons();
        
        // In mobile mode (forced or detected), apply mobile behaviors
        const realMobile = (typeof isRealMobileDevice === 'function') ? isRealMobileDevice() : false;
        if (realMobile) {
            // Prevent browser gestures/scroll interfering
            document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
            document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        } else if (typeof TESTING_MOBILE_ON_WEB !== 'undefined' && TESTING_MOBILE_ON_WEB) {
            // Testing on desktop: keep cursor visible
            document.body.style.cursor = 'auto';
            document.body.classList.remove('cursor-none');
        }
    }
}

function createMovementJoystick() {
    // Create movement joystick container
    const joystickContainer = document.createElement('div');
    joystickContainer.id = 'movement-joystick';
    joystickContainer.className = 'fixed bottom-4 left-4 w-24 h-24 bg-black bg-opacity-30 rounded-full border-2 border-green-400 border-opacity-50 backdrop-blur-sm';
    joystickContainer.style.zIndex = '1000';
    
    // Create joystick knob
    const joystickKnob = document.createElement('div');
    joystickKnob.id = 'movement-knob';
    joystickKnob.className = 'absolute top-1/2 left-1/2 w-8 h-8 bg-green-400 bg-opacity-60 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100';
    
    // Add icon to show it's for movement
    const icon = document.createElement('div');
    icon.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs';
    icon.innerHTML = '🏃';
    joystickKnob.appendChild(icon);
    
    joystickContainer.appendChild(joystickKnob);
    document.body.appendChild(joystickContainer);
    
    setupJoystick(joystickContainer, joystickKnob, 'movement');
}

function createCameraJoystick() {
    // Create camera joystick container
    const joystickContainer = document.createElement('div');
    joystickContainer.id = 'camera-joystick';
    joystickContainer.className = 'fixed bottom-4 right-28 w-24 h-24 bg-black bg-opacity-30 rounded-full border-2 border-blue-400 border-opacity-50 backdrop-blur-sm';
    joystickContainer.style.zIndex = '1000';
    
    // Create joystick knob
    const joystickKnob = document.createElement('div');
    joystickKnob.id = 'camera-knob';
    joystickKnob.className = 'absolute top-1/2 left-1/2 w-8 h-8 bg-blue-400 bg-opacity-60 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100';
    
    // Add icon to show it's for camera
    const icon = document.createElement('div');
    icon.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs';
    icon.innerHTML = '👁️';
    joystickKnob.appendChild(icon);
    
    joystickContainer.appendChild(joystickKnob);
    document.body.appendChild(joystickContainer);
    
    setupJoystick(joystickContainer, joystickKnob, 'camera');
}

function setupJoystick(container, knob, type) {
    // Setup joystick events (touch for mobile, mouse for testing on web)
    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    
    const centerX = 48; // Half of container width (96px / 2)
    const centerY = 48; // Half of container height (96px / 2)
    const maxDistance = 32; // Max distance from center
    
    function handleStart(clientX, clientY) {
        isDragging = true;
        const rect = container.getBoundingClientRect();
        startPos.x = rect.left + centerX;
        startPos.y = rect.top + centerY;
    }
    
    function handleMove(clientX, clientY) {
        if (!isDragging) return;
        
        const deltaX = clientX - startPos.x;
        const deltaY = clientY - startPos.y;
        
        // Calculate distance and angle
        const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), maxDistance);
        const angle = Math.atan2(deltaY, deltaX);
        
        // Position knob
        const knobX = Math.cos(angle) * distance;
        const knobY = Math.sin(angle) * distance;
        
        knob.style.transform = `translate(${knobX - 16}px, ${knobY - 16}px)`;
        
        // Update values (-1 to 1)
        if (type === 'movement') {
            touchControls.movement.x = knobX / maxDistance;
            touchControls.movement.y = -knobY / maxDistance; // Invert Y for forward/back
            
            
        } else if (type === 'camera') {
            touchControls.camera.x = knobX / maxDistance;
            touchControls.camera.y = knobY / maxDistance; // Don't invert for camera
            
            
        }
    }
    
    function handleEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        // Reset knob position
        knob.style.transform = 'translate(-16px, -16px)';
        
        // Reset values
        if (type === 'movement') {
            touchControls.movement.x = 0;
            touchControls.movement.y = 0;
        } else if (type === 'camera') {
            touchControls.camera.x = 0;
            touchControls.camera.y = 0;
        }
    }
    
    if (TESTING_MOBILE_ON_WEB) {
        // Use mouse events for testing on web
        container.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleStart(e.clientX, e.clientY);
        });
        
        document.addEventListener('mousemove', (e) => {
            handleMove(e.clientX, e.clientY);
        });
        
        document.addEventListener('mouseup', (e) => {
            handleEnd();
        });
    } else {
        // Use touch events for real mobile
        container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        });
        
        document.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            handleEnd();
        });
        
        // Also handle touchcancel for mobile
        document.addEventListener('touchcancel', (e) => {
            if (!isDragging) return;
            handleEnd();
        });
    }
}

function createSpellButtons() {
    // Create spell buttons container - moved higher to avoid camera joystick
    const spellContainer = document.createElement('div');
    spellContainer.className = 'fixed bottom-32 right-4 flex flex-col space-y-3';
    spellContainer.style.zIndex = '2000'; // Higher z-index to ensure it's on top
    
    // Fireball button with cooldown system (same as desktop but larger)
    const fireballBtn = document.createElement('div');
    fireballBtn.className = 'relative';
    fireballBtn.innerHTML = `
        <div class="w-16 h-16 bg-black bg-opacity-40 rounded-full backdrop-blur-sm border-2 border-orange-400 border-opacity-50 flex items-center justify-center shadow-lg">
            <div class="text-2xl">🔥</div>
        </div>
        <div id="mobile-fireball-cooldown" class="absolute inset-0 rounded-full border-4 border-orange-500 opacity-0 transition-opacity duration-200">
            <div id="mobile-fireball-progress" class="absolute inset-0 rounded-full" style="background: conic-gradient(transparent 0deg, orange 0deg);"></div>
        </div>
    `;
    fireballBtn.style.pointerEvents = 'auto';
    
    // Lightning button with cooldown system (same as desktop but larger)
    const lightningBtn = document.createElement('div');
    lightningBtn.className = 'relative';
    lightningBtn.innerHTML = `
        <div class="w-16 h-16 bg-black bg-opacity-40 rounded-full backdrop-blur-sm border-2 border-blue-400 border-opacity-50 flex items-center justify-center shadow-lg">
            <div class="text-2xl">⚡</div>
        </div>
        <div id="mobile-lightning-cooldown" class="absolute inset-0 rounded-full border-4 border-blue-500 opacity-0 transition-opacity duration-200">
            <div id="mobile-lightning-progress" class="absolute inset-0 rounded-full" style="background: conic-gradient(transparent 0deg, cyan 0deg);"></div>
        </div>
    `;
    
    spellContainer.appendChild(fireballBtn);
    spellContainer.appendChild(lightningBtn);
    document.body.appendChild(spellContainer);
    
    // Setup spell button events (touch for mobile, click for testing on web)
    if (TESTING_MOBILE_ON_WEB) {
        // Use click events for testing on web
        fireballBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            fireballBtn.style.transform = 'scale(0.9)';
        });
        
        fireballBtn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            fireballBtn.style.transform = 'scale(1)';
        });
        
        fireballBtn.addEventListener('click', (e) => {
            e.preventDefault();
            castFireball();
        });
        
        lightningBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            lightningBtn.style.transform = 'scale(0.9)';
        });
        
        lightningBtn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            lightningBtn.style.transform = 'scale(1)';
        });
        
        lightningBtn.addEventListener('click', (e) => {
            e.preventDefault();
            castLightning();
        });
    } else {
        // Use touch events for real mobile
        fireballBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            fireballBtn.style.transform = 'scale(0.9)';
            castFireball();
        });
        
        fireballBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            fireballBtn.style.transform = 'scale(1)';
        });
        
        fireballBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            fireballBtn.style.transform = 'scale(1)';
        });
        
        lightningBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            lightningBtn.style.transform = 'scale(0.9)';
            castLightning();
        });
        
        lightningBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            lightningBtn.style.transform = 'scale(1)';
        });
        
        lightningBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            lightningBtn.style.transform = 'scale(1)';
        });
    }
}

function setupTouchCamera() {
    let isCameraDragging = false;
    let lastTouchX = 0;
    let lastTouchY = 0;
    
    // Use the game container for camera controls
    const gameContainer = document.getElementById('game-container');
    
    gameContainer.addEventListener('touchstart', (e) => {
        // Don't handle camera if touching mobile UI elements
        const isMobileUI = e.target.closest('#movement-joystick') || 
                          e.target.closest('#camera-joystick') ||
                          e.target.closest('#mobile-fireball') || 
                          e.target.closest('#mobile-lightning') ||
                          e.target.id === 'movement-joystick' ||
                          e.target.id === 'camera-joystick' ||
                          e.target.id === 'mobile-fireball' ||
                          e.target.id === 'mobile-lightning';
        
        if (!isMobileUI && (e.target === gameContainer || e.target === gameContainer.firstChild)) {
            e.preventDefault();
            
            // Only cast fireball if touch is in upper portion of screen (above UI)
            const screenHeight = window.innerHeight;
            const uiZoneHeight = screenHeight * 0.4; // Bottom 40% is UI zone
            const touch = e.touches[0];
            
            if (touch.clientY <= uiZoneHeight) {
                // Touch is in firing zone
                castFireball();
            }
            
            isCameraDragging = true;
            lastTouchX = touch.clientX;
            lastTouchY = touch.clientY;
        }
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isCameraDragging) return;
        
        // Don't prevent default if touching mobile UI
        const isMobileUI = e.target.closest('#movement-joystick') || 
                          e.target.closest('#camera-joystick') ||
                          e.target.closest('#mobile-fireball') || 
                          e.target.closest('#mobile-lightning');
        
        if (!isMobileUI) {
            e.preventDefault();
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - lastTouchX;
            const deltaY = touch.clientY - lastTouchY;
            
            // Apply camera rotation (similar to mouse movement)
            gameState.player.rotation.y -= deltaX * gameState.mouse.sensitivity;
            gameState.player.rotation.x -= deltaY * gameState.mouse.sensitivity;
            
            // Clamp vertical rotation
            gameState.player.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, gameState.player.rotation.x));
            
            lastTouchX = touch.clientX;
            lastTouchY = touch.clientY;
        }
    });
    
    document.addEventListener('touchend', (e) => {
        isCameraDragging = false;
    });
}

// Override input functions for mobile
function updateMobileInput(deltaTime) {
    if (!isMobile) return;
    
    // Convert joystick input to key states and camera rotation
    const moveThreshold = 0.2; // Lower threshold for easier triggering
    const cameraThreshold = 0.1; // Lower threshold for camera
    
    // Clear movement keys every frame, then set based on current joystick state
    // This ensures when joystick returns to 0, movement stops
    delete gameState.keys['keyw'];
    delete gameState.keys['keys'];
    delete gameState.keys['keya'];
    delete gameState.keys['keyd'];
    
    // Set movement keys based on current joystick position
    if (touchControls.movement.y > moveThreshold) {
        gameState.keys['keyw'] = true;
    }
    if (touchControls.movement.y < -moveThreshold) {
        gameState.keys['keys'] = true;
    }
    if (touchControls.movement.x < -moveThreshold) {
        gameState.keys['keya'] = true;
    }
    if (touchControls.movement.x > moveThreshold) {
        gameState.keys['keyd'] = true;
    }
    
    // Apply camera rotation based on camera joystick
    if (Math.abs(touchControls.camera.x) > cameraThreshold || Math.abs(touchControls.camera.y) > cameraThreshold) {
        const sensitivity = 0.05; // Camera sensitivity
        
        gameState.player.rotation.y -= touchControls.camera.x * sensitivity;
        gameState.player.rotation.x -= touchControls.camera.y * sensitivity;
        
        // Clamp vertical rotation
        gameState.player.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, gameState.player.rotation.x));
    }
}

// Mobile-specific UI adjustments
function adjustUIForMobile() {
    if (!isMobile) return;
    
    // Handle desktop cooldown icons vs mobile spell buttons
    const cooldownContainer = document.getElementById('desktop-spell-cooldowns');
    if (cooldownContainer) {
        // On both testing-mobile-on-web and real mobile, hide desktop cooldowns to avoid duplication
        cooldownContainer.style.display = 'none';
    }
    
    // Make health and mana bars slightly smaller on mobile
    const healthBar = document.querySelector('.absolute.top-4.left-4');
    const manaBar = document.querySelector('.absolute.top-16.left-4');
    
    if (healthBar) {
        healthBar.querySelector('.w-64').className = healthBar.querySelector('.w-64').className.replace('w-64', 'w-48');
    }
    if (manaBar) {
        manaBar.querySelector('.w-64').className = manaBar.querySelector('.w-64').className.replace('w-64', 'w-48');
    }
}

// Initialize mobile controls when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        // Set version label if present
        const versionEl = document.getElementById('version-label');
        if (versionEl) {
            versionEl.textContent = VERSION;
        }
        
        initMobileControls();
        adjustUIForMobile();
    });
}

// Export for use in other files
window.updateMobileInput = updateMobileInput;
window.isMobile = () => isMobile;
