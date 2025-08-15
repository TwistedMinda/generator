// Camera Control System

function initCamera() {
    // Create camera
    gameState.camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    
    // Position camera above and behind the origin
    gameState.camera.position.set(0, CONSTANTS.CAMERA_HEIGHT, CONSTANTS.CAMERA_DISTANCE);
    gameState.camera.lookAt(0, 0, 0);
    
    // Store initial camera offset for following player
    gameState.cameraOffset = new THREE.Vector3(0, CONSTANTS.CAMERA_HEIGHT, CONSTANTS.CAMERA_DISTANCE);
}

function updateCamera() {
    if (!gameState.camera || !gameState.player.mesh) return;
    
    // Follow player with smooth camera movement
    const targetPosition = gameState.player.mesh.position.clone().add(gameState.cameraOffset);
    
    // Smooth camera following
    gameState.camera.position.lerp(targetPosition, 0.05);
    
    // Always look at the player
    const lookTarget = gameState.player.mesh.position.clone();
    lookTarget.y += CONSTANTS.PLAYER_HEIGHT / 2;
    gameState.camera.lookAt(lookTarget);
}

function handleKeyboardInput() {
    // No keyboard controls needed
}

function setupCameraControls() {
    // Mouse controls for movement
    document.addEventListener('mousedown', (event) => {
        if (event.button === 0) { // Left mouse button
            gameState.mouse.isPressed = true;
            updateMouseWorldPosition(event);
            
            // Resume audio context on first interaction
            if (gameState.audioContext && gameState.audioContext.state === 'suspended') {
                gameState.audioContext.resume().then(() => {
                });
            }
        }
    });
    
    document.addEventListener('mouseup', (event) => {
        if (event.button === 0) { // Left mouse button
            gameState.mouse.isPressed = false;
            gameState.player.isMoving = false;
        }
    });
    
    document.addEventListener('mousemove', (event) => {
        gameState.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        gameState.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update movement target if mouse is pressed
        if (gameState.mouse.isPressed) {
            updateMouseWorldPosition(event);
        }
    });
}

function updateMouseWorldPosition(event) {
    // Convert mouse coordinates to world position
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, gameState.camera);
    
    // Find intersection with ground plane
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(groundPlane, intersection)) {
        gameState.mouse.worldTarget.copy(intersection);
    }
}

function handleWindowResize() {
    if (!gameState.camera || !gameState.renderer) return;
    
    gameState.camera.aspect = window.innerWidth / window.innerHeight;
    gameState.camera.updateProjectionMatrix();
    gameState.renderer.setSize(window.innerWidth, window.innerHeight);
}

// Setup resize handler
window.addEventListener('resize', handleWindowResize);
