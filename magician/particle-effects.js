// Particle effects - all magical effects for the game

function createFireballTrail(fireball) {
    // Much simpler trail - just a few particles, less frequent
    const createTrailParticle = () => {
        if (!gameState.spells.includes(fireball)) return;
        
        const particleGeometry = new THREE.SphereGeometry(0.05);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4500,
            transparent: true,
            opacity: 0.6
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(fireball.position);
        
        particle.userData = {
            life: 400,
            startTime: Date.now(),
            velocity: new THREE.Vector3(0, 0, 0) // Static trail
        };
        
        gameState.scene.add(particle);
        gameState.particleSystems.push(particle);
    };
    
    // Much less frequent particle creation
    const trailInterval = setInterval(() => {
        if (gameState.spells.includes(fireball)) {
            createTrailParticle();
        } else {
            clearInterval(trailInterval);
        }
    }, 150); // 3x less frequent
}

function createHitEffect(position) {
    // Small ring burst effect - completely different shape
    const ringGeometry = new THREE.RingGeometry(0.05, 0.1, 8);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffaa00,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.rotation.x = Math.random() * Math.PI;
    ring.rotation.y = Math.random() * Math.PI;
    gameState.scene.add(ring);
    
    // Animate tiny ring burst
    const startTime = Date.now();
    const animateHit = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 150) {
            gameState.scene.remove(ring);
            return;
        }
        
        const progress = elapsed / 150;
        ring.scale.setScalar(1 + progress * 0.5); // Much smaller scaling
        ring.material.opacity = 0.9 * (1 - progress);
        ring.rotation.z += 0.2;
        requestAnimationFrame(animateHit);
    };
    animateHit();
    
    // Just 2 tiny sparks
    for (let i = 0; i < 2; i++) {
        const sparkGeometry = new THREE.SphereGeometry(0.02);
        const sparkMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffcc44,
            transparent: true,
            opacity: 0.8
        });
        
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        spark.position.copy(position);
        
        spark.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                Math.random() * 1.5,
                (Math.random() - 0.5) * 3
            ),
            life: 200,
            startTime: Date.now(),
            gravity: -8
        };
        
        gameState.scene.add(spark);
        gameState.particleSystems.push(spark);
    }
}

function createExplosion(position) {
    // Core explosion with better scaling
    const coreGeometry = new THREE.SphereGeometry(0.4);
    const coreMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff6600,
        transparent: true,
        opacity: 0.9
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.copy(position);
    gameState.scene.add(core);
    
    // Outer fire ring
    const ringGeometry = new THREE.RingGeometry(0.2, 0.8, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff3300,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.rotation.x = -Math.PI / 2;
    gameState.scene.add(ring);
    
    // Animate explosion
    const startTime = Date.now();
    const animateExplosion = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 600) {
            gameState.scene.remove(core);
            gameState.scene.remove(ring);
            return;
        }
        
        const progress = elapsed / 600;
        
        // Core expansion
        core.scale.setScalar(1 + progress * 3);
        core.material.opacity = 0.9 * (1 - progress);
        
        // Ring expansion
        ring.scale.setScalar(1 + progress * 4);
        ring.material.opacity = 0.6 * (1 - progress);
        ring.rotation.z += 0.1;
        
        requestAnimationFrame(animateExplosion);
    };
    animateExplosion();
    
    // Enhanced fire particles
    for (let i = 0; i < 12; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.06 + Math.random() * 0.04);
        const hue = 0.05 + Math.random() * 0.1; // Orange to yellow
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color().setHSL(hue, 1, 0.6 + Math.random() * 0.3),
            transparent: true,
            opacity: 0.8
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(position);
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 12,
            Math.random() * 6 + 3,
            (Math.random() - 0.5) * 12
        );
        
        particle.userData = {
            velocity: velocity,
            life: 1000 + Math.random() * 500,
            startTime: Date.now(),
            gravity: -12
        };
        
        gameState.scene.add(particle);
        gameState.particleSystems.push(particle);
    }
    
    // Dramatic explosion light
    const explosionLight = new THREE.PointLight(0xff4400, 5, 12);
    explosionLight.position.copy(position);
    gameState.scene.add(explosionLight);
    
    setTimeout(() => {
        gameState.scene.remove(explosionLight);
    }, 400);
}

function createMagicAura(position, color = 0x8b5cf6, size = 1) {
    const auraGeometry = new THREE.RingGeometry(size * 0.5, size, 16);
    const auraMaterial = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    aura.position.copy(position);
    aura.rotation.x = -Math.PI / 2;
    gameState.scene.add(aura);
    
    // Animate aura
    const startTime = Date.now();
    const animateAura = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 2000) {
            gameState.scene.remove(aura);
            return;
        }
        
        const progress = elapsed / 2000;
        aura.scale.setScalar(1 + progress);
        aura.material.opacity = 0.3 * (1 - progress);
        aura.rotation.z += 0.02;
        requestAnimationFrame(animateAura);
    };
    animateAura();
}

function updateParticleSystem(deltaTime) {
    for (let i = gameState.particleSystems.length - 1; i >= 0; i--) {
        const particle = gameState.particleSystems[i];
        const userData = particle.userData;
        
        if (!userData) continue;
        
        const elapsed = Date.now() - userData.startTime;
        
        // Remove if life expired
        if (elapsed > userData.life) {
            gameState.scene.remove(particle);
            gameState.particleSystems.splice(i, 1);
            continue;
        }
        
        // Update position
        if (userData.velocity) {
            // Ensure velocity is a Vector3
            if (userData.velocity.clone) {
                particle.position.add(userData.velocity.clone().multiplyScalar(deltaTime));
            } else {
                // Convert plain object to Vector3 movement
                particle.position.x += userData.velocity.x * deltaTime;
                particle.position.y += userData.velocity.y * deltaTime;
                particle.position.z += userData.velocity.z * deltaTime;
            }
            
            // Apply gravity if exists
            if (userData.gravity) {
                userData.velocity.y += userData.gravity * deltaTime;
            }
        }
        
        // Update opacity
        const lifeProgress = elapsed / userData.life;
        if (particle.material && particle.material.opacity !== undefined) {
            particle.material.opacity = Math.max(0, 1 - lifeProgress);
        }
        
        // Special effects for floating particles
        if (userData.originalY !== undefined) {
            particle.position.y = userData.originalY + Math.sin(Date.now() * 0.001 + i) * 2;
        }
    }
}

function createSpellCastEffect(position) {
    // Casting rings
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const ringGeometry = new THREE.RingGeometry(0.2, 0.4, 16);
            const ringMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff4500,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.copy(position);
            ring.rotation.x = -Math.PI / 2;
            gameState.scene.add(ring);
            
            // Animate ring
            const startTime = Date.now();
            const animateRing = () => {
                const elapsed = Date.now() - startTime;
                if (elapsed > 800) {
                    gameState.scene.remove(ring);
                    return;
                }
                
                const progress = elapsed / 800;
                ring.scale.setScalar(1 + progress * 3);
                ring.material.opacity = 0.6 * (1 - progress);
                ring.rotation.z += 0.1;
                requestAnimationFrame(animateRing);
            };
            animateRing();
        }, i * 200);
    }
}

function createImpactRipple(position) {
    const rippleGeometry = new THREE.RingGeometry(0.1, 0.3, 16);
    const rippleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    
    const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
    ripple.position.copy(position);
    ripple.position.y = 0.01; // Slightly above ground
    ripple.rotation.x = -Math.PI / 2;
    gameState.scene.add(ripple);
    
    // Animate ripple
    const startTime = Date.now();
    const animateRipple = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 600) {
            gameState.scene.remove(ripple);
            return;
        }
        
        const progress = elapsed / 600;
        ripple.scale.setScalar(1 + progress * 5);
        ripple.material.opacity = 0.8 * (1 - progress);
        requestAnimationFrame(animateRipple);
    };
    animateRipple();
}
