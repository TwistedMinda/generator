// Particle effects

function createSparkBurst(position, color) {
    const group = new THREE.Group();
    const count = 32;
    for (let i = 0; i < count; i++) {
        const m = new THREE.Mesh(
            new THREE.SphereGeometry(0.03, 6, 6),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
        );
        const dir = new THREE.Vector3(Math.random()-0.5, Math.random()*0.8, Math.random()-0.5).normalize();
        m.userData = { v: dir.multiplyScalar(2 + Math.random()*2), life: GAME_CONSTANTS.particle.burstLifespan };
        m.position.copy(position);
        group.add(m);
    }
    group.userData = { type: 'burst' };
    gameState.scene.add(group);
    gameState.particleSystems.push(group);
}

function createTrailParticle(position, color) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }));
    m.position.copy(position);
    m.userData = { v: new THREE.Vector3(0, 0.6, 0), life: GAME_CONSTANTS.particle.sparkleLifespan };
    gameState.scene.add(m);
    gameState.particleSystems.push(m);
}

function updateParticleSystem(delta) {
    for (let i = gameState.particleSystems.length - 1; i >= 0; i--) {
        const p = gameState.particleSystems[i];
        if (p.userData && p.userData.type === 'burst') {
            for (const child of p.children) {
                child.userData.life -= delta;
                child.position.add(child.userData.v.clone().multiplyScalar(delta));
                child.material.opacity = Math.max(0, child.material.opacity - delta * 1.2);
            }
            if (p.children.length && p.children[0].userData.life <= 0) {
                gameState.scene.remove(p);
                gameState.particleSystems.splice(i, 1);
            }
        } else {
            // single particle
            p.userData.life -= delta;
            p.position.add(p.userData.v.clone().multiplyScalar(delta));
            p.material.opacity = Math.max(0, p.material.opacity - delta * 0.8);
            if (p.userData.life <= 0) {
                gameState.scene.remove(p);
                gameState.particleSystems.splice(i, 1);
            }
        }
    }
}


