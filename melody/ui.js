// UI Manipulation Functions

function updateScore() {
    // No score display needed
}

function updateFPSDisplay(fps) {
    const fpsElement = document.getElementById('fps-value');
    if (fpsElement) {
        fpsElement.textContent = fps;
        
        // Color code based on performance
        const counter = document.getElementById('fps-counter');
        if (counter) {
            if (fps >= 50) {
                counter.className = counter.className.replace(/text-\w+-\d+/g, '') + ' text-green-400';
            } else if (fps >= 30) {
                counter.className = counter.className.replace(/text-\w+-\d+/g, '') + ' text-yellow-400';
            } else {
                counter.className = counter.className.replace(/text-\w+-\d+/g, '') + ' text-red-400';
            }
        }
    }
}

function showMessage(text, duration = 2000) {
    // Create temporary message element
    const message = document.createElement('div');
    message.className = 'absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg pointer-events-none backdrop-blur-sm border border-white/20';
    message.textContent = text;
    
    const container = document.getElementById('ui-container');
    container.appendChild(message);
    
    // Animate in
    message.style.opacity = '0';
    message.style.transform = 'translate(-50%, 0) translateY(20px)';
    
    requestAnimationFrame(() => {
        message.style.transition = 'all 0.3s ease-out';
        message.style.opacity = '1';
        message.style.transform = 'translate(-50%, 0) translateY(0px)';
    });
    
    // Remove after duration
    setTimeout(() => {
        message.style.transition = 'all 0.3s ease-in';
        message.style.opacity = '0';
        message.style.transform = 'translate(-50%, 0) translateY(20px)';
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 300);
    }, duration);
}

function addFloatingText(text, position, color = '#ffffff') {
    const floatingText = document.createElement('div');
    floatingText.className = 'absolute pointer-events-none font-bold text-lg';
    floatingText.style.color = color;
    floatingText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    floatingText.textContent = text;
    
    // Convert 3D position to screen coordinates
    const vector = position.clone();
    vector.project(gameState.camera);
    
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
    
    floatingText.style.left = x + 'px';
    floatingText.style.top = y + 'px';
    floatingText.style.transform = 'translate(-50%, -50%)';
    
    const container = document.getElementById('ui-container');
    container.appendChild(floatingText);
    
    // Animate upward and fade out
    let startTime = Date.now();
    const duration = 1500;
    
    function animateFloat() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
            return;
        }
        
        const newY = y - progress * 50;
        const opacity = 1 - progress;
        
        floatingText.style.top = newY + 'px';
        floatingText.style.opacity = opacity;
        
        requestAnimationFrame(animateFloat);
    }
    
    requestAnimationFrame(animateFloat);
}

function updateInventoryUI() {
    const inventoryContainer = document.getElementById('inventory');
    if (!inventoryContainer) return;
    
    // Show/hide play button based on inventory
    const playButton = document.getElementById('sequence-toggle');
    if (playButton) {
        if (gameState.inventory.length > 0) {
            playButton.style.opacity = '1';
            playButton.style.pointerEvents = 'auto';
        } else {
            playButton.style.opacity = '0';
            playButton.style.pointerEvents = 'none';
        }
    }
    
    // Clear existing slots
    inventoryContainer.innerHTML = '';
    
    // Create slots for collected items only, plus one empty slot
    const slotsToShow = Math.min(gameState.inventory.length + (gameState.inventory.length < gameState.maxInventorySize ? 1 : 0), gameState.maxInventorySize);
    
    for (let i = 0; i < slotsToShow; i++) {
        const slot = document.createElement('div');
        slot.className = 'w-14 h-14 border-2 border-white/30 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-white/60';
        
        if (i < gameState.inventory.length) {
            const note = gameState.inventory[i];
            slot.style.backgroundColor = `#${note.color.toString(16).padStart(6, '0')}40`;
            slot.style.borderColor = `#${note.color.toString(16).padStart(6, '0')}`;
            
            // Note symbol
            const symbol = document.createElement('div');
            symbol.className = 'text-white font-bold text-xl';
            symbol.textContent = note.symbol;
            slot.appendChild(symbol);
            
            // Playing indicator
            if (note.isPlaying) {
                const indicator = document.createElement('div');
                indicator.className = 'absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse';
                slot.appendChild(indicator);
                slot.style.position = 'relative';
                
                // Add playing border
                slot.style.borderColor = '#10b981';
                slot.classList.add('border-green-500');
            }
            
            // Add click handlers
            slot.addEventListener('click', () => toggleNoteLoop(note.id));
            slot.addEventListener('dblclick', () => dropNoteFromInventory(i));
        } else if (gameState.inventory.length < gameState.maxInventorySize) {
            // Empty slot (only show if not at max capacity)
            slot.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            slot.className += ' opacity-50';
            const plus = document.createElement('div');
            plus.className = 'text-white/50 text-2xl';
            plus.textContent = '+';
            slot.appendChild(plus);
        }
        
        inventoryContainer.appendChild(slot);
    }
    
    // Show inventory count if we have items
    if (gameState.inventory.length > 0) {
        const countIndicator = document.createElement('div');
        countIndicator.className = 'col-span-full text-center text-white/70 text-xs mt-2';
        countIndicator.textContent = `${gameState.inventory.length}/${gameState.maxInventorySize} notes`;
        inventoryContainer.appendChild(countIndicator);
    }
}

function toggleNoteLoop(noteId) {
    const note = gameState.inventory.find(n => n.id === noteId);
    if (!note) return;
    
    // If sequence is paused, just play the note once
    if (!gameState.isSequencePlaying) {
        playTileNote(note.noteIndex);
        highlightInventorySlot(note.id);
        return;
    }
    
    // If sequence is playing, toggle the note's state
    note.isPlaying = !note.isPlaying;
    
    // Restart the sequence with new configuration
    startNoteSequence();
    
    updateInventoryUI();
}

function highlightInventorySlot(noteId) {
    const inventoryContainer = document.getElementById('inventory');
    if (!inventoryContainer) return;
    
    // Remove existing highlights
    inventoryContainer.querySelectorAll('.slot-highlight').forEach(el => {
        el.classList.remove('slot-highlight');
    });
    
    // Find and highlight the current note slot
    const noteIndex = gameState.inventory.findIndex(note => note.id === noteId);
    if (noteIndex >= 0) {
        const slots = inventoryContainer.children;
        if (slots[noteIndex]) {
            slots[noteIndex].classList.add('slot-highlight');
            
            // Remove highlight after a short time
            setTimeout(() => {
                slots[noteIndex]?.classList.remove('slot-highlight');
            }, 200);
        }
    }
}

function dropNoteFromInventory(slotIndex) {
    if (slotIndex >= gameState.inventory.length) return;
    
    const note = gameState.inventory[slotIndex];
    
    // Drop note near player
    const dropPosition = gameState.player.currentPosition.clone();
    dropPosition.x += (Math.random() - 0.5) * 2;
    dropPosition.z += (Math.random() - 0.5) * 2;
    
    dropNote(note, dropPosition);
    
    // Remove from inventory
    gameState.inventory.splice(slotIndex, 1);
    
    // If sequence was playing, restart it with remaining notes
    if (gameState.isSequencePlaying) {
        startNoteSequence();
    }
    
    updateInventoryUI();
    
    showMessage(`Dropped ${note.symbol}`, 1000);
}

function updateUI() {
    updateScore();
    updateInventoryUI();
    updateSequenceToggle();
}

function updateSequenceToggle() {
    const toggleButton = document.getElementById('sequence-toggle');
    const toggleIcon = document.getElementById('sequence-icon');
    
    if (toggleButton && toggleIcon) {
        if (gameState.isSequencePlaying) {
            toggleIcon.textContent = '⏸️';
            toggleButton.title = 'Pause sequence';
        } else {
            toggleIcon.textContent = '▶️';
            toggleButton.title = 'Play sequence';
        }
    }
}

function setupSequenceToggle() {
    const toggleButton = document.getElementById('sequence-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            if (gameState.isSequencePlaying) {
                pauseNoteSequence();
            } else {
                resumeNoteSequence();
            }
            updateSequenceToggle();
        });
    }
    
    // Update initial state
    updateSequenceToggle();
}
