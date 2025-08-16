// Candle creation functions

function createCandle(openPrice, closePrice, highPrice, lowPrice, position = { x: 0, y: 0, z: 0 }) {
    // Create group to hold all candle parts
    const candleGroup = new THREE.Group();
    
    // Convert prices to world coordinates
    const worldPrices = priceScale.candleToWorld({
        open: openPrice,
        close: closePrice,
        high: highPrice,
        low: lowPrice
    });
    
    // Determine if candle is bullish (green) or bearish (red)
    const isBullish = closePrice > openPrice;
    const bodyColor = isBullish ? 0x00ff88 : 0xff4444;
    
    // Calculate body dimensions in world coordinates
    const bodyHeight = Math.abs(worldPrices.close - worldPrices.open);
    const bodyWidth = 0.8;
    const bodyDepth = 0.4;
    
    // Create candle body (rectangle)
    const bodyGeometry = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
        color: bodyColor,
        transparent: true,
        opacity: 0.6
    });
    const candleBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Position body relative to entry price (openPrice = 0 in group coordinates)
    // The body center is at the midpoint between open and close, relative to open
    const worldPriceMovement = worldPrices.close - worldPrices.open; // Where close is relative to open in world coords
    candleBody.position.y = worldPriceMovement / 2; // Center of body relative to entry price
    candleBody.castShadow = true;
    candleBody.receiveShadow = true;
    
    // Create upper wick (from body top to high) - all relative to entry price (open) in world coordinates
    const bodyTop = Math.max(worldPriceMovement, 0); // Top of body relative to open
    const highOffset = worldPrices.high - worldPrices.open; // High relative to open in world coords
    const upperWickHeight = highOffset - bodyTop;
    if (upperWickHeight > 0) {
        const upperWickGeometry = new THREE.BoxGeometry(0.1, upperWickHeight, 0.1);
        const upperWickMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const upperWick = new THREE.Mesh(upperWickGeometry, upperWickMaterial);
        upperWick.position.y = bodyTop + upperWickHeight / 2;
        candleGroup.add(upperWick);
    }
    
    // Create lower wick (from body bottom to low) - all relative to entry price (open) in world coordinates
    const bodyBottom = Math.min(worldPriceMovement, 0); // Bottom of body relative to open
    const lowOffset = worldPrices.low - worldPrices.open; // Low relative to open in world coords
    const lowerWickHeight = bodyBottom - lowOffset;
    if (lowerWickHeight > 0) {
        const lowerWickGeometry = new THREE.BoxGeometry(0.1, lowerWickHeight, 0.1);
        const lowerWickMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const lowerWick = new THREE.Mesh(lowerWickGeometry, lowerWickMaterial);
        lowerWick.position.y = bodyBottom - lowerWickHeight / 2;
        candleGroup.add(lowerWick);
    }
    
    // Add body to group
    candleGroup.add(candleBody);
    
    // Add visual marker at group center for debugging
    const centerMarkerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const centerMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow
    const centerMarker = new THREE.Mesh(centerMarkerGeometry, centerMarkerMaterial);
    centerMarker.position.set(0, 0, 0); // At group origin
    candleGroup.add(centerMarker);
    
    // Position the entire candle group
    // The group's origin (0,0,0) represents the entry price (openPrice)
    candleGroup.position.set(position.x, position.y, position.z);
    
    return candleGroup;
}

function createSampleCandle() {
    // Create a sample candle with realistic price data
    const openPrice = 1.0;
    const closePrice = 1.5;
    const highPrice = 1.8;
    const lowPrice = 0.8;
    
    return createCandle(openPrice, closePrice, highPrice, lowPrice, { x: 0, y: 0, z: 0 });
}
