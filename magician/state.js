// Global game state
window.gameState = {
    // Scene and rendering
    scene: null,
    camera: null,
    renderer: null,
    
    // Player state
    player: {
        health: 100,
        maxHealth: 100,
        mana: 100,
        maxMana: 100,
        position: { x: 0, y: 1.8, z: 0 },
        rotation: { x: 0, y: 0 },
        speed: 8,
        staff: null
    },
    
    // Game objects
    faeries: [],
    spells: [],
    particleSystems: [],
    buildings: [], // Will store building meshes for collision detection
    healthGems: [], // Health pickup gems
    
    // Input
    keys: {},
    mouse: { x: 0, y: 0, sensitivity: 0.002 },
    
    // Game state
    score: 0,
    gameStarted: false,
    time: 0,
    spawnTimer: 0,
    healthGemSpawnTimer: 0,
    difficulty: 1,
    
    // Settings
    maxFaeries: 5, // Even fewer faeries
    spawnRate: 1500, // ms - slower spawn
    fireballCost: 8, // Cheaper spells
    lightningCost: 20,
    fireballCooldown: 400, // 0.4 seconds for fireball
    lightningCooldown: 3000, // 3 seconds for lightning
    maxHealthGems: 2,
    healthGemSpawnRate: 10000, // 10 seconds base
    
    // Spell cooldowns
    lastFireballTime: 0,
    lastLightningTime: 0,
    
    // Lights for dynamic shadows
    lights: {
        ambient: null,
        directional: null,
        spellLights: []
    }
};
