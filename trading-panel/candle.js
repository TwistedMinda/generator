// Candle creation functions

function createCandle(openPrice, closePrice, highPrice, lowPrice, position = { x: 0, y: 0, z: 0 }, isActive = false) {
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
    let bodyColor;
    
    if (isActive) {
        // Current/unfinished candle - use brighter, more saturated colors
        bodyColor = isBullish ? 0x00ffaa : 0xff6666;
    } else {
        // Completed candle - use standard colors
        bodyColor = isBullish ? 0x00ff88 : 0xff4444;
    }
    
    // Calculate body dimensions in world coordinates
    const bodyHeight = Math.abs(worldPrices.close - worldPrices.open);
    const bodyWidth = 0.8;
    const bodyDepth = 0.4;
    
    // Create more rectangular candle body using CylinderGeometry with more segments
    const bodyGeometry = new THREE.CylinderGeometry(bodyWidth / 2, bodyWidth / 2, bodyHeight, 16);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
        color: bodyColor,
        transparent: true,
        opacity: isActive ? 0.9 : 0.6,
        emissive: isActive ? bodyColor : 0x000000,
        emissiveIntensity: isActive ? 0.1 : 0
    });
    const candleBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Position body relative to entry price (openPrice = 0 in group coordinates)
    const worldPriceMovement = worldPrices.close - worldPrices.open;
    candleBody.position.y = worldPriceMovement / 2;
    candleBody.castShadow = true;
    candleBody.receiveShadow = true;
    
    // Create wicks with rounded appearance
    const bodyTop = Math.max(worldPriceMovement, 0);
    const highOffset = worldPrices.high - worldPrices.open;
    const upperWickHeight = highOffset - bodyTop;
    if (upperWickHeight > 0) {
        const upperWickGeometry = new THREE.CylinderGeometry(0.05, 0.05, upperWickHeight, 8);
        const upperWickMaterial = new THREE.MeshLambertMaterial({ 
            color: isActive ? 0xffffff : 0xcccccc,
            emissive: isActive ? 0x333333 : 0x000000,
            emissiveIntensity: isActive ? 0.2 : 0
        });
        const upperWick = new THREE.Mesh(upperWickGeometry, upperWickMaterial);
        upperWick.position.y = bodyTop + upperWickHeight / 2;
        candleGroup.add(upperWick);
    }
    
    const bodyBottom = Math.min(worldPriceMovement, 0);
    const lowOffset = worldPrices.low - worldPrices.open;
    const lowerWickHeight = bodyBottom - lowOffset;
    if (lowerWickHeight > 0) {
        const lowerWickGeometry = new THREE.CylinderGeometry(0.05, 0.05, lowerWickHeight, 8);
        const lowerWickMaterial = new THREE.MeshLambertMaterial({ 
            color: isActive ? 0xffffff : 0xcccccc,
            emissive: isActive ? 0x333333 : 0x000000,
            emissiveIntensity: isActive ? 0.2 : 0
        });
        const lowerWick = new THREE.Mesh(lowerWickGeometry, lowerWickMaterial);
        lowerWick.position.y = bodyBottom - lowerWickHeight / 2;
        candleGroup.add(lowerWick);
    }
    
    // Add body to group
    candleGroup.add(candleBody);
    
    // Entry price sphere with active state highlight
    const centerMarkerGeometry = new THREE.SphereGeometry(0.05, 12, 12);
    const centerMarkerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: isActive ? 1.0 : 0.8
    });
    const centerMarker = new THREE.Mesh(centerMarkerGeometry, centerMarkerMaterial);
    centerMarker.position.set(0, 0, 0);
    
    // Add flashing animation data for active candle
    if (isActive) {
        centerMarker.userData = {
            flashSpeed: 0.01,
            originalOpacity: 1.0,
            isActive: true
        };
    }
    
    candleGroup.add(centerMarker);
    
    // Store position for wick tap detection
    candleGroup.userData = {
        position: position,
        isActive: isActive
    };
    
    // Position the entire candle group
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
