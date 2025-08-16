// Medium Test Sequence
// Extended price movement with multiple candles

window.mediumSequence = {
    name: "Medium Test",
    description: "Extended price movement with multiple candles",
    baseState: [
        { open: 50, close: 50.5, high: 50.8, low: 49.8 }
    ],
    stepChanges: [
        {}, // Step 0: no changes (base state)
        { 0: { close: 48, low: 47.7 } }, // Step 1: first drop with wick
        { 1: { open: 48, close: 49.5, high: 49.8, low: 47.9 } }, // Step 2: add candle 2 - recovery
        { 2: { open: 49.5, close: 52, high: 52.3, low: 49.3 } }, // Step 3: add candle 3 - breakout up
        { 3: { open: 52, close: 51.2, high: 52.1, low: 50.9 } }, // Step 4: add candle 4 - consolidation
        { 4: { open: 51.2, close: 49.8, high: 51.4, low: 49.5 } }, // Step 5: add candle 5 - pullback
        { 5: { open: 49.8, close: 46.5, high: 49.9, low: 46.2 } }, // Step 6: add candle 6 - strong reversal
        { 6: { open: 46.5, close: 47.8, high: 48.1, low: 46.3 } }, // Step 7: add candle 7 - bounce attempt
        { 7: { open: 47.8, close: 44.2, high: 47.9, low: 44.0 } } // Step 8: add candle 8 - final drop
    ]
};
