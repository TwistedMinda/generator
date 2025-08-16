// Complex Test Sequence
// High complexity with multiple changes per candle and dramatic movements

window.complexSequence = {
    name: "Complex Test",
    description: "High complexity with multiple changes per candle and dramatic movements",
    baseState: [
        { open: 50, close: 50.5, high: 50.8, low: 49.8 }
    ],
    stepChanges: [
        {}, // Step 0: no changes (base state)
        
        // Candle 0: Initial volatility with multiple changes
        { 0: { close: 50.8, high: 51.0 } }, // Step 1: slight up
        { 0: { close: 51.2, high: 51.2 } }, // Step 2: continue up
        { 0: { close: 50.9, low: 50.7 } }, // Step 3: pullback
        { 0: { close: 50.5, low: 50.3 } }, // Step 4: settle
        
        // Candle 1: Strong breakout with multiple changes
        { 1: { open: 50.5, close: 51.5, high: 51.8, low: 50.2 } }, // Step 5: add candle 1
        { 1: { close: 52.5, high: 52.5 } }, // Step 6: strong breakout
        { 1: { close: 53.8, high: 53.8 } }, // Step 7: major breakout
        { 1: { close: 54.2, high: 54.2 } }, // Step 8: peak
        
        // Candle 2: Sharp reversal with multiple changes
        { 2: { open: 54.2, close: 53.0, high: 54.5, low: 52.8 } }, // Step 9: add candle 2
        { 2: { close: 51.5, low: 51.3 } }, // Step 10: sharp drop
        { 2: { close: 50.2, low: 50.0 } }, // Step 11: accelerate down
        { 2: { close: 48.8, low: 48.5 } }, // Step 12: major reversal
        
        // Candle 3: Volatile bounce with multiple changes
        { 3: { open: 48.8, close: 49.8, high: 50.2, low: 48.5 } }, // Step 13: add candle 3
        { 3: { close: 50.8, high: 50.8 } }, // Step 14: strong bounce
        { 3: { close: 51.5, high: 51.5 } }, // Step 15: continue up
        { 3: { close: 50.9, low: 50.7 } }, // Step 16: partial retrace
        
        // Candle 4: Sideways chop with multiple changes
        { 4: { open: 50.9, close: 51.2, high: 51.5, low: 50.6 } }, // Step 17: add candle 4
        { 4: { close: 51.8, high: 51.8 } }, // Step 18: up
        { 4: { close: 51.4, low: 51.2 } }, // Step 19: down
        { 4: { close: 51.6, high: 51.6 } }, // Step 20: up again
        
        // Candle 5: Breakdown with multiple changes
        { 5: { open: 51.6, close: 50.8, high: 51.8, low: 50.6 } }, // Step 21: add candle 5
        { 5: { close: 49.8, low: 49.6 } }, // Step 22: break down
        { 5: { close: 48.5, low: 48.3 } }, // Step 23: accelerate down
        { 5: { close: 47.2, low: 47.0 } }, // Step 24: major breakdown
        
        // Candle 6: Panic selling with multiple changes
        { 6: { open: 47.2, close: 45.8, high: 47.5, low: 45.5 } }, // Step 25: add candle 6
        { 6: { close: 44.2, low: 44.0 } }, // Step 26: panic
        { 6: { close: 42.5, low: 42.3 } }, // Step 27: crash
        { 6: { close: 40.8, low: 40.5 } }, // Step 28: bottom
        
        // Candle 7: Recovery attempt with multiple changes
        { 7: { open: 40.8, close: 42.5, high: 42.8, low: 40.5 } }, // Step 29: add candle 7
        { 7: { close: 44.2, high: 44.2 } }, // Step 30: strong recovery
        { 7: { close: 45.8, high: 45.8 } }, // Step 31: continue up
        { 7: { close: 47.2, high: 47.5 } }, // Step 32: major recovery
        
        // Candle 8: Final consolidation with multiple changes
        { 8: { open: 47.2, close: 47.8, high: 48.2, low: 46.8 } }, // Step 33: add candle 8
        { 8: { close: 48.5, high: 48.5 } }, // Step 34: slight up
        { 8: { close: 47.9, low: 47.7 } }, // Step 35: slight down
        { 8: { close: 48.2, high: 48.2 } }, // Step 36: settle
    ]
};
