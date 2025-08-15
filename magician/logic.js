// Main game logic and flow

function initGame() {
    
    // Initialize core systems
    initScene();
    initRenderer();
    initCamera();
    initPlayer();
    initAudio();
    
    // Create the game world
    createMap();
    
    // Start the game
    gameState.gameStarted = true;
    startGameLoop();
    
    // Start ambient audio
    startAmbientAudio();
    
    
}

function updateGameLogic(deltaTime) {
    // Spawn faeries
    gameState.spawnTimer += deltaTime * 1000;
    if (gameState.spawnTimer >= gameState.spawnRate) {
        spawnFaerie();
        gameState.spawnTimer = 0;
        
        // Increase difficulty over time
        if (gameState.time > 30) {
            gameState.spawnRate = Math.max(600, gameState.spawnRate - 10); // Gets faster
            gameState.maxFaeries = Math.min(12, gameState.maxFaeries + 0.15); // Fewer max faeries
        }
    }
    
    // Spawn health gems
    gameState.healthGemSpawnTimer += deltaTime * 1000;
    if (gameState.healthGemSpawnTimer >= gameState.healthGemSpawnRate) {
        spawnHealthGem();
        // Reset with new random interval: 10 seconds + 3-10 seconds random
        gameState.healthGemSpawnTimer = 0;
        gameState.healthGemSpawnRate = 10000 + (3000 + Math.random() * 7000);
    }
    
    // Check win condition (survival-based game)
    updateDifficulty();
    
    // Check game over
    if (gameState.player.health <= 0) {
        gameOver();
    }
}

function updateDifficulty() {
    const timeMinutes = gameState.time / 60;
    
    // Increase difficulty every minute
    const newDifficulty = 1 + Math.floor(timeMinutes);
    
    if (newDifficulty > gameState.difficulty) {
        gameState.difficulty = newDifficulty;
        
        // Make enemies slightly stronger
        gameState.faeries.forEach(faerie => {
            if (faerie.userData) {
                faerie.userData.speed += 0.2;
                faerie.userData.attackDamage += 2;
            }
        });
        
        // Visual feedback for difficulty increase
        createMagicAura(gameState.camera.position, 0xff0000, 3);
        playSound('powerUp');
        
        // Show notification
        showNotification(`Difficulty Increased! Level ${gameState.difficulty}`);
    }
}

function gameOver() {
    gameState.gameStarted = false;
    stopGameLoop();
    
    // Show game over screen
    showGameOverScreen();
    playSound('gameOver');
}

function showGameOverScreen() {
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
    gameOverDiv.innerHTML = `
        <div class="text-center text-white p-8">
            <h1 class="text-6xl font-bold mb-4 text-red-500">GAME OVER</h1>
            <p class="text-2xl mb-4">Final Score: <span class="text-yellow-400">${gameState.score}</span></p>
            <p class="text-xl mb-6">Survival Time: <span class="text-blue-400">${Math.floor(gameState.time)}s</span></p>
            <button onclick="restartGame()" class="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-300 hover:scale-105">
                Try Again
            </button>
        </div>
    `;
    
    document.body.appendChild(gameOverDiv);
}

function restartGame() {
    // Remove game over screen
    const gameOverScreen = document.querySelector('.fixed.inset-0.bg-black');
    if (gameOverScreen) {
        gameOverScreen.remove();
    }
    
    // Reset game state
    resetGameState();
    
    // Restart game
    initGame();
}

function resetGameState() {
    // Clear existing objects
    gameState.faeries.forEach(faerie => gameState.scene.remove(faerie));
    gameState.spells.forEach(spell => gameState.scene.remove(spell));
    gameState.particleSystems.forEach(particle => gameState.scene.remove(particle));
    
    // Reset arrays
    gameState.faeries = [];
    gameState.spells = [];
    gameState.particleSystems = [];
    gameState.healthGems = [];
    
    // Reset player state
    gameState.player.health = gameState.player.maxHealth;
    gameState.player.mana = gameState.player.maxMana;
    gameState.player.position = { x: 0, y: 1.8, z: 0 };
    gameState.player.rotation = { x: 0, y: 0 };
    
    // Reset game variables
    gameState.score = 0;
    gameState.time = 0;
    gameState.spawnTimer = 0;
    gameState.healthGemSpawnTimer = 0;
    gameState.difficulty = 1;
    gameState.spawnRate = 1200; // Start with moderate spawning
    gameState.maxFaeries = 8; // Start with fewer faeries
    
    // Reset spell cooldowns
    gameState.lastFireballTime = 0;
    gameState.lastLightningTime = 0;
    
    // Update UI
    updateHealthBar();
    updateManaBar();
    updateScore();
}

function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg z-40 shadow-lg';
    notification.textContent = message;
    notification.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
    
    document.body.appendChild(notification);
    
    // Animate in
    notification.style.opacity = '0';
    notification.style.transform = 'translate(-50%, -20px) scale(0.8)';
    
    setTimeout(() => {
        notification.style.transition = 'all 0.3s ease-out';
        notification.style.opacity = '1';
        notification.style.transform = 'translate(-50%, 0) scale(1)';
    }, 100);
    
    // Remove after duration
    setTimeout(() => {
        notification.style.transition = 'all 0.3s ease-in';
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -20px) scale(0.8)';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

function pauseGame() {
    if (gameState.gameStarted) {
        gameState.gameStarted = false;
        stopGameLoop();
        showNotification('Game Paused - Click to Resume');
    } else {
        gameState.gameStarted = true;
        startGameLoop();
    }
}

// Handle tab visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameState.gameStarted) {
        pauseGame();
    }
});

// Handle window focus/blur
window.addEventListener('blur', () => {
    if (gameState.gameStarted) {
        pauseGame();
    }
});

// Global restart function for button
window.restartGame = restartGame;
