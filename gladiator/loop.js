let lastTime = 0;
let animationId;

function gameLoop(currentTime) {
	const deltaTime = (currentTime - lastTime) / 1000;
	lastTime = currentTime;
	const dt = Math.min(deltaTime, 0.1);

	if (gameState.gameStarted) {
		gameState.time += dt;
		updateMobileInput(dt);
		updateCamera(dt);
		updatePlayer(dt);
		updateOpponent(dt);
		updateParticleSystem(dt);
		updateGameLogic(dt);
		updateHUD();
		if (gameState.renderer && gameState.scene && gameState.camera) {
			gameState.renderer.render(gameState.scene, gameState.camera);
		}
	}

	animationId = requestAnimationFrame(gameLoop);
}

function startGameLoop() {
	if (animationId) cancelAnimationFrame(animationId);
	lastTime = performance.now();
	gameLoop(lastTime);
}


