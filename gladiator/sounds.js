function ensureAudio() {
	if (!gameState.audioCtx) {
		gameState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	}
}

function playTone(freq, duration, type = 'sine', gain = 0.04) {
	ensureAudio();
	const ctx = gameState.audioCtx;
	const o = ctx.createOscillator();
	const g = ctx.createGain();
	o.type = type;
	o.frequency.value = freq;
	g.gain.value = gain;
	o.connect(g).connect(ctx.destination);
	o.start();
	g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
	o.stop(ctx.currentTime + duration);
}

function sfxAttack() { playTone(280, 0.08, 'triangle', 0.06); playTone(120, 0.12, 'sawtooth', 0.03); }
function sfxBlock() { playTone(720, 0.05, 'square', 0.05); playTone(520, 0.06, 'square', 0.04); }
function sfxHit() { playTone(160, 0.12, 'sawtooth', 0.06); }
function sfxRound() { playTone(440, 0.2, 'sine', 0.05); setTimeout(()=>playTone(660, 0.25, 'sine', 0.04), 120); }


