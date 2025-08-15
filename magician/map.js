// Map creation - devastated city with dark forest ambiance

function createMap() {
    // Dark fog for dramatic atmosphere
    gameState.scene.fog = new THREE.Fog(0x0a0a0a, 15, 60);
    
    // Ground
    createGround();
    
    // Buildings
    createBuildings();
    
    // Trees
    createTrees();
    
    // Ambient lighting
    setupLighting();
    
    // Particles in air
    createAmbientParticles();
}

function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x4a3520, // Lighter brown for visibility
        transparent: false
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    gameState.scene.add(ground);
    
    // Add cracks and debris
    for (let i = 0; i < 50; i++) {
        const crackGeometry = new THREE.PlaneGeometry(
            Math.random() * 3 + 1, 
            Math.random() * 0.2 + 0.1
        );
        const crackMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x1a1a1a,
            transparent: true,
            opacity: 0.6
        });
        
        const crack = new THREE.Mesh(crackGeometry, crackMaterial);
        crack.position.set(
            (Math.random() - 0.5) * 100,
            0.01,
            (Math.random() - 0.5) * 100
        );
        crack.rotation.x = -Math.PI / 2;
        crack.rotation.z = Math.random() * Math.PI;
        gameState.scene.add(crack);
    }
}

function createBuildings() {
    const buildingPositions = [
        { x: 15, z: 20 }, { x: -20, z: 15 }, { x: 25, z: -10 },
        { x: -15, z: -25 }, { x: 35, z: 5 }, { x: -30, z: -5 },
        { x: 10, z: -35 }, { x: -25, z: 30 }
    ];
    
    buildingPositions.forEach(pos => {
        const height = Math.random() * 15 + 8;
        const width = Math.random() * 6 + 4;
        const depth = Math.random() * 6 + 4;
        
        // Main building
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x6a6a6a, // Lighter buildings for visibility
            transparent: false
        });
        
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(pos.x, height / 2, pos.z);
        building.castShadow = true;
        building.receiveShadow = true;
        gameState.scene.add(building);
        gameState.buildings.push(building); // Store for collision detection
        
        // Damage effects
        if (Math.random() > 0.5) {
            const debrisCount = 3 + Math.floor(Math.random() * 5);
            for (let i = 0; i < debrisCount; i++) {
                const debrisGeometry = new THREE.BoxGeometry(
                    Math.random() * 0.5 + 0.2,
                    Math.random() * 0.5 + 0.2,
                    Math.random() * 0.5 + 0.2
                );
                const debrisMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
                
                const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
                debris.position.set(
                    pos.x + (Math.random() - 0.5) * width * 2,
                    Math.random() * 2,
                    pos.z + (Math.random() - 0.5) * depth * 2
                );
                debris.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                debris.castShadow = true;
                gameState.scene.add(debris);
            }
        }
        
        // Broken windows (glowing slightly)
        const windowCount = Math.floor(height / 3);
        for (let i = 0; i < windowCount; i++) {
            if (Math.random() > 0.3) {
                const windowGeometry = new THREE.PlaneGeometry(0.8, 1.2);
                const windowMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x444400,
                    transparent: true,
                    opacity: 0.3
                });
                
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(
                    pos.x + width / 2 + 0.1,
                    i * 3 + 2,
                    pos.z + (Math.random() - 0.5) * depth * 0.8
                );
                gameState.scene.add(window);
            }
        }
    });
}

function createTrees() {
    for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 40;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        // Tree trunk - nature reclaiming
        const trunkHeight = 4 + Math.random() * 6;
        const trunkGeometry = new THREE.CylinderGeometry(
            0.2 + Math.random() * 0.3,
            0.4 + Math.random() * 0.3,
            trunkHeight
        );
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3429 });
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, trunkHeight / 2, z);
        trunk.castShadow = true;
        gameState.scene.add(trunk);
        gameState.buildings.push(trunk); // Trees are solid obstacles too
        
        // Green canopy - nature's return
        const canopyGeometry = new THREE.SphereGeometry(1.5 + Math.random() * 1.5);
        const canopyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22, // Forest green
            transparent: true,
            opacity: 0.8
        });
        
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.set(
            x + (Math.random() - 0.5) * 0.5,
            trunkHeight + canopy.geometry.parameters.radius * 0.7,
            z + (Math.random() - 0.5) * 0.5
        );
        canopy.castShadow = true;
        gameState.scene.add(canopy);
        
        // Living branches with small leaves
        const branchCount = 3 + Math.floor(Math.random() * 4);
        for (let j = 0; j < branchCount; j++) {
            const branchGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.8 + Math.random() * 0.7);
            const branch = new THREE.Mesh(branchGeometry, trunkMaterial);
            
            const branchX = x + (Math.random() - 0.5) * 3;
            const branchY = trunkHeight * 0.6 + Math.random() * trunkHeight * 0.4;
            const branchZ = z + (Math.random() - 0.5) * 3;
            
            branch.position.set(branchX, branchY, branchZ);
            branch.rotation.set(
                Math.random() * 0.3,
                Math.random() * Math.PI * 2,
                Math.random() * 0.3
            );
            gameState.scene.add(branch);
            
            // Small leaf clusters on branches
            if (Math.random() > 0.3) {
                const leafGeometry = new THREE.SphereGeometry(0.2 + Math.random() * 0.2);
                const leafMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0x32CD32, // Lime green
                    transparent: true,
                    opacity: 0.7
                });
                
                const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
                leaves.position.set(
                    branchX + (Math.random() - 0.5) * 0.5,
                    branchY + 0.2,
                    branchZ + (Math.random() - 0.5) * 0.5
                );
                gameState.scene.add(leaves);
            }
        }
        
        // Small bushes around some trees
        if (Math.random() > 0.6) {
            const bushGeometry = new THREE.SphereGeometry(0.5 + Math.random() * 0.5);
            const bushMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x006400, // Dark green
                transparent: true,
                opacity: 0.9
            });
            
            const bush = new THREE.Mesh(bushGeometry, bushMaterial);
            bush.position.set(
                x + (Math.random() - 0.5) * 4,
                bush.geometry.parameters.radius * 0.8,
                z + (Math.random() - 0.5) * 4
            );
            gameState.scene.add(bush);
        }
    }
}

function setupLighting() {
    // Much darker ambient light for dramatic fireball lighting
    gameState.lights.ambient = new THREE.AmbientLight(0x202020, 0.2);
    gameState.scene.add(gameState.lights.ambient);
    
    // Dim moonlight for subtle background
    gameState.lights.directional = new THREE.DirectionalLight(0x4444ff, 0.3);
    gameState.lights.directional.position.set(-50, 50, 30);
    gameState.lights.directional.castShadow = true;
    gameState.lights.directional.shadow.mapSize.width = 1024;
    gameState.lights.directional.shadow.mapSize.height = 1024;
    gameState.lights.directional.shadow.camera.near = 0.5;
    gameState.lights.directional.shadow.camera.far = 500;
    gameState.lights.directional.shadow.camera.left = -50;
    gameState.lights.directional.shadow.camera.right = 50;
    gameState.lights.directional.shadow.camera.top = 50;
    gameState.lights.directional.shadow.camera.bottom = -50;
    gameState.scene.add(gameState.lights.directional);
}

function createAmbientParticles() {
    // Floating ash/dust particles - reduced count
    for (let i = 0; i < 30; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.02 + Math.random() * 0.03);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x666666,
            transparent: true,
            opacity: 0.3 + Math.random() * 0.3
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(
            (Math.random() - 0.5) * 100,
            Math.random() * 20,
            (Math.random() - 0.5) * 100
        );
        
        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                Math.random() * 0.01,
                (Math.random() - 0.5) * 0.02
            ),
            originalY: particle.position.y
        };
        
        gameState.scene.add(particle);
        gameState.particleSystems.push(particle);
    }
}
