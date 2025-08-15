function buildArena() {
	const scene = gameState.scene;
	// Floor
	const floorGeo = new THREE.PlaneGeometry(40, 40, 1, 1);
	const floorMat = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.8, metalness: 0.1 });
	const floor = new THREE.Mesh(floorGeo, floorMat);
	floor.rotation.x = -Math.PI / 2;
	floor.receiveShadow = true;
	scene.add(floor);

	// Ring
	const ringGeo = new THREE.RingGeometry(8, 9, 64);
	const ringMat = new THREE.MeshBasicMaterial({ color: 0xffb020, side: THREE.DoubleSide });
	const ring = new THREE.Mesh(ringGeo, ringMat);
	ring.rotation.x = -Math.PI / 2;
	 ring.position.y = 0.01;
	scene.add(ring);

	// Lights
	const hemi = new THREE.HemisphereLight(0xffffff, 0x080808, 0.6);
	scene.add(hemi);
	const key = new THREE.SpotLight(0xffb020, 2.2, 60, Math.PI / 6, 0.5, 1);
	key.position.set(10, 16, 10);
	key.castShadow = true;
	scene.add(key);
	const rim = new THREE.PointLight(0x46f1b0, 1.4, 40);
	rim.position.set(-6, 10, -6);
	scene.add(rim);
}


