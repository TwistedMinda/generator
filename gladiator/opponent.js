function createOpponent() {
	const geo = new THREE.CylinderGeometry(0.45, 0.45, 2.0, 16);
	const mat = new THREE.MeshStandardMaterial({ color: 0xff4d4d, metalness: 0.2, roughness: 0.5 });
	const mesh = new THREE.Mesh(geo, mat);
	mesh.position.set(2.2, 1.2, 0);
	mesh.castShadow = true;
	gameState.opponent = mesh;
	gameState.scene.add(mesh);
}

function updateOpponent(dt) {
	if (!gameState.opponent) return;
	gameState.opponent.position.y = 1.2 + Math.sin(gameState.time * 2.2 + 1.3) * 0.05;
}


