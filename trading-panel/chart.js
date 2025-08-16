// Chart logic for managing candles

class Chart {
    constructor() {
        this.candles = [];
        this.candleSpacing = 1.2; // Distance between candles on X axis
        this.baseLevel = 50; // Base price level ($50) where first candle's entry price sits
    }

    // Add a candle to the chart
    addCandle(openPrice, closePrice, highPrice, lowPrice) {
        const candleData = {
            open: openPrice,
            close: closePrice,
            high: highPrice,
            low: lowPrice,
            index: this.candles.length
        };
        
        this.candles.push(candleData);
        return candleData;
    }

    // Get the position for a candle based on its index
    getCandlePosition(index) {
        const x = index * this.candleSpacing;
        
        if (index === 0) {
            // First candle: position so entry price (group origin) is at baseLevel
            const y = priceScale.priceToWorldY(this.baseLevel);
            return { x, y, z: 0 };
        } else {
            // Subsequent candles: position so entry price (group origin) aligns with previous exit price
            const prevCandle = this.candles[index - 1];
            
            // Previous candle's exit price in world coordinates
            const prevExitPrice = prevCandle.close;
            const prevExitWorldY = priceScale.priceToWorldY(prevExitPrice);
            
            // Current candle's entry price (group origin) should be at previous exit price
            const y = prevExitWorldY;
            
            return { x, y, z: 0 };
        }
    }

    // Get the exit price position of the last candle
    getLastCandleExitPosition() {
        if (this.candles.length === 0) {
            return { x: 0, y: priceScale.priceToWorldY(this.baseLevel), z: 0, price: this.baseLevel };
        }

        const lastCandle = this.candles[this.candles.length - 1];
        const lastPosition = this.getCandlePosition(this.candles.length - 1);
        
        // Since the group origin is the entry price, exit price is offset by price movement in world coordinates
        const worldPriceMovement = priceScale.priceToWorldY(lastCandle.close) - priceScale.priceToWorldY(lastCandle.open);
        const exitPriceY = lastPosition.y + worldPriceMovement;
        
        return {
            x: lastPosition.x,
            y: exitPriceY,
            z: lastPosition.z,
            price: lastCandle.close
        };
    }

    // Get the position where the next candle should be placed
    getNextCandlePosition(nextCandleOpenPrice, nextCandleClosePrice) {
        const lastExitPos = this.getLastCandleExitPosition();
        const nextIndex = this.candles.length;
        const nextX = nextIndex * this.candleSpacing;
        
        // Position next candle so its entry price (group origin) aligns with previous exit price
        const y = lastExitPos.y;
        
        return { x: nextX, y, z: 0 };
    }

    // Create all 3D candle meshes and return them
    createCandleMeshes() {
        const candleMeshes = [];
        
        for (let i = 0; i < this.candles.length; i++) {
            const candleData = this.candles[i];
            const position = this.getCandlePosition(i);
            
            // Check if this candle is animating and use animated values
            const animatedValues = this.getAnimatedCandleValues(i);
            const valuesToUse = animatedValues || candleData;
            
            // Create the candle mesh with current (possibly animated) values
            const candleMesh = createCandle(
                valuesToUse.open,
                valuesToUse.close,
                valuesToUse.high,
                valuesToUse.low,
                position
            );
            
            candleMeshes.push(candleMesh);
        }
        
        // Add current price line for the last candle
        if (this.candles.length > 0) {
            const lastCandle = this.candles[this.candles.length - 1];
            const lastPosition = this.getCandlePosition(this.candles.length - 1);
            
            // Use animated close price if animating
            const animatedValues = this.getAnimatedCandleValues(this.candles.length - 1);
            const closePrice = animatedValues ? animatedValues.close : lastCandle.close;
            
            const currentPriceLine = this.createCurrentPriceLine(closePrice, lastPosition);
            candleMeshes.push(currentPriceLine);
        }
        
        return candleMeshes;
    }

    // Get chart statistics
    getStats() {
        if (this.candles.length === 0) return null;
        
        const lastCandle = this.candles[this.candles.length - 1];
        const firstCandle = this.candles[0];
        
        return {
            candleCount: this.candles.length,
            startPrice: firstCandle.open,
            currentPrice: lastCandle.close,
            priceChange: lastCandle.close - firstCandle.open,
            lastExitPosition: this.getLastCandleExitPosition()
        };
    }

    // Replace the last candle with new data
    replaceLastCandle(open, close, high, low) {
        if (this.candles.length === 0) return false;
        
        const lastCandleIndex = this.candles.length - 1;
        const lastCandle = this.candles[lastCandleIndex];
        
        // Start smooth animation to new values
        this.animateCandleTo(lastCandleIndex, open, close, high, low);
        
        return true;
    }
    
    // Animate a candle to new values smoothly
    animateCandleTo(candleIndex, targetOpen, targetClose, targetHigh, targetLow, duration = 500) {
        const candle = this.candles[candleIndex];
        if (!candle) return;
        
        // Store current values as starting point
        const startValues = {
            open: candle.open,
            close: candle.close,
            high: candle.high,
            low: candle.low
        };
        
        // Store target values
        const targetValues = {
            open: targetOpen,
            close: targetClose,
            high: targetHigh,
            low: targetLow
        };
        
        // Create animation data
        const animation = {
            startTime: Date.now(),
            duration: duration,
            startValues: startValues,
            targetValues: targetValues,
            isActive: true
        };
        
        // Store animation on the candle itself
        candle.animation = animation;
        
        // Update the candle data to target values immediately (for positioning)
        candle.open = targetOpen;
        candle.close = targetClose;
        candle.high = targetHigh;
        candle.low = targetLow;
    }
    
    // Get current animated values for a candle
    getAnimatedCandleValues(candleIndex) {
        const candle = this.candles[candleIndex];
        if (!candle || !candle.animation || !candle.animation.isActive) {
            return null; // No animation active
        }
        
        const anim = candle.animation;
        const elapsed = Date.now() - anim.startTime;
        const progress = Math.min(elapsed / anim.duration, 1);
        
        // Use ease-out cubic for smooth animation
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        // Interpolate between start and target values
        const currentValues = {
            open: this.lerp(anim.startValues.open, anim.targetValues.open, easedProgress),
            close: this.lerp(anim.startValues.close, anim.targetValues.close, easedProgress),
            high: this.lerp(anim.startValues.high, anim.targetValues.high, easedProgress),
            low: this.lerp(anim.startValues.low, anim.targetValues.low, easedProgress)
        };
        
        // Mark animation as complete if finished
        if (progress >= 1) {
            anim.isActive = false;
            delete candle.animation;
        }
        
        return currentValues;
    }
    
    // Linear interpolation helper
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    // Check if any candles are currently animating
    hasActiveAnimations() {
        return this.candles.some(candle => candle.animation && candle.animation.isActive);
    }

    // Rebuild chart from complete state
    rebuildFromState(candleStates) {
        this.candles = [];
        // Clear any ongoing animations
        candleStates.forEach(candle => {
            this.addCandle(candle.open, candle.close, candle.high, candle.low);
        });
    }

    // Create a horizontal line showing current price level
    createCurrentPriceLine(currentPrice, candlePosition) {
        const worldPrice = priceScale.priceToWorldY(currentPrice);
        const lineLength = 1.5; // Extend 1.5 units to the right
        
        // Create horizontal line geometry
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(candlePosition.x - 0.2, worldPrice, 0),
            new THREE.Vector3(candlePosition.x + lineLength, worldPrice, 0)
        ]);
        
        // Create glowing material for the price line
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ff00, // Bright green
            linewidth: 3,
            transparent: true,
            opacity: 0.8
        });
        
        const priceLine = new THREE.Line(lineGeometry, lineMaterial);
        
        // Add a small sphere at the end (right side) to make it more visible
        const sphereGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const sphereMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.9
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(candlePosition.x + lineLength, worldPrice, 0);
        
        // Create price text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Enable crisp text rendering
        context.imageSmoothingEnabled = false;
        context.textRenderingOptimization = 'optimizeSpeed';
        
        context.fillStyle = '#00ff00';
        context.font = 'bold 80px Arial';
        context.textAlign = 'left';
        context.fillText(`$${currentPrice.toFixed(2)}`, 20, 90);
        
        const texture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const textGeometry = new THREE.PlaneGeometry(4.0, 1.0);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(candlePosition.x + lineLength + 2.0, worldPrice + 0.1, 0);
        
        // Group the line, sphere, and text together
        const priceLineGroup = new THREE.Group();
        priceLineGroup.add(priceLine);
        priceLineGroup.add(sphere);
        priceLineGroup.add(textMesh);
        
        return priceLineGroup;
    }



    // Debug function to log candle positions
    debugPositions() {
        console.log('Chart Debug - Candle Positions:');
        for (let i = 0; i < this.candles.length; i++) {
            const candle = this.candles[i];
            const position = this.getCandlePosition(i);
            console.log(`Candle ${i}: Open=${candle.open}, Close=${candle.close}, Position=(${position.x}, ${position.y}, ${position.z})`);
        }
        const exitPos = this.getLastCandleExitPosition();
        console.log(`Last Exit Position: (${exitPos.x}, ${exitPos.y}, ${exitPos.z}) Price=${exitPos.price}`);
    }
}

// Global chart instance
let chart = new Chart();

// Initialize with sample data
function initChart() {
    // Initialize with step 0 data
    const initialData = fakeData.getCurrentStepData();
    chart.rebuildFromState(initialData.candles);
    
    return chart;
}

// Helper function to get the chart instance
function getChart() {
    return chart;
}
