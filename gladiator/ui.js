function setTelegraph(text, colorClass) {
	const el = document.getElementById('telegraph');
	if (!el) return;
	el.textContent = text;
	el.className = `px-6 py-3 rounded-xl glass border border-white/10 text-2xl font-extrabold tracking-widest shadow-2xl ${colorClass || 'text-white'}`;
}

function updateHUD() {
	const playerBar = document.getElementById('player-health');
	const enemyBar = document.getElementById('enemy-health');
	const roundLabel = document.getElementById('round-label');
	const scoreLabel = document.getElementById('score-label');
	if (playerBar) playerBar.style.width = `${Math.max(0, Math.min(100, (gameState.playerHealth / CONSTANTS.maxPlayerHealth) * 100))}%`;
	if (enemyBar) enemyBar.style.width = `${Math.max(0, Math.min(100, (gameState.enemyHealth / CONSTANTS.maxEnemyHealth) * 100))}%`;
	if (roundLabel) roundLabel.textContent = String(gameState.round);
	if (scoreLabel) scoreLabel.textContent = String(gameState.score);

	// Position status badges above characters in screen space
	const playerBadge = document.getElementById('player-status');
	const enemyBadge = document.getElementById('enemy-status');
	if (playerBadge && gameState.player && gameState.camera) {
		const v = gameState.player.position.clone();
		v.y += 2.2;
		v.project(gameState.camera);
		const x = (v.x * 0.5 + 0.5) * window.innerWidth;
		const y = (-v.y * 0.5 + 0.5) * window.innerHeight;
		playerBadge.style.left = `${x - 40}px`;
		playerBadge.style.top = `${y - 20}px`;
	}
	if (enemyBadge && gameState.opponent && gameState.camera) {
		const v2 = gameState.opponent.position.clone();
		v2.y += 2.2;
		v2.project(gameState.camera);
		const x2 = (v2.x * 0.5 + 0.5) * window.innerWidth;
		const y2 = (-v2.y * 0.5 + 0.5) * window.innerHeight;
		enemyBadge.style.left = `${x2 - 40}px`;
		enemyBadge.style.top = `${y2 - 20}px`;
	}
	// Cooldown overlays
	const aCd = document.getElementById('attack-cooldown');
	const dCd = document.getElementById('defend-cooldown');
	const attackBtn = document.getElementById('btn-attack');
	const defendBtn = document.getElementById('btn-defend');
	if (aCd) {
		// show during cooldown or active attack window
		const remain = Math.max(gameState.attackTimer, gameState.attackActiveRemaining);
		if (remain > 0) {
			aCd.style.opacity = '1';
			aCd.textContent = `${Math.ceil(remain * 10) / 10}s`;
		} else aCd.style.opacity = '0';
	}
	if (dCd) {
		if (gameState.defendActiveRemaining > 0) {
			dCd.style.opacity = '1';
			dCd.textContent = `${Math.ceil(gameState.defendActiveRemaining * 10) / 10}s`;
		} else dCd.style.opacity = '0';
	}

	// Lock/unlock buttons visually and functionally
	const anyActiveWindow = (gameState.attackActiveRemaining > 0) || (gameState.defendActiveRemaining > 0);
	const attackLocked = (gameState.attackTimer > 0) || anyActiveWindow;
	const defendLocked = anyActiveWindow; // defend has no separate cooldown beyond its 1s window
	if (attackBtn) {
		attackBtn.style.pointerEvents = attackLocked ? 'none' : 'auto';
		attackBtn.style.transform = attackLocked ? 'scale(0.98)' : 'scale(1)';
		attackBtn.style.opacity = attackLocked ? '0.9' : '1';
	}
	if (defendBtn) {
		defendBtn.style.pointerEvents = defendLocked ? 'none' : 'auto';
		defendBtn.style.transform = defendLocked ? 'scale(0.98)' : 'scale(1)';
		defendBtn.style.opacity = defendLocked ? '0.9' : '1';
	}

	// Persistent status badges based on active states
	const pWrap = document.getElementById('player-status');
	const pIcon = document.getElementById('player-status-icon');
	if (pWrap && pIcon) {
		const pLabel = pWrap.querySelector('span:nth-child(2)');
		if (gameState.attackActiveRemaining > 0) {
			pIcon.textContent = '⚔️';
			pWrap.firstElementChild.className = 'px-3 py-1 rounded-full bg-gradient-to-r from-amber-300 to-yellow-300 text-black font-extrabold shadow-lg text-sm flex items-center gap-1';
			if (pLabel) pLabel.textContent = 'ATTACK';
			pWrap.style.opacity = '1';
			pWrap.style.transform = 'translateY(-6px) scale(1)';
		} else if (gameState.defendActiveRemaining > 0 || gameState.isDefending) {
			pIcon.textContent = '🛡️';
			pWrap.firstElementChild.className = 'px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 text-black font-extrabold shadow-lg text-sm flex items-center gap-1';
			if (pLabel) pLabel.textContent = 'DEFEND';
			pWrap.style.opacity = '1';
			pWrap.style.transform = 'translateY(-6px) scale(1)';
		} else {
			pWrap.style.opacity = '0';
			pWrap.style.transform = 'translateY(0px) scale(0.75)';
		}
	}

	const eWrap = document.getElementById('enemy-status');
	const eIcon = document.getElementById('enemy-status-icon');
	if (eWrap && eIcon) {
		const eLabel = eWrap.querySelector('span:nth-child(2)');
		if (gameState.aiActionActiveRemaining > 0) {
			if (gameState.aiIsAttacking) {
				eIcon.textContent = '⚔️';
				eWrap.firstElementChild.className = 'px-3 py-1 rounded-full bg-gradient-to-r from-rose-400 to-amber-300 text-black font-extrabold shadow-lg text-sm flex items-center gap-1';
				if (eLabel) eLabel.textContent = 'ATTACK';
			} else {
				eIcon.textContent = '🛡️';
				eWrap.firstElementChild.className = 'px-3 py-1 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 text-black font-extrabold shadow-lg text-sm flex items-center gap-1';
				if (eLabel) eLabel.textContent = 'DEFEND';
			}
			eWrap.style.opacity = '1';
			eWrap.style.transform = 'translateY(-6px) scale(1)';
		} else {
			eWrap.style.opacity = '0';
			eWrap.style.transform = 'translateY(0px) scale(0.75)';
		}
	}
}

function showStatusBadge(who, mode) {
	const el = document.getElementById(who === 'player' ? 'player-status' : 'enemy-status');
	const icon = document.getElementById(who === 'player' ? 'player-status-icon' : 'enemy-status-icon');
	const label = el ? el.querySelector('span:nth-child(2)') : null;
	if (!el || !icon) return;
	if (mode === 'attack') {
		icon.textContent = '⚔️';
		el.firstElementChild.className = who === 'player'
			? 'px-3 py-1 rounded-full bg-gradient-to-r from-amber-300 to-yellow-300 text-black font-extrabold shadow-lg text-sm flex items-center gap-1'
			: 'px-3 py-1 rounded-full bg-gradient-to-r from-rose-400 to-amber-300 text-black font-extrabold shadow-lg text-sm flex items-center gap-1';
		if (label) label.textContent = 'ATTACK';
	} else {
		icon.textContent = '🛡️';
		el.firstElementChild.className = who === 'player'
			? 'px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 text-black font-extrabold shadow-lg text-sm flex items-center gap-1'
			: 'px-3 py-1 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 text-black font-extrabold shadow-lg text-sm flex items-center gap-1';
		if (label) label.textContent = 'DEFEND';
	}
	el.style.opacity = '1';
	el.style.transform = 'translateY(-6px) scale(1)';
}

function hideStatusBadge(who) {
	const el = document.getElementById(who === 'player' ? 'player-status' : 'enemy-status');
	if (!el) return;
	el.style.opacity = '0';
	el.style.transform = 'translateY(0px) scale(0.75)';
}


