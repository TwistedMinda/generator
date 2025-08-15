// Single global object
const gameState = {
	// three
	renderer: null,
	scene: null,
	camera: null,

	// time
	time: 0,
	gameStarted: false,
	inReadyPhase: true,

	// player/enemy
	playerHealth: 100,
	enemyHealth: 100,
	round: 1,
	score: 0,

	// inputs
	isAttacking: false,
	isDefending: false,
	attackTimer: 0,
	attackActiveRemaining: 0,
	attackSecondHitDone: false,
	defendActiveRemaining: 0,

	// player attack stacker
	attackStack: 0, // grows on consecutive attacks, decays over time

	// locks
	attackLockEnabled: false,
	defendLockEnabled: false,

	// camera control (ready-phase movement)
	cameraMoveActive: false,
	cameraMoveElapsed: 0,
	cameraMoveDuration: 3.0,
	cameraStartPos: { x: 0, y: 5.2, z: 10 },
	cameraEndPos: { x: -10.3, y: 5.2, z: 0.3 },
	cameraHeight: 5.2,
	cameraTiltOffset: 1.5,

	// enemy telegraph
	telegraphTimer: 0,
	telegraphActive: false,
	telegraphType: 'attack',
	lastEnemyActionTime: 0,
	aiIsDefending: false,
	aiIsAttacking: false,
	aiActionActiveRemaining: 0,
	aiAttackSecondHitDone: false,

	// audio
	audioCtx: null
};


