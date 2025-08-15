// Camera and input

function initCamera() {
    gameState.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    gameState.camera.position.set(gameState.player.position.x, gameState.player.position.y, gameState.player.position.z);
    setupInputHandlers();
}

function setupInputHandlers() {
    document.addEventListener('keydown', (e) => {
        gameState.keys[e.code.toLowerCase()] = true;
        if (['keyw','keya','keys','keyd'].includes(e.code.toLowerCase())) e.preventDefault();
    });
    document.addEventListener('keyup', (e) => { gameState.keys[e.code.toLowerCase()] = false; });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === document.body) {
            gameState.player.rotation.y -= e.movementX * gameState.mouse.sensitivity;
            gameState.player.rotation.x -= e.movementY * gameState.mouse.sensitivity;
            gameState.player.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, gameState.player.rotation.x));
        }
    });

    document.addEventListener('click', () => {
        if (document.pointerLockElement !== document.body) document.body.requestPointerLock();
        pulseBlast();
    });

    window.addEventListener('resize', () => {
        gameState.camera.aspect = window.innerWidth / window.innerHeight;
        gameState.camera.updateProjectionMatrix();
        gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function updateCamera(delta) {
    const speed = gameState.player.speed * delta;
    const dir = new THREE.Vector3();
    const yaw = gameState.player.rotation.y;
    if (gameState.keys['keyw']) { dir.x -= Math.sin(yaw) * speed; dir.z -= Math.cos(yaw) * speed; }
    if (gameState.keys['keys']) { dir.x += Math.sin(yaw) * speed; dir.z += Math.cos(yaw) * speed; }
    if (gameState.keys['keya']) { dir.x -= Math.cos(yaw) * speed; dir.z += Math.sin(yaw) * speed; }
    if (gameState.keys['keyd']) { dir.x += Math.cos(yaw) * speed; dir.z -= Math.sin(yaw) * speed; }

    const newPos = { x: gameState.player.position.x + dir.x, y: 1.8, z: gameState.player.position.z + dir.z };
    if (!checkBuildingCollision(newPos)) {
        gameState.player.position.x = newPos.x;
        gameState.player.position.z = newPos.z;
    }

    gameState.camera.position.set(gameState.player.position.x, 1.8, gameState.player.position.z);
    gameState.camera.rotation.order = 'YXZ';
    gameState.camera.rotation.x = gameState.player.rotation.x;
    gameState.camera.rotation.y = gameState.player.rotation.y;
}

function checkBuildingCollision(newPosition) {
    const radius = 0.35;
    for (const b of gameState.buildings) {
        const box = new THREE.Box3().setFromObject(b);
        box.expandByScalar(radius);
        if (box.containsPoint(new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z))) return true;
    }
    return false;
}

function getCameraDirection() {
    const v = new THREE.Vector3(0,0,-1);
    v.applyQuaternion(gameState.camera.quaternion);
    return v;
}


