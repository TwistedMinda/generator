// Sound system using Web Audio API oscillators
let audioContext = null;
let masterGain = null;

function initSounds() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.3; // Master volume
        masterGain.connect(audioContext.destination);
    } catch (error) {
        console.warn('Web Audio API not supported');
        audioContext = null;
    }
}

function playSound(type, options = {}) {
    if (!audioContext || !gameState.settings.soundEnabled) return;
    
    // Resume audio context if suspended (required for some browsers)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    switch (type) {
        case 'engine':
            playEngineSound(options);
            break;
        case 'hit':
            playHitSound(options);
            break;
        case 'explosion':
            playExplosionSound(options);
            break;
        case 'playerShoot':
            playPlayerShootSound(options);
            break;
        case 'enemyShoot':
            playEnemyShootSound(options);
            break;
        case 'impact':
            playImpactSound(options);
            break;
        case 'ambient':
            playAmbientSound(options);
            break;
        default:
            playGenericSound(options);
            break;
    }
}

function playEngineSound(options = {}) {
    const duration = options.duration || 0.5;
    const volume = options.volume || 0.2;
    
    // Main engine oscillator
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + duration);
    
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.connect(gain);
    gain.connect(masterGain);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
    // High frequency component for realism
    const highOsc = audioContext.createOscillator();
    const highGain = audioContext.createGain();
    
    highOsc.type = 'square';
    highOsc.frequency.setValueAtTime(400, audioContext.currentTime);
    highOsc.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + duration);
    
    highGain.gain.setValueAtTime(0, audioContext.currentTime);
    highGain.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.05);
    highGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    highOsc.connect(highGain);
    highGain.connect(masterGain);
    
    highOsc.start(audioContext.currentTime);
    highOsc.stop(audioContext.currentTime + duration);
}

function playHitSound(options = {}) {
    const duration = options.duration || 0.3;
    const volume = options.volume || 0.4;
    
    // Impact noise
    const noiseBuffer = createNoiseBuffer(audioContext.sampleRate * duration);
    const noiseSource = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    noiseSource.buffer = noiseBuffer;
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 5;
    
    noiseGain.gain.setValueAtTime(volume, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    
    noiseSource.start(audioContext.currentTime);
    noiseSource.stop(audioContext.currentTime + duration);
}

function playExplosionSound(options = {}) {
    const duration = options.duration || 1.5;
    const volume = options.volume || 0.6;
    
    // Low frequency boom
    const bassOsc = audioContext.createOscillator();
    const bassGain = audioContext.createGain();
    
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(60, audioContext.currentTime);
    bassOsc.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + duration);
    
    bassGain.gain.setValueAtTime(volume, audioContext.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    bassOsc.connect(bassGain);
    bassGain.connect(masterGain);
    
    bassOsc.start(audioContext.currentTime);
    bassOsc.stop(audioContext.currentTime + duration);
    
    // High frequency crack
    const crackBuffer = createNoiseBuffer(audioContext.sampleRate * 0.2);
    const crackSource = audioContext.createBufferSource();
    const crackGain = audioContext.createGain();
    const crackFilter = audioContext.createBiquadFilter();
    
    crackSource.buffer = crackBuffer;
    crackFilter.type = 'highpass';
    crackFilter.frequency.value = 2000;
    
    crackGain.gain.setValueAtTime(volume * 0.8, audioContext.currentTime);
    crackGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
    
    crackSource.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(masterGain);
    
    crackSource.start(audioContext.currentTime);
    crackSource.stop(audioContext.currentTime + 0.2);
}

function playPlayerShootSound(options = {}) {
    const duration = options.duration || 0.15;
    const volume = options.volume || 0.3;
    
    // Laser-like sound
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + duration);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + duration);
    
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playEnemyShootSound(options = {}) {
    const duration = options.duration || 0.2;
    const volume = options.volume || 0.25;
    
    // Different tone for enemy weapons
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + duration);
    
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.connect(gain);
    gain.connect(masterGain);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playImpactSound(options = {}) {
    const duration = options.duration || 0.1;
    const volume = options.volume || 0.2;
    
    // Sharp metallic impact
    const noiseBuffer = createNoiseBuffer(audioContext.sampleRate * duration);
    const noiseSource = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    noiseSource.buffer = noiseBuffer;
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    
    noiseGain.gain.setValueAtTime(volume, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    
    noiseSource.start(audioContext.currentTime);
    noiseSource.stop(audioContext.currentTime + duration);
}

function playAmbientSound(options = {}) {
    const duration = options.duration || 5.0;
    const volume = options.volume || 0.1;
    
    // Wind-like ambient sound
    const noiseBuffer = createNoiseBuffer(audioContext.sampleRate * duration);
    const noiseSource = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    filter.Q.value = 1;
    
    noiseGain.gain.setValueAtTime(0, audioContext.currentTime);
    noiseGain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 1);
    
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    
    noiseSource.start(audioContext.currentTime);
    
    // Store reference for potential stopping
    if (!gameState.ambientSound) {
        gameState.ambientSound = { source: noiseSource, gain: noiseGain };
    }
}

function playGenericSound(options = {}) {
    const frequency = options.frequency || 440;
    const duration = options.duration || 0.3;
    const volume = options.volume || 0.2;
    const type = options.type || 'sine';
    
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.connect(gain);
    gain.connect(masterGain);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function createNoiseBuffer(length) {
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
}

function stopAmbientSound() {
    if (gameState.ambientSound) {
        gameState.ambientSound.gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
        setTimeout(() => {
            if (gameState.ambientSound) {
                gameState.ambientSound.source.stop();
                gameState.ambientSound = null;
            }
        }, 1000);
    }
}

function setMasterVolume(volume) {
    if (masterGain) {
        masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioContext.currentTime);
    }
}

// Start ambient sound when game begins
setTimeout(() => {
    if (gameState.settings.soundEnabled) {
        playSound('ambient');
    }
}, 2000);
