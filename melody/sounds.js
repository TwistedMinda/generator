// Sound System using Web Audio API Oscillators

function initAudio() {
    try {
        gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain node for volume control
        gameState.masterGain = gameState.audioContext.createGain();
        gameState.masterGain.connect(gameState.audioContext.destination);
        gameState.masterGain.gain.setValueAtTime(0.7, gameState.audioContext.currentTime);
        
    } catch (e) {
        console.warn('Web Audio API not supported');
        return false;
    }
    return true;
}

function playTileNote(tileIndex) {
    if (!gameState.audioContext) {
        console.warn('Audio context not available');
        return;
    }
    
    // Resume audio context if suspended (browser requirement)
    if (gameState.audioContext.state === 'suspended') {
        gameState.audioContext.resume().then(() => {
            playTileNoteInternal(tileIndex);
        }).catch(err => {
            console.error('Failed to resume audio context:', err);
        });
        return;
    }
    
    playTileNoteInternal(tileIndex);
}

function playTileNoteInternal(tileIndex) {
    // Calculate note frequency using pentatonic scale
    const scaleNote = CONSTANTS.SCALES.PENTATONIC[tileIndex % CONSTANTS.SCALES.PENTATONIC.length];
    const octave = Math.floor(tileIndex / CONSTANTS.SCALES.PENTATONIC.length);
    const frequency = CONSTANTS.BASE_FREQUENCY * Math.pow(2, (scaleNote + octave * 12) / 12);
    
    // Create oscillator
    const oscillator = gameState.audioContext.createOscillator();
    const gainNode = gameState.audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(gameState.masterGain || gameState.audioContext.destination);
    
    // Configure oscillator
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, gameState.audioContext.currentTime);
    
    // Configure envelope (attack, decay, sustain, release)
    const now = gameState.audioContext.currentTime;
    const attackTime = 0.05;
    const decayTime = 0.1;
    const sustainLevel = 0.3;
    const releaseTime = 0.2;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel, now + CONSTANTS.NOTE_DURATION - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, now + CONSTANTS.NOTE_DURATION);
    
    // Start and stop
    oscillator.start(now);
    oscillator.stop(now + CONSTANTS.NOTE_DURATION);
    
    // Add harmonic for richness
    const harmonic = gameState.audioContext.createOscillator();
    const harmonicGain = gameState.audioContext.createGain();
    
    harmonic.connect(harmonicGain);
    harmonicGain.connect(gameState.masterGain || gameState.audioContext.destination);
    
    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(frequency * 2, now); // Octave higher
    
    harmonicGain.gain.setValueAtTime(0, now);
    harmonicGain.gain.linearRampToValueAtTime(0.1, now + attackTime);
    harmonicGain.gain.linearRampToValueAtTime(0.05, now + attackTime + decayTime);
    harmonicGain.gain.setValueAtTime(0.05, now + CONSTANTS.NOTE_DURATION - releaseTime);
    harmonicGain.gain.linearRampToValueAtTime(0, now + CONSTANTS.NOTE_DURATION);
    
    harmonic.start(now);
    harmonic.stop(now + CONSTANTS.NOTE_DURATION);
}

function playSimpleTileSound(tileIndex) {
    if (!gameState.audioContext || gameState.audioContext.state !== 'running') return;
    
    // Lower, more peaceful frequency range
    const baseFreq = 300; // Lower base frequency
    const variant = (tileIndex % 8) * 12; // Smaller frequency steps
    const frequency = baseFreq + variant;
    
    const osc = gameState.audioContext.createOscillator();
    const gain = gameState.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(gameState.audioContext.destination);
    
    osc.frequency.value = frequency;
    osc.type = 'triangle'; // Softer, warmer sound than sine
    
    // Gentle envelope for peaceful sound
    const now = gameState.audioContext.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02); // Gentle fade in
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15); // Gentle fade out
    
    osc.start();
    osc.stop(now + 0.15);
}

// Legacy functions - now handled by sequence system
function startLoopingNote(noteId) {
    // This is now handled by the sequence system
    startNoteSequence();
}

function stopLoopingNote(noteId) {
    // This is now handled by the sequence system
    const note = gameState.inventory.find(n => n.id === noteId);
    if (note) {
        note.isPlaying = false;
        // Only restart sequence if it was already playing
        if (gameState.isSequencePlaying) {
            startNoteSequence();
        }
    }
}

function startNoteSequence() {
    // Stop any existing sequence
    stopNoteSequence();
    
    if (gameState.inventory.length === 0) return;
    
    // Filter playing notes and sort by collection order
    const playingNotes = gameState.inventory.filter(note => note.isPlaying);
    
    if (playingNotes.length === 0) return;
    
    // Start the sequence
    gameState.sequenceIndex = 0;
    gameState.sequenceNotes = playingNotes;
    gameState.isSequencePlaying = true;
    
    playNextInSequence();
}

function playNextInSequence() {
    if (!gameState.isSequencePlaying || !gameState.sequenceNotes || gameState.sequenceNotes.length === 0) {
        return;
    }
    
    const note = gameState.sequenceNotes[gameState.sequenceIndex];
    
    if (note && note.isPlaying) {
        // Play the note
        playTileNote(note.noteIndex);
        
        // Visual feedback - highlight the inventory slot
        highlightInventorySlot(note.id);
    }
    
    // Move to next note
    gameState.sequenceIndex = (gameState.sequenceIndex + 1) % gameState.sequenceNotes.length;
    
    // Schedule next note with delay
    gameState.sequenceTimeout = setTimeout(() => {
        if (gameState.isSequencePlaying) {
            playNextInSequence();
        }
    }, 250); // 0.25s delay
}

function stopNoteSequence() {
    gameState.isSequencePlaying = false;
    
    if (gameState.sequenceTimeout) {
        clearTimeout(gameState.sequenceTimeout);
        gameState.sequenceTimeout = null;
    }
    
    gameState.sequenceIndex = 0;
    gameState.sequenceNotes = [];
}

function pauseNoteSequence() {
    gameState.isSequencePlaying = false;
    
    if (gameState.sequenceTimeout) {
        clearTimeout(gameState.sequenceTimeout);
        gameState.sequenceTimeout = null;
    }
    
    // Don't reset index or notes - keep current position
}

function resumeNoteSequence() {
    if (gameState.inventory.length === 0) return;
    
    // Filter playing notes
    const playingNotes = gameState.inventory.filter(note => note.isPlaying);
    
    if (playingNotes.length === 0) return;
    
    // Update sequence notes in case inventory changed
    gameState.sequenceNotes = playingNotes;
    gameState.isSequencePlaying = true;
    
    // Continue from current position
    playNextInSequence();
}

function stopAllLoopingNotes() {
    stopNoteSequence();
}

function playAmbientTone() {
    if (!gameState.audioContext) return;
    
    // Soft ambient drone
    const oscillator = gameState.audioContext.createOscillator();
    const gainNode = gameState.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(gameState.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(CONSTANTS.BASE_FREQUENCY / 4, gameState.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.02, gameState.audioContext.currentTime);
    
    oscillator.start();
    
    // Store reference to stop later if needed
    gameState.ambientOscillator = oscillator;
    gameState.ambientGain = gainNode;
}

function playStepSound() {
    if (!gameState.audioContext) return;
    
    // Gentle step sound
    const oscillator = gameState.audioContext.createOscillator();
    const gainNode = gameState.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(gameState.audioContext.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(80 + Math.random() * 40, gameState.audioContext.currentTime);
    
    const now = gameState.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.05, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
    
    oscillator.start(now);
    oscillator.stop(now + 0.1);
}
