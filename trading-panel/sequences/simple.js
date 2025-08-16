// Simple Test Sequence
// Basic price movement test

window.simpleSequence = {
    name: "Simple Test",
    description: "Basic price movement test",
    baseState: [
        { open: 50, close: 50.5, high: 50.8, low: 49.8 }
    ],
    stepChanges: [
        {}, // Step 0: no changes (base state)
        { 0: { close: 48.5, low: 48.2 } }, // Step 1: lower close with wick
        { 1: { open: 48.5, close: 49.2, high: 49.5, low: 48.3 } }, // Step 2: add candle 2 - recovery
        { 2: { open: 49.2, close: 52, high: 52.3, low: 49.0 } }, // Step 3: add candle 3 - breakout
        { 3: { open: 52, close: 51.3, high: 52.2, low: 51.1 } }, // Step 4: add candle 4 - pullback
        { 4: { open: 51.3, close: 50.1, high: 51.4, low: 49.9 } }, // Step 5: add candle 5 - consolidation
        { 5: { open: 50.1, close: 45, low: 44.8, high: 50.3 } }, // Step 6: add candle 6 - big drop
        { 6: { open: 45, close: 44.2, low: 44.0, high: 45.2 } }, // Step 7: add candle 7 - continuation
        { 7: { open: 44.2, close: 47.5, high: 47.8, low: 44.0 } }, // Step 8: add candle 8 - recovery
        { 7: { close: 48.5, high: 48.5, low: 48.5 } }, // Step 8: add candle 8 - recovery
        { 7: { close: 49.5, high: 49.5, low: 49.5 } }, // Step 8: add candle 8 - recovery
        { 7: { close: 48.5, high: 49.5, low: 49.5 } }, // Step 8: add candle 8 - recovery
    ]
};
