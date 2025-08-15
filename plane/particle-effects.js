// Particle system for all visual effects
function initParticleSystem() {
    gameState.particles = [];
}

function createParticle(options) {
    const particle = {
        x: options.x || 0,
        y: options.y || 0,
        z: options.z || 0,
        velocityX: options.velocityX || 0,
        velocityY: options.velocityY || 0,
        velocityZ: options.velocityZ || 0,
        life: options.life || 1.0,
        maxLife: options.maxLife || 1.0,
        size: options.size || 5,
        color: options.color || 'white',
        gravity: options.gravity !== undefined ? options.gravity : true,
        fadeOut: options.fadeOut !== undefined ? options.fadeOut : true,
        rotation: options.rotation || 0,
        rotationSpeed: options.rotationSpeed || 0
    };
    
    gameState.particles.push(particle);
    
    // Limit particle count for performance
    if (gameState.particles.length > gameState.settings.particleCount) {
        gameState.particles.shift();
    }
}

function updateParticles() {
    const deltaTime = gameState.deltaTime;
    
    gameState.particles.forEach((particle, index) => {
        // Update life
        particle.life -= deltaTime;
        
        // Remove dead particles
        if (particle.life <= 0) {
            gameState.particles.splice(index, 1);
            return;
        }
        
        // Apply gravity
        if (particle.gravity) {
            particle.velocityY += gameState.world.gravity * deltaTime * 0.5;
        }
        
        // Apply wind
        particle.velocityX += gameState.world.windX * deltaTime * 0.1;
        particle.velocityZ += gameState.world.windZ * deltaTime * 0.1;
        
        // Update position
        particle.x += particle.velocityX * deltaTime;
        particle.y += particle.velocityY * deltaTime;
        particle.z += particle.velocityZ * deltaTime;
        
        // Update rotation
        particle.rotation += particle.rotationSpeed * deltaTime;
        
        // Apply drag
        const drag = 0.98;
        particle.velocityX *= drag;
        particle.velocityY *= drag;
        particle.velocityZ *= drag;
        
        // Ground collision for some particles
        if (particle.y < gameState.world.ground && particle.gravity) {
            particle.y = gameState.world.ground;
            particle.velocityY = -particle.velocityY * 0.3;
            particle.velocityX *= 0.8;
            particle.velocityZ *= 0.8;
        }
    });
}

function drawParticles() {
    const ctx = gameState.ctx;
    const camera = gameState.camera;
    
    // Sort particles by distance for proper alpha blending
    const sortedParticles = gameState.particles.slice().sort((a, b) => {
        const distA = (a.x - camera.x) ** 2 + (a.z - camera.z) ** 2;
        const distB = (b.x - camera.x) ** 2 + (b.z - camera.z) ** 2;
        return distB - distA;
    });
    
    sortedParticles.forEach(particle => {
        const dx = particle.x - camera.x;
        const dy = particle.y - camera.y;
        const dz = particle.z - camera.z;
        
        if (dz < 1 || dz > 3000) return;
        
        const scale = gameState.canvas.height / dz;
        const screenX = gameState.canvas.width / 2 + dx * scale;
        const screenY = gameState.canvas.height / 2 - dy * scale;
        const screenSize = particle.size * scale;
        
        if (screenX < -screenSize || screenX > gameState.canvas.width + screenSize) return;
        if (screenY < -screenSize || screenY > gameState.canvas.height + screenSize) return;
        
        ctx.save();
        
        // Calculate alpha based on life and distance
        let alpha = 1;
        if (particle.fadeOut) {
            alpha = particle.life / particle.maxLife;
        }
        alpha *= Math.min(1, 500 / dz); // Distance fade
        
        if (alpha <= 0) {
            ctx.restore();
            return;
        }
        
        // Apply rotation if needed
        if (particle.rotation !== 0) {
            ctx.translate(screenX, screenY);
            ctx.rotate(particle.rotation);
            ctx.translate(-screenX, -screenY);
        }
        
        // Draw particle based on color type
        switch (particle.color) {
            case 'fire':
                drawFireParticle(ctx, screenX, screenY, screenSize, alpha);
                break;
            case 'smoke':
                drawSmokeParticle(ctx, screenX, screenY, screenSize, alpha);
                break;
            case 'spark':
                drawSparkParticle(ctx, screenX, screenY, screenSize, alpha);
                break;
            case 'explosion':
                drawExplosionParticle(ctx, screenX, screenY, screenSize, alpha);
                break;
            case 'ash':
                drawAshParticle(ctx, screenX, screenY, screenSize, alpha);
                break;
            default:
                drawDefaultParticle(ctx, screenX, screenY, screenSize, alpha);
                break;
        }
        
        ctx.restore();
    });
}

function drawFireParticle(ctx, x, y, size, alpha) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, `rgba(255, 255, 100, ${alpha})`);
    gradient.addColorStop(0.3, `rgba(255, 150, 50, ${alpha * 0.8})`);
    gradient.addColorStop(0.7, `rgba(255, 50, 0, ${alpha * 0.6})`);
    gradient.addColorStop(1, `rgba(100, 0, 0, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

function drawSmokeParticle(ctx, x, y, size, alpha) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, `rgba(80, 80, 80, ${alpha * 0.6})`);
    gradient.addColorStop(0.5, `rgba(60, 60, 60, ${alpha * 0.4})`);
    gradient.addColorStop(1, `rgba(40, 40, 40, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

function drawSparkParticle(ctx, x, y, size, alpha) {
    ctx.fillStyle = `rgba(255, 255, 150, ${alpha})`;
    ctx.shadowColor = `rgba(255, 255, 150, ${alpha * 0.5})`;
    ctx.shadowBlur = size * 2;
    
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function drawExplosionParticle(ctx, x, y, size, alpha) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    gradient.addColorStop(0.2, `rgba(255, 200, 100, ${alpha * 0.8})`);
    gradient.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.6})`);
    gradient.addColorStop(1, `rgba(150, 0, 0, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

function drawAshParticle(ctx, x, y, size, alpha) {
    ctx.fillStyle = `rgba(120, 100, 80, ${alpha * 0.7})`;
    ctx.fillRect(x - size/2, y - size/2, size, size);
}

function drawDefaultParticle(ctx, x, y, size, alpha) {
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

function createExplosion(x, y, z, size = 1) {
    const particleCount = Math.floor(30 * size);
    
    // Fire and explosion particles
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const speed = (Math.random() * 200 + 100) * size;
        const upwardBias = Math.random() * 100 * size;
        
        createParticle({
            x: x + (Math.random() - 0.5) * 20 * size,
            y: y + (Math.random() - 0.5) * 20 * size,
            z: z + (Math.random() - 0.5) * 20 * size,
            velocityX: Math.cos(angle) * speed + (Math.random() - 0.5) * 50,
            velocityY: Math.sin(angle) * speed + upwardBias,
            velocityZ: (Math.random() - 0.5) * speed,
            life: Math.random() * 2 + 1,
            maxLife: Math.random() * 2 + 1,
            size: Math.random() * 20 * size + 10,
            color: Math.random() < 0.7 ? 'fire' : 'explosion',
            gravity: true
        });
    }
    
    // Smoke particles
    for (let i = 0; i < particleCount / 2; i++) {
        createParticle({
            x: x + (Math.random() - 0.5) * 40 * size,
            y: y + (Math.random() - 0.5) * 40 * size,
            z: z + (Math.random() - 0.5) * 40 * size,
            velocityX: (Math.random() - 0.5) * 100,
            velocityY: Math.random() * 150 + 50,
            velocityZ: (Math.random() - 0.5) * 100,
            life: Math.random() * 5 + 3,
            maxLife: Math.random() * 5 + 3,
            size: Math.random() * 30 * size + 20,
            color: 'smoke',
            gravity: false
        });
    }
    
    // Sparks
    for (let i = 0; i < particleCount / 3; i++) {
        createParticle({
            x: x,
            y: y,
            z: z,
            velocityX: (Math.random() - 0.5) * 500,
            velocityY: (Math.random() - 0.5) * 500,
            velocityZ: (Math.random() - 0.5) * 500,
            life: Math.random() * 1 + 0.5,
            maxLife: Math.random() * 1 + 0.5,
            size: Math.random() * 5 + 2,
            color: 'spark',
            gravity: true
        });
    }
}

function createMuzzleFlash(x, y, z, direction) {
    for (let i = 0; i < 5; i++) {
        createParticle({
            x: x + direction.x * 30,
            y: y + direction.y * 30,
            z: z + direction.z * 30,
            velocityX: direction.x * 200 + (Math.random() - 0.5) * 100,
            velocityY: direction.y * 200 + (Math.random() - 0.5) * 100,
            velocityZ: direction.z * 200 + (Math.random() - 0.5) * 100,
            life: 0.1,
            maxLife: 0.1,
            size: Math.random() * 15 + 10,
            color: 'spark',
            gravity: false
        });
    }
}

function createTrailEffect(x, y, z, velocity) {
    if (Math.random() < 0.3) {
        createParticle({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            z: z + (Math.random() - 0.5) * 10,
            velocityX: -velocity.x * 0.1 + (Math.random() - 0.5) * 20,
            velocityY: -velocity.y * 0.1 + (Math.random() - 0.5) * 20,
            velocityZ: -velocity.z * 0.1 + (Math.random() - 0.5) * 20,
            life: 0.5,
            maxLife: 0.5,
            size: Math.random() * 5 + 3,
            color: 'smoke',
            gravity: false
        });
    }
}
