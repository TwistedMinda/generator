// Global variables
let scene, renderer, ground, lights = [], candleMeshes = [], priceUpdateTimer;

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
    
    // Add price scale markers
    createPriceScaleMarkers();

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
    // Update chart using fake data
    priceUpdateTimer = setInterval(() => {
        if (fakeData.isRunning) {
            // Handle realtime sequence differently
            if (fakeData.currentSequence === 'realtime') {
                updateRealtimeData();
            } else {
                // Handle regular sequences
                if (!fakeData.isComplete()) {
                    const nextStep = fakeData.getNextStep();
                    if (nextStep !== null) {
                        chart.rebuildFromState(nextStep.candles);
                        updateCandles();
                        updateSlider();
                    }
                }
                
                if (fakeData.isComplete()) {
                    stopPriceUpdates();
                    const startPauseBtn = document.getElementById('start-pause-btn');
                    startPauseBtn.textContent = 'Completed';
                    startPauseBtn.className = 'bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold cursor-not-allowed';
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
    
    // Update current candle every 3 seconds
    if (realtimeData.shouldUpdate()) {
        const updatedCandle = realtimeData.generatePriceMovement();
        realtimeData.lastUpdateTime = Date.now();
        
        // Update the last candle in the chart
        if (chart.candles.length > 0) {
            const lastCandle = chart.candles[chart.candles.length - 1];
            lastCandle.close = updatedCandle.close;
            lastCandle.high = updatedCandle.high;
            lastCandle.low = updatedCandle.low;
            
            // Rebuild chart to show updated candle
            chart.rebuildFromState(chart.candles);
            updateCandles();
        }
    }
    
    // Start new candle every 1 minute
    if (realtimeData.shouldStartNewCandle()) {
        realtimeData.startNewCandle();
        
        // Add new candle to chart
        const newCandle = realtimeData.getCurrentCandle();
        chart.addCandle(newCandle.open, newCandle.close, newCandle.high, newCandle.low);
        
        // Rebuild chart to show new candle
        chart.rebuildFromState(chart.candles);
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
    // Hide slider for realtime sequence
    const sliderContainer = document.querySelector('#slider-container');
    if (fakeData.currentSequence === 'realtime') {
        sliderContainer.style.display = 'none';
        return;
    } else {
        sliderContainer.style.display = 'block';
    }
    
    const progress = fakeData.getProgress();
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
        if (fakeData.isRunning) {
            // Pause
            fakeData.stop();
            stopPriceUpdates();
            startPauseBtn.textContent = 'Start';
            startPauseBtn.className = 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold mb-3 w-full';
        } else {
            // Start
            fakeData.start();
            startPriceUpdates();
            startPauseBtn.textContent = 'Pause';
            startPauseBtn.className = 'bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm font-semibold mb-3 w-full';
        }
        updateSlider();
    });
    
    // Slider control
    stepSlider.addEventListener('input', (e) => {
        const targetStep = parseInt(e.target.value);
        
        // Pause auto-advancement when manually controlling slider
        if (fakeData.isRunning) {
            fakeData.stop();
            stopPriceUpdates();
            startPauseBtn.textContent = 'Start';
            startPauseBtn.className = 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold mb-3 w-full';
        }
        
        // Jump to specific step
        const stepData = fakeData.jumpToStep(targetStep);
        if (stepData) {
            chart.rebuildFromState(stepData.candles);
            updateCandles();
        }
    });
}

function setupSequenceSelector() {
    const sequenceButtons = document.querySelectorAll('.sequence-btn');
    
    sequenceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sequenceName = button.getAttribute('data-sequence');
            
            // Load the selected sequence
            fakeData.loadSequence(sequenceName);
            
            // Update chart with new sequence
            const stepData = fakeData.getCurrentStepData();
            chart.rebuildFromState(stepData.candles);
            updateCandles();
            
            // Update slider for new sequence
            updateSlider();
            
            // Update button styles
            updateSequenceButtonStyles();
        });
    });
    
    // Set initial active state
    updateSequenceButtonStyles();
}

function updateSequenceButtonStyles() {
    const buttons = document.querySelectorAll('.sequence-btn');
    buttons.forEach(button => {
        const sequenceName = button.getAttribute('data-sequence');
        
        if (fakeData.currentSequence === sequenceName) {
            button.classList.remove('bg-gradient-to-br', 'from-slate-800', 'via-slate-700', 'to-slate-800', 'hover:from-slate-700', 'hover:via-slate-600', 'hover:to-slate-700', 'border-slate-600/40', 'hover:border-slate-500/60', 'hover:shadow-purple-500/20');
            button.classList.add('bg-gradient-to-br', 'from-purple-600', 'via-purple-500', 'to-purple-600', 'hover:from-purple-500', 'hover:via-purple-400', 'hover:to-purple-500', 'border-purple-400/60', 'hover:border-purple-300/80', 'hover:shadow-purple-400/30', 'animate-pulse');
        } else {
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

function createPriceScaleMarkers() {
    // Create price markers at key levels
    const pricelevels = [30, 40, 50, 60, 70]; // Price levels to show
    const markerX = -2; // Position to the left of candles
    
    pricelevels.forEach(price => {
        const worldY = priceScale.priceToWorldY(price);
        
        // Create a small sphere marker
        const markerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: price === 50 ? 0xffff00 : 0x888888 // Yellow for $50 (base), gray for others
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(markerX, worldY, 0);
        scene.add(marker);
        
        // Create a line extending to the right
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(markerX + 0.1, worldY, 0),
            new THREE.Vector3(markerX + 0.5, worldY, 0)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: price === 50 ? 0xffff00 : 0x444444,
            opacity: 0.7,
            transparent: true
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        
        // Create price text label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Enable crisp text rendering
        context.imageSmoothingEnabled = false;
        context.textRenderingOptimization = 'optimizeSpeed';
        
        context.fillStyle = price === 50 ? '#ffff00' : '#888888';
        context.font = 'bold 64px Arial';
        context.textAlign = 'right';
        context.fillText(`$${price}`, 480, 90);
        
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
    });
    
    // Add reference lines for top and bottom of current range
    const topPrice = 70;
    const bottomPrice = 30;
    const topY = priceScale.priceToWorldY(topPrice);
    const bottomY = priceScale.priceToWorldY(bottomPrice);
    
    // Create horizontal reference lines across the scene
    [topY, bottomY].forEach((y, index) => {
        const refLineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-1.5, y, 0),
            new THREE.Vector3(4, y, 0)
        ]);
        const refLineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x333333,
            opacity: 0.3,
            transparent: true
        });
        const refLine = new THREE.Line(refLineGeometry, refLineMaterial);
        scene.add(refLine);
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
    
    renderer.render(scene, camera);
}
