// Camera controls - WASD movement and mouse orientation
function initCamera() {
    const canvas = gameState.canvas;
    
    // Mouse events
    canvas.addEventListener('click', lockPointer);
    
    document.addEventListener('pointerlockchange', () => {
        gameState.input.mouse.locked = document.pointerLockElement === canvas;
    });
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

function handleMouseMove(event) {
    if (!gameState.input.mouse.locked) return;
    
    gameState.input.mouse.deltaX = event.movementX || 0;
    gameState.input.mouse.deltaY = event.movementY || 0;
    
    // Apply mouse sensitivity
    const sensitivity = gameState.settings.mouseSensitivity;
    gameState.camera.yaw -= gameState.input.mouse.deltaX * sensitivity;
    gameState.camera.pitch -= gameState.input.mouse.deltaY * sensitivity;
    
    // Clamp pitch
    gameState.camera.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, gameState.camera.pitch));
    
    // Reset mouse deltas
    gameState.input.mouse.deltaX = 0;
    gameState.input.mouse.deltaY = 0;
}

function handleKeyDown(event) {
    gameState.input.keys[event.code] = true;
    
    // Prevent default for game keys
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'KeyF'].includes(event.code)) {
        event.preventDefault();
    }
    
    // Debug toggle
    if (event.code === 'KeyF') {
        toggleDebugInfo();
    }
}

function handleKeyUp(event) {
    gameState.input.keys[event.code] = false;
}

function updateCamera() {
    const camera = gameState.camera;
    const player = gameState.player;
    const input = gameState.input;
    const deltaTime = gameState.deltaTime;
    
    // Movement input
    let forwardInput = 0;
    let rightInput = 0;
    let upInput = 0;
    
    if (input.keys.KeyW) forwardInput += 1;
    if (input.keys.KeyS) forwardInput -= 1;
    if (input.keys.KeyD) rightInput += 1;
    if (input.keys.KeyA) rightInput -= 1;
    if (input.keys.Space) upInput += 1;
    if (input.keys.ShiftLeft) upInput -= 1;
    
    // Calculate movement vectors based on camera rotation
    const cosYaw = Math.cos(camera.yaw);
    const sinYaw = Math.sin(camera.yaw);
    const cosPitch = Math.cos(camera.pitch);
    
    // Forward/backward movement
    const forwardX = sinYaw * cosPitch * forwardInput;
    const forwardY = Math.sin(camera.pitch) * forwardInput;
    const forwardZ = cosYaw * cosPitch * forwardInput;
    
    // Right/left movement
    const rightX = cosYaw * rightInput;
    const rightZ = -sinYaw * rightInput;
    
    // Apply movement with speed
    const speed = 500; // Base movement speed
    player.velocityX += (forwardX + rightX) * speed * deltaTime;
    player.velocityY += (forwardY + upInput * speed) * deltaTime;
    player.velocityZ += (forwardZ + rightZ) * speed * deltaTime;
    
    // Apply drag
    const drag = 0.95;
    player.velocityX *= drag;
    player.velocityY *= drag;
    player.velocityZ *= drag;
    
    // Update player position
    player.x += player.velocityX * deltaTime;
    player.y += player.velocityY * deltaTime;
    player.z += player.velocityZ * deltaTime;
    
    // Ground collision
    if (player.y < gameState.world.ground + 10) {
        player.y = gameState.world.ground + 10;
        player.velocityY = Math.max(0, player.velocityY);
    }
    
    // Update camera to follow player
    camera.x = player.x;
    camera.y = player.y;
    camera.z = player.z;
    
    // Copy rotation to player for consistency
    player.pitch = camera.pitch;
    player.yaw = camera.yaw;
    
    // Calculate player speed for HUD
    const totalVelocity = Math.sqrt(
        player.velocityX * player.velocityX +
        player.velocityY * player.velocityY +
        player.velocityZ * player.velocityZ
    );
    player.speed = totalVelocity * 3.6; // Convert to km/h
}

function screenToWorld(screenX, screenY) {
    const camera = gameState.camera;
    const canvas = gameState.canvas;
    
    // Convert screen coordinates to normalized device coordinates
    const ndcX = (screenX / canvas.width) * 2 - 1;
    const ndcY = 1 - (screenY / canvas.height) * 2;
    
    // Simple ray casting (for targeting)
    const direction = {
        x: Math.sin(camera.yaw) * Math.cos(camera.pitch),
        y: Math.sin(camera.pitch),
        z: Math.cos(camera.yaw) * Math.cos(camera.pitch)
    };
    
    return {
        origin: { x: camera.x, y: camera.y, z: camera.z },
        direction: direction
    };
}
