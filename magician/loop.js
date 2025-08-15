// Game loop - main rendering and update loop

let lastTime = 0;
let animationId;

function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Cap delta time to prevent large jumps
    const clampedDelta = Math.min(deltaTime, 0.1);
    
    if (gameState.gameStarted) {
        // Update game time
        gameState.time += clampedDelta;
        
        // Update all game systems
        updateMobileInput(clampedDelta);
        updateCamera(clampedDelta);
        updatePlayer(clampedDelta);
        updateFaeries(clampedDelta);
        updateParticleSystem(clampedDelta);
        updateHealthGems(clampedDelta);
        updateGameLogic(clampedDelta);
        updateSpellCooldowns();
        
        // Render the scene
        if (gameState.renderer && gameState.scene && gameState.camera) {
            gameState.renderer.render(gameState.scene, gameState.camera);
        }
    }
    
    // Continue the loop
    animationId = requestAnimationFrame(gameLoop);
}

function startGameLoop() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    lastTime = performance.now();
    gameLoop(lastTime);
}

function stopGameLoop() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Initialize Three.js renderer
function initRenderer() {
    gameState.renderer = new THREE.WebGLRenderer({ antialias: true });
    gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    gameState.renderer.setClearColor(0x0a0a0a); // Very dark for dramatic lighting
    gameState.renderer.shadowMap.enabled = true;
    gameState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    gameState.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    gameState.renderer.toneMappingExposure = 1.2; // Brighter exposure
    
    // Add to DOM
    const container = document.getElementById('game-container');
    container.appendChild(gameState.renderer.domElement);
}

// Initialize Three.js scene
function initScene() {
    gameState.scene = new THREE.Scene();
}

// Performance monitoring
let frameCount = 0;
let lastFPSTime = 0;

function updateFPS(currentTime) {
    frameCount++;
    
    if (currentTime - lastFPSTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFPSTime));
        
        // Optional FPS display for debugging
        
        
        frameCount = 0;
        lastFPSTime = currentTime;
    }
}

// Cleanup function
function cleanup() {
    stopGameLoop();
    
    // Dispose of Three.js objects
    if (gameState.scene) {
        gameState.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
    
    if (gameState.renderer) {
        gameState.renderer.dispose();
    }
}
