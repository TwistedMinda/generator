// Simple Test Sequence
// Basic price movement test with multiple changes per candle

window.simpleSequence = {
    name: "Simple Test",
    description: "Basic price movement test with multiple changes per candle",
    scale: {
        min: 30,
        max: 70,
        base: 50,
        markers: [70, 60, 50, 40, 30]
    },
    baseState: [
        { open: 50, close: 50.5, high: 50.8, low: 49.8 }
    ],
    stepChanges: [
        {}, // Step 0: no changes (base state)
        
        // Candle 0: Multiple price changes
        { 0: { close: 49.8, low: 49.5 } }, // Step 1: slight drop
        { 0: { close: 49.2, low: 48.8 } }, // Step 2: further drop
        { 0: { close: 48.5, low: 48.2 } }, // Step 3: significant drop
        
        // Candle 1: Recovery with multiple changes
        { 1: { open: 48.5, close: 49.0, high: 49.2, low: 48.3 } }, // Step 4: add candle 1
        { 1: { close: 49.5, high: 49.5 } }, // Step 5: continue recovery
        { 1: { close: 49.8, high: 49.8 } }, // Step 6: near break even
        
        // Candle 2: Breakout with multiple changes
        { 2: { open: 49.8, close: 50.5, high: 50.8, low: 49.6 } }, // Step 7: add candle 2
        { 2: { close: 51.2, high: 51.2 } }, // Step 8: strong breakout
        { 2: { close: 52.0, high: 52.3 } }, // Step 9: major breakout
        
        // Candle 3: Pullback with multiple changes
        { 3: { open: 52.0, close: 51.5, high: 52.2, low: 51.1 } }, // Step 10: add candle 3
        { 3: { close: 51.0, low: 50.8 } }, // Step 11: continue pullback
        { 3: { close: 50.5, low: 50.3 } }, // Step 12: deeper pullback
        
        // Candle 4: Consolidation with multiple changes
        { 4: { open: 50.5, close: 50.8, high: 51.0, low: 50.2 } }, // Step 13: add candle 4
        { 4: { close: 51.2, high: 51.2 } }, // Step 14: slight bounce
        { 4: { close: 50.9, low: 50.7 } }, // Step 15: settle back
        
        // Candle 5: Big drop with multiple changes
        { 5: { open: 50.9, close: 49.5, high: 51.0, low: 49.3 } }, // Step 16: add candle 5
        { 5: { close: 48.0, low: 47.8 } }, // Step 17: accelerate drop
        { 5: { close: 45.0, low: 44.8 } }, // Step 18: major drop
        
        // Candle 6: Continuation with multiple changes
        { 6: { open: 45.0, close: 44.5, high: 45.2, low: 44.0 } }, // Step 19: add candle 6
        { 6: { close: 44.0, low: 43.8 } }, // Step 20: continue down
        { 6: { close: 43.5, low: 43.2 } }, // Step 21: new low
        
        // Candle 7: Recovery with multiple changes
        { 7: { open: 43.5, close: 44.5, high: 44.8, low: 43.2 } }, // Step 22: add candle 7
        { 7: { close: 45.5, high: 45.5 } }, // Step 23: strong recovery
        { 7: { close: 47.5, high: 47.8 } }, // Step 24: major recovery
    ]
};
