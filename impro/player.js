// Player visuals and actions

function initPlayer() {
    // Hand-held neon rod
    const geo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 12);
    const mat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.6, roughness: 0.3 });
    const rod = new THREE.Mesh(geo, mat);
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 16), new THREE.MeshBasicMaterial({ color: 0x00eaff }));
    glow.material.transparent = true;
    glow.material.opacity = 0.35;
    glow.position.set(0,0,0);
    rod.add(glow);
    rod.castShadow = true;
    gameState.player.staff = rod;
    gameState.scene.add(rod);
}

function updatePlayer() {
    // staff follows camera
    if (!gameState.player.staff) return;
    const camera = gameState.camera;
    const baseOffset = new THREE.Vector3(0.16, -0.12, -0.42);
    const offset = baseOffset.clone();
    offset.applyMatrix4(camera.matrixWorld);
    gameState.player.staff.position.copy(offset);
    gameState.player.staff.rotation.copy(camera.rotation);
}

function takeDamage(amount) {
    gameState.player.health = Math.max(0, gameState.player.health - amount);
    updateHealthBar();
    if (gameState.player.health <= 0) gameOver();
}


