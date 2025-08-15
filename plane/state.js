// Global game state - single source of truth
window.gameState = {
    // Canvas and rendering
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    
    // Game timing
    lastTime: 0,
    deltaTime: 0,
    
    // Player state
    player: {
        x: 0,
        y: 1000,
        z: 0,
        velocityX: 0,
        velocityY: 0,
        velocityZ: 0,
        pitch: 0,
        yaw: 0,
        roll: 0,
        health: 100,
        maxHealth: 100,
        speed: 250,
        maxSpeed: 500,
        fuel: 100
    },
    
    // Camera state
    camera: {
        x: 0,
        y: 1000,
        z: 0,
        pitch: 0,
        yaw: 0,
        fov: 75,
        near: 1,
        far: 10000
    },
    
    // Input state
    input: {
        keys: {},
        mouse: {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            locked: false
        }
    },
    
    // Game world
    world: {
        gravity: -9.81,
        windX: 0,
        windZ: 0,
        time: 0,
        buildings: [],
        debris: [],
        clouds: [],
        ground: -50
    },
    
    // Entities
    enemies: [],
    projectiles: [],
    particles: [],
    explosions: [],
    
    // Game settings
    settings: {
        mouseSensitivity: 0.002,
        inverted: false,
        soundEnabled: true,
        particleCount: 500
    },
    
    // Game flags
    gameRunning: true,
    paused: false,
    debugMode: false
};
