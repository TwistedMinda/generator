// Devastated city environment generation
function generateBuildings() {
    gameState.world.buildings = [];
    
    for (let i = 0; i < 100; i++) {
        const building = {
            x: (Math.random() - 0.5) * 4000,
            y: Math.random() * 300 + 50,
            z: (Math.random() - 0.5) * 4000,
            width: Math.random() * 80 + 40,
            height: Math.random() * 400 + 100,
            depth: Math.random() * 80 + 40,
            destroyed: Math.random() < 0.7,
            fires: []
        };
        
        // Add fires to destroyed buildings
        if (building.destroyed) {
            const fireCount = Math.floor(Math.random() * 3) + 1;
            for (let f = 0; f < fireCount; f++) {
                building.fires.push({
                    x: building.x + (Math.random() - 0.5) * building.width,
                    y: building.y + Math.random() * building.height * 0.8,
                    z: building.z + (Math.random() - 0.5) * building.depth,
                    intensity: Math.random() * 0.5 + 0.5
                });
            }
        }
        
        gameState.world.buildings.push(building);
    }
}

function generateDebris() {
    gameState.world.debris = [];
    
    for (let i = 0; i < 200; i++) {
        gameState.world.debris.push({
            x: (Math.random() - 0.5) * 6000,
            y: Math.random() * 800 + 50,
            z: (Math.random() - 0.5) * 6000,
            size: Math.random() * 20 + 5,
            rotationX: Math.random() * Math.PI * 2,
            rotationY: Math.random() * Math.PI * 2,
            rotationZ: Math.random() * Math.PI * 2,
            velocityY: Math.random() * 2 - 1
        });
    }
}

function generateClouds() {
    gameState.world.clouds = [];
    
    for (let i = 0; i < 50; i++) {
        gameState.world.clouds.push({
            x: (Math.random() - 0.5) * 8000,
            y: Math.random() * 300 + 500,
            z: (Math.random() - 0.5) * 8000,
            size: Math.random() * 200 + 100,
            opacity: Math.random() * 0.3 + 0.1,
            velocityX: Math.random() * 10 - 5,
            velocityZ: Math.random() * 10 - 5
        });
    }
}

function drawBuilding(building) {
    const ctx = gameState.ctx;
    const camera = gameState.camera;
    
    // Simple 3D projection
    const dx = building.x - camera.x;
    const dy = building.y - camera.y;
    const dz = building.z - camera.z;
    
    if (dz < 0) return; // Behind camera
    
    const scale = gameState.canvas.height / dz;
    const screenX = gameState.canvas.width / 2 + dx * scale;
    const screenY = gameState.canvas.height / 2 - dy * scale;
    const screenWidth = building.width * scale;
    const screenHeight = building.height * scale;
    
    if (screenX + screenWidth < 0 || screenX > gameState.canvas.width) return;
    if (screenY + screenHeight < 0 || screenY > gameState.canvas.height) return;
    
    ctx.save();
    
    // Building color based on destruction
    if (building.destroyed) {
        ctx.fillStyle = `rgba(60, 40, 30, ${Math.min(1, 500 / dz)})`;
    } else {
        ctx.fillStyle = `rgba(80, 80, 90, ${Math.min(1, 500 / dz)})`;
    }
    
    ctx.fillRect(screenX, screenY, screenWidth, screenHeight);
    
    // Add windows for non-destroyed buildings
    if (!building.destroyed && scale > 0.5) {
        ctx.fillStyle = `rgba(255, 255, 100, ${Math.min(0.8, 300 / dz)})`;
        const windowRows = Math.floor(building.height / 30);
        const windowCols = Math.floor(building.width / 20);
        
        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                if (Math.random() < 0.7) {
                    const wx = screenX + (col + 0.2) * (screenWidth / windowCols);
                    const wy = screenY + (row + 0.2) * (screenHeight / windowRows);
                    const ww = screenWidth / windowCols * 0.6;
                    const wh = screenHeight / windowRows * 0.6;
                    ctx.fillRect(wx, wy, ww, wh);
                }
            }
        }
    }
    
    ctx.restore();
}

function drawDebris(debris) {
    const ctx = gameState.ctx;
    const camera = gameState.camera;
    
    const dx = debris.x - camera.x;
    const dy = debris.y - camera.y;
    const dz = debris.z - camera.z;
    
    if (dz < 0 || dz > 2000) return;
    
    const scale = gameState.canvas.height / dz;
    const screenX = gameState.canvas.width / 2 + dx * scale;
    const screenY = gameState.canvas.height / 2 - dy * scale;
    const screenSize = debris.size * scale;
    
    if (screenX < -screenSize || screenX > gameState.canvas.width + screenSize) return;
    if (screenY < -screenSize || screenY > gameState.canvas.height + screenSize) return;
    
    ctx.save();
    ctx.fillStyle = `rgba(100, 80, 60, ${Math.min(0.8, 200 / dz)})`;
    ctx.fillRect(screenX, screenY, screenSize, screenSize);
    ctx.restore();
}

function drawGround() {
    const ctx = gameState.ctx;
    const camera = gameState.camera;
    
    // Simple ground plane
    const groundY = gameState.world.ground;
    const dy = groundY - camera.y;
    
    if (dy > 0) return; // Above ground
    
    const horizonY = gameState.canvas.height / 2 - dy * 2;
    
    if (horizonY > 0 && horizonY < gameState.canvas.height) {
        ctx.save();
        ctx.fillStyle = 'rgba(40, 30, 20, 0.8)';
        ctx.fillRect(0, horizonY, gameState.canvas.width, gameState.canvas.height - horizonY);
        ctx.restore();
    }
}

function updateMap() {
    // Update debris animation
    gameState.world.debris.forEach(debris => {
        debris.y += debris.velocityY * gameState.deltaTime;
        debris.rotationX += gameState.deltaTime;
        debris.rotationY += gameState.deltaTime * 0.7;
        debris.rotationZ += gameState.deltaTime * 1.3;
    });
    
    // Update clouds
    gameState.world.clouds.forEach(cloud => {
        cloud.x += cloud.velocityX * gameState.deltaTime;
        cloud.z += cloud.velocityZ * gameState.deltaTime;
    });
}
