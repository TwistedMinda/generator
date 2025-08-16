// Medium Test Sequence
// Moderate complexity with multiple changes per candle

window.mediumSequence = {
    name: "Medium Test",
    description: "Moderate complexity with multiple changes per candle",
    scale: {
        min: 30,
        max: 70,
        base: 50,
        markers: [70, 60, 50, 40, 30]
    },
    baseState: [
        { open: 60, close: 60.5, high: 60.8, low: 59.8 }
    ],
    stepChanges: [
        {}, // Step 0: no changes (base state)
        
        // Candle 0: Gradual decline with multiple changes
        { 0: { close: 60.2, low: 59.9 } }, // Step 1: slight decline
        { 0: { close: 59.8, low: 59.5 } }, // Step 2: continue decline
        { 0: { close: 59.2, low: 58.8 } }, // Step 3: accelerate decline
        { 0: { close: 58.5, low: 58.2 } }, // Step 4: significant decline
        
        // Candle 1: Volatile recovery with multiple changes
        { 1: { open: 58.5, close: 58.8, high: 59.0, low: 58.3 } }, // Step 5: add candle 1
        { 1: { close: 59.2, high: 59.2 } }, // Step 6: bounce up
        { 1: { close: 58.9, low: 58.7 } }, // Step 7: pullback
        { 1: { close: 59.5, high: 59.5 } }, // Step 8: strong recovery
        
        // Candle 2: Sideways consolidation with multiple changes
        { 2: { open: 59.5, close: 59.8, high: 60.0, low: 59.3 } }, // Step 9: add candle 2
        { 2: { close: 60.2, high: 60.2 } }, // Step 10: slight up
        { 2: { close: 59.9, low: 59.7 } }, // Step 11: slight down
        { 2: { close: 60.1, high: 60.1 } }, // Step 12: settle
        
        // Candle 3: Breakout attempt with multiple changes
        { 3: { open: 60.1, close: 60.8, high: 61.0, low: 59.9 } }, // Step 13: add candle 3
        { 3: { close: 61.5, high: 61.5 } }, // Step 14: strong breakout
        { 3: { close: 62.2, high: 62.2 } }, // Step 15: major breakout
        { 3: { close: 61.8, low: 61.6 } }, // Step 16: partial retrace
        
        // Candle 4: Failed breakout with multiple changes
        { 4: { open: 61.8, close: 61.2, high: 62.0, low: 61.0 } }, // Step 17: add candle 4
        { 4: { close: 60.8, low: 60.6 } }, // Step 18: continue down
        { 4: { close: 60.2, low: 60.0 } }, // Step 19: accelerate down
        { 4: { close: 59.5, low: 59.3 } }, // Step 20: significant drop
        
        // Candle 5: Bounce with multiple changes
        { 5: { open: 59.5, close: 60.0, high: 60.3, low: 59.2 } }, // Step 21: add candle 5
        { 5: { close: 60.5, high: 60.5 } }, // Step 22: continue bounce
        { 5: { close: 60.8, high: 60.8 } }, // Step 23: strong bounce
        { 5: { close: 60.3, low: 60.1 } }, // Step 24: settle back
        
        // Candle 6: Final decline with multiple changes
        { 6: { open: 60.3, close: 59.8, high: 60.5, low: 59.6 } }, // Step 25: add candle 6
        { 6: { close: 59.2, low: 59.0 } }, // Step 26: accelerate down
        { 6: { close: 58.5, low: 58.3 } }, // Step 27: major decline
        { 6: { close: 47.8, low: 47.5 } }, // Step 28: new low
    ]
};
