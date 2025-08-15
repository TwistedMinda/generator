// Main Game Logic

function initGame() {
    // Initialize Three.js
    gameState.scene = new THREE.Scene();
    gameState.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    
    // Initialize renderer
    const canvas = document.getElementById('gameCanvas');
    gameState.renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true 
    });
    gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    gameState.renderer.shadowMap.enabled = true;
    gameState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Initialize systems
    const audioInitialized = initAudio();
    if (audioInitialized) {
    } else {
        console.warn('⚠️ Audio system failed to initialize');
    }
    
    initCamera();
    createMap();
    createPlayer();
    setupCameraControls();
    
    // Initialize mobile controls
    initMobileControls();
    addTouchFeedback();
    
    // Setup UI controls
    setTimeout(() => {
        setupSequenceToggle();
    }, 100);
    
    // Mark as initialized
    gameState.initialized = true;
}

function updateGame() {
    // Calculate delta time
    const currentTime = performance.now() * 0.001;
    gameState.deltaTime = currentTime - gameState.lastTime;
    gameState.lastTime = currentTime;
    
    // Cap delta time to prevent large jumps
    gameState.deltaTime = Math.min(gameState.deltaTime, 0.016);
    
    // Update game systems
    updateCamera();
    updatePlayer();
    updateMap();
    updateParticles();
    updateFloatingParticles();
    
    // Render scene
    renderGame();
}

function renderGame() {
    if (gameState.scene && gameState.camera && gameState.renderer) {
        gameState.renderer.render(gameState.scene, gameState.camera);
    }
}

function startGame() {
    // Initialize game if not done
    if (!gameState.initialized) {
        initGame();
    }
    
    // Show welcome message
    showMessage('🎵 Collect floating notes to create music!', 4000);
    
    // Start ambient audio
    if (gameState.audioContext) {
        playAmbientTone();
    }
    
    // Create some initial sparkles
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const pos = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                1,
                (Math.random() - 0.5) * 10
            );
            createSparkle(pos);
        }, i * 200);
    }
}

function resetGame() {
    // Clear particles
    clearAllParticles();
    
    // Reset player position
    if (gameState.player.mesh) {
        gameState.player.mesh.position.set(0, 0, 0);
        gameState.player.currentPosition.set(0, 0, 0);
        gameState.player.targetPosition.set(0, 0, 0);
        gameState.player.isMoving = false;
    }
    
    // Reset stats
    gameState.lastTileIndex = -1;
    
    // Stop all looping notes and clear inventory
    stopAllLoopingNotes();
    gameState.inventory = [];
    
    // Update UI
    updateUI();
    
    showMessage('🔄 Game Reset!', 2000);

}

function pauseGame() {
    // Stop ambient sound
    if (gameState.ambientOscillator) {
        gameState.ambientOscillator.stop();
        gameState.ambientOscillator = null;
    }
}

function resumeGame() {
    // Restart ambient sound
    if (gameState.audioContext) {
        playAmbientTone();
    }
}

// Game event handlers
function handleVisibilityChange() {
    if (document.hidden) {
        pauseGame();
    } else {
        resumeGame();
    }
}

function handleGamepadInput() {
    // Future enhancement for gamepad support
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad) {
            // Handle gamepad input here
            break;
        }
    }
}

// Performance monitoring
function checkPerformance() {
    const particleCount = gameState.particles.length;
    
    if (particleCount > CONSTANTS.MAX_PARTICLES * 0.8) {
        console.warn('High particle count:', particleCount);
        
        // Remove excess particles
        while (gameState.particles.length > CONSTANTS.MAX_PARTICLES * 0.6) {
            removeOldestParticle();
        }
    }
}

// Easter eggs and special effects
function createCelebration() {
    // Special effect for milestones
    const centerPos = new THREE.Vector3(0, 2, 0);
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const randomPos = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 8
            );
            createSparkle(randomPos);
        }, i * 50);
    }
    
    // Play celebration chord
    const chord = [0, 4, 7]; // Major triad
    chord.forEach((note, index) => {
        setTimeout(() => {
            playTileNote(note);
        }, index * 100);
    });
}

// Check for milestones
function checkMilestones() {
    if (gameState.notesPlayed > 0 && gameState.notesPlayed % 10 === 0) {
        createCelebration();
        showMessage(`🎉 ${gameState.notesPlayed} notes played!`, 2000);
    }
}

// Setup visibility change listener
document.addEventListener('visibilitychange', handleVisibilityChange);
