// Camera controls - WASD movement and mouse orientation

function initCamera() {
    gameState.camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    
    gameState.camera.position.set(
        gameState.player.position.x,
        gameState.player.position.y,
        gameState.player.position.z
    );
    
    // Setup controls
    setupInputHandlers();
}

function setupInputHandlers() {
    // Keyboard input
    document.addEventListener('keydown', (event) => {
        gameState.keys[event.code.toLowerCase()] = true;
        
        // Prevent default for game keys
        if (['keyw', 'keya', 'keys', 'keyd', 'space'].includes(event.code.toLowerCase())) {
            event.preventDefault();
        }
    });
    
    document.addEventListener('keyup', (event) => {
        gameState.keys[event.code.toLowerCase()] = false;
    });
    
    // Mouse input
    document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body) {
            gameState.player.rotation.y -= event.movementX * gameState.mouse.sensitivity;
            gameState.player.rotation.x -= event.movementY * gameState.mouse.sensitivity; // Fixed inversion
            
            // Limit vertical rotation
            gameState.player.rotation.x = Math.max(
                -Math.PI / 2, 
                Math.min(Math.PI / 2, gameState.player.rotation.x)
            );
        }
    });
    
    // Mouse click for spells
    document.addEventListener('click', (event) => {
        // Always cast on click
        castFireball();
        
        // Prevent pointer lock only if testing flag is on AND not truly mobile
        if (TESTING_MOBILE_ON_WEB && !IS_DEVICE) return;

        if (document.pointerLockElement !== document.body) {
            document.body.requestPointerLock();
        }
    });
    
    // Space for lightning
    document.addEventListener('keydown', (event) => {
        if (event.code.toLowerCase() === 'space') {
            if (document.pointerLockElement === document.body) {
                event.preventDefault();
                castLightning();
            }
        }
    });
    
    // Window resize
    window.addEventListener('resize', () => {
        gameState.camera.aspect = window.innerWidth / window.innerHeight;
        gameState.camera.updateProjectionMatrix();
        gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function updateCamera(deltaTime) {
    const speed = gameState.player.speed * deltaTime;
    const direction = new THREE.Vector3();
    
    // Calculate movement direction based on camera rotation
    const yaw = gameState.player.rotation.y;
    
    // WASD movement
    if (gameState.keys['keyw']) {
        direction.x -= Math.sin(yaw) * speed;
        direction.z -= Math.cos(yaw) * speed;
    }
    if (gameState.keys['keys']) {
        direction.x += Math.sin(yaw) * speed;
        direction.z += Math.cos(yaw) * speed;
    }
    if (gameState.keys['keya']) {
        direction.x -= Math.cos(yaw) * speed;
        direction.z += Math.sin(yaw) * speed;
    }
    if (gameState.keys['keyd']) {
        direction.x += Math.cos(yaw) * speed;
        direction.z -= Math.sin(yaw) * speed;
    }
    
    // Check for collisions before moving
    const newPosition = {
        x: gameState.player.position.x + direction.x,
        y: gameState.player.position.y,
        z: gameState.player.position.z + direction.z
    };
    
    // Check building collisions
    if (!checkBuildingCollision(newPosition)) {
        // Check faerie collisions
        if (!checkFaerieCollision(newPosition)) {
            // Safe to move
            gameState.player.position.x = newPosition.x;
            gameState.player.position.z = newPosition.z;
        }
    }
    
    // Keep player above ground
    gameState.player.position.y = 1.8;
    
    // Update camera position and rotation
    gameState.camera.position.set(
        gameState.player.position.x,
        gameState.player.position.y,
        gameState.player.position.z
    );
    
    // Apply only pitch and yaw - no roll to prevent head tilt
    gameState.camera.rotation.order = 'YXZ'; // Ensure proper rotation order
    gameState.camera.rotation.x = gameState.player.rotation.x; // Pitch (up/down)
    gameState.camera.rotation.y = gameState.player.rotation.y; // Yaw (left/right)  
    gameState.camera.rotation.z = 0; // No roll (head tilt)
    
    // Update staff position if it exists
    if (gameState.player.staff) {
        updateStaffPosition();
    }
}

function updateStaffPosition() {
    const staff = gameState.player.staff;
    const camera = gameState.camera;
    
    // Position staff relative to camera (smaller and more in view)
    const baseOffset = new THREE.Vector3(0.12, -0.08, -0.36);
    let staffOffset = baseOffset.clone();
    
    // Apply brief recoil kick when casting
    const kickActive = gameState.player.staff.userData && gameState.player.staff.userData.kickUntil && Date.now() < gameState.player.staff.userData.kickUntil;
    if (kickActive) {
        staffOffset.x += 0.02;
        staffOffset.y -= 0.01;
        staffOffset.z -= 0.03;
    }
    staffOffset.applyMatrix4(camera.matrixWorld);
    
    staff.position.copy(staffOffset);
    staff.rotation.copy(camera.rotation);
    
    // Clear kick flag when elapsed
    if (gameState.player.staff.userData && gameState.player.staff.userData.kickUntil && Date.now() >= gameState.player.staff.userData.kickUntil) {
        delete gameState.player.staff.userData.kickUntil;
    }
    // No more swaying - keeps head stable
}

function getCameraDirection() {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(gameState.camera.quaternion);
    return direction;
}

function checkBuildingCollision(newPosition) {
    const playerRadius = 0.3; // Smaller collision radius for buildings
    
    // Check against all buildings
    for (const building of gameState.buildings) {
        const buildingBox = new THREE.Box3().setFromObject(building);
        
        // Expand building box by player radius
        buildingBox.expandByScalar(playerRadius);
        
        // Check if new position would be inside expanded building box
        if (buildingBox.containsPoint(new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z))) {
            return true; // Collision detected
        }
    }
    
    return false; // No collision
}

function checkFaerieCollision(newPosition) {
    const playerRadius = 0.3; // Smaller player collision radius
    const faerieRadius = 0.4; // Smaller faerie collision radius
    const minDistance = playerRadius + faerieRadius;
    let blockedCount = 0;
    
    // Check against all faeries
    for (const faerie of gameState.faeries) {
        const distance = Math.sqrt(
            Math.pow(newPosition.x - faerie.position.x, 2) +
            Math.pow(newPosition.z - faerie.position.z, 2)
        );
        
        if (distance < minDistance) {
            blockedCount++;
            // Only block if multiple faeries are very close (prevents total lockup)
            if (blockedCount >= 2) {
                return true;
            }
        }
    }
    
    return false; // No collision or only one faerie blocking
}
