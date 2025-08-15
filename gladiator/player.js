function createPlayer() {
	const geo = new THREE.CylinderGeometry(0.45, 0.45, 2.0, 16);
	const mat = new THREE.MeshStandardMaterial({ color: 0x46f1b0, metalness: 0.4, roughness: 0.3 });
	const mesh = new THREE.Mesh(geo, mat);
	mesh.position.set(-2.2, 1.2, 0);
	mesh.castShadow = true;
	gameState.player = mesh;
	gameState.scene.add(mesh);
}

function updatePlayer(dt) {
	// Simple idle breathing
	if (!gameState.player) return;
	gameState.player.position.y = 1.2 + Math.sin(gameState.time * 2) * 0.05;
}


