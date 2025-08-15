// Game Constants - Easy to modify mechanics
const CONSTANTS = {
    // World
    WORLD_SIZE: 20,
    TILE_SIZE: 2,
    TILE_HEIGHT: 0.1,
    
    // Player
    PLAYER_SIZE: 0.5,
    PLAYER_HEIGHT: 1,
    PLAYER_SPEED: 4,
    PLAYER_BOB_SPEED: 8,
    PLAYER_BOB_HEIGHT: 0.1,
    
    // Camera
    CAMERA_HEIGHT: 8,
    CAMERA_DISTANCE: 12,
    CAMERA_ANGLE: Math.PI / 6,
    
    // Tiles
    TILE_COLORS: [
        0xff6b6b, // Red
        0xffd93d, // Yellow  
        0x6bcf7f, // Green
        0x4ecdc4, // Teal
        0x45b7d1, // Blue
        0x96ceb4, // Mint
        0xffeaa7, // Peach
        0xfd79a8, // Pink
        0xa29bfe, // Purple
        0x74b9ff  // Light Blue
    ],
    
    // Audio
    BASE_FREQUENCY: 220, // A3
    SCALES: {
        PENTATONIC: [0, 2, 4, 7, 9], // Major pentatonic intervals
        MAJOR: [0, 2, 4, 5, 7, 9, 11]
    },
    NOTE_DURATION: 0.3,
    
    // Effects
    PARTICLE_COUNT: 15,
    PARTICLE_LIFE: 1.5,
    GLOW_INTENSITY: 3.0,
    RAINBOW_CYCLE_SPEED: 0.5,
    
    // Performance
    MAX_PARTICLES: 150,
    

};
