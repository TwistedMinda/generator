// Sound system using Web Audio API oscillators

let audioContext;
let masterGain;

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master gain node for volume control
        masterGain = audioContext.createGain();
        masterGain.gain.setValueAtTime(0.3, audioContext.currentTime);
        masterGain.connect(audioContext.destination);
        
        console.log('Audio system initialized');
    } catch (error) {
        console.warn('Audio not available:', error);
    }
}

function playSound(type, options = {}) {
    if (!audioContext || !masterGain) return;
    
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    switch (type) {
        case 'fireball':
            playFireballSound(options);
            break;
        case 'lightning':
            playLightningSound(options);
            break;
        case 'hit':
            playHitSound(options);
            break;
        case 'faerieAttack':
            playFaerieAttackSound(options);
            break;
        case 'faerieDeath':
            playFaerieDeathSound(options);
            break;
        case 'error':
            playErrorSound(options);
            break;
        case 'powerUp':
            playPowerUpSound(options);
            break;
        case 'gameOver':
            playGameOverSound(options);
            break;
        case 'ambient':
            playAmbientSound(options);
            break;
        case 'gemSpawn':
            playGemSpawnSound(options);
            break;
        case 'gemPickup':
            playGemPickupSound(options);
            break;
    }
}

function playFireballSound() {
    const duration = 0.5;
    const now = audioContext.currentTime;
    
    // Warm fire base - gentle filtered noise
    const noiseBuffer = createNoiseBuffer(duration);
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + duration);
    filter.Q.setValueAtTime(1, now);
    
    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    
    noiseSource.start(now);
    noiseSource.stop(now + duration);
    
    // Magical whoosh - warm sine wave
    const whoosh = audioContext.createOscillator();
    whoosh.type = 'sine';
    whoosh.frequency.setValueAtTime(220, now);
    whoosh.frequency.exponentialRampToValueAtTime(110, now + duration);
    
    const whooshGain = audioContext.createGain();
    whooshGain.gain.setValueAtTime(0, now);
    whooshGain.gain.linearRampToValueAtTime(0.12, now + 0.1);
    whooshGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    whoosh.connect(whooshGain);
    whooshGain.connect(masterGain);
    
    whoosh.start(now);
    whoosh.stop(now + duration);
    
    // Fire crackle harmonic
    const crackle = audioContext.createOscillator();
    crackle.type = 'triangle';
    crackle.frequency.setValueAtTime(880, now);
    crackle.frequency.exponentialRampToValueAtTime(440, now + duration);
    
    const crackleGain = audioContext.createGain();
    crackleGain.gain.setValueAtTime(0, now + 0.02);
    crackleGain.gain.linearRampToValueAtTime(0.06, now + 0.08);
    crackleGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    crackle.connect(crackleGain);
    crackleGain.connect(masterGain);
    
    crackle.start(now + 0.02);
    crackle.stop(now + duration);
}

function playLightningSound() {
    const duration = 0.5;
    const now = audioContext.currentTime;
    
    // Gentle electric pulse - very soft (the part you liked!)
    const pulse = audioContext.createOscillator();
    pulse.type = 'sine';
    pulse.frequency.setValueAtTime(110, now);
    pulse.frequency.linearRampToValueAtTime(80, now + duration);
    
    const pulseGain = audioContext.createGain();
    pulseGain.gain.setValueAtTime(0, now);
    pulseGain.gain.linearRampToValueAtTime(0.08, now + 0.15);
    pulseGain.gain.linearRampToValueAtTime(0.05, now + duration * 0.8);
    pulseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    pulse.connect(pulseGain);
    pulseGain.connect(masterGain);
    
    pulse.start(now);
    pulse.stop(now + duration);
    
    // Soft harmonic layer
    const harmonic = audioContext.createOscillator();
    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(220, now + 0.1);
    harmonic.frequency.linearRampToValueAtTime(165, now + duration);
    
    const harmonicGain = audioContext.createGain();
    harmonicGain.gain.setValueAtTime(0, now + 0.1);
    harmonicGain.gain.linearRampToValueAtTime(0.04, now + 0.2);
    harmonicGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    harmonic.connect(harmonicGain);
    harmonicGain.connect(masterGain);
    
    harmonic.start(now + 0.1);
    harmonic.stop(now + duration);
}

function playHitSound() {
    const duration = 0.15;
    const now = audioContext.currentTime;
    
    // Sharp impact sound
    const impact = audioContext.createOscillator();
    impact.type = 'square';
    impact.frequency.setValueAtTime(300, now);
    impact.frequency.exponentialRampToValueAtTime(80, now + duration);
    
    const impactGain = audioContext.createGain();
    impactGain.gain.setValueAtTime(0.15, now);
    impactGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    // Add some noise for explosive quality
    const noiseBuffer = createNoiseBuffer(duration * 0.5);
    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.5);
    
    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(400, now);
    noiseFilter.Q.setValueAtTime(2, now);
    
    // Connect everything
    impact.connect(impactGain);
    impactGain.connect(masterGain);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    
    // Start sounds
    impact.start(now);
    impact.stop(now + duration);
    noise.start(now);
    noise.stop(now + duration * 0.5);
}

function playGemSpawnSound() {
    const duration = 0.8;
    const now = audioContext.currentTime;
    
    // Gentle magical chime
    const chime = audioContext.createOscillator();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(523, now); // C5
    chime.frequency.linearRampToValueAtTime(659, now + duration * 0.3); // E5
    chime.frequency.linearRampToValueAtTime(523, now + duration); // Back to C5
    
    const chimeGain = audioContext.createGain();
    chimeGain.gain.setValueAtTime(0, now);
    chimeGain.gain.linearRampToValueAtTime(0.08, now + 0.1);
    chimeGain.gain.linearRampToValueAtTime(0.05, now + duration * 0.6);
    chimeGain.gain.linearRampToValueAtTime(0, now + duration);
    
    chime.connect(chimeGain);
    chimeGain.connect(masterGain);
    
    chime.start(now);
    chime.stop(now + duration);
}

function playGemPickupSound() {
    const duration = 0.4;
    const now = audioContext.currentTime;
    
    // Healing sparkle sound - ascending
    const heal = audioContext.createOscillator();
    heal.type = 'sine';
    heal.frequency.setValueAtTime(400, now);
    heal.frequency.exponentialRampToValueAtTime(800, now + duration);
    
    const healGain = audioContext.createGain();
    healGain.gain.setValueAtTime(0.12, now);
    healGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    // Add harmonics for magical feeling
    const harmonic = audioContext.createOscillator();
    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(800, now);
    harmonic.frequency.exponentialRampToValueAtTime(1200, now + duration);
    
    const harmonicGain = audioContext.createGain();
    harmonicGain.gain.setValueAtTime(0.06, now);
    harmonicGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    heal.connect(healGain);
    healGain.connect(masterGain);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(masterGain);
    
    heal.start(now);
    heal.stop(now + duration);
    harmonic.start(now);
    harmonic.stop(now + duration);
}

function playFaerieAttackSound() {
    const duration = 0.3;
    const now = audioContext.currentTime;
    
    // High pitched magical sound
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
    osc.frequency.linearRampToValueAtTime(600, now + duration);
    
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + duration);
}

function playFaerieDeathSound() {
    const duration = 0.4;
    const now = audioContext.currentTime;
    
    // Much quieter descending chimes
    for (let i = 0; i < 3; i++) {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        const baseFreq = 500 - i * 120;
        osc.frequency.setValueAtTime(baseFreq, now + i * 0.08);
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.04, now + i * 0.08 + 0.03); // Much quieter - was 0.2
        gain.gain.exponentialRampToValueAtTime(0.005, now + i * 0.08 + 0.2);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.2);
    }
}

function playErrorSound() {
    const duration = 0.15;
    const now = audioContext.currentTime;
    
    const osc = audioContext.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, now);
    
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.03, now); // Much quieter - was 0.2
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + duration);
}

function playPowerUpSound() {
    const duration = 0.8;
    const now = audioContext.currentTime;
    
    // Ascending arpeggio
    const frequencies = [261.63, 329.63, 392, 523.25]; // C, E, G, C
    
    frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.15);
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, now + index * 0.15);
        gain.gain.linearRampToValueAtTime(0.25, now + index * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.3);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start(now + index * 0.15);
        osc.stop(now + index * 0.15 + 0.3);
    });
}

function playGameOverSound() {
    const duration = 2;
    const now = audioContext.currentTime;
    
    // Dramatic descending sound
    const osc = audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + duration);
    
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + duration);
}

function playAmbientSound() {
    if (!audioContext || !masterGain) return;
    
    // Create atmospheric wind sound
    const duration = 8;
    const now = audioContext.currentTime;
    
    // Low rumble layer
    const rumble = audioContext.createOscillator();
    rumble.type = 'sine';
    rumble.frequency.setValueAtTime(45 + Math.random() * 15, now);
    
    const rumbleGain = audioContext.createGain();
    rumbleGain.gain.setValueAtTime(0.015, now);
    rumbleGain.gain.linearRampToValueAtTime(0.03, now + duration/2);
    rumbleGain.gain.linearRampToValueAtTime(0.015, now + duration);
    
    const rumbleFilter = audioContext.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(100, now);
    
    rumble.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(masterGain);
    
    // Ambient melody layer - haunting and magical with darker tones
    const melodyNotes = [110, 123, 138, 165, 185]; // A2, B2, C#3, E3, F#3 - darker minor pentatonic
    const noteCount = 3 + Math.floor(Math.random() * 3); // 3-5 notes
    
    for (let i = 0; i < noteCount; i++) {
        const noteFreq = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
        const noteStart = now + (i * duration / noteCount) + Math.random() * 0.5;
        const noteDuration = 1.5 + Math.random() * 2;
        
        const melody = audioContext.createOscillator();
        melody.type = 'sine';
        melody.frequency.setValueAtTime(noteFreq, noteStart);
        melody.frequency.linearRampToValueAtTime(noteFreq * 1.02, noteStart + noteDuration); // Slight pitch bend
        
        const melodyGain = audioContext.createGain();
        melodyGain.gain.setValueAtTime(0, noteStart);
        melodyGain.gain.linearRampToValueAtTime(0.012, noteStart + 0.3);
        melodyGain.gain.linearRampToValueAtTime(0.008, noteStart + noteDuration - 0.5);
        melodyGain.gain.linearRampToValueAtTime(0, noteStart + noteDuration);
        
        const melodyFilter = audioContext.createBiquadFilter();
        melodyFilter.type = 'lowpass';
        melodyFilter.frequency.setValueAtTime(800, noteStart);
        melodyFilter.Q.setValueAtTime(0.7, noteStart);
        
        melody.connect(melodyFilter);
        melodyFilter.connect(melodyGain);
        melodyGain.connect(masterGain);
        
        melody.start(noteStart);
        melody.stop(noteStart + noteDuration);
    }
    
    // Start rumble
    rumble.start(now);
    rumble.stop(now + duration);
    
    // Schedule next ambient sound with slight overlap
    setTimeout(() => {
        if (gameState.gameStarted) {
            playAmbientSound();
        }
    }, (duration - 1) * 1000);
}

function createNoiseBuffer(duration) {
    const length = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
}

// Start ambient sound when game starts
function startAmbientAudio() {
    if (gameState.gameStarted) {
        playAmbientSound();
    }
}
