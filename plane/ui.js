// UI manipulation functions
function updateHUD() {
    const healthBar = document.getElementById('healthBar');
    const altitude = document.getElementById('altitude');
    const speed = document.getElementById('speed');
    
    if (healthBar) {
        const healthPercent = (gameState.player.health / gameState.player.maxHealth) * 100;
        healthBar.style.width = healthPercent + '%';
        
        // Color changes based on health
        if (healthPercent > 70) {
            healthBar.className = 'h-full bg-green-500 transition-all duration-200';
        } else if (healthPercent > 30) {
            healthBar.className = 'h-full bg-yellow-500 transition-all duration-200';
        } else {
            healthBar.className = 'h-full bg-red-500 transition-all duration-200';
        }
    }
    
    if (altitude) {
        altitude.textContent = Math.max(0, Math.round(gameState.player.y)) + 'm';
    }
    
    if (speed) {
        speed.textContent = Math.round(gameState.player.speed) + ' km/h';
    }
}

function showDamageIndicator() {
    const hud = document.getElementById('hud');
    const indicator = document.createElement('div');
    
    indicator.className = 'absolute inset-0 bg-red-500 bg-opacity-20 pointer-events-none animate-pulse';
    hud.appendChild(indicator);
    
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }, 300);
}

function lockPointer() {
    const canvas = gameState.canvas;
    if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
    }
}

function unlockPointer() {
    if (document.exitPointerLock) {
        document.exitPointerLock();
    }
}

function toggleDebugInfo() {
    gameState.debugMode = !gameState.debugMode;
}

function drawDebugInfo() {
    if (!gameState.debugMode) return;
    
    const ctx = gameState.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.font = '12px monospace';
    
    const debugLines = [
        `Position: ${gameState.player.x.toFixed(1)}, ${gameState.player.y.toFixed(1)}, ${gameState.player.z.toFixed(1)}`,
        `Velocity: ${gameState.player.velocityX.toFixed(1)}, ${gameState.player.velocityY.toFixed(1)}, ${gameState.player.velocityZ.toFixed(1)}`,
        `Rotation: P${gameState.player.pitch.toFixed(2)} Y${gameState.player.yaw.toFixed(2)} R${gameState.player.roll.toFixed(2)}`,
        `Enemies: ${gameState.enemies.length}`,
        `Particles: ${gameState.particles.length}`,
        `FPS: ${Math.round(1 / gameState.deltaTime)}`
    ];
    
    debugLines.forEach((line, index) => {
        ctx.fillText(line, 10, 20 + index * 15);
    });
    
    ctx.restore();
}

function createExplosionFlash() {
    const hud = document.getElementById('hud');
    const flash = document.createElement('div');
    
    flash.className = 'absolute inset-0 bg-orange-400 bg-opacity-60 pointer-events-none';
    flash.style.animation = 'pulse 0.5s ease-out';
    hud.appendChild(flash);
    
    setTimeout(() => {
        if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
        }
    }, 500);
}
