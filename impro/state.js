// Single global state object

const gameState = {
    // threejs
    scene: null,
    renderer: null,
    camera: null,

    // player
    player: {
        position: { x: 0, y: 1.8, z: 0 },
        rotation: { x: 0, y: 0 },
        speed: GAME_CONSTANTS.playerSpeed,
        health: GAME_CONSTANTS.maxHealth,
        maxHealth: GAME_CONSTANTS.maxHealth,
        staff: null
    },

    keys: {},
    mouse: { sensitivity: GAME_CONSTANTS.mouseSensitivity },

    // world
    buildings: [],
    orbs: [],
    particleSystems: [],

    // flow
    score: 0,
    time: 0,
    gameStarted: false,

    // spawn
    spawnTimer: 0,
    spawnRate: GAME_CONSTANTS.orb.spawnRateMs,
    maxOrbs: GAME_CONSTANTS.orb.maxOrbs,

    // cooling
    lastPulseTime: 0
};


