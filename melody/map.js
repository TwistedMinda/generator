// Map and Environment Creation

function createMap() {
    // Create tiles in a grid pattern
    const tileCount = Math.floor(CONSTANTS.WORLD_SIZE / CONSTANTS.TILE_SIZE);
    const startX = -(tileCount * CONSTANTS.TILE_SIZE) / 2;
    const startZ = -(tileCount * CONSTANTS.TILE_SIZE) / 2;
    
    for (let x = 0; x < tileCount; x++) {
        for (let z = 0; z < tileCount; z++) {
            const worldX = startX + x * CONSTANTS.TILE_SIZE + CONSTANTS.TILE_SIZE / 2;
            const worldZ = startZ + z * CONSTANTS.TILE_SIZE + CONSTANTS.TILE_SIZE / 2;
            
            createTile(worldX, worldZ, x * tileCount + z);
        }
    }
    
    // Create ambient lighting
    createLighting();
    
    // Create ground base
    createGroundBase();
    
    // Spawn collectible notes
    spawnCollectibleNotes();
}

function createTile(x, z, index) {
    // Create tile geometry
    const geometry = new THREE.BoxGeometry(
        CONSTANTS.TILE_SIZE * 0.9, 
        CONSTANTS.TILE_HEIGHT, 
        CONSTANTS.TILE_SIZE * 0.9
    );
    
    // Get color for this tile
    const colorIndex = index % CONSTANTS.TILE_COLORS.length;
    const color = CONSTANTS.TILE_COLORS[colorIndex];
    
    // Create material with enhanced glow effect
    const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.85,
        emissive: new THREE.Color(color).multiplyScalar(0.15),
        shininess: 100,
        specular: 0x444444
    });
    
    // Create tile mesh
    const tile = new THREE.Mesh(geometry, material);
    tile.position.set(x, CONSTANTS.TILE_HEIGHT / 2, z);
    
    // Add slight random height variation
    tile.position.y += (Math.random() - 0.5) * 0.05;
    
    // Store tile data
    tile.userData = {
        index: index,
        colorIndex: colorIndex,
        originalColor: color,
        isActive: false,
        lastActivated: 0
    };
    
    gameState.scene.add(tile);
    gameState.tiles.push(tile);
    
    // Store in map for quick lookup
    const key = `${Math.round(x)},${Math.round(z)}`;
    gameState.tileMap.set(key, tile);
}

function createLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    gameState.scene.add(ambientLight);
    gameState.lights.push(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    gameState.scene.add(directionalLight);
    gameState.lights.push(directionalLight);
    
    // Point lights for atmosphere
    const colors = [0xff6b9d, 0x4ecdc4, 0xffd93d];
    for (let i = 0; i < 3; i++) {
        const pointLight = new THREE.PointLight(colors[i], 0.3, 20);
        pointLight.position.set(
            (Math.random() - 0.5) * CONSTANTS.WORLD_SIZE,
            5,
            (Math.random() - 0.5) * CONSTANTS.WORLD_SIZE
        );
        gameState.scene.add(pointLight);
        gameState.lights.push(pointLight);
    }
}

function createGroundBase() {
    // Large ground plane beneath tiles
    const groundGeometry = new THREE.PlaneGeometry(CONSTANTS.WORLD_SIZE * 2, CONSTANTS.WORLD_SIZE * 2);
    const groundMaterial = new THREE.MeshLambertMaterial({
        color: 0x2c3e50,
        transparent: true,
        opacity: 0.3
    });
    
    gameState.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    gameState.ground.rotation.x = -Math.PI / 2;
    gameState.ground.position.y = -0.1;
    gameState.scene.add(gameState.ground);
}

function getTileAtPosition(x, z) {
    // Find which tile grid position the player is in
    const tileCount = Math.floor(CONSTANTS.WORLD_SIZE / CONSTANTS.TILE_SIZE);
    const startX = -(tileCount * CONSTANTS.TILE_SIZE) / 2;
    const startZ = -(tileCount * CONSTANTS.TILE_SIZE) / 2;
    
    // Calculate grid indices
    const gridX = Math.floor((x - startX) / CONSTANTS.TILE_SIZE);
    const gridZ = Math.floor((z - startZ) / CONSTANTS.TILE_SIZE);
    
    // Check bounds
    if (gridX < 0 || gridX >= tileCount || gridZ < 0 || gridZ >= tileCount) {
        return null;
    }
    
    // Calculate the actual tile center coordinates (same as in createMap)
    const worldX = startX + gridX * CONSTANTS.TILE_SIZE + CONSTANTS.TILE_SIZE / 2;
    const worldZ = startZ + gridZ * CONSTANTS.TILE_SIZE + CONSTANTS.TILE_SIZE / 2;
    
    // Create key using the same format as when tiles were stored
    const key = `${Math.round(worldX)},${Math.round(worldZ)}`;
    return gameState.tileMap.get(key);
}

function activateTile(tile) {
    if (!tile || !tile.userData) return false;
    
    const now = Date.now();
    
    // Prevent rapid re-activation
    if (now - tile.userData.lastActivated < 200) return false;
    
    tile.userData.lastActivated = now;
    tile.userData.isActive = true;
    
    // Visual feedback - brighten tile
    const material = tile.material;
    material.emissive.setHex(tile.userData.originalColor);
    material.emissiveIntensity = CONSTANTS.GLOW_INTENSITY;
    
    // Create particles
    createTileParticles(tile.position, tile.userData.originalColor);
    
    // Reset tile appearance after delay
    setTimeout(() => {
        material.emissiveIntensity = 0.1;
        tile.userData.isActive = false;
    }, CONSTANTS.NOTE_DURATION * 1000);
    
    return true;
}

function spawnCollectibleNotes() {
    const noteCount = 12;
    const noteTypes = ['♪', '♫', '♬', '♩', '♭', '♯'];
    
    for (let i = 0; i < noteCount; i++) {
        spawnCollectibleNote(i);
    }
}

function spawnCollectibleNote(noteIndex) {
    // Random position within world bounds
    const x = (Math.random() - 0.5) * (CONSTANTS.WORLD_SIZE - 4);
    const z = (Math.random() - 0.5) * (CONSTANTS.WORLD_SIZE - 4);
    
    // Create note geometry
    const geometry = new THREE.SphereGeometry(0.3);
    const noteColor = CONSTANTS.TILE_COLORS[noteIndex % CONSTANTS.TILE_COLORS.length];
    
    const material = new THREE.MeshPhongMaterial({
        color: noteColor,
        emissive: new THREE.Color(noteColor).multiplyScalar(0.3),
        transparent: true,
        opacity: 0.9
    });
    
    const noteMesh = new THREE.Mesh(geometry, material);
    noteMesh.position.set(x, 0.8, z);
    
    // Add floating animation
    noteMesh.userData = {
        id: `note_${noteIndex}_${Date.now()}`,
        noteIndex: noteIndex,
        originalY: 0.8,
        floatOffset: Math.random() * Math.PI * 2,
        collected: false,
        noteSymbol: ['♪', '♫', '♬', '♩', '♭', '♯'][noteIndex % 6]
    };
    
    gameState.scene.add(noteMesh);
    gameState.collectibleNotes.push(noteMesh);
    
    // Add sparkle effect
    createNoteSparkles(noteMesh.position, noteColor);
}

function createNoteSparkles(position, color) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const sparklePos = position.clone().add(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 0.8,
                    Math.random() * 0.5,
                    (Math.random() - 0.5) * 0.8
                )
            );
            createSparkle(sparklePos);
        }, i * 200);
    }
}

function updateMap() {
    // Animate point lights
    gameState.lights.forEach((light, index) => {
        if (light.type === 'PointLight') {
            const time = Date.now() * 0.001;
            light.position.x += Math.sin(time + index) * 0.01;
            light.position.z += Math.cos(time + index) * 0.01;
        }
    });
    
    // Animate collectible notes
    updateCollectibleNotes();
}

function updateCollectibleNotes() {
    const time = Date.now() * 0.001;
    
    gameState.collectibleNotes.forEach((note, index) => {
        if (!note.userData.collected) {
            // Floating animation
            note.position.y = note.userData.originalY + Math.sin(time * 2 + note.userData.floatOffset) * 0.2;
            
            // Gentle rotation
            note.rotation.y += 0.02;
            
            // Pulsing glow
            const pulse = (Math.sin(time * 3 + note.userData.floatOffset) + 1) * 0.5;
            note.material.emissiveIntensity = 0.3 + pulse * 0.2;
        }
    });
}

function collectNote(noteId) {
    const noteIndex = gameState.collectibleNotes.findIndex(note => note.userData.id === noteId);
    
    if (noteIndex !== -1) {
        const note = gameState.collectibleNotes[noteIndex];
        
        // Add to inventory if there's space
        if (gameState.inventory.length < gameState.maxInventorySize) {
            const inventoryNote = {
                id: note.userData.id,
                noteIndex: note.userData.noteIndex,
                symbol: note.userData.noteSymbol,
                color: note.material.color.getHex(),
                isPlaying: true,
                audioNodes: null
            };
            
            gameState.inventory.push(inventoryNote);
            
            // Remove from world
            gameState.scene.remove(note);
            note.geometry.dispose();
            note.material.dispose();
            gameState.collectibleNotes.splice(noteIndex, 1);
            
            // Create collection effect
            createTileParticles(note.position, note.material.color.getHex());
            
            // Play the collected note sound
            playTileNote(inventoryNote.noteIndex);
            
            // Update UI 
            updateInventoryUI();
            
            // Only start sequence if it was already playing
            if (gameState.isSequencePlaying) {
                startNoteSequence();
            }
            
            return true;
        }
    }
    return false;
}

function dropNote(noteData, position) {
    // Create note mesh at position
    const geometry = new THREE.SphereGeometry(0.3);
    const material = new THREE.MeshPhongMaterial({
        color: noteData.color,
        emissive: new THREE.Color(noteData.color).multiplyScalar(0.3),
        transparent: true,
        opacity: 0.9
    });
    
    const noteMesh = new THREE.Mesh(geometry, material);
    noteMesh.position.copy(position);
    noteMesh.position.y = 0.8;
    
    noteMesh.userData = {
        id: `dropped_${Date.now()}`,
        noteIndex: noteData.noteIndex,
        originalY: 0.8,
        floatOffset: Math.random() * Math.PI * 2,
        collected: false,
        noteSymbol: noteData.symbol
    };
    
    gameState.scene.add(noteMesh);
    gameState.collectibleNotes.push(noteMesh);
    
    // Stop playing the note if it was playing
    if (noteData.isPlaying) {
        stopLoopingNote(noteData.id);
    }
}
