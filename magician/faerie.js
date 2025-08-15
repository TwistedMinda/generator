// Faerie enemies - magical creatures attacking the player

function spawnFaerie() {
    if (gameState.faeries.length >= gameState.maxFaeries) return;
    
    const faerie = createFaerie();
    gameState.faeries.push(faerie);
    gameState.scene.add(faerie);
}

function createFaerie() {
    const group = new THREE.Group();
    
    // Determine if this is an elite faerie
    const isElite = Math.random() > 0.7; // 30% chance for elite faerie
    
    // Main body - glowing orb (much bigger and different colors for elite)
    const bodySize = isElite ? 0.25 : 0.15; // Elite much bigger
    const bodyColor = isElite ? 0xff3333 : 0x66ff66; // Bright red for elite, green for normal
    const emissiveColor = isElite ? 0x661111 : 0x224422;
    
    const bodyGeometry = new THREE.SphereGeometry(bodySize);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: bodyColor,
        emissive: emissiveColor,
        transparent: true,
        opacity: 0.8
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);
    
    // Wings - translucent planes (different colors and sizes)
    const wingSize = isElite ? 0.4 : 0.3; // Elite wings bigger
    const wingColor = isElite ? 0xff8888 : 0x88ffaa; // Red wings for elite, green for normal
    
    const wingGeometry = new THREE.PlaneGeometry(wingSize, wingSize * 0.7);
    const wingMaterial = new THREE.MeshBasicMaterial({ 
        color: wingColor,
        transparent: true,
        opacity: isElite ? 0.6 : 0.4, // Elite wings more opaque
        side: THREE.DoubleSide
    });
    
    const wingOffset = isElite ? 0.25 : 0.2; // Elite wings positioned wider
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-wingOffset, 0, 0);
    leftWing.rotation.y = Math.PI / 6;
    group.add(leftWing);
    
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(wingOffset, 0, 0);
    rightWing.rotation.y = -Math.PI / 6;
    group.add(rightWing);
    
    // Glow effect - much more dramatic for elite
    const glowSize = isElite ? 0.45 : 0.25; // Elite glow much bigger
    const glowColor = isElite ? 0xff3333 : 0x66ff66;
    
    const glowGeometry = new THREE.SphereGeometry(glowSize);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: glowColor,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);
    
    // Position randomly around player - closer spawn radius
    const angle = Math.random() * Math.PI * 2;
    const distance = 8 + Math.random() * 12; // Much closer - 8 to 20 units away
    group.position.set(
        gameState.player.position.x + Math.cos(angle) * distance,
        2 + Math.random() * 6,
        gameState.player.position.z + Math.sin(angle) * distance
    );
    
    // Faerie properties - random health for variety
    const health = isElite ? 50 + Math.random() * 25 : 25; // Elite: 50-75 HP, Normal: 25 HP
    
    group.userData = {
        health: health,
        maxHealth: health,
        speed: 1.5 + Math.random() * 0.75, // Much slower - divided by 2
        attackDamage: isElite ? 20 : 15,
        attackCooldown: 0,
        attackRange: 2,
        detectionRange: 25,
        wingPhase: Math.random() * Math.PI * 2,
        bodyPhase: Math.random() * Math.PI * 2,
        targetHeight: group.position.y,
        isAttacking: false,
        isElite: isElite
    };
    
    // Add faerie light - elite much brighter
    const lightColor = isElite ? 0xff3333 : 0x66ff66;
    const lightIntensity = isElite ? 1.2 : 0.5; // Elite much brighter
    const lightRange = isElite ? 5 : 3; // Elite light reaches further
    const faerieLight = new THREE.PointLight(lightColor, lightIntensity, lightRange);
    group.add(faerieLight);
    
    // Elite faeries get an additional pulsing effect
    if (isElite) {
        const pulseGeometry = new THREE.SphereGeometry(0.1);
        const pulseMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffaaaa,
            transparent: true,
            opacity: 0.8
        });
        const pulseCore = new THREE.Mesh(pulseGeometry, pulseMaterial);
        group.add(pulseCore);
    }
    
    return group;
}

function updateFaeries(deltaTime) {
    for (let i = gameState.faeries.length - 1; i >= 0; i--) {
        const faerie = gameState.faeries[i];
        updateFaerie(faerie, deltaTime);
        
        // Remove if health <= 0
        if (faerie.userData.health <= 0) {
            // Elite faeries give more score
            const scoreGain = faerie.userData.isElite ? 200 : 100;
            showScoreNumber(faerie.position.x, faerie.position.y, faerie.position.z, scoreGain);
            
            // Create final explosion at death
            createExplosion(faerie.position);
            
            gameState.scene.remove(faerie);
            gameState.faeries.splice(i, 1);
            
            // Add score
            gameState.score += scoreGain;
            updateScore();
            
            // Create death effect
            createFaerieDeathEffect(faerie.position);
            playSound('faerieDeath');
        }
    }
}

function updateFaerie(faerie, deltaTime) {
    const userData = faerie.userData;
    const playerPos = new THREE.Vector3(
        gameState.player.position.x,
        gameState.player.position.y,
        gameState.player.position.z
    );
    
    const distance = faerie.position.distanceTo(playerPos);
    
    // Wing animation
    userData.wingPhase += deltaTime * 10;
    const wingOffset = Math.sin(userData.wingPhase) * 0.3;
    faerie.children[1].rotation.z = wingOffset; // Left wing
    faerie.children[2].rotation.z = -wingOffset; // Right wing
    
    // Body glow animation
    userData.bodyPhase += deltaTime * 3;
    const glowIntensity = 0.5 + Math.sin(userData.bodyPhase) * 0.3;
    faerie.children[0].material.emissive.setScalar(glowIntensity * 0.3);
    faerie.children[3].material.opacity = 0.1 + glowIntensity * 0.2;
    
    // Floating motion
    userData.targetHeight += Math.sin(Date.now() * 0.001 + userData.bodyPhase) * 0.02;
    faerie.position.y += (userData.targetHeight - faerie.position.y) * deltaTime * 2;
    
    if (distance < userData.detectionRange) {
        // Move towards player
        const direction = playerPos.clone().sub(faerie.position).normalize();
        
        if (distance > userData.attackRange) {
            // Approach player
            faerie.position.add(direction.multiplyScalar(userData.speed * deltaTime));
            userData.isAttacking = false;
        } else {
            // Attack player
            userData.attackCooldown -= deltaTime;
            if (userData.attackCooldown <= 0) {
                attackPlayer(faerie);
                userData.attackCooldown = 1.5; // Attack every 1.5 seconds
                userData.isAttacking = true;
            }
        }
        
        // Face player
        faerie.lookAt(playerPos);
    } else {
        // Wander randomly
        userData.isAttacking = false;
        if (Math.random() < deltaTime) {
            const wanderDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            ).normalize();
            faerie.position.add(wanderDirection.multiplyScalar(userData.speed * deltaTime * 0.5));
        }
    }
    
    // Visual feedback for attacking and elite pulsing
    if (userData.isAttacking) {
        faerie.children[0].material.emissive.setHex(0xff2222);
        if (userData.isElite) {
            faerie.children[3].material.color.setHex(0xff3333);
        } else {
            faerie.children[3].material.color.setHex(0xff6666);
        }
    } else {
        if (userData.isElite) {
            faerie.children[0].material.emissive.setHex(0x661111);
            faerie.children[3].material.color.setHex(0xff3333);
            
            // Elite pulsing effect
            if (faerie.children[6]) { // Pulse core exists
                const pulseIntensity = 0.5 + Math.sin(userData.bodyPhase * 2) * 0.3;
                faerie.children[6].material.opacity = pulseIntensity;
                faerie.children[6].scale.setScalar(1 + pulseIntensity * 0.5);
            }
        } else {
            faerie.children[0].material.emissive.setHex(0x224422);
            faerie.children[3].material.color.setHex(0x66ff66);
        }
    }
}

function attackPlayer(faerie) {
    takeDamage(faerie.userData.attackDamage);
    
    // Create attack effect
    createAttackEffect(faerie.position, gameState.camera.position);
    playSound('faerieAttack');
    
    // Visual feedback
    createScreenFlash('#ff6666', 200);
}

function damageFaerie(faerie, damage) {
    faerie.userData.health -= damage;
    
    // Play hit sound
    playSound('hit');
    
    // Only show damage number if faerie survives the hit
    if (faerie.userData.health > 0) {
        showDamageNumber(faerie.position.x, faerie.position.y, faerie.position.z, damage);
    }
    
    // Flash effect
    const originalColor = faerie.children[0].material.color.clone();
    faerie.children[0].material.color.setHex(0xff6666);
    
    setTimeout(() => {
        if (faerie.children[0] && faerie.children[0].material) {
            faerie.children[0].material.color.copy(originalColor);
        }
    }, 100);
}

function createFaerieDeathEffect(position) {
    // Create sparkle particles - reduced count
    for (let i = 0; i < 5; i++) {
        const sparkleGeometry = new THREE.SphereGeometry(0.02);
        const sparkleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x66ff66,
            transparent: true,
            opacity: 0.8
        });
        
        const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        sparkle.position.copy(position);
        sparkle.position.add(new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ));
        
        sparkle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 5 + 2,
                (Math.random() - 0.5) * 5
            ),
            life: 1000
        };
        
        gameState.scene.add(sparkle);
        gameState.particleSystems.push(sparkle);
    }
}

function createAttackEffect(from, to) {
    // Create magical bolt
    const direction = to.clone().sub(from).normalize();
    const boltGeometry = new THREE.CylinderGeometry(0.02, 0.02, from.distanceTo(to));
    const boltMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff6666,
        transparent: true,
        opacity: 0.7
    });
    
    const bolt = new THREE.Mesh(boltGeometry, boltMaterial);
    bolt.position.copy(from.clone().lerp(to, 0.5));
    bolt.lookAt(to);
    bolt.rotateX(Math.PI / 2);
    
    gameState.scene.add(bolt);
    
    // Remove after short time
    setTimeout(() => {
        gameState.scene.remove(bolt);
    }, 200);
}
