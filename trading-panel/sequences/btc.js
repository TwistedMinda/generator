// BTC Live Price Sequence
// Real-time Bitcoin price tracking with dynamic scaling

window.btcSequence = createLiveSequence({
    name: "BTC Live",
    description: "Real-time Bitcoin price tracking",
    symbol: "BTC",
    apiSymbol: "bitcoin",
    scale: {
        min: 40000,
        max: 60000,
        base: 50000,
        markers: [60000, 55000, 50000, 45000, 40000]
    }
});
