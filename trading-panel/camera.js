// Camera variables
let camera, controls;

function initCamera() {
    // Create perspective camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0.6, 0, 20); // Position at $50 level (y=0)
    
    // Create orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0.6, 0, 0); // Center view at $50 level between candles
    controls.update();
}

function updateCamera() {
    // Follow the latest candle horizontally
    if (chart && chart.candles.length > 0) {
        const lastCandleIndex = chart.candles.length - 1;
        const lastCandlePosition = chart.getCandlePosition(lastCandleIndex);
        
        // Calculate target position (center on the latest candle)
        const targetX = lastCandlePosition.x;
        const targetY = lastCandlePosition.y; // Follow the candle's Y position too
        
        // Smoothly move camera and target to follow the latest candle
        const cameraSpeed = 0.1; // Adjust for smoother/faster following
        
        // Update camera position
        camera.position.x += (targetX - camera.position.x) * cameraSpeed;
        camera.position.y += (targetY - camera.position.y) * cameraSpeed;
        
        // Update controls target
        controls.target.x += (targetX - controls.target.x) * cameraSpeed;
        controls.target.y += (targetY - controls.target.y) * cameraSpeed;
    }
    
    controls.update();
}


