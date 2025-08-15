function initCamera() {
	const aspect = window.innerWidth / window.innerHeight;
	gameState.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 100);
	// apply tilt offset to initial position to match movement trajectory
	const tiltOffset = gameState.cameraTiltOffset || 0;
	gameState.camera.position.set(
		gameState.cameraStartPos.x,
		gameState.cameraStartPos.y,
		gameState.cameraStartPos.z + tiltOffset
	);
	// apply tilt to look-at from start to prevent flicker
	gameState.camera.lookAt(tiltOffset * 0.2, 2.2, 0);
}

function updateCamera(dt) {
	// Ready-phase smooth movement over fixed duration
	if (gameState.cameraMoveActive) {
		gameState.cameraMoveElapsed += dt;
		const t = Math.min(1, gameState.cameraMoveElapsed / gameState.cameraMoveDuration);
		// ease in-out
		const tt = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
		const sx = gameState.cameraStartPos.x, sy = gameState.cameraStartPos.y, sz = gameState.cameraStartPos.z;
		const ex = gameState.cameraEndPos.x, ey = gameState.cameraEndPos.y, ez = gameState.cameraEndPos.z + (gameState.cameraTiltOffset || 0);
		gameState.camera.position.set(
			sx + (ex - sx) * tt,
			sy + (ey - sy) * tt,
			sz + (ez - sz) * tt
		);
		// Subtle look-at tilt to match lateral offset
		gameState.camera.lookAt((gameState.cameraTiltOffset || 0) * 0.2, 2.2, 0);
		if (t >= 1) {
			gameState.cameraMoveActive = false;
		}
	}
}


