// Player Character Logic

function createPlayer() {
    // Create player group for easy animation
    const playerGroup = new THREE.Group();
    
    // Main body - cute rounded shape
    const bodyGeometry = new THREE.SphereGeometry(CONSTANTS.PLAYER_SIZE * 0.7, 16, 12);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0xf0f8ff,
        emissive: 0x87ceeb,
        emissiveIntensity: 0.15,
        shininess: 100
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = CONSTANTS.PLAYER_SIZE * 0.6;
    body.scale.y = 0.8; // Slightly flatten for cute effect
    playerGroup.add(body);
    
    // Cute face - eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 6);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, CONSTANTS.PLAYER_SIZE * 0.8, CONSTANTS.PLAYER_SIZE * 0.5);
    playerGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, CONSTANTS.PLAYER_SIZE * 0.8, CONSTANTS.PLAYER_SIZE * 0.5);
    playerGroup.add(rightEye);
    
    // Happy mouth
    const mouthGeometry = new THREE.TorusGeometry(0.12, 0.02, 4, 8, Math.PI);
    const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, CONSTANTS.PLAYER_SIZE * 0.6, CONSTANTS.PLAYER_SIZE * 0.5);
    mouth.rotation.z = Math.PI; // Flip for smile
    playerGroup.add(mouth);
    
    // Cute little hat/crown
    const hatGeometry = new THREE.ConeGeometry(CONSTANTS.PLAYER_SIZE * 0.4, CONSTANTS.PLAYER_SIZE * 0.6, 6);
    const hatMaterial = new THREE.MeshPhongMaterial({
        color: 0xff69b4,
        emissive: 0xff1493,
        emissiveIntensity: 0.2
    });
    
    const hat = new THREE.Mesh(hatGeometry, hatMaterial);
    hat.position.y = CONSTANTS.PLAYER_SIZE * 1.2;
    playerGroup.add(hat);
    
    // Hat decoration - glowing orb
    const orbGeometry = new THREE.SphereGeometry(0.08);
    const orbMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.8
    });
    
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.y = CONSTANTS.PLAYER_SIZE * 1.5;
    playerGroup.add(orb);
    
    // Cute little feet
    const feetGeometry = new THREE.SphereGeometry(CONSTANTS.PLAYER_SIZE * 0.3, 8, 6);
    const feetMaterial = new THREE.MeshPhongMaterial({
        color: 0xffa500,
        emissive: 0xff8c00,
        emissiveIntensity: 0.1
    });
    
    const leftFoot = new THREE.Mesh(feetGeometry, feetMaterial);
    leftFoot.position.set(-CONSTANTS.PLAYER_SIZE * 0.4, 0.1, CONSTANTS.PLAYER_SIZE * 0.3);
    leftFoot.scale.y = 0.5;
    playerGroup.add(leftFoot);
    
    const rightFoot = new THREE.Mesh(feetGeometry, feetMaterial);
    rightFoot.position.set(CONSTANTS.PLAYER_SIZE * 0.4, 0.1, CONSTANTS.PLAYER_SIZE * 0.3);
    rightFoot.scale.y = 0.5;
    playerGroup.add(rightFoot);
    
    // Magical aura particles
    for (let i = 0; i < 8; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.03);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: [0x00ffff, 0xff69b4, 0x98fb98, 0xffd700][i % 4],
            transparent: true,
            opacity: 0.7
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.userData = {
            offset: i,
            radius: 1.2 + Math.random() * 0.5,
            speed: 0.5 + Math.random() * 0.3,
            verticalOffset: Math.random() * 0.5
        };
        playerGroup.add(particle);
    }
    
    // Position player
    playerGroup.position.set(0, 0, 0);
    gameState.scene.add(playerGroup);
    
    // Store references
    gameState.player.mesh = playerGroup;
    gameState.player.body = body;
    gameState.player.head = hat; // Use hat as head reference
    gameState.player.orb = orb;
    gameState.player.leftEye = leftEye;
    gameState.player.rightEye = rightEye;
    gameState.player.currentPosition.copy(playerGroup.position);
    gameState.player.targetPosition.copy(playerGroup.position);
}

function setPlayerTarget(x, z) {
    gameState.player.targetPosition.set(x, 0, z);
    gameState.player.isMoving = true;
    
    // Rotate player to face target
    const direction = new THREE.Vector3(x, 0, z).sub(gameState.player.currentPosition);
    if (direction.length() > 0.1) {
        const angle = Math.atan2(direction.x, direction.z);
        gameState.player.mesh.rotation.y = angle;
    }
}

function updatePlayerMovement() {
    if (gameState.mouse.isPressed) {
        // Continuous movement towards mouse position
        const direction = gameState.mouse.worldTarget.clone().sub(gameState.player.currentPosition);
        direction.y = 0; // Keep movement on ground plane
        
        if (direction.length() > 0.1) {
            // Set target and start moving
            setPlayerTarget(gameState.mouse.worldTarget.x, gameState.mouse.worldTarget.z);
        }
    }
}

function updatePlayer() {
    if (!gameState.player.mesh) return;
    
    const player = gameState.player;
    const mesh = player.mesh;
    
    // Update movement input
    updatePlayerMovement();
    
    // Update current position towards target
    if (player.isMoving) {
        const distance = player.currentPosition.distanceTo(player.targetPosition);
        
        if (distance > 0.1) {
            // Move towards target
            const direction = player.targetPosition.clone().sub(player.currentPosition).normalize();
            const moveAmount = CONSTANTS.PLAYER_SPEED * gameState.deltaTime;
            
            player.currentPosition.addScaledVector(direction, moveAmount);
            
            // Update mesh position
            mesh.position.copy(player.currentPosition);
            
            // Walking animation (bobbing)
            player.bobOffset += CONSTANTS.PLAYER_BOB_SPEED * gameState.deltaTime;
            const bobHeight = Math.sin(player.bobOffset) * CONSTANTS.PLAYER_BOB_HEIGHT;
            mesh.position.y = bobHeight;
            
            // Check for tile activation
            checkTileInteraction();
            
            // Check for note collection
            checkNoteCollection();
            
            // Play step sounds occasionally
            if (Math.random() < 0.1 * gameState.deltaTime) {
                playStepSound();
            }
            
        } else {
            // Reached target
            player.isMoving = false;
            mesh.position.copy(player.targetPosition);
            mesh.position.y = 0;
        }
    }
    
    // Update magical aura
    updatePlayerAura();
    
    // Animate hat and orb
    if (player.head) {
        const time = Date.now() * 0.003;
        player.head.material.emissiveIntensity = 0.2 + Math.sin(time) * 0.1;
    }
    
    if (player.orb) {
        const time = Date.now() * 0.005;
        player.orb.material.emissiveIntensity = 0.8 + Math.sin(time) * 0.3;
        player.orb.rotation.y += 0.05;
    }
    
    // Cute eye animation when moving
    if (player.isMoving && player.leftEye && player.rightEye) {
        const blinkTime = Date.now() * 0.01;
        if (Math.sin(blinkTime) > 0.9) {
            player.leftEye.scale.y = 0.1;
            player.rightEye.scale.y = 0.1;
        } else {
            player.leftEye.scale.y = 1;
            player.rightEye.scale.y = 1;
        }
    }
}

function updatePlayerAura() {
    const player = gameState.player;
    if (!player.mesh) return;
    
    const time = Date.now() * 0.001;
    
    // Update magical aura particles
    player.mesh.children.forEach((child) => {
        if (child.userData.radius !== undefined) {
            const data = child.userData;
            const angle = time * data.speed + data.offset * (Math.PI / 4);
            
            // Circular orbit around player
            child.position.x = Math.cos(angle) * data.radius;
            child.position.z = Math.sin(angle) * data.radius;
            child.position.y = CONSTANTS.PLAYER_HEIGHT / 2 + 
                             Math.sin(time * 2 + data.offset) * 0.3 + 
                             data.verticalOffset;
            
            // Pulsing opacity
            child.material.opacity = 0.7 + Math.sin(time * 3 + data.offset) * 0.3;
            
            // Gentle rotation
            child.rotation.x += 0.01;
            child.rotation.y += 0.015;
        }
    });
}

function checkTileInteraction() {
    const player = gameState.player;
    const tile = getTileAtPosition(player.currentPosition.x, player.currentPosition.z);
    
    if (tile) {
        // Play simple tile sound
        const timeSinceLastSound = Date.now() - (gameState.lastSubtleSoundTime || 0);
        if (timeSinceLastSound > 200) {
            playSimpleTileSound(tile.userData.index);
            gameState.lastSubtleSoundTime = Date.now();
        }
        
        // Only trigger visual effects and main interaction when entering a new tile
        if (tile.userData.index !== gameState.lastTileIndex) {
            if (activateTile(tile)) {
                gameState.lastTileIndex = tile.userData.index;
                
                // Simple UI feedback
                const noteSymbols = ['♪', '♫', '♬', '♩', '♭', '♯'];
                const randomNote = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
                
                addFloatingText(
                    randomNote,
                    tile.position.clone().add(new THREE.Vector3(0, 1, 0)),
                    `#${tile.userData.originalColor.toString(16)}`
                );
                
                updateUI();
            }
        }
    }
}

function checkNoteCollection() {
    const player = gameState.player;
    const collectionRange = 1.0; // Collection distance
    
    // Check each collectible note
    for (let i = gameState.collectibleNotes.length - 1; i >= 0; i--) {
        const note = gameState.collectibleNotes[i];
        
        if (!note.userData.collected) {
            const distance = player.currentPosition.distanceTo(note.position);
            
            if (distance < collectionRange) {
                // Collect the note
                if (collectNote(note.userData.id)) {
                    // Create collection effect
                    createMagicalAura(note.position, 0.8, note.material.color.getHex());
                    
                    break; // Only collect one note per frame
                } else {
                    // Inventory full - only show message if not already showing
                    if (!gameState.isInventoryFullDialogShowing) {
                        gameState.isInventoryFullDialogShowing = true;
                        showMessage('Inventory Full!', 1000);
                        
                        // Reset flag after message duration
                        setTimeout(() => {
                            gameState.isInventoryFullDialogShowing = false;
                        }, 1000);
                    }
                }
            }
        }
    }
}
