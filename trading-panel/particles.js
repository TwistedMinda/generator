// Simple particle system for candle effects

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    // Create firework effect for new candles
    createCandleFirework(position) {
        const fireworkCount = 15;
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        
        for (let i = 0; i < fireworkCount; i++) {
            const particle = this.createFireworkParticle(position, colors[i % colors.length]);
            this.particles.push(particle);
            // Add to scene immediately
            if (typeof scene !== 'undefined') {
                scene.add(particle);
            }
        }
    }
    
    // Create wick tap effect when price hits wick level
    createWickTap(position, direction = 'up') {
        const tapCount = 8;
        const colors = [0xffff00, 0x00ffff, 0xff00ff]; // Bright colors for wick taps
        
        for (let i = 0; i < tapCount; i++) {
            const particle = this.createTapParticle(position, colors[i % colors.length], direction);
            this.particles.push(particle);
            // Add to scene immediately
            if (typeof scene !== 'undefined') {
                scene.add(particle);
            }
        }
    }
    
    // Create subtle close change effect
    createCloseChangeEffect(position, isBullish) {
        const effectCount = 3;
        const color = isBullish ? 0x00ff88 : 0xff4444; // Green for bullish, red for bearish
        const direction = isBullish ? 'up' : 'down'; // Up for bullish, down for bearish
        
        for (let i = 0; i < effectCount; i++) {
            const particle = this.createCloseChangeParticle(position, color, direction);
            this.particles.push(particle);
            // Add to scene immediately
            if (typeof scene !== 'undefined') {
                scene.add(particle);
            }
        }
    }
    
    // Create a firework particle
    createFireworkParticle(position, color) {
        const geometry = new THREE.SphereGeometry(0.03, 6, 6);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1.0
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(position.x, position.y, position.z);
        
        // Explosive velocity in all directions
        const angle = Math.random() * Math.PI * 2;
        const elevation = Math.random() * Math.PI;
        const speed = 0.04 + Math.random() * 0.04;
        
        const velocity = new THREE.Vector3(
            Math.sin(elevation) * Math.cos(angle) * speed,
            Math.sin(elevation) * Math.sin(angle) * speed,
            Math.cos(elevation) * speed
        );
        
        particle.userData = {
            velocity: velocity,
            life: 1.0,
            decay: 0.88 + Math.random() * 0.08, // Fast decay
            type: 'firework',
            color: color
        };
        
        return particle;
    }
    
    // Create a tap particle (smaller, faster)
    createTapParticle(position, color, direction = 'up') {
        const geometry = new THREE.SphereGeometry(0.02, 4, 4);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1.0
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(position.x, position.y, position.z);
        
        // Quick burst in the specified direction
        const baseVelocity = direction === 'up' ? 0.03 : -0.03;
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            baseVelocity + Math.random() * 0.02, // Up or down based on direction
            (Math.random() - 0.5) * 0.01
        );
        
        particle.userData = {
            velocity: velocity,
            life: 1.0,
            decay: 0.82 + Math.random() * 0.1, // Very fast decay
            type: 'tap',
            color: color
        };
        
        return particle;
    }
    
    // Create a subtle close change particle
    createCloseChangeParticle(position, color, direction = 'up') {
        const geometry = new THREE.SphereGeometry(0.025, 4, 4);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(position.x, position.y, position.z);
        
        // Directional drift based on bullish/bearish
        const baseVelocity = direction === 'up' ? 0.008 : -0.008;
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.005, // Minimal horizontal movement
            baseVelocity + Math.random() * 0.004, // Up or down based on direction
            (Math.random() - 0.5) * 0.002
        );
        
        particle.userData = {
            velocity: velocity,
            life: 1.0,
            decay: 0.95 + Math.random() * 0.03, // Very slow decay
            type: 'closeChange',
            color: color
        };
        
        return particle;
    }
    
    // Update all particles
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const data = particle.userData;
            
            // Update position
            particle.position.add(data.velocity);
            
            // Update life
            data.life *= data.decay;
            
            // Apply gravity to firework particles
            if (data.type === 'firework') {
                data.velocity.y -= 0.001;
            }
            
            // Update opacity
            particle.material.opacity = data.life;
            
            // Remove dead particles
            if (data.life < 0.1) {
                if (particle.parent) {
                    particle.parent.remove(particle);
                }
                this.particles.splice(i, 1);
            }
        }
    }
    
    // Clear all particles
    clear() {
        this.particles.forEach(particle => {
            if (particle.parent) {
                particle.parent.remove(particle);
            }
        });
        this.particles = [];
    }
    
    // Get all particle meshes
    getParticleMeshes() {
        return this.particles;
    }
}

// Global particle system instance
let particleSystem = new ParticleSystem();
