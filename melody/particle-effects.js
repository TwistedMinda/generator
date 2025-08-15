// Particle Effects System

function createTileParticles(position, color) {
    const particleCount = CONSTANTS.PARTICLE_COUNT;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(position, color);
    }
}

function createParticle(position, color) {
    // Limit total particles for performance
    if (gameState.particles.length >= CONSTANTS.MAX_PARTICLES) {
        removeOldestParticle();
    }
    
    // Create particle geometry
    const geometry = new THREE.SphereGeometry(0.02 + Math.random() * 0.03);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8
    });
    
    const particle = new THREE.Mesh(geometry, material);
    
    // Set initial position with slight randomness
    particle.position.copy(position);
    particle.position.x += (Math.random() - 0.5) * 0.5;
    particle.position.y += Math.random() * 0.2;
    particle.position.z += (Math.random() - 0.5) * 0.5;
    
    // Set velocity
    const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 2
    );
    
    // Store particle data
    particle.userData = {
        velocity: velocity,
        life: CONSTANTS.PARTICLE_LIFE,
        maxLife: CONSTANTS.PARTICLE_LIFE,
        gravity: -4,
        bounce: 0.3
    };
    
    gameState.scene.add(particle);
    gameState.particles.push(particle);
}

function updateParticles() {
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const particle = gameState.particles[i];
        const data = particle.userData;
        
        if (!data) {
            removeParticle(i);
            continue;
        }
        
        // Update life
        data.life -= gameState.deltaTime;
        
        if (data.life <= 0) {
            removeParticle(i);
            continue;
        }
        
        // Only update physics for particles with velocity (regular particles)
        if (data.velocity) {
            // Update position
            particle.position.addScaledVector(data.velocity, gameState.deltaTime);
            
            // Apply gravity
            data.velocity.y += data.gravity * gameState.deltaTime;
            
            // Ground collision
            if (particle.position.y <= 0.1) {
                particle.position.y = 0.1;
                data.velocity.y *= -data.bounce;
                
                // Reduce horizontal velocity on bounce
                data.velocity.x *= 0.8;
                data.velocity.z *= 0.8;
            }
            
            // Add slight rotation
            particle.rotation.x += gameState.deltaTime * 2;
            particle.rotation.y += gameState.deltaTime * 1.5;
        }
        
        // Update opacity based on life (for all particles)
        if (data.maxLife) {
            const lifeRatio = data.life / data.maxLife;
            particle.material.opacity = lifeRatio * 0.8;
            
            // Scale down as life decreases
            const scale = 0.5 + lifeRatio * 0.5;
            particle.scale.setScalar(scale);
        }
    }
}

function removeParticle(index) {
    const particle = gameState.particles[index];
    gameState.scene.remove(particle);
    gameState.particles.splice(index, 1);
    
    // Dispose of geometry and material
    particle.geometry.dispose();
    particle.material.dispose();
}

function removeOldestParticle() {
    if (gameState.particles.length > 0) {
        removeParticle(0);
    }
}

function createMagicalAura(position, radius = 1, color = 0x4ecdc4) {
    // Create ring of particles for magical effects
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const x = position.x + Math.cos(angle) * radius;
        const z = position.z + Math.sin(angle) * radius;
        
        const particlePos = new THREE.Vector3(x, position.y + 0.5, z);
        createFloatingParticle(particlePos, color);
    }
}

function createFloatingParticle(position, color) {
    const geometry = new THREE.SphereGeometry(0.05);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6
    });
    
    const particle = new THREE.Mesh(geometry, material);
    particle.position.copy(position);
    
    // Floating motion
    particle.userData = {
        life: 3.0,
        maxLife: 3.0,
        floatSpeed: Math.random() * 2 + 1,
        floatOffset: Math.random() * Math.PI * 2,
        originalY: position.y
    };
    
    gameState.scene.add(particle);
    gameState.particles.push(particle);
}

function createSparkle(position) {
    // Quick sparkle effect
    const geometry = new THREE.SphereGeometry(0.01);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1.0
    });
    
    const sparkle = new THREE.Mesh(geometry, material);
    sparkle.position.copy(position);
    sparkle.position.y += Math.random() * 0.5;
    
    sparkle.userData = {
        life: 0.5,
        maxLife: 0.5,
        scaleSpeed: 3
    };
    
    gameState.scene.add(sparkle);
    gameState.particles.push(sparkle);
}

function updateFloatingParticles() {
    gameState.particles.forEach((particle, index) => {
        const data = particle.userData;
        
        if (data.floatSpeed !== undefined) {
            // Floating animation
            const time = Date.now() * 0.001;
            particle.position.y = data.originalY + Math.sin(time * data.floatSpeed + data.floatOffset) * 0.3;
            
            // Gentle horizontal drift
            particle.position.x += Math.sin(time * 0.5 + data.floatOffset) * 0.01;
            particle.position.z += Math.cos(time * 0.7 + data.floatOffset) * 0.01;
        }
        
        if (data.scaleSpeed !== undefined) {
            // Sparkle scaling
            const scale = Math.sin(Date.now() * 0.01 * data.scaleSpeed) * 0.5 + 0.5;
            particle.scale.setScalar(scale);
        }
    });
}

function clearAllParticles() {
    while (gameState.particles.length > 0) {
        removeParticle(0);
    }
}
