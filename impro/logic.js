// Main game flow

function initGame() {
    initScene();
    initRenderer();
    initCamera();
    initPlayer();
    initAudio();
    createMap();
    gameState.gameStarted = true;
    startGameLoop();
}

function updateGameLogic(dt) {
    // spawn orbs
    gameState.spawnTimer += dt * 1000;
    if (gameState.spawnTimer >= gameState.spawnRate) {
        spawnOrb();
        gameState.spawnTimer = 0;
    }
    // ramp difficulty
    if (gameState.time && Math.floor(gameState.time) % GAME_CONSTANTS.difficulty.rampEverySec === 0) {
        gameState.maxOrbs = Math.min(28, gameState.maxOrbs + 1);
        gameState.spawnRate = Math.max(GAME_CONSTANTS.difficulty.spawnRateMinMs, gameState.spawnRate - 20);
    }
}

function pulseBlast() {
    const now = performance.now();
    if (now - gameState.lastPulseTime < 200) return; // simple cooldown
    gameState.lastPulseTime = now;
    const origin = gameState.camera.position.clone();
    const dir = getCameraDirection();
    playSound('pulse');

    // raycast-like hit test vs orbs
    let hitIndex = -1;
    let hitDist = Infinity;
    for (let i = 0; i < gameState.orbs.length; i++) {
        const o = gameState.orbs[i];
        const toOrb = new THREE.Vector3().subVectors(o.position, origin);
        const proj = toOrb.dot(dir);
        if (proj < 0) continue;
        const closest = origin.clone().add(dir.clone().multiplyScalar(proj));
        const d = closest.distanceTo(o.position);
        if (d < 0.6 && proj < hitDist) { hitDist = proj; hitIndex = i; }
    }
    if (hitIndex >= 0) {
        const o = gameState.orbs[hitIndex];
        createSparkBurst(o.position, 0x7cff00);
        gameState.scene.remove(o);
        gameState.orbs.splice(hitIndex, 1);
        gameState.score += 5;
        updateScore();
        playSound('hit');
    }
}

function gameOver() {
    gameState.gameStarted = false;
    stopGameLoop();
    const screen = document.createElement('div');
    screen.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
    screen.innerHTML = `
        <div class="text-center text-white p-8">
            <h1 class="text-5xl font-extrabold mb-4 text-cyan-400">FLOW BROKE</h1>
            <p class="text-xl mb-6">Score: <span class="text-pink-300 font-bold">${gameState.score}</span></p>
            <button class="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 font-semibold" onclick="restartGame()">Again</button>
        </div>`;
    document.body.appendChild(screen);
}

function restartGame() {
    const screen = document.querySelector('.fixed.inset-0.bg-black\\/80');
    if (screen) screen.remove();
    resetGameState();
    initGame();
}

function resetGameState() {
    gameState.orbs.forEach(o => gameState.scene.remove(o));
    gameState.particleSystems.forEach(p => gameState.scene.remove(p));
    gameState.orbs = [];
    gameState.particleSystems = [];
    gameState.score = 0;
    gameState.time = 0;
    gameState.spawnTimer = 0;
    gameState.spawnRate = GAME_CONSTANTS.orb.spawnRateMs;
    gameState.maxOrbs = GAME_CONSTANTS.orb.maxOrbs;
    gameState.player.health = GAME_CONSTANTS.maxHealth;
    updateHealthBar();
    updateScore();
}

window.restartGame = restartGame;


