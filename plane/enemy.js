// Flying enemy logic
function initEnemies() {
    gameState.enemies = [];
    spawnEnemyWave();
}

function spawnEnemyWave() {
    const waveSize = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < waveSize; i++) {
        spawnEnemy();
    }
}

function spawnEnemy() {
    const player = gameState.player;
    const spawnDistance = 2000 + Math.random() * 1000;
    const angle = Math.random() * Math.PI * 2;
    
    const enemy = {
        x: player.x + Math.cos(angle) * spawnDistance,
        y: player.y + (Math.random() - 0.5) * 500,
        z: player.z + Math.sin(angle) * spawnDistance,
        velocityX: 0,
        velocityY: 0,
        velocityZ: 0,
        health: 50,
        maxHealth: 50,
        speed: 200 + Math.random() * 100,
        yaw: 0,
        pitch: 0,
        lastShotTime: 0,
        shootCooldown: 2000 + Math.random() * 1000,
        aggroRange: 1500,
        attackRange: 800,
        aiState: 'patrol', // patrol, chase, attack, flee
        patrolTarget: {
            x: Math.random() * 4000 - 2000,
            y: Math.random() * 500 + 200,
            z: Math.random() * 4000 - 2000
        }
    };
    
    gameState.enemies.push(enemy);
}

function updateEnemies() {
    const player = gameState.player;
    const deltaTime = gameState.deltaTime;
    const currentTime = Date.now();
    
    // Spawn new enemies occasionally
    if (gameState.enemies.length < 10 && Math.random() < 0.001) {
        spawnEnemy();
    }
    
    gameState.enemies.forEach((enemy, index) => {
        updateEnemyAI(enemy, player, currentTime);
        updateEnemyMovement(enemy, deltaTime);
        
        // Remove dead enemies
        if (enemy.health <= 0) {
            createExplosion(enemy.x, enemy.y, enemy.z);
            playSound('explosion');
            gameState.enemies.splice(index, 1);
        }
        
        // Remove enemies that are too far away
        const distance = Math.sqrt(
            (enemy.x - player.x) ** 2 +
            (enemy.y - player.y) ** 2 +
            (enemy.z - player.z) ** 2
        );
        
        if (distance > 5000) {
            gameState.enemies.splice(index, 1);
        }
    });
}

function updateEnemyAI(enemy, player, currentTime) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dz = player.z - enemy.z;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // State transitions
    switch (enemy.aiState) {
        case 'patrol':
            if (distanceToPlayer < enemy.aggroRange) {
                enemy.aiState = 'chase';
            }
            break;
            
        case 'chase':
            if (distanceToPlayer > enemy.aggroRange * 1.5) {
                enemy.aiState = 'patrol';
            } else if (distanceToPlayer < enemy.attackRange) {
                enemy.aiState = 'attack';
            }
            break;
            
        case 'attack':
            if (distanceToPlayer > enemy.attackRange * 1.2) {
                enemy.aiState = 'chase';
            }
            if (enemy.health < enemy.maxHealth * 0.3) {
                enemy.aiState = 'flee';
            }
            break;
            
        case 'flee':
            if (distanceToPlayer > enemy.aggroRange * 2) {
                enemy.aiState = 'patrol';
                enemy.health = enemy.maxHealth; // Regenerate when safe
            }
            break;
    }
    
    // Behavior based on state
    let targetX, targetY, targetZ;
    
    switch (enemy.aiState) {
        case 'patrol':
            targetX = enemy.patrolTarget.x;
            targetY = enemy.patrolTarget.y;
            targetZ = enemy.patrolTarget.z;
            
            // Choose new patrol target if close to current one
            const patrolDist = Math.sqrt(
                (enemy.x - targetX) ** 2 +
                (enemy.y - targetY) ** 2 +
                (enemy.z - targetZ) ** 2
            );
            
            if (patrolDist < 100) {
                enemy.patrolTarget = {
                    x: enemy.x + (Math.random() - 0.5) * 1000,
                    y: enemy.y + (Math.random() - 0.5) * 200,
                    z: enemy.z + (Math.random() - 0.5) * 1000
                };
            }
            break;
            
        case 'chase':
        case 'attack':
            // Lead the target
            targetX = player.x + player.velocityX * 2;
            targetY = player.y + player.velocityY * 2;
            targetZ = player.z + player.velocityZ * 2;
            
            // Shoot at player
            if (enemy.aiState === 'attack' && 
                currentTime - enemy.lastShotTime > enemy.shootCooldown) {
                shootAtPlayer(enemy, player);
                enemy.lastShotTime = currentTime;
            }
            break;
            
        case 'flee':
            // Move away from player
            targetX = enemy.x - dx;
            targetY = enemy.y - dy;
            targetZ = enemy.z - dz;
            break;
    }
    
    // Move toward target
    const targetDx = targetX - enemy.x;
    const targetDy = targetY - enemy.y;
    const targetDz = targetZ - enemy.z;
    const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy + targetDz * targetDz);
    
    if (targetDistance > 0) {
        const moveForce = enemy.speed * 2;
        enemy.velocityX += (targetDx / targetDistance) * moveForce * gameState.deltaTime;
        enemy.velocityY += (targetDy / targetDistance) * moveForce * gameState.deltaTime;
        enemy.velocityZ += (targetDz / targetDistance) * moveForce * gameState.deltaTime;
        
        // Update enemy orientation
        enemy.yaw = Math.atan2(targetDx, targetDz);
        enemy.pitch = -Math.asin(targetDy / targetDistance);
    }
}

function updateEnemyMovement(enemy, deltaTime) {
    // Apply drag
    const drag = 0.9;
    enemy.velocityX *= drag;
    enemy.velocityY *= drag;
    enemy.velocityZ *= drag;
    
    // Update position
    enemy.x += enemy.velocityX * deltaTime;
    enemy.y += enemy.velocityY * deltaTime;
    enemy.z += enemy.velocityZ * deltaTime;
    
    // Avoid ground
    if (enemy.y < gameState.world.ground + 50) {
        enemy.y = gameState.world.ground + 50;
        enemy.velocityY = Math.max(100, enemy.velocityY);
    }
    
    // Create engine trail
    if (Math.random() < 0.3) {
        createParticle({
            x: enemy.x + (Math.random() - 0.5) * 20,
            y: enemy.y + (Math.random() - 0.5) * 10,
            z: enemy.z + (Math.random() - 0.5) * 20,
            velocityX: (Math.random() - 0.5) * 30,
            velocityY: (Math.random() - 0.5) * 30,
            velocityZ: (Math.random() - 0.5) * 30,
            life: 0.5,
            maxLife: 0.5,
            size: Math.random() * 5 + 3,
            color: 'smoke'
        });
    }
}

function shootAtPlayer(enemy, player) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dz = player.z - enemy.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance === 0) return;
    
    const projectileSpeed = 1000;
    const projectile = {
        x: enemy.x,
        y: enemy.y,
        z: enemy.z,
        velocityX: (dx / distance) * projectileSpeed,
        velocityY: (dy / distance) * projectileSpeed,
        velocityZ: (dz / distance) * projectileSpeed,
        life: 3.0,
        damage: 15,
        fromEnemy: true
    };
    
    gameState.projectiles.push(projectile);
    playSound('enemyShoot');
}

function drawEnemy(enemy) {
    const ctx = gameState.ctx;
    const camera = gameState.camera;
    
    const dx = enemy.x - camera.x;
    const dy = enemy.y - camera.y;
    const dz = enemy.z - camera.z;
    
    if (dz < 0 || dz > 3000) return;
    
    const scale = gameState.canvas.height / dz;
    const screenX = gameState.canvas.width / 2 + dx * scale;
    const screenY = gameState.canvas.height / 2 - dy * scale;
    const screenSize = 20 * scale;
    
    if (screenX < -screenSize || screenX > gameState.canvas.width + screenSize) return;
    if (screenY < -screenSize || screenY > gameState.canvas.height + screenSize) return;
    
    ctx.save();
    
    // Enemy body
    ctx.fillStyle = `rgba(150, 50, 50, ${Math.min(1, 500 / dz)})`;
    ctx.fillRect(screenX - screenSize/2, screenY - screenSize/4, screenSize, screenSize/2);
    
    // Enemy wings
    ctx.fillStyle = `rgba(100, 40, 40, ${Math.min(0.8, 400 / dz)})`;
    ctx.fillRect(screenX - screenSize, screenY - screenSize/8, screenSize * 2, screenSize/4);
    
    // Health bar for damaged enemies
    if (enemy.health < enemy.maxHealth && scale > 0.5) {
        const barWidth = screenSize;
        const barHeight = 3;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillRect(screenX - barWidth/2, screenY - screenSize/2 - 10, barWidth, barHeight);
        
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.fillRect(screenX - barWidth/2, screenY - screenSize/2 - 10, barWidth * healthPercent, barHeight);
    }
    
    ctx.restore();
}
