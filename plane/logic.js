// Core game logic and flow
function updateProjectiles() {
    const deltaTime = gameState.deltaTime;
    
    gameState.projectiles.forEach((projectile, index) => {
        // Update position
        projectile.x += projectile.velocityX * deltaTime;
        projectile.y += projectile.velocityY * deltaTime;
        projectile.z += projectile.velocityZ * deltaTime;
        
        // Update life
        projectile.life -= deltaTime;
        
        // Remove expired projectiles
        if (projectile.life <= 0) {
            gameState.projectiles.splice(index, 1);
            return;
        }
        
        // Check collision with player
        if (projectile.fromEnemy) {
            const player = gameState.player;
            const dx = projectile.x - player.x;
            const dy = projectile.y - player.y;
            const dz = projectile.z - player.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance < 30) {
                takeDamage(projectile.damage);
                createImpactEffect(projectile.x, projectile.y, projectile.z);
                gameState.projectiles.splice(index, 1);
                return;
            }
        }
        
        // Check collision with enemies
        if (!projectile.fromEnemy) {
            gameState.enemies.forEach((enemy, enemyIndex) => {
                const dx = projectile.x - enemy.x;
                const dy = projectile.y - enemy.y;
                const dz = projectile.z - enemy.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance < 40) {
                    enemy.health -= projectile.damage;
                    createImpactEffect(projectile.x, projectile.y, projectile.z);
                    gameState.projectiles.splice(index, 1);
                    
                    if (enemy.health <= 0) {
                        createExplosion(enemy.x, enemy.y, enemy.z);
                        gameState.enemies.splice(enemyIndex, 1);
                        playSound('explosion');
                    }
                    return;
                }
            });
        }
        
        // Check collision with buildings
        gameState.world.buildings.forEach(building => {
            const dx = Math.abs(projectile.x - building.x);
            const dy = Math.abs(projectile.y - building.y);
            const dz = Math.abs(projectile.z - building.z);
            
            if (dx < building.width / 2 &&
                dy < building.height / 2 &&
                dz < building.depth / 2) {
                
                createImpactEffect(projectile.x, projectile.y, projectile.z);
                gameState.projectiles.splice(index, 1);
                return;
            }
        });
        
        // Check ground collision
        if (projectile.y < gameState.world.ground) {
            createImpactEffect(projectile.x, gameState.world.ground, projectile.z);
            gameState.projectiles.splice(index, 1);
        }
    });
}

function drawProjectiles() {
    const ctx = gameState.ctx;
    const camera = gameState.camera;
    
    gameState.projectiles.forEach(projectile => {
        const dx = projectile.x - camera.x;
        const dy = projectile.y - camera.y;
        const dz = projectile.z - camera.z;
        
        if (dz < 0 || dz > 2000) return;
        
        const scale = gameState.canvas.height / dz;
        const screenX = gameState.canvas.width / 2 + dx * scale;
        const screenY = gameState.canvas.height / 2 - dy * scale;
        const screenSize = 5 * scale;
        
        if (screenX < -screenSize || screenX > gameState.canvas.width + screenSize) return;
        if (screenY < -screenSize || screenY > gameState.canvas.height + screenSize) return;
        
        ctx.save();
        
        // Projectile trail
        const trailLength = 30 * scale;
        const trailGradient = ctx.createLinearGradient(
            screenX - trailLength, screenY,
            screenX + trailLength, screenY
        );
        
        if (projectile.fromEnemy) {
            trailGradient.addColorStop(0, 'rgba(255, 100, 100, 0)');
            trailGradient.addColorStop(1, 'rgba(255, 100, 100, 0.8)');
        } else {
            trailGradient.addColorStop(0, 'rgba(100, 255, 100, 0)');
            trailGradient.addColorStop(1, 'rgba(100, 255, 100, 0.8)');
        }
        
        ctx.fillStyle = trailGradient;
        ctx.fillRect(screenX - trailLength, screenY - 1, trailLength * 2, 2);
        
        // Projectile core
        if (projectile.fromEnemy) {
            ctx.fillStyle = `rgba(255, 100, 100, ${Math.min(1, 300 / dz)})`;
        } else {
            ctx.fillStyle = `rgba(100, 255, 100, ${Math.min(1, 300 / dz)})`;
        }
        
        ctx.fillRect(screenX - screenSize/2, screenY - screenSize/2, screenSize, screenSize);
        
        ctx.restore();
    });
}

function createImpactEffect(x, y, z) {
    // Create impact particles
    for (let i = 0; i < 8; i++) {
        createParticle({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            z: z + (Math.random() - 0.5) * 20,
            velocityX: (Math.random() - 0.5) * 200,
            velocityY: (Math.random() - 0.5) * 200,
            velocityZ: (Math.random() - 0.5) * 200,
            life: 0.5,
            maxLife: 0.5,
            size: Math.random() * 8 + 4,
            color: 'spark'
        });
    }
    
    playSound('impact');
}

function createCollisionExplosion(x, y, z) {
    // Create collision explosion
    for (let i = 0; i < 20; i++) {
        createParticle({
            x: x + (Math.random() - 0.5) * 50,
            y: y + (Math.random() - 0.5) * 50,
            z: z + (Math.random() - 0.5) * 50,
            velocityX: (Math.random() - 0.5) * 400,
            velocityY: (Math.random() - 0.5) * 400,
            velocityZ: (Math.random() - 0.5) * 400,
            life: 1.5,
            maxLife: 1.5,
            size: Math.random() * 15 + 10,
            color: 'fire'
        });
    }
    
    // Add some smoke
    for (let i = 0; i < 10; i++) {
        createParticle({
            x: x + (Math.random() - 0.5) * 30,
            y: y + (Math.random() - 0.5) * 30,
            z: z + (Math.random() - 0.5) * 30,
            velocityX: (Math.random() - 0.5) * 100,
            velocityY: Math.random() * 100 + 50,
            velocityZ: (Math.random() - 0.5) * 100,
            life: 3.0,
            maxLife: 3.0,
            size: Math.random() * 25 + 15,
            color: 'smoke'
        });
    }
}

function handleGameEvents() {
    // Handle player input for shooting
    if (gameState.input.keys.Space && !gameState.input.lastSpacePress) {
        firePlayerWeapon();
        gameState.input.lastSpacePress = true;
    }
    
    if (!gameState.input.keys.Space) {
        gameState.input.lastSpacePress = false;
    }
    
    // Dynamic enemy spawning based on difficulty
    const difficultyFactor = Math.min(gameState.world.time / 60, 3); // Max difficulty after 3 minutes
    
    if (Math.random() < 0.001 * (1 + difficultyFactor)) {
        spawnEnemy();
    }
    
    // Environmental effects
    if (Math.random() < 0.0005) {
        createWeatherEffect();
    }
}

function firePlayerWeapon() {
    const player = gameState.player;
    const projectileSpeed = 1500;
    
    // Calculate firing direction
    const dirX = Math.sin(player.yaw) * Math.cos(player.pitch);
    const dirY = Math.sin(player.pitch);
    const dirZ = Math.cos(player.yaw) * Math.cos(player.pitch);
    
    const projectile = {
        x: player.x + dirX * 50,
        y: player.y + dirY * 50,
        z: player.z + dirZ * 50,
        velocityX: dirX * projectileSpeed + player.velocityX,
        velocityY: dirY * projectileSpeed + player.velocityY,
        velocityZ: dirZ * projectileSpeed + player.velocityZ,
        life: 2.0,
        damage: 25,
        fromEnemy: false
    };
    
    gameState.projectiles.push(projectile);
    playSound('playerShoot');
    
    // Muzzle flash effect
    createParticle({
        x: projectile.x,
        y: projectile.y,
        z: projectile.z,
        velocityX: dirX * 100,
        velocityY: dirY * 100,
        velocityZ: dirZ * 100,
        life: 0.1,
        maxLife: 0.1,
        size: 20,
        color: 'spark'
    });
}

function createWeatherEffect() {
    // Random environmental particles (ash, debris)
    const player = gameState.player;
    
    for (let i = 0; i < 5; i++) {
        createParticle({
            x: player.x + (Math.random() - 0.5) * 2000,
            y: player.y + Math.random() * 500 + 200,
            z: player.z + (Math.random() - 0.5) * 2000,
            velocityX: gameState.world.windX + (Math.random() - 0.5) * 20,
            velocityY: -Math.random() * 50 - 10,
            velocityZ: gameState.world.windZ + (Math.random() - 0.5) * 20,
            life: 10.0,
            maxLife: 10.0,
            size: Math.random() * 3 + 1,
            color: 'ash'
        });
    }
}
