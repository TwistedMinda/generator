// Base loop and renderer/scene init

let lastTime = 0;
let animationId;

function gameLoop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    if (gameState.gameStarted) {
        gameState.time += dt;
        updateCamera(dt);
        updatePlayer(dt);
        updateOrbs(dt);
        updateParticleSystem(dt);
        updateGameLogic(dt);
        if (gameState.renderer && gameState.scene && gameState.camera) {
            gameState.renderer.render(gameState.scene, gameState.camera);
        }
    }
    animationId = requestAnimationFrame(gameLoop);
}

function startGameLoop() {
    if (animationId) cancelAnimationFrame(animationId);
    lastTime = performance.now();
    gameLoop(lastTime);
}

function stopGameLoop() {
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
}

function initRenderer() {
    gameState.renderer = new THREE.WebGLRenderer({ antialias: true });
    gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    gameState.renderer.setClearColor(0x0a0a0f);
    gameState.renderer.shadowMap.enabled = true;
    gameState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    gameState.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    gameState.renderer.toneMappingExposure = 1.25;
    document.getElementById('game-container').appendChild(gameState.renderer.domElement);
}

function initScene() { gameState.scene = new THREE.Scene(); }


