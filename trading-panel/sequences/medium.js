// Medium Test Sequence
// Moderate complexity with multiple changes per candle

window.mediumSequence = {
    name: "Medium Test",
    description: "Moderate complexity with multiple changes per candle",
    baseState: [
        { open: 50, close: 50.5, high: 50.8, low: 49.8 }
    ],
    stepChanges: [
        {}, // Step 0: no changes (base state)
        
        // Candle 0: Gradual decline with multiple changes
        { 0: { close: 50.2, low: 49.9 } }, // Step 1: slight decline
        { 0: { close: 49.8, low: 49.5 } }, // Step 2: continue decline
        { 0: { close: 49.2, low: 48.8 } }, // Step 3: accelerate decline
        { 0: { close: 48.5, low: 48.2 } }, // Step 4: significant decline
        
        // Candle 1: Volatile recovery with multiple changes
        { 1: { open: 48.5, close: 48.8, high: 49.0, low: 48.3 } }, // Step 5: add candle 1
        { 1: { close: 49.2, high: 49.2 } }, // Step 6: bounce up
        { 1: { close: 48.9, low: 48.7 } }, // Step 7: pullback
        { 1: { close: 49.5, high: 49.5 } }, // Step 8: strong recovery
        
        // Candle 2: Sideways consolidation with multiple changes
        { 2: { open: 49.5, close: 49.8, high: 50.0, low: 49.3 } }, // Step 9: add candle 2
        { 2: { close: 50.2, high: 50.2 } }, // Step 10: slight up
        { 2: { close: 49.9, low: 49.7 } }, // Step 11: slight down
        { 2: { close: 50.1, high: 50.1 } }, // Step 12: settle
        
        // Candle 3: Breakout attempt with multiple changes
        { 3: { open: 50.1, close: 50.8, high: 51.0, low: 49.9 } }, // Step 13: add candle 3
        { 3: { close: 51.5, high: 51.5 } }, // Step 14: strong breakout
        { 3: { close: 52.2, high: 52.2 } }, // Step 15: major breakout
        { 3: { close: 51.8, low: 51.6 } }, // Step 16: partial retrace
        
        // Candle 4: Failed breakout with multiple changes
        { 4: { open: 51.8, close: 51.2, high: 52.0, low: 51.0 } }, // Step 17: add candle 4
        { 4: { close: 50.8, low: 50.6 } }, // Step 18: continue down
        { 4: { close: 50.2, low: 50.0 } }, // Step 19: accelerate down
        { 4: { close: 49.5, low: 49.3 } }, // Step 20: significant drop
        
        // Candle 5: Bounce with multiple changes
        { 5: { open: 49.5, close: 50.0, high: 50.3, low: 49.2 } }, // Step 21: add candle 5
        { 5: { close: 50.5, high: 50.5 } }, // Step 22: continue bounce
        { 5: { close: 50.8, high: 50.8 } }, // Step 23: strong bounce
        { 5: { close: 50.3, low: 50.1 } }, // Step 24: settle back
        
        // Candle 6: Final decline with multiple changes
        { 6: { open: 50.3, close: 49.8, high: 50.5, low: 49.6 } }, // Step 25: add candle 6
        { 6: { close: 49.2, low: 49.0 } }, // Step 26: accelerate down
        { 6: { close: 48.5, low: 48.3 } }, // Step 27: major decline
        { 6: { close: 47.8, low: 47.5 } }, // Step 28: new low
    ]
};
