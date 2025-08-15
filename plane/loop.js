// Base game loop - handles timing and main update cycle
function initGameLoop() {
    const canvas = document.getElementById('gameCanvas');
    gameState.canvas = canvas;
    gameState.ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize game systems
    initCamera();
    initPlayer();
    initEnemies();
    initSounds();
    initParticleSystem();
    
    // Generate world
    generateBuildings();
    generateDebris();
    generateClouds();
    
    // Start the game loop
    gameState.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    const canvas = gameState.canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameState.width = canvas.width;
    gameState.height = canvas.height;
}

function gameLoop(currentTime) {
    // Calculate delta time
    gameState.deltaTime = Math.min((currentTime - gameState.lastTime) / 1000, 0.016);
    gameState.lastTime = currentTime;
    gameState.world.time += gameState.deltaTime;
    
    if (gameState.gameRunning && !gameState.paused) {
        update();
        render();
    }
    
    requestAnimationFrame(gameLoop);
}

function update() {
    // Update core systems
    updateCamera();
    updatePlayer();
    updateEnemies();
    updateProjectiles();
    updateParticles();
    updateMap();
    updateHUD();
    
    // Update wind for atmosphere
    gameState.world.windX = Math.sin(gameState.world.time * 0.1) * 20;
    gameState.world.windZ = Math.cos(gameState.world.time * 0.07) * 15;
}

function render() {
    const ctx = gameState.ctx;
    const canvas = gameState.canvas;
    
    // Clear screen with dark apocalyptic sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#1a0a0a');
    skyGradient.addColorStop(0.7, '#2d1a1a');
    skyGradient.addColorStop(1, '#4a2a2a');
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw world elements (sorted by distance for depth)
    const camera = gameState.camera;
    const renderList = [];
    
    // Add buildings to render list
    gameState.world.buildings.forEach(building => {
        const distance = Math.sqrt(
            (building.x - camera.x) ** 2 +
            (building.z - camera.z) ** 2
        );
        renderList.push({ type: 'building', object: building, distance });
    });
    
    // Add debris to render list
    gameState.world.debris.forEach(debris => {
        const distance = Math.sqrt(
            (debris.x - camera.x) ** 2 +
            (debris.z - camera.z) ** 2
        );
        renderList.push({ type: 'debris', object: debris, distance });
    });
    
    // Add enemies to render list
    gameState.enemies.forEach(enemy => {
        const distance = Math.sqrt(
            (enemy.x - camera.x) ** 2 +
            (enemy.z - camera.z) ** 2
        );
        renderList.push({ type: 'enemy', object: enemy, distance });
    });
    
    // Sort by distance (far to near)
    renderList.sort((a, b) => b.distance - a.distance);
    
    // Render sorted objects
    renderList.forEach(item => {
        switch (item.type) {
            case 'building':
                drawBuilding(item.object);
                break;
            case 'debris':
                drawDebris(item.object);
                break;
            case 'enemy':
                drawEnemy(item.object);
                break;
        }
    });
    
    // Draw ground
    drawGround();
    
    // Draw projectiles
    drawProjectiles();
    
    // Draw particles (always on top)
    drawParticles();
    
    // Draw atmospheric effects
    drawAtmosphericEffects();
    
    // Draw debug info if enabled
    drawDebugInfo();
}

function drawAtmosphericEffects() {
    const ctx = gameState.ctx;
    const canvas = gameState.canvas;
    
    // Dust particles in air
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#888';
    
    for (let i = 0; i < 50; i++) {
        const x = (Math.sin(gameState.world.time * 0.1 + i) * 0.5 + 0.5) * canvas.width;
        const y = (Math.sin(gameState.world.time * 0.07 + i * 1.3) * 0.5 + 0.5) * canvas.height;
        const size = Math.sin(gameState.world.time * 0.05 + i * 2) * 2 + 2;
        
        ctx.fillRect(x, y, size, size);
    }
    
    ctx.restore();
    
    // Atmospheric haze near ground
    const groundY = gameState.canvas.height / 2 - (gameState.world.ground - gameState.camera.y) * 2;
    if (groundY > 0 && groundY < canvas.height) {
        const hazeGradient = ctx.createLinearGradient(0, groundY - 100, 0, groundY + 100);
        hazeGradient.addColorStop(0, 'rgba(139, 69, 19, 0)');
        hazeGradient.addColorStop(1, 'rgba(139, 69, 19, 0.3)');
        
        ctx.fillStyle = hazeGradient;
        ctx.fillRect(0, Math.max(0, groundY - 100), canvas.width, 200);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initGameLoop);
