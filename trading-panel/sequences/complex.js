// Complex Test Sequence
// Complex price movement with many candles and dramatic swings

window.complexSequence = {
    name: "Complex Test",
    description: "Complex price movement with many candles and dramatic swings",
    baseState: [
        { open: 50, close: 50.5, high: 50.8, low: 49.8 }
    ],
    stepChanges: [
        {}, // Step 0: no changes (base state)
        { 0: { close: 50.3, high: 50.9, low: 49.6 } }, // Step 1: initial consolidation
        { 1: { open: 50.5, close: 51.8, high: 52.1, low: 50.3 } }, // Step 2: add candle 2 - first breakout attempt
        { 2: { open: 51.8, close: 49.2, high: 51.9, low: 49.0 } }, // Step 3: add candle 3 - rejection and reversal
        { 3: { open: 49.2, close: 47.5, high: 49.4, low: 47.3 } }, // Step 4: add candle 4 - strong downtrend begins
        { 4: { open: 47.5, close: 45.2, high: 47.7, low: 45.0 } }, // Step 5: add candle 5 - acceleration down
        { 5: { open: 45.2, close: 46.8, high: 47.1, low: 45.0 } }, // Step 6: add candle 6 - bounce attempt
        { 6: { open: 46.8, close: 43.5, high: 47.0, low: 43.3 } }, // Step 7: add candle 7 - failed bounce - continuation down
        { 7: { open: 43.5, close: 45.8, high: 46.1, low: 43.3 } }, // Step 8: add candle 8 - major reversal signal
        { 8: { open: 45.8, close: 48.5, high: 48.8, low: 45.6 } }, // Step 9: add candle 9 - strong recovery
        { 9: { open: 48.5, close: 52.2, high: 52.5, low: 48.3 } }, // Step 10: add candle 10 - breakout to new highs
        { 10: { open: 52.2, close: 56.8, high: 57.1, low: 52.0 } }, // Step 11: add candle 11 - parabolic move
        { 11: { open: 56.8, close: 58.5, high: 58.8, low: 56.6 } }, // Step 12: add candle 12 - final climax
        { 12: { open: 58.5, close: 70.8, high: 70.8, low: 58.4 } }, // Step 12: add candle 12 - final climax
        { 12: { close: 65.8, high: 70.8, low: 58.4 } } // Step 12: add candle 12 - final climax
    ]
};
