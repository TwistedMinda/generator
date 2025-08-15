// Player logic - magician with staff and spells

function initPlayer() {
    createStaff();
    gameState.player.health = gameState.player.maxHealth;
    gameState.player.mana = gameState.player.maxMana;
}

function createStaff() {
    // Staff handle
    const handleGeometry = new THREE.CylinderGeometry(0.02, 0.03, 1.5);
    const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3429 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    
    // Crystal on top
    const crystalGeometry = new THREE.OctahedronGeometry(0.08);
    const crystalMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff4500,
        emissive: 0x442200,
        transparent: true,
        opacity: 0.8
    });
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
    crystal.position.y = 0.8;
    
    // Combine staff parts
    gameState.player.staff = new THREE.Group();
    gameState.player.staff.add(handle);
    gameState.player.staff.add(crystal);
    
    // Add glow effect to crystal
    const glowGeometry = new THREE.SphereGeometry(0.15);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff4500,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 0.8;
    gameState.player.staff.add(glow);
    
    gameState.scene.add(gameState.player.staff);
    
    // Animate crystal glow
    setInterval(() => {
        if (crystal.material) {
            const intensity = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
            crystal.material.emissive.setHex(0x442200);
            crystal.material.emissive.multiplyScalar(intensity);
            glow.material.opacity = 0.2 + intensity * 0.2;
        }
    }, 50);
}

function castFireball() {
    const now = Date.now();
    const timeSinceLastCast = now - gameState.lastFireballTime;
    
    // Check cooldown
    if (timeSinceLastCast < gameState.fireballCooldown) {
        createScreenFlash('#ff8800', 100);
        playSound('error');
        return;
    }
    
    // Check mana
    if (gameState.player.mana < gameState.fireballCost) {
        createScreenFlash('#ff0000', 100);
        playSound('error');
        return;
    }
    
    // Cast successful - update cooldown and mana
    gameState.lastFireballTime = now;
    gameState.player.mana -= gameState.fireballCost;
    updateManaBar();
    
    // Create fireball
    const fireball = createFireball();
    gameState.spells.push(fireball);
    
    playSound('fireball');
    createScreenFlash('#ff4500', 100);
    
    // Add enhanced dramatic light
    const light = new THREE.PointLight(0xff4400, 4, 10);
    light.castShadow = false; // No shadows for performance but keep the light
    fireball.add(light);
    gameState.lights.spellLights.push(light);
}

function castLightning() {
    const now = Date.now();
    const timeSinceLastCast = now - gameState.lastLightningTime;
    
    // Check cooldown
    if (timeSinceLastCast < gameState.lightningCooldown) {
        createScreenFlash('#4488ff', 100);
        playSound('error');
        return;
    }
    
    // Check mana
    if (gameState.player.mana < gameState.lightningCost) {
        createScreenFlash('#ff0000', 100);
        playSound('error');
        return;
    }
    
    // Cast successful - update cooldown and mana
    gameState.lastLightningTime = now;
    gameState.player.mana -= gameState.lightningCost;
    updateManaBar();
    
    createLightningBolt();
    playSound('lightning');
    createScreenFlash('#ffffff', 150);
}

function createFireball() {
    const group = new THREE.Group();
    
    // Core fireball
    const coreGeometry = new THREE.SphereGeometry(0.1);
    const coreMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff4500,
        transparent: true,
        opacity: 0.8
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);
    
    // Outer glow
    const glowGeometry = new THREE.SphereGeometry(0.2);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff6600,
        transparent: true,
        opacity: 0.4
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);
    
    // Position at staff tip
    const staffTip = new THREE.Vector3(0.3, -0.2 + 0.8, -0.5);
    staffTip.applyMatrix4(gameState.camera.matrixWorld);
    group.position.copy(staffTip);
    
    // Set velocity
    const direction = getCameraDirection();
    group.userData = {
        velocity: direction.multiplyScalar(20),
        life: 1500, // Shorter life - 1.5 seconds instead of 3
        damage: 25
    };
    
    gameState.scene.add(group);
    
    // Particle trail
    createFireballTrail(group);
    
    return group;
}

function createLightningBolt() {
    // Find all faeries within range for area effect
    const maxRange = 15;
    const targets = [];
    
    gameState.faeries.forEach(faerie => {
        const distance = faerie.position.distanceTo(gameState.camera.position);
        if (distance < maxRange) {
            targets.push(faerie);
        }
    });
    
    if (targets.length === 0) {
        // Show "no target" feedback
        createScreenFlash('#4444ff', 100);
        playSound('error');
        return;
    }
    
    // Sort by distance to prioritize closest
    targets.sort((a, b) => {
        return a.position.distanceTo(gameState.camera.position) - 
               b.position.distanceTo(gameState.camera.position);
    });
    
    // Hit up to 3 closest faeries
    const maxTargets = Math.min(3, targets.length);
    
    for (let i = 0; i < maxTargets; i++) {
        const target = targets[i];
    
        // Create jagged lightning path to each target
        const points = [];
        const start = gameState.camera.position.clone();
        const end = target.position.clone();
        
        const segments = 6;
        for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            const point = start.clone().lerp(end, t);
            
            // Add electrical randomness to middle segments
            if (j > 0 && j < segments) {
                const jitter = 1.5;
                point.x += (Math.random() - 0.5) * jitter;
                point.y += (Math.random() - 0.5) * jitter;
                point.z += (Math.random() - 0.5) * jitter;
            }
            
            points.push(point);
        }
        
        // Create lightning bolt visual
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0xaaccff,
            linewidth: 4,
            transparent: true,
            opacity: 0.9 - (i * 0.2) // Subsequent bolts slightly dimmer
        });
        
        const lightning = new THREE.Line(geometry, material);
        gameState.scene.add(lightning);
        
        // Damage target
        damageFaerie(target, 50);
        
        // Lightning effects
        createLightningEffects(target.position);
        
        // Clean up lightning bolt
        setTimeout(() => {
            gameState.scene.remove(lightning);
        }, 150 + i * 50); // Stagger cleanup
    }
}

function createLightningEffects(position) {
    // Intense white-blue flash
    const flashLight = new THREE.PointLight(0xccddff, 12, 20);
    flashLight.position.copy(position);
    gameState.scene.add(flashLight);
    
    // Electric sphere impact
    const impactGeometry = new THREE.SphereGeometry(0.3);
    const impactMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
    });
    const impact = new THREE.Mesh(impactGeometry, impactMaterial);
    impact.position.copy(position);
    gameState.scene.add(impact);
    
    // Electric ring
    const ringGeometry = new THREE.RingGeometry(0.1, 0.5, 12);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x88ccff,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.rotation.x = -Math.PI / 2;
    gameState.scene.add(ring);
    
    // Animate impact
    const startTime = Date.now();
    const animateImpact = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 400) {
            gameState.scene.remove(impact);
            gameState.scene.remove(ring);
            return;
        }
        
        const progress = elapsed / 400;
        impact.scale.setScalar(1 + progress * 2);
        impact.material.opacity = 0.9 * (1 - progress);
        
        ring.scale.setScalar(1 + progress * 3);
        ring.material.opacity = 0.7 * (1 - progress);
        
        requestAnimationFrame(animateImpact);
    };
    animateImpact();
    
    // Enhanced electric sparks
    for (let i = 0; i < 8; i++) {
        const sparkGeometry = new THREE.SphereGeometry(0.03 + Math.random() * 0.02);
        const sparkMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color().setHSL(0.6 + Math.random() * 0.1, 0.8, 0.8 + Math.random() * 0.2),
            transparent: true,
            opacity: 0.9
        });
        
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        spark.position.copy(position);
        spark.position.add(new THREE.Vector3(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3
        ));
        
        spark.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 4
            ),
            life: 500,
            startTime: Date.now()
        };
        
        gameState.scene.add(spark);
        gameState.particleSystems.push(spark);
    }
    
    // Remove flash light
    setTimeout(() => {
        gameState.scene.remove(flashLight);
    }, 120);
}

function updatePlayer(deltaTime) {
    // Regenerate mana slowly
    if (gameState.player.mana < gameState.player.maxMana) {
        gameState.player.mana = Math.min(
            gameState.player.maxMana,
            gameState.player.mana + 15 * deltaTime
        );
        updateManaBar();
    }
    
    // Update spells
    updateSpells(deltaTime);
}

function updateSpells(deltaTime) {
    for (let i = gameState.spells.length - 1; i >= 0; i--) {
        const spell = gameState.spells[i];
        
        // Move spell
        spell.position.add(
            spell.userData.velocity.clone().multiplyScalar(deltaTime)
        );
        
        // Decrease life
        spell.userData.life -= deltaTime * 1000;
        
        // Check collision with faeries
        gameState.faeries.forEach(faerie => {
            if (spell.position.distanceTo(faerie.position) < 0.5) {
                damageFaerie(faerie, spell.userData.damage);
                
                // Only show hit effect if faerie survives (death explosion handled in faerie.js)
                if (faerie.userData.health > 0) {
                    createHitEffect(spell.position);
                }
                
                // Remove spell
                gameState.scene.remove(spell);
                gameState.spells.splice(i, 1);
                return; // Exit early
            }
        });
        
        // Remove if life expired or hit ground/obstacle
        if (spell.userData.life <= 0 || spell.position.y < 0) {
            // Create small explosion when spell expires
            createExplosion(spell.position);
            
            // Remove light
            const lightIndex = gameState.lights.spellLights.indexOf(spell.children[2]);
            if (lightIndex > -1) {
                gameState.lights.spellLights.splice(lightIndex, 1);
            }
            
            // Remove spell
            gameState.scene.remove(spell);
            gameState.spells.splice(i, 1);
        }
    }
}

function takeDamage(amount) {
    gameState.player.health = Math.max(0, gameState.player.health - amount);
    updateHealthBar();
    
    if (gameState.player.health <= 0) {
        // Game over logic would go here
        console.log('Game Over!');
    }
    
    createScreenFlash('#ff0000', 300);
    playSound('hit');
}
