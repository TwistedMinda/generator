// Global Game State
const gameState = {
    // Three.js objects
    scene: null,
    camera: null,
    renderer: null,
    
    // Game objects
    player: {
        mesh: null,
        targetPosition: new THREE.Vector3(0, 0, 0),
        currentPosition: new THREE.Vector3(0, 0, 0),
        isMoving: false,
        bobOffset: 0
    },
    
    // World
    tiles: [],
    tileMap: new Map(), // For quick position lookups
    ground: null,
    lights: [],
    collectibleNotes: [],
    
    // Inventory
    inventory: [],
    maxInventorySize: 10,
    
    // Input
    mouse: {
        x: 0,
        y: 0,
        isPressed: false,
        worldTarget: new THREE.Vector3()
    },
    

    
    // Audio
    audioContext: null,
    currentNote: null,
    loopingNotes: new Map(), // Map of note ID to audio nodes
    masterGain: null,
    
    // Note sequence
    isSequencePlaying: false,
    sequenceIndex: 0,
    sequenceNotes: [],
    sequenceTimeout: null,
    
    // Game stats
    lastTileIndex: -1,
    lastSubtleSoundTime: 0,
    
    // Particles
    particles: [],
    
    // Timing
    deltaTime: 0,
    lastTime: 0,
    
    // UI flags
    isInventoryFullDialogShowing: false,
    
    // Initialization
    initialized: false
};
