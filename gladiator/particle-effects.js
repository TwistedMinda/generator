const particles = [];

function spawnHitSpark(position, color) {
	const count = 30;
	for (let i = 0; i < count; i++) {
		const geo = new THREE.SphereGeometry(0.04, 6, 6);
		const mat = new THREE.MeshBasicMaterial({ color: color || 0xffb020 });
		const p = new THREE.Mesh(geo, mat);
		p.position.copy(position);
		p.velocity = new THREE.Vector3(
			( Math.random() - 0.5) * 2.5,
			Math.random() * 2.0,
			( Math.random() - 0.5) * 2.5
		);
		p.life = 0.6 + Math.random() * 0.6;
		particles.push(p);
		gameState.scene.add(p);
	}
}

function spawnShieldBurst(position) {
	const count = 16;
	for (let i = 0; i < count; i++) {
		const geo = new THREE.RingGeometry(0.2 + i*0.02, 0.22 + i*0.02, 16);
		const mat = new THREE.MeshBasicMaterial({ color: 0x7fffd4, side: THREE.DoubleSide, transparent: true, opacity: Math.max(0.15, 0.4 - i*0.02) });
		const ring = new THREE.Mesh(geo, mat);
		ring.position.copy(position);
		ring.rotation.x = -Math.PI/2;
		ring.velocity = new THREE.Vector3(0, 0, 0); // static rings
		ring.life = 0.4 + i*0.01;
		particles.push(ring);
		gameState.scene.add(ring);
	}
}

function updateParticleSystem(dt) {
	for (let i = particles.length - 1; i >= 0; i--) {
		const p = particles[i];
		p.life -= dt;
		p.position.addScaledVector(p.velocity, dt);
		p.velocity.y -= 4.8 * dt;
		if (p.life <= 0) {
			gameState.scene.remove(p);
			if (p.material) p.material.dispose();
			if (p.geometry) p.geometry.dispose();
			particles.splice(i, 1);
		}
	}
}


