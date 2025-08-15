// Player plane logic
function initPlayer() {
    const player = gameState.player;
    
    // Starting position
    player.x = 0;
    player.y = 1000;
    player.z = 0;
    player.health = player.maxHealth;
    player.fuel = 100;
}

function updatePlayer() {
    const player = gameState.player;
    const deltaTime = gameState.deltaTime;
    
    // Apply gravity slightly (planes need some downward force)
    player.velocityY += gameState.world.gravity * 0.1 * deltaTime;
    
    // Apply wind effects
    player.velocityX += gameState.world.windX * deltaTime;
    player.velocityZ += gameState.world.windZ * deltaTime;
    
    // Banking/roll based on turning
    const turnRate = Math.abs(gameState.input.mouse.deltaX || 0);
    const targetRoll = Math.sign(gameState.input.mouse.deltaX || 0) * Math.min(turnRate * 0.01, 0.5);
    player.roll += (targetRoll - player.roll) * 5 * deltaTime;
    
    // Speed affects maneuverability
    const speedFactor = Math.min(player.speed / player.maxSpeed, 1);
    
    // Engine thrust simulation
    if (gameState.input.keys.KeyW) {
        const thrustForce = 1000 * speedFactor;
        const thrustX = Math.sin(player.yaw) * Math.cos(player.pitch) * thrustForce * deltaTime;
        const thrustY = Math.sin(player.pitch) * thrustForce * deltaTime;
        const thrustZ = Math.cos(player.yaw) * Math.cos(player.pitch) * thrustForce * deltaTime;
        
        player.velocityX += thrustX;
        player.velocityY += thrustY;
        player.velocityZ += thrustZ;
        
        // Consume fuel
        player.fuel = Math.max(0, player.fuel - 10 * deltaTime);
        
        // Create engine particles
        createEngineTrail();
    }
    
    // Air resistance
    const airResistance = 0.98;
    player.velocityX *= airResistance;
    player.velocityY *= airResistance;
    player.velocityZ *= airResistance;
    
    // Check collisions with buildings
    checkBuildingCollisions();
    
    // Check collisions with enemies
    checkEnemyCollisions();
    
    // Regenerate health slowly
    if (player.health < player.maxHealth && player.health > 0) {
        player.health = Math.min(player.maxHealth, player.health + 5 * deltaTime);
    }
    
    // Check if player is dead
    if (player.health <= 0) {
        handlePlayerDeath();
    }
}

function checkBuildingCollisions() {
    const player = gameState.player;
    const buildings = gameState.world.buildings;
    
    buildings.forEach(building => {
        const dx = Math.abs(player.x - building.x);
        const dy = Math.abs(player.y - building.y);
        const dz = Math.abs(player.z - building.z);
        
        // Simple box collision
        if (dx < building.width / 2 + 20 &&
            dy < building.height / 2 + 20 &&
            dz < building.depth / 2 + 20) {
            
            // Take damage
            takeDamage(50);
            
            // Bounce off
            const bounceForce = 500;
            if (dx > dz) {
                player.velocityX += Math.sign(player.x - building.x) * bounceForce;
            } else {
                player.velocityZ += Math.sign(player.z - building.z) * bounceForce;
            }
            
            // Create collision particles
            createCollisionExplosion(player.x, player.y, player.z);
        }
    });
}

function checkEnemyCollisions() {
    const player = gameState.player;
    const enemies = gameState.enemies;
    
    enemies.forEach((enemy, index) => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dz = player.z - enemy.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance < 50) {
            // Take damage
            takeDamage(25);
            
            // Destroy enemy
            createExplosion(enemy.x, enemy.y, enemy.z);
            gameState.enemies.splice(index, 1);
            
            // Knockback
            const knockbackForce = 300;
            player.velocityX += (dx / distance) * knockbackForce;
            player.velocityY += (dy / distance) * knockbackForce;
            player.velocityZ += (dz / distance) * knockbackForce;
        }
    });
}

function takeDamage(amount) {
    gameState.player.health = Math.max(0, gameState.player.health - amount);
    showDamageIndicator();
    playSound('hit');
    
    // Screen shake effect
    shakeScreen();
}

function handlePlayerDeath() {
    // Reset player
    gameState.player.health = gameState.player.maxHealth;
    gameState.player.x = 0;
    gameState.player.y = 1000;
    gameState.player.z = 0;
    gameState.player.velocityX = 0;
    gameState.player.velocityY = 0;
    gameState.player.velocityZ = 0;
    
    // Create death explosion
    createExplosion(gameState.player.x, gameState.player.y, gameState.player.z);
    createExplosionFlash();
    playSound('explosion');
}

function shakeScreen() {
    // Simple screen shake by temporarily offsetting camera
    const originalCameraX = gameState.camera.x;
    const originalCameraY = gameState.camera.y;
    
    const shakeIntensity = 20;
    const shakeDuration = 200;
    
    let shakeTime = 0;
    const shakeInterval = setInterval(() => {
        if (shakeTime < shakeDuration) {
            gameState.camera.x = originalCameraX + (Math.random() - 0.5) * shakeIntensity;
            gameState.camera.y = originalCameraY + (Math.random() - 0.5) * shakeIntensity;
            shakeTime += 16;
        } else {
            gameState.camera.x = originalCameraX;
            gameState.camera.y = originalCameraY;
            clearInterval(shakeInterval);
        }
    }, 16);
}

function createEngineTrail() {
    const player = gameState.player;
    
    // Create particles behind the plane
    const trailOffset = -50;
    const trailX = player.x + Math.sin(player.yaw + Math.PI) * trailOffset;
    const trailY = player.y;
    const trailZ = player.z + Math.cos(player.yaw + Math.PI) * trailOffset;
    
    for (let i = 0; i < 3; i++) {
        createParticle({
            x: trailX + (Math.random() - 0.5) * 20,
            y: trailY + (Math.random() - 0.5) * 10,
            z: trailZ + (Math.random() - 0.5) * 20,
            velocityX: (Math.random() - 0.5) * 50,
            velocityY: (Math.random() - 0.5) * 50,
            velocityZ: (Math.random() - 0.5) * 50,
            life: 1.0,
            maxLife: 1.0,
            size: Math.random() * 10 + 5,
            color: 'fire'
        });
    }
}
