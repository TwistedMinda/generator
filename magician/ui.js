// UI manipulation functions

function updateHealthBar() {
    const healthBar = document.getElementById('health-bar');
    const percentage = (gameState.player.health / gameState.player.maxHealth) * 100;
    healthBar.style.width = percentage + '%';
    
    // Change color based on health with smooth gradients and animations
    if (percentage > 50) {
        healthBar.className = 'h-full bg-gradient-to-r from-green-400 to-green-300 rounded-full transition-all duration-500 shadow-lg';
    } else if (percentage > 25) {
        healthBar.className = 'h-full bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full transition-all duration-500 shadow-lg animate-pulse';
    } else {
        healthBar.className = 'h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500 shadow-lg animate-bounce';
    }
}

function updateManaBar() {
    const manaBar = document.getElementById('mana-bar');
    const percentage = (gameState.player.mana / gameState.player.maxMana) * 100;
    manaBar.style.width = percentage + '%';
    
    // Add glow effect when mana is low
    if (percentage < 30) {
        manaBar.className = 'h-full bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full transition-all duration-500 shadow-lg animate-pulse';
    } else {
        manaBar.className = 'h-full bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full transition-all duration-500 shadow-lg';
    }
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    const newScore = gameState.score;
    
    // Subtle animation - just a small scale
    scoreElement.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
        scoreElement.textContent = newScore;
        scoreElement.style.transform = 'scale(1)';
    }, 100);
}

function showDamageNumber(x, y, z, damage) {
    // Create floating damage number using HTML
    const damageDiv = document.createElement('div');
    damageDiv.className = 'fixed pointer-events-none z-50 text-2xl font-bold text-orange-500';
    damageDiv.textContent = '-' + damage;
    damageDiv.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
    
    // Convert 3D position to screen coordinates
    const vector = new THREE.Vector3(x, y + 1, z);
    vector.project(gameState.camera);
    
    const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = (vector.y * -0.5 + 0.5) * window.innerHeight;
    
    damageDiv.style.left = screenX + 'px';
    damageDiv.style.top = screenY + 'px';
    damageDiv.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(damageDiv);
    
    // Animate and remove
    const startTime = Date.now();
    const animate = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 1000) {
            damageDiv.remove();
            return;
        }
        
        const progress = elapsed / 1000;
        damageDiv.style.top = (screenY - progress * 50) + 'px';
        damageDiv.style.opacity = 1 - progress;
        requestAnimationFrame(animate);
    };
    animate();
}

function showScoreNumber(x, y, z, score) {
    // Create floating score number using HTML
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'fixed pointer-events-none z-50 text-2xl font-bold text-green-400';
    scoreDiv.textContent = '+' + score;
    scoreDiv.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
    
    // Convert 3D position to screen coordinates
    const vector = new THREE.Vector3(x, y + 1, z);
    vector.project(gameState.camera);
    
    const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = (vector.y * -0.5 + 0.5) * window.innerHeight;
    
    scoreDiv.style.left = screenX + 'px';
    scoreDiv.style.top = screenY + 'px';
    scoreDiv.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(scoreDiv);
    
    // Animate and remove
    const startTime = Date.now();
    const animate = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 1000) {
            scoreDiv.remove();
            return;
        }
        
        const progress = elapsed / 1000;
        scoreDiv.style.top = (screenY - progress * 50) + 'px';
        scoreDiv.style.opacity = 1 - progress;
        requestAnimationFrame(animate);
    };
    animate();
}

function updateSpellCooldowns() {
    const now = Date.now();
    
    // Update fireball cooldown
    const fireballTimeLeft = Math.max(0, gameState.fireballCooldown - (now - gameState.lastFireballTime));
    const fireballProgress = 1 - (fireballTimeLeft / gameState.fireballCooldown);
    const fireballElement = document.getElementById('fireball-cooldown');
    const fireballProgressElement = document.getElementById('fireball-progress');
    
    if (fireballTimeLeft > 0) {
        fireballElement.style.opacity = '0.3';
        const degrees = fireballProgress * 360;
        fireballProgressElement.style.background = `conic-gradient(orange ${degrees}deg, transparent ${degrees}deg)`;
    } else {
        fireballElement.style.opacity = '0';
    }
    
    // Update lightning cooldown
    const lightningTimeLeft = Math.max(0, gameState.lightningCooldown - (now - gameState.lastLightningTime));
    const lightningProgress = 1 - (lightningTimeLeft / gameState.lightningCooldown);
    const lightningElement = document.getElementById('lightning-cooldown');
    const lightningProgressElement = document.getElementById('lightning-progress');
    
    if (lightningTimeLeft > 0) {
        lightningElement.style.opacity = '0.3';
        const degrees = lightningProgress * 360;
        lightningProgressElement.style.background = `conic-gradient(cyan ${degrees}deg, transparent ${degrees}deg)`;
    } else {
        lightningElement.style.opacity = '0';
    }
}

function createScreenFlash(color = '#ff4500', duration = 200) {
    const flash = document.createElement('div');
    flash.className = 'fixed inset-0 pointer-events-none z-50';
    flash.style.backgroundColor = color;
    flash.style.opacity = '0.3';
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.transition = `opacity ${duration}ms ease-out`;
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), duration);
    }, 50);
}