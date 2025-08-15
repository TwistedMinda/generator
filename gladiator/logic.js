function initRenderer() {
	gameState.renderer = new THREE.WebGLRenderer({ antialias: true });
	gameState.renderer.setSize(window.innerWidth, window.innerHeight);
	gameState.renderer.setClearColor(0x0b0b0c);
	gameState.renderer.shadowMap.enabled = true;
	const container = document.getElementById('game-container');
	container.appendChild(gameState.renderer.domElement);
}

function initScene() {
	gameState.scene = new THREE.Scene();
}

function scheduleNextEnemyTelegraph() {
	// Wait if still in peaceful ready phase
	if (gameState.inReadyPhase) return;
	// Choose a fresh AI action immediately when idle
	if (gameState.aiActionActiveRemaining > 0) return;
	const chooseDefend = Math.random() < 0.5;
	gameState.aiIsDefending = chooseDefend;
	gameState.aiIsAttacking = !chooseDefend;
	gameState.aiActionActiveRemaining = chooseDefend ? CONSTANTS.defendDuration : CONSTANTS.attackDuration;
	gameState.aiAttackSecondHitDone = false;
	gameState._aiFirstHitApplied = false;
	showStatusBadge('enemy', chooseDefend ? 'defend' : 'attack');
}

function enemyResolveTelegraph() {
	// Deprecated path (kept for compatibility with earlier flow)
	gameState.telegraphActive = false;
}

// Legacy functions - now handled by ButtonManager

function updateGameLogic(dt) {
	// Update smart button system
	ButtonManager.update(dt);
	
	// Stack decay
	if (!gameState.isDefending && gameState.attackStack > 0) {
		gameState.attackStack = Math.max(0, gameState.attackStack - CONSTANTS.attackStackDecayPerSecond * dt);
	}
	
	// Track defend timer for UI
	gameState.defendTimer += dt;

	// Handle second hit for attacks
	if (gameState.attackActiveRemaining > 0) {
		if (!gameState.attackSecondHitDone && gameState.attackActiveRemaining <= CONSTANTS.attackDuration - 2.0) {
			gameState.attackSecondHitDone = true;
			let mult = 1 + gameState.attackStack;
			let damage2 = Math.round(CONSTANTS.attackBaseDamage * mult);
			if (gameState.aiIsDefending) {
				if (Math.random() < 0.8) {
					damage2 = 0;
					spawnShieldBurst(new THREE.Vector3(2.2, 1.4, 0));
					sfxBlock();
				} else {
					damage2 = Math.max(1, Math.round(damage2 * (1 - CONSTANTS.defendDamageReduction)));
				}
			}
			gameState.enemyHealth -= damage2;
			spawnHitSpark(new THREE.Vector3(2.2, 1.3, 0), 0xffd060);
			sfxAttack();
			if (gameState.enemyHealth <= 0) {
				gameState.enemyHealth = 0;
				setTelegraph('KO!', 'text-glad-amber');
				gameState.round++;
				setTimeout(nextRound, CONSTANTS.roundDelay * 1000);
			}
		}
	}

	// AI action processing loop (paused in ready phase)
	if (gameState.aiActionActiveRemaining > 0) {
		gameState.aiActionActiveRemaining -= dt;
		if (gameState.aiIsAttacking) {
			// first hit at action start
			if (!gameState._aiFirstHitApplied) {
				const base = CONSTANTS.enemyBaseDamage;
				let incoming = base;
				if (gameState.isDefending) {
					// 50% perfect block on defend
					if (Math.random() < 0.5) {
						incoming = 0;
						spawnShieldBurst(new THREE.Vector3(-0.2, 1.4, 0));
						sfxBlock();
					} else {
						incoming = Math.max(CONSTANTS.chipDamage, Math.round(base * (1 - CONSTANTS.defendDamageReduction)));
					}
				}
				gameState.playerHealth -= incoming;
				spawnHitSpark(new THREE.Vector3(-0.2, 1.2, 0), 0xff4d4d);
				sfxHit();
				gameState._aiFirstHitApplied = true;
			}
			// second hit at t+1s
			if (!gameState.aiAttackSecondHitDone && gameState.aiActionActiveRemaining <= CONSTANTS.attackDuration - 1.0) {
				const base2 = CONSTANTS.enemyBaseDamage;
				let incoming2 = base2;
				if (gameState.isDefending) {
					if (Math.random() < 0.5) {
						incoming2 = 0;
						spawnShieldBurst(new THREE.Vector3(-0.2, 1.4, 0));
						sfxBlock();
					} else {
						incoming2 = Math.max(CONSTANTS.chipDamage, Math.round(base2 * (1 - CONSTANTS.defendDamageReduction)));
					}
				}
				gameState.playerHealth -= incoming2;
				spawnHitSpark(new THREE.Vector3(-0.1, 1.3, 0), 0xff8080);
				sfxHit();
				gameState.aiAttackSecondHitDone = true;
			}
		}
		if (gameState.aiActionActiveRemaining <= 0) {
			gameState.aiIsDefending = false;
			gameState.aiIsAttacking = false;
			gameState._aiFirstHitApplied = false;
			// immediately pick next action
			scheduleNextEnemyTelegraph();
		}
	} else if (!gameState.inReadyPhase) {
		// if idle, immediately choose next action
		scheduleNextEnemyTelegraph();
	}

	// Legacy telegraph countdown no longer used here
}

function nextRound() {
	gameState.enemyHealth = CONSTANTS.maxEnemyHealth + Math.round((gameState.round - 1) * 10);
	gameState.playerHealth = Math.min(CONSTANTS.maxPlayerHealth, gameState.playerHealth + 30);
	sfxRound();
	gameState.inReadyPhase = true;
	const controls = document.getElementById('controls');
	if (controls) controls.style.display = 'none';
	setTelegraph(`READY 3`, 'text-white');
	setTimeout(() => setTelegraph(`READY 2`, 'text-white'), 900);
	setTimeout(() => setTelegraph(`READY 1`, 'text-white'), 1800);
	setTimeout(() => setTelegraph(`READY 0`, 'text-white'), 2700);
	// start 3s camera move
	gameState.cameraMoveActive = true;
	gameState.cameraMoveElapsed = 0;
	setTimeout(() => {
		const tele = document.getElementById('telegraph');
		if (tele) tele.style.display = 'none';
		gameState.inReadyPhase = false;
		if (controls) {
			controls.style.display = 'flex';
			requestAnimationFrame(() => {
				controls.style.opacity = '1';
				controls.style.transform = 'scale(1)';
			});
		}
		scheduleNextEnemyTelegraph();
	}, 3000);
}

// Replaced by ButtonManager

function initGame() {
	// base state
	gameState.playerHealth = CONSTANTS.maxPlayerHealth;
	gameState.enemyHealth = CONSTANTS.maxEnemyHealth;
	gameState.score = 0;
	gameState.round = 1;
	gameState.time = 0;
	
	// ensure camera positions are set
	if (!gameState.cameraStartPos) gameState.cameraStartPos = { x: 0, y: 5.2, z: 10 };
	if (!gameState.cameraEndPos) gameState.cameraEndPos = { x: -10.3, y: 5.2, z: 0.3 };
	if (!gameState.cameraTiltOffset) gameState.cameraTiltOffset = 0.3;

	initRenderer();
	initScene();
	initCamera();
	buildArena();
	createPlayer();
	createOpponent();
	ButtonManager.init();

	gameState.gameStarted = true;
	setTelegraph('READY', 'text-white');
	setTimeout(() => { nextRound(); }, 600);
	startGameLoop();
}


