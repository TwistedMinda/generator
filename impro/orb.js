// Enemy: neon orb that orbits then dashes

function spawnOrb() {
    if (gameState.orbs.length >= gameState.maxOrbs) return;

    const color = Math.random() < 0.5 ? 0x00eaff : 0xff4bd8;
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, metalness: 0.2, roughness: 0.4 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 20), mat);
    const angle = Math.random() * Math.PI * 2;
    const radius = 12 + Math.random() * 16;
    mesh.position.set(Math.cos(angle) * radius, 1.2 + Math.random()*1.2, Math.sin(angle) * radius);
    mesh.castShadow = true;
    mesh.userData = {
        speed: GAME_CONSTANTS.orb.baseSpeed + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        dashTimer: 1 + Math.random() * 1.5
    };
    gameState.scene.add(mesh);
    gameState.orbs.push(mesh);
}

function updateOrbs(delta) {
    for (let i = gameState.orbs.length - 1; i >= 0; i--) {
        const o = gameState.orbs[i];
        const toPlayer = new THREE.Vector3(
            gameState.player.position.x - o.position.x,
            0,
            gameState.player.position.z - o.position.z
        );
        const dist = toPlayer.length();
        toPlayer.normalize();

        // orbiting wobble
        o.userData.phase += delta * 2;
        o.position.y = 1 + Math.sin(o.userData.phase) * 0.4;

        // dash behavior
        o.userData.dashTimer -= delta;
        if (o.userData.dashTimer <= 0) {
            const dash = toPlayer.clone().multiplyScalar(o.userData.speed * 6);
            o.position.x += dash.x * delta;
            o.position.z += dash.z * delta;
            o.userData.dashTimer = 0.9 + Math.random() * 1.3;
            createSparkBurst(o.position, o.material.emissive.getHex());
        } else {
            o.position.x += toPlayer.x * o.userData.speed * delta;
            o.position.z += toPlayer.z * o.userData.speed * delta;
        }

        // collision with player
        if (dist < 0.7) {
            takeDamage(GAME_CONSTANTS.orb.damage);
            createSparkBurst(o.position, 0xff3355);
            gameState.scene.remove(o);
            gameState.orbs.splice(i, 1);
            continue;
        }
    }
}


