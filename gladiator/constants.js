// Tunable knobs for the duel flow
const CONSTANTS = {
	maxPlayerHealth: 300,
	maxEnemyHealth: 100,
	roundDelay: 2.0,

	// Player attack
	attackCooldown: 4.0,
	attackDuration: 4.0,
	defendDuration: 2.0,
	attackBaseDamage: 12,
	attackStackIncrease: 0.35, // added to stack per attack
	attackStackDecayPerSecond: 0.25, // natural decay per second (halved)
	attackStackMax: 2.0, // final multiplier is (1 + stack)

	// Enemy AI
	enemyActionInterval: 2.0, // one action per 2 seconds
	enemyBaseDamage: 8,
	defendDamageReduction: 0.7, // 70% damage reduction when defending
	chipDamage: 3 // minimum damage that always goes through on enemy hit
};


