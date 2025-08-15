// Ground, lighting, scenery

function createMap() {
    // Scene fog and background
    gameState.scene.background = new THREE.Color(0x0a0a10);
    gameState.scene.fog = new THREE.Fog(0x05050a, 12, 42);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(200, 200, 64, 64);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0d0f1a, roughness: 0.9, metalness: 0.05 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    gameState.scene.add(ground);

    // Neon pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x11131f, metalness: 0.4, roughness: 0.6 });
    const ringMat = new THREE.MeshStandardMaterial({ emissive: 0x00eaff, color: 0x001a1f, emissiveIntensity: 2.5 });

    for (let i = 0; i < 14; i++) {
        const h = 2 + Math.random() * 3;
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, h, 16), pillarMat);
        body.position.set((Math.random() - 0.5) * 40, h / 2, (Math.random() - 0.5) * 40);
        body.castShadow = true;
        body.receiveShadow = true;
        gameState.scene.add(body);
        gameState.buildings.push(body);

        const rings = 2 + Math.floor(Math.random() * 3);
        for (let r = 0; r < rings; r++) {
            const torus = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 12, 48), ringMat.clone());
            torus.position.set(body.position.x, body.position.y - h / 2 + (r + 1) * (h / (rings + 1)), body.position.z);
            torus.rotation.x = Math.PI / 2;
            gameState.scene.add(torus);
        }
    }

    // Lights
    const hemi = new THREE.HemisphereLight(0x66ccff, 0x080810, 0.35);
    gameState.scene.add(hemi);

    const key = new THREE.SpotLight(0x00eaff, 2.2, 60, Math.PI / 5, 0.35, 1.2);
    key.position.set(8, 18, 8);
    key.castShadow = true;
    gameState.scene.add(key);

    const fill = new THREE.PointLight(0xff4bd8, 1.3, 40);
    fill.position.set(-10, 6, -6);
    gameState.scene.add(fill);
}


