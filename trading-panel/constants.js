// Trading Panel Constants

// Price Scale Configuration
const PRICE_SCALE = {
    BASE_PRICE: 50,                    // Base price level ($50) where first candle's entry price sits
    WORLD_Y_AT_BASE_PRICE: 0,          // World Y coordinate at base price
    WORLD_UNITS_PER_DOLLAR: 0.5,       // How many world units per dollar
    PRICE_LEVELS: [30, 40, 50, 60, 70] // Price levels to show on scale
};

// Chart Configuration
const CHART = {
    CANDLE_SPACING: 1.2,               // Distance between candles on X axis
    BASE_LEVEL: 50,                    // Base price level for chart positioning
    PRICE_LINE_LENGTH: 1.5,            // Length of current price line extension
    PRICE_LINE_OFFSET: 0.2             // Offset for price line start position
};

// Candle Visual Configuration
const CANDLE = {
    BODY_WIDTH: 0.8,                   // Width of candle body
    BODY_DEPTH: 0.4,                   // Depth of candle body
    WICK_RADIUS: 0.05,                 // Radius of wick cylinders
    WICK_SEGMENTS: 8,                  // Number of segments for wick cylinders
    ENTRY_SPHERE_RADIUS: 0.05,         // Radius of entry price sphere
    ENTRY_SPHERE_SEGMENTS: 12,         // Number of segments for entry sphere
    GLOW_OFFSET: 0.2,                  // Additional size for glow effect
    GLOW_OPACITY: 0.3,                 // Opacity of glow effect
    ACTIVE_GLOW_RADIUS: 0.1,           // Radius of active sphere glow
    ACTIVE_GLOW_OPACITY: 0.4           // Opacity of active sphere glow
};

// Particle System Configuration
const PARTICLES = {
    FIREWORK_COUNT: 15,                // Number of particles in candle firework
    TAP_COUNT: 8,                      // Number of particles in wick tap effect
    FIREWORK_SPEED_MIN: 0.04,          // Minimum speed for firework particles
    FIREWORK_SPEED_MAX: 0.08,          // Maximum speed for firework particles
    TAP_SPEED_MIN: 0.03,               // Minimum upward speed for tap particles
    TAP_SPEED_MAX: 0.05,               // Maximum upward speed for tap particles
    FIREWORK_DECAY_MIN: 0.88,          // Minimum decay rate for firework particles
    FIREWORK_DECAY_MAX: 0.96,          // Maximum decay rate for firework particles
    TAP_DECAY_MIN: 0.82,               // Minimum decay rate for tap particles
    TAP_DECAY_MAX: 0.92,               // Maximum decay rate for tap particles
    GRAVITY: 0.001,                    // Gravity effect on firework particles
    LIFE_THRESHOLD: 0.1,               // Life threshold for particle removal
    FIREWORK_RADIUS: 0.03,             // Radius of firework particles
    TAP_RADIUS: 0.02,                  // Radius of tap particles
    FIREWORK_SEGMENTS: 6,              // Segments for firework particles
    TAP_SEGMENTS: 4                    // Segments for tap particles
};

// Particle Colors
const PARTICLE_COLORS = {
    FIREWORK: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff], // Rainbow colors
    TAP: [0xffff00, 0x00ffff, 0xff00ff] // Bright colors for wick taps
};

// Candle Colors
const CANDLE_COLORS = {
    BULLISH_BASE: 0x00ff88,            // Green for bullish candles
    BEARISH_BASE: 0xff4444,            // Red for bearish candles
    BULLISH_ACTIVE: 0x00ffff,          // Cyan for active bullish candles
    BEARISH_ACTIVE: 0xff00ff,          // Magenta for active bearish candles
    WICK_NORMAL: 0xcccccc,             // Gray for normal wicks
    WICK_ACTIVE: 0xffffff,             // White for active wicks
    ENTRY_SPHERE: 0xffff00,            // Yellow for entry price sphere
    CURRENT_PRICE_LINE: 0x00ff00,      // Green for current price line
    CURRENT_PRICE_SPHERE: 0x00ff00     // Green for current price sphere
};

// Animation Configuration
const ANIMATION = {
    DEFAULT_DURATION: 500,             // Default animation duration in ms
    CANDLE_UPDATE_DURATION: 300,       // Duration for candle updates
    EASE_OUT_POWER: 3                  // Power for ease-out cubic function
};

// Wick Tap Detection
const WICK_TAP = {
    THRESHOLD_RATIO: 0.1               // Ratio of price range for wick tap detection
};

// Scene Configuration
const SCENE = {
    BACKGROUND_COLOR: 0x0a0a0a,        // Dark background color
    PRICE_SCALE_MARKER_X: -4,          // X position for price scale markers
    PRICE_SCALE_LINE_START: -3.5,      // Start X for reference lines
    PRICE_SCALE_LINE_END: 4,           // End X for reference lines
    PRICE_SCALE_MARKER_RADIUS: 0.15,   // Radius of price scale markers
    PRICE_SCALE_MARKER_SEGMENTS: 8,    // Segments for price scale markers
    PRICE_SCALE_LINE_OPACITY: 0.7,     // Opacity of price scale lines
    REFERENCE_LINE_OPACITY: 0.3        // Opacity of reference lines
};

// Text Configuration
const TEXT = {
    CANVAS_WIDTH: 512,                 // Canvas width for text rendering
    CANVAS_HEIGHT: 128,                // Canvas height for text rendering
    PRICE_LABEL_FONT: 'bold 64px Arial', // Font for price labels
    CURRENT_PRICE_FONT: 'bold 80px Arial', // Font for current price
    PRICE_LABEL_OFFSET: 480,           // X offset for price label text
    PRICE_LABEL_Y: 90,                 // Y position for price label text
    CURRENT_PRICE_OFFSET: 20,          // X offset for current price text
    CURRENT_PRICE_Y: 90                // Y position for current price text
};

// UI Configuration
const UI = {
    SLIDER_UPDATE_INTERVAL: 1000,      // Interval for slider updates in ms
    REALTIME_UPDATE_INTERVAL: 1000,    // Interval for realtime updates in ms
    REALTIME_CANDLE_INTERVAL: 5000     // Interval for new candles in realtime mode
};

// Lighting Configuration
const LIGHTING = {
    AMBIENT_COLOR: 0x404040,           // Ambient light color
    AMBIENT_INTENSITY: 0.4,            // Ambient light intensity
    DIRECTIONAL_COLOR: 0xffffff,       // Main directional light color
    DIRECTIONAL_INTENSITY: 1,          // Main directional light intensity
    RIM_COLOR: 0x00ffff,               // Rim light color
    RIM_INTENSITY: 0.5,                // Rim light intensity
    POINT_COLOR: 0xff6600,             // Point light color
    POINT_INTENSITY: 0.8,              // Point light intensity
    POINT_DISTANCE: 10                 // Point light distance
};
