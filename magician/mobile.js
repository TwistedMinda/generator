// Mobile controls for touch devices

// Set this to true to test mobile controls on web browsers
const TESTING_MOBILE_ON_WEB = false;

// Flag is automatically global when declared at top level

let isMobile = false;
let virtualJoystick = null;
let touchControls = {
    movement: { x: 0, y: 0 },
    camera: { x: 0, y: 0 },
    spells: { fireball: false, lightning: false }
};

function initMobileControls() {
    // Detect mobile device or force mobile mode for testing
    isMobile = TESTING_MOBILE_ON_WEB || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0);
    
    if (isMobile) {
        console.log('Mobile device detected - initializing touch controls');
        createMovementJoystick();
        createCameraJoystick();
        createSpellButtons();
        
        // Hide cursor only on real mobile devices, not when testing on web
        if (!TESTING_MOBILE_ON_WEB) {
            document.body.style.cursor = 'none';
            
            // Prevent default touch behaviors only on real mobile
            document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
            document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        } else {
            // When testing mobile on web, ensure cursor is visible
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
            
            if (TESTING_MOBILE_ON_WEB) {
                console.log('Movement joystick:', touchControls.movement.x.toFixed(2), touchControls.movement.y.toFixed(2));
            }
        } else if (type === 'camera') {
            touchControls.camera.x = knobX / maxDistance;
            touchControls.camera.y = knobY / maxDistance; // Don't invert for camera
            
            if (TESTING_MOBILE_ON_WEB) {
                console.log('Camera joystick:', touchControls.camera.x.toFixed(2), touchControls.camera.y.toFixed(2));
            }
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
            handleEnd();
        });
    }
}

function createSpellButtons() {
    // Create spell buttons container - moved higher to avoid camera joystick
    const spellContainer = document.createElement('div');
    spellContainer.className = 'fixed bottom-32 right-4 flex flex-col space-y-3';
    spellContainer.style.zIndex = '2000'; // Higher z-index to ensure it's on top
    
    // Fireball button
    const fireballBtn = document.createElement('div');
    fireballBtn.id = 'mobile-fireball';
    fireballBtn.className = 'w-16 h-16 bg-black bg-opacity-40 rounded-full border-2 border-orange-400 border-opacity-50 flex items-center justify-center shadow-lg backdrop-blur-sm';
    fireballBtn.style.pointerEvents = 'auto'; // Ensure touch events work
    fireballBtn.innerHTML = '<div class="text-2xl pointer-events-none">🔥</div>';
    
    // Lightning button
    const lightningBtn = document.createElement('div');
    lightningBtn.id = 'mobile-lightning';
    lightningBtn.className = 'w-16 h-16 bg-black bg-opacity-40 rounded-full border-2 border-blue-400 border-opacity-50 flex items-center justify-center shadow-lg backdrop-blur-sm';
    lightningBtn.style.pointerEvents = 'auto'; // Ensure touch events work
    lightningBtn.innerHTML = '<div class="text-2xl pointer-events-none">⚡</div>';
    
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
        
        lightningBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            lightningBtn.style.transform = 'scale(0.9)';
            castLightning();
        });
        
        lightningBtn.addEventListener('touchend', (e) => {
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
        if (TESTING_MOBILE_ON_WEB) console.log('Setting W key');
    }
    if (touchControls.movement.y < -moveThreshold) {
        gameState.keys['keys'] = true;
        if (TESTING_MOBILE_ON_WEB) console.log('Setting S key');
    }
    if (touchControls.movement.x < -moveThreshold) {
        gameState.keys['keya'] = true;
        if (TESTING_MOBILE_ON_WEB) console.log('Setting A key');
    }
    if (touchControls.movement.x > moveThreshold) {
        gameState.keys['keyd'] = true;
        if (TESTING_MOBILE_ON_WEB) console.log('Setting D key');
    }
    
    // Debug: Show current joystick and key state
    if (TESTING_MOBILE_ON_WEB && (Math.abs(touchControls.movement.x) > 0.01 || Math.abs(touchControls.movement.y) > 0.01)) {
        console.log('Joystick:', touchControls.movement.x.toFixed(2), touchControls.movement.y.toFixed(2), 'Keys:', Object.keys(gameState.keys).filter(k => k.startsWith('key')));
    }
    
    // Debug: Show when no movement is detected
    if (TESTING_MOBILE_ON_WEB && (Math.abs(touchControls.movement.x) > 0.1 || Math.abs(touchControls.movement.y) > 0.1)) {
        if (!gameState.keys['keyw'] && !gameState.keys['keys'] && !gameState.keys['keya'] && !gameState.keys['keyd']) {
            console.log('Movement detected but no keys set! Values:', touchControls.movement.x, touchControls.movement.y);
        }
    }
    
    // Apply camera rotation based on camera joystick
    if (Math.abs(touchControls.camera.x) > cameraThreshold || Math.abs(touchControls.camera.y) > cameraThreshold) {
        const sensitivity = 0.05; // Camera sensitivity
        
        gameState.player.rotation.y -= touchControls.camera.x * sensitivity;
        gameState.player.rotation.x -= touchControls.camera.y * sensitivity;
        
        // Clamp vertical rotation
        gameState.player.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, gameState.player.rotation.x));
        
        if (TESTING_MOBILE_ON_WEB) {
            console.log('Camera rotation:', touchControls.camera.x.toFixed(2), touchControls.camera.y.toFixed(2));
        }
    }
}

// Mobile-specific UI adjustments
function adjustUIForMobile() {
    if (!isMobile) return;
    
    // Hide desktop-only crosshair only on real mobile, keep it when testing on web
    if (!TESTING_MOBILE_ON_WEB) {
        const crosshair = document.querySelector('.absolute.top-1\\/2.left-1\\/2');
        if (crosshair) {
            crosshair.style.display = 'none';
        }
    }
    
    // Hide desktop cooldown icons when testing mobile on web to avoid duplication
    const cooldownContainer = document.querySelector('.absolute.bottom-4.left-4.flex.space-x-3');
    if (cooldownContainer) {
        if (TESTING_MOBILE_ON_WEB) {
            // Hide entire desktop cooldown container when testing mobile on web
            cooldownContainer.style.display = 'none';
        } else {
            // On real mobile, move above joystick
            cooldownContainer.style.bottom = '7rem';
            
            // Hide desktop control labels (CLICK, SPACE) on real mobile
            const labels = cooldownContainer.querySelectorAll('div[class*="absolute"][class*="-bottom-1"]');
            labels.forEach(label => {
                if (label.textContent === 'CLICK' || label.textContent === 'SPACE') {
                    label.style.display = 'none';
                }
            });
        }
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
        initMobileControls();
        adjustUIForMobile();
    });
}

// Export for use in other files
window.updateMobileInput = updateMobileInput;
window.isMobile = () => isMobile;
