// Oscillator-based minimal synth

let audioCtx;
let masterGain;

function initAudio() {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.2;
        masterGain.connect(audioCtx.destination);
        startAmbientAudio();
    } catch (e) {
        
    }
}

function startAmbientAudio() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 220;
    gain.gain.value = 0.001;
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();

    // subtle evolving pad
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 40;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
}

function playSound(type) {
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(masterGain);

    if (type === 'pulse') {
        o.type = 'square';
        o.frequency.setValueAtTime(440, audioCtx.currentTime);
        o.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
        g.gain.setValueAtTime(0.15, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
    } else if (type === 'hit') {
        o.type = 'triangle';
        o.frequency.setValueAtTime(180, audioCtx.currentTime);
        g.gain.setValueAtTime(0.12, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
    }
    o.start();
    o.stop(audioCtx.currentTime + 0.3);
}


