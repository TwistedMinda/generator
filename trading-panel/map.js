// Global variables
let scene, renderer, ground, lights = [], candleMeshes = [], priceUpdateTimer;
let priceScaleMarkers = []; // Track price scale markers for cleanup

function initScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('chart-container').appendChild(renderer.domElement);


    
    // Initialize chart with candles
    initChart();
    updateCandles();
    
    // Setup test controls and initial display
    setupTestControls();
    setupSequenceSelector();
    updateSlider();
    
    // Setup lighting
    setupLighting();
    
    // Price scale markers will be created when a sequence is selected
    
    // Initialize particles in scene
    const initialParticleMeshes = particleSystem.getParticleMeshes();
    initialParticleMeshes.forEach(particle => {
        scene.add(particle);
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}



function updateCandles() {
    // Remove existing candles from scene
    candleMeshes.forEach(candle => scene.remove(candle));
    candleMeshes = [];
    
    // Create new candles
    const newCandleMeshes = chart.createCandleMeshes();
    newCandleMeshes.forEach(candle => {
        scene.add(candle);
        candleMeshes.push(candle);
    });
}

function startPriceUpdates() {
    // Update chart using story data
    priceUpdateTimer = setInterval(() => {
        if (storyData.isRunning) {
            // Handle realtime sequence differently
            if (storyData.currentSequence === 'realtime') {
                updateRealtimeData();
            } else {
                // Handle regular sequences
                if (!storyData.isComplete()) {
                    const nextStep = storyData.getNextStep();
                    if (nextStep !== null) {
                        // Animate each candle to its new values
                        nextStep.candles.forEach((candleData, index) => {
                            if (index < chart.candles.length) {
                                // Animate existing candle
                                chart.animateCandleTo(index, candleData.open, candleData.close, candleData.high, candleData.low, 300);
                            } else {
                                // Add new candle if needed
                                chart.addCandle(candleData.open, candleData.close, candleData.high, candleData.low);
                            }
                        });
                        
                        // Remove extra candles if we went backwards
                        while (chart.candles.length > nextStep.candles.length) {
                            chart.candles.pop();
                        }
                        
                        updateCandles();
                        updateSlider();
                    }
                }
                
                if (storyData.isComplete()) {
                    stopPriceUpdates();
                    const startPauseBtn = document.getElementById('start-pause-btn');
                    startPauseBtn.textContent = 'Completed';
                    startPauseBtn.className = 'bg-gray-600 text-white py-2 rounded text-sm font-semibold cursor-not-allowed text-center';
                    startPauseBtn.disabled = true;
                }
            }
        }
    }, 1000); // Check every second for updates
}

function updateRealtimeData() {
    if (!realtimeData.isRunning) {
        realtimeData.start();
    }
    
    // Update current candle every 1 second
    if (realtimeData.shouldUpdate()) {
        const updatedCandle = realtimeData.generatePriceMovement();
        realtimeData.lastUpdateTime = Date.now();
        
        // Update the last candle in the chart using animation
        if (chart.candles.length > 0) {
            chart.replaceLastCandle(
                updatedCandle.open,
                updatedCandle.close,
                updatedCandle.high,
                updatedCandle.low
            );
            updateCandles();
        }
    }
    
    // Start new candle every 5 seconds
    if (realtimeData.shouldStartNewCandle()) {
        realtimeData.startNewCandle();
        
        // Add new candle to chart
        const newCandle = realtimeData.getCurrentCandle();
        chart.addCandle(newCandle.open, newCandle.close, newCandle.high, newCandle.low);
        updateCandles();
    }
}

function stopPriceUpdates() {
    if (priceUpdateTimer) {
        clearInterval(priceUpdateTimer);
        priceUpdateTimer = null;
    }
}



function updateSlider() {
    const sliderContainer = document.querySelector('#slider-container');
    
    // Hide slider if no story is selected
    if (!storyData.currentSequence) {
        sliderContainer.style.display = 'none';
        return;
    }
    
    // Hide slider for realtime sequence
    if (storyData.currentSequence === 'realtime') {
        sliderContainer.style.display = 'none';
        return;
    } else {
        sliderContainer.style.display = 'block';
    }
    
    const progress = storyData.getProgress();
    const slider = document.getElementById('step-slider');
    const maxLabel = document.querySelector('.flex.justify-between span:last-child');
    
    // Update slider max value and labels
    slider.max = progress.total;
    maxLabel.textContent = progress.total;
    
    // Update current value
    slider.value = progress.current;
}

function setupTestControls() {
    const startPauseBtn = document.getElementById('start-pause-btn');
    const stepSlider = document.getElementById('step-slider');
    
    // Initialize slider with current sequence size
    updateSlider();
    
    // Start/Pause button
    startPauseBtn.addEventListener('click', () => {
        if (storyData.isRunning) {
            // Pause
            storyData.stop();
            stopPriceUpdates();
            startPauseBtn.textContent = 'Start';
            startPauseBtn.className = 'bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-semibold text-center';
        } else {
            // Start
            storyData.start();
            startPriceUpdates();
            startPauseBtn.textContent = 'Pause';
            startPauseBtn.className = 'bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded text-sm font-semibold text-center';
        }
        updateSlider();
    });
    
    // Slider control
    stepSlider.addEventListener('input', (e) => {
        const targetStep = parseInt(e.target.value);
        
        // Pause auto-advancement when manually controlling slider
        if (storyData.isRunning) {
            storyData.stop();
            stopPriceUpdates();
            startPauseBtn.textContent = 'Start';
            startPauseBtn.className = 'bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-semibold text-center';
        }
        
        // Jump to specific step with animation
        const stepData = storyData.jumpToStep(targetStep);
        if (stepData) {
            // Animate each candle to its new values
            stepData.candles.forEach((candleData, index) => {
                if (index < chart.candles.length) {
                    // Animate existing candle
                    chart.animateCandleTo(index, candleData.open, candleData.close, candleData.high, candleData.low, 300);
                } else {
                    // Add new candle if needed
                    chart.addCandle(candleData.open, candleData.close, candleData.high, candleData.low);
                }
            });
            
            // Remove extra candles if we went backwards
            while (chart.candles.length > stepData.candles.length) {
                chart.candles.pop();
            }
            
            updateCandles();
        }
    });
}

function setupSequenceSelector() {
    const sequenceButtons = document.querySelectorAll('.sequence-btn');
    
    sequenceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sequenceName = button.getAttribute('data-sequence');
            selectSequence(sequenceName);
        });
    });
    
    // Set initial active state
    updateSequenceButtonStyles();
}

function selectSequence(sequenceName) {
    // Stop any running updates
    if (storyData.isRunning) {
        storyData.stop();
        stopPriceUpdates();
    }
    
    // Stop live intervals if they're running
    stopLiveTracking();
    
    // Reset start button to initial state
    const startPauseBtn = document.getElementById('start-pause-btn');
    startPauseBtn.textContent = 'Start';
    startPauseBtn.className = 'bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-semibold text-center';
    startPauseBtn.disabled = false;
    
    // Clear live mode flag
    window.isLiveMode = false;
    
    // Load the selected sequence
    storyData.loadSequence(sequenceName);
    
    // Update price scale based on sequence scale
    const scale = getCurrentScale();
    priceScale.updateScale(scale.min, scale.max, scale.base);
    
    // Update chart with new sequence
    const stepData = storyData.getCurrentStepData();
    chart.rebuildFromState(stepData.candles);
    updateCandles();
    
    // Update price scale markers for new sequence
    createPriceScaleMarkers();
    
    // Update slider for new sequence
    updateSlider();
    
    // Update button styles
    updateSequenceButtonStyles();
    
    // Show controls when a story is selected
    showControlsForStory();
}

function updateSequenceButtonStyles() {
    const buttons = document.querySelectorAll('.sequence-btn');
    buttons.forEach(button => {
        const sequenceName = button.getAttribute('data-sequence');
        
        if (storyData.currentSequence === sequenceName) {
            // Active state - purple gradient
            button.classList.remove('bg-gradient-to-br', 'from-slate-800', 'via-slate-700', 'to-slate-800', 'hover:from-slate-700', 'hover:via-slate-600', 'hover:to-slate-700', 'border-slate-600/40', 'hover:border-slate-500/60', 'hover:shadow-purple-500/20');
            button.classList.add('bg-gradient-to-br', 'from-purple-600', 'via-purple-500', 'to-purple-600', 'hover:from-purple-500', 'hover:via-purple-400', 'hover:to-purple-500', 'border-purple-400/60', 'hover:border-purple-300/80', 'hover:shadow-purple-400/30', 'animate-pulse');
        } else {
            // Inactive state - slate gradient
            button.classList.remove('bg-gradient-to-br', 'from-purple-600', 'via-purple-500', 'to-purple-600', 'hover:from-purple-500', 'hover:via-purple-400', 'hover:to-purple-500', 'border-purple-400/60', 'hover:border-purple-300/80', 'hover:shadow-purple-400/30', 'animate-pulse');
            button.classList.add('bg-gradient-to-br', 'from-slate-800', 'via-slate-700', 'to-slate-800', 'hover:from-slate-700', 'hover:via-slate-600', 'hover:to-slate-700', 'border-slate-600/40', 'hover:border-slate-500/60', 'hover:shadow-purple-500/20');
        }
    });
}

function setupLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    lights.push(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    lights.push(directionalLight);

    // Rim lighting for dramatic effect
    const rimLight = new THREE.DirectionalLight(0x00ffff, 0.5);
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);
    lights.push(rimLight);

    // Point light for extra sparkle
    const pointLight = new THREE.PointLight(0xff6600, 0.8, 10);
    pointLight.position.set(0, 5, 3);
    scene.add(pointLight);
    lights.push(pointLight);
}

// Get current scale settings based on active sequence or live mode
function getCurrentScale() {
    // Check if live mode is active
    if (window.isLiveMode) {
        return calculateLiveScale();
    }
    
    // Check if a sequence is loaded
    if (storyData.currentSequence) {
        const sequenceVar = window[storyData.currentSequence + 'Sequence'];
        if (sequenceVar && sequenceVar.scale) {
            return sequenceVar.scale;
        }
    }
    
    // Default fallback scale
    return {
        min: 30,
        max: 70,
        base: 50,
        markers: [30, 40, 50, 60, 70]
    };
}

// Clear existing price scale markers
function clearPriceScaleMarkers() {
    priceScaleMarkers.forEach(marker => {
        scene.remove(marker);
    });
    priceScaleMarkers = [];
}

function createPriceScaleMarkers() {
    // Clear existing price scale markers
    clearPriceScaleMarkers();
    
    const scale = getCurrentScale();
    const markerX = -4; // Position to the left of candles
    
    scale.markers.forEach(price => {
        const worldY = priceScale.priceToWorldY(price);
        
        // Create a small sphere marker
        const markerGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: price === scale.base ? 0xffff00 : 0x888888 // Yellow for base price, gray for others
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(markerX, worldY, 0);
        scene.add(marker);
        priceScaleMarkers.push(marker);
        
        // Create a line extending to the right
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(markerX + 0.3, worldY, 0),
            new THREE.Vector3(markerX + 2.5, worldY, 0)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: price === scale.base ? 0xffff00 : 0x444444,
            opacity: 0.7,
            transparent: true
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        priceScaleMarkers.push(line);
        
        // Create price text label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Enable crisp text rendering
        context.imageSmoothingEnabled = false;
        context.textRenderingOptimization = 'optimizeSpeed';
        
        context.fillStyle = price === scale.base ? '#ffff00' : '#888888';
        context.font = 'bold 64px Arial';
        context.textAlign = 'right';
        context.fillText(`$${price.toFixed(2)}`, 480, 90);
        
        const texture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const textGeometry = new THREE.PlaneGeometry(6.4, 1.6);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(markerX - 3.6, worldY, 0);
        
        scene.add(textMesh);
        priceScaleMarkers.push(textMesh);
    });
    
    // Add reference lines for top and bottom of current range
    const topPrice = scale.max;
    const bottomPrice = scale.min;
    const topY = priceScale.priceToWorldY(topPrice);
    const bottomY = priceScale.priceToWorldY(bottomPrice);
    
    // Create horizontal reference lines across the scene
    [topY, bottomY].forEach((y, index) => {
        const refLineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-3.5, y, 0),
            new THREE.Vector3(4, y, 0)
        ]);
        const refLineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x333333,
            opacity: 0.3,
            transparent: true
        });
        const refLine = new THREE.Line(refLineGeometry, refLineMaterial);
        scene.add(refLine);
        priceScaleMarkers.push(refLine);
    });
}





function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update camera controls if they exist
    if (typeof updateCamera === 'function') {
        updateCamera();
    }
    
    // Update particles
    particleSystem.update();
    
    // Check if any candles are animating and update them
    if (chart && chart.hasActiveAnimations()) {
        updateCandles();
    }
    
    // Check for wick taps
    if (chart) {
        chart.checkWickTaps();
    }
    
    // Animate flashing spheres on active candles
    candleMeshes.forEach(candle => {
        candle.children.forEach(child => {
            if (child.userData && child.userData.isActive && child.userData.flashSpeed) {
                const time = Date.now() * child.userData.flashSpeed;
                const opacity = child.userData.originalOpacity * (0.5 + 0.5 * Math.sin(time));
                child.material.opacity = opacity;
            }
        });
    });
    
    renderer.render(scene, camera);
}
