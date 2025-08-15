// Health gem system for healing pickups

function createHealthGem() {
    const group = new THREE.Group();
    
    // Main gem crystal - diamond shape
    const gemGeometry = new THREE.OctahedronGeometry(0.3);
    const gemMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff4444,
        emissive: 0x441111,
        transparent: true,
        opacity: 0.8,
        shininess: 100
    });
    const gem = new THREE.Mesh(gemGeometry, gemMaterial);
    group.add(gem);
    
    // Inner glow core
    const coreGeometry = new THREE.SphereGeometry(0.15);
    const coreMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffaaaa,
        transparent: true,
        opacity: 0.6
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);
    
    // Outer glow aura
    const auraGeometry = new THREE.SphereGeometry(0.5);
    const auraMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff4444,
        transparent: true,
        opacity: 0.1
    });
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    group.add(aura);
    
    // Position randomly around player - lower height
    const angle = Math.random() * Math.PI * 2;
    const distance = 5 + Math.random() * 15;
    group.position.set(
        gameState.player.position.x + Math.cos(angle) * distance,
        0.5 + Math.random() * 0.5,
        gameState.player.position.z + Math.sin(angle) * distance
    );
    
    // Gem properties
    group.userData = {
        bouncePhase: Math.random() * Math.PI * 2,
        rotationSpeed: 1 + Math.random() * 2,
        glowPhase: Math.random() * Math.PI * 2,
        baseY: group.position.y,
        healAmount: 25 + Math.random() * 15 // 25-40 health
    };
    
    // Add gem light - red
    const gemLight = new THREE.PointLight(0xff4444, 0.8, 4);
    group.add(gemLight);
    
    return group;
}

function spawnHealthGem() {
    // Only spawn if below max limit
    if (gameState.healthGems.length < gameState.maxHealthGems) {
        const gem = createHealthGem();
        gameState.scene.add(gem);
        gameState.healthGems.push(gem);
        
        // Play a gentle spawn sound
        playSound('gemSpawn');
    }
}

function updateHealthGems(deltaTime) {
    for (let i = gameState.healthGems.length - 1; i >= 0; i--) {
        const gem = gameState.healthGems[i];
        const userData = gem.userData;
        
        // Bouncing animation - lower bounce
        userData.bouncePhase += deltaTime * 3;
        gem.position.y = userData.baseY + Math.sin(userData.bouncePhase) * 0.2;
        
        // Rotation animation
        gem.rotation.y += deltaTime * userData.rotationSpeed;
        gem.rotation.x += deltaTime * userData.rotationSpeed * 0.5;
        
        // Glow pulsing
        userData.glowPhase += deltaTime * 4;
        const glowIntensity = 0.8 + Math.sin(userData.glowPhase) * 0.3;
        if (gem.children[3]) { // The light
            gem.children[3].intensity = glowIntensity;
        }
        
        // Check pickup collision with player
        const distance = gem.position.distanceTo(gameState.camera.position);
        if (distance < 1.2) {
            // Heal player
            const healAmount = userData.healAmount;
            gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + healAmount);
            
            // Show heal number
            showScoreNumber(gem.position.x, gem.position.y, gem.position.z, healAmount);
            
            // Create pickup effect
            createHealthGemPickupEffect(gem.position);
            
            // Play pickup sound
            playSound('gemPickup');
            
            // Remove gem
            gameState.scene.remove(gem);
            gameState.healthGems.splice(i, 1);
            
            // Update UI
            updateHealthBar();
        }
    }
}

function createHealthGemPickupEffect(position) {
    // Healing sparkles - red
    for (let i = 0; i < 8; i++) {
        const sparkGeometry = new THREE.SphereGeometry(0.04);
        const sparkMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color().setHSL(0 + Math.random() * 0.1, 1, 0.7),
            transparent: true,
            opacity: 0.9
        });
        
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        spark.position.copy(position);
        
        spark.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                Math.random() * 3 + 2,
                (Math.random() - 0.5) * 4
            ),
            life: 800,
            startTime: Date.now(),
            gravity: -5
        };
        
        gameState.scene.add(spark);
        gameState.particleSystems.push(spark);
    }
    
    // Healing ring burst - red
    const ringGeometry = new THREE.RingGeometry(0.1, 0.3, 12);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffaaaa,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.rotation.x = -Math.PI / 2;
    gameState.scene.add(ring);
    
    // Animate healing ring
    const startTime = Date.now();
    const animateRing = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 400) {
            gameState.scene.remove(ring);
            return;
        }
        
        const progress = elapsed / 400;
        ring.scale.setScalar(1 + progress * 2);
        ring.material.opacity = 0.8 * (1 - progress);
        requestAnimationFrame(animateRing);
    };
    animateRing();
}
