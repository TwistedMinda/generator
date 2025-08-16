// SOL Live Price Sequence
// Real-time Solana price tracking with dynamic scaling

window.solSequence = createLiveSequence({
    name: "SOL Live",
    description: "Real-time Solana price tracking",
    symbol: "SOL",
    apiSymbol: "solana",
    scale: {
        min: 80,
        max: 120,
        base: 100,
        markers: [120, 110, 100, 90, 80]
    }
});
