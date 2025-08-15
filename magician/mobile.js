let virtualJoystick = null;
let touchControls = {
    movement: { x: 0, y: 0 },
    camera: { x: 0, y: 0 },
    spells: { fireball: false, lightning: false }
};

function initMobileControls() {
    if (IS_MOBILE) {
        createMovementJoystick();
        createCameraJoystick();
        createSpellButtons();
        
        // In mobile mode (forced or detected), apply mobile behaviors
        if (IS_DEVICE) {
            // Prevent browser gestures/scroll interfering
            document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
            document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        } else if (TESTING_MOBILE_ON_WEB) {
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
    // Prevent click (only) from bubbling to global fire handler
    joystickContainer.addEventListener('click', (e) => { e.stopPropagation(); }, true);
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
    // Prevent click (only) from bubbling to global fire handler
    joystickContainer.addEventListener('click', (e) => { e.stopPropagation(); }, true);
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
    
    if (TESTING_MOBILE_ON_WEB && !IS_DEVICE) {
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
        // Multi-touch: bind one touch exclusively to this joystick until it ends/cancels
        let activeTouchId = null;
        
        container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (activeTouchId === null && e.changedTouches.length > 0) {
                const t = e.changedTouches[0];
                activeTouchId = t.identifier;
                handleStart(t.clientX, t.clientY);
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (activeTouchId === null) return;
            for (let i = 0; i < e.touches.length; i++) {
                const t = e.touches[i];
                if (t.identifier === activeTouchId) {
                    e.preventDefault();
                    handleMove(t.clientX, t.clientY);
                    break;
                }
            }
        }, { passive: false });
        
        const endLike = (e) => {
            if (activeTouchId === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.identifier === activeTouchId) {
                    handleEnd();
                    activeTouchId = null;
                    break;
                }
            }
        };
        document.addEventListener('touchend', endLike, { passive: false });
        document.addEventListener('touchcancel', endLike, { passive: false });
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
    if (TESTING_MOBILE_ON_WEB && !IS_DEVICE) {
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
    if (!IS_MOBILE) return;
    
    // Convert joystick input to key states and camera rotation
    const moveThreshold = 0.25; // Slightly stricter to avoid accidental movement
    const cameraThreshold = 0.12; // Lower threshold for camera
    
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
        const sensitivity = 0.03; // Lower sensitivity for mobile joystick
        
        gameState.player.rotation.y -= touchControls.camera.x * sensitivity;
        gameState.player.rotation.x -= touchControls.camera.y * sensitivity;
        
        // Clamp vertical rotation
        gameState.player.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, gameState.player.rotation.x));
    }
}

// Mobile-specific UI adjustments
function adjustUIForMobile() {
    if (!IS_MOBILE) return;
    
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
