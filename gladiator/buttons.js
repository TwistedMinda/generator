// Smart button system - handles all attack/defend logic cleanly
const ButtonManager = {
	// Current state
	attackCooldown: 0,
	defendCooldown: 0,
	activeAction: null, // 'attack' or 'defend' or null
	lockedAction: null, // 'attack' or 'defend' or null
	
	// Initialize the button system
	init() {
		this.bindEvents();
		this.updateUI();
	},
	
	// Update cooldowns and state
	update(dt) {
		// Decrease cooldowns
		if (this.attackCooldown > 0) this.attackCooldown -= dt;
		if (this.defendCooldown > 0) this.defendCooldown -= dt;
		
		// Handle active action timeouts
		if (gameState.attackActiveRemaining > 0) {
			gameState.attackActiveRemaining -= dt;
			if (gameState.attackActiveRemaining <= 0) {
				this.activeAction = null;
			}
		}
		
		if (gameState.defendActiveRemaining > 0) {
			gameState.defendActiveRemaining -= dt;
			if (gameState.defendActiveRemaining <= 0) {
				this.activeAction = null;
				gameState.isDefending = false;
			}
		}
		
		// Auto-repeat locked actions when cooldown expires
		if (this.lockedAction === 'attack' && this.attackCooldown <= 0 && this.activeAction !== 'attack') {
			this.executeAction('attack');
		}
		if (this.lockedAction === 'defend' && this.defendCooldown <= 0 && this.activeAction !== 'defend') {
			this.executeAction('defend');
		}
		
		this.updateUI();
	},
	
	// Execute an action (attack or defend)
	executeAction(action) {
		if (gameState.inReadyPhase) return false;
		
		// Check if action is on cooldown
		if (action === 'attack' && this.attackCooldown > 0) return false;
		if (action === 'defend' && this.defendCooldown > 0) return false;
		
		// Can't start new action while another is active
		if (this.activeAction && this.activeAction !== action) return false;
		
		if (action === 'attack') {
			return this.doAttack();
		} else if (action === 'defend') {
			return this.doDefend();
		}
		
		return false;
	},
	
	// Perform attack logic
	doAttack() {
		this.activeAction = 'attack';
		this.attackCooldown = CONSTANTS.attackCooldown;
		this.defendCooldown = CONSTANTS.attackCooldown; // Both buttons get cooldown
		gameState.attackActiveRemaining = CONSTANTS.attackDuration;
		gameState.attackSecondHitDone = false;

		// Calculate damage
		gameState.attackStack = Math.min(CONSTANTS.attackStackMax, gameState.attackStack + CONSTANTS.attackStackIncrease);
		let mult = 1 + gameState.attackStack;
		let damage = Math.round(CONSTANTS.attackBaseDamage * mult);
		
		if (gameState.aiIsDefending) {
			if (Math.random() < 0.8) {
				damage = 0;
				spawnShieldBurst(new THREE.Vector3(2.2, 1.4, 0));
				sfxBlock();
			} else {
				damage = Math.max(1, Math.round(damage * (1 - CONSTANTS.defendDamageReduction)));
			}
		}
		
		gameState.enemyHealth -= damage;
		gameState.score += Math.max(10, Math.round(20 * mult));

		// Effects
		spawnHitSpark(new THREE.Vector3(2.2, 1.2, 0), 0xffb020);
		sfxAttack();
		setTelegraph(`STRIKE -${damage}`, 'text-amber-300');
		showStatusBadge('player', 'attack');

		// Check win condition
		if (gameState.enemyHealth <= 0) {
			gameState.enemyHealth = 0;
			setTelegraph('KO!', 'text-glad-amber');
			gameState.round++;
			setTimeout(nextRound, CONSTANTS.roundDelay * 1000);
		}
		
		return true;
	},
	
	// Perform defend logic
	doDefend() {
		this.activeAction = 'defend';
		this.defendCooldown = CONSTANTS.defendDuration;
		this.attackCooldown = CONSTANTS.defendDuration; // Both buttons get cooldown
		gameState.isDefending = true;
		gameState.defendTimer = 0;
		gameState.defendActiveRemaining = CONSTANTS.defendDuration;
		showStatusBadge('player', 'defend');
		
		return true;
	},
	
	// Handle button clicks
	onAttackClick() {
		this.executeAction('attack');
	},
	
	onDefendClick() {
		this.executeAction('defend');
	},
	
	// Handle lock button clicks
	onAttackLockClick() {
		if (this.lockedAction === 'attack') {
			// Unlock
			this.lockedAction = null;
		} else {
			// Lock attack (unlock defend if needed)
			this.lockedAction = 'attack';
			this.executeAction('attack'); // Start immediately
		}
		this.updateUI();
	},
	
	onDefendLockClick() {
		if (this.lockedAction === 'defend') {
			// Unlock
			this.lockedAction = null;
		} else {
			// Lock defend (unlock attack if needed)
			this.lockedAction = 'defend';
			this.executeAction('defend'); // Start immediately
		}
		this.updateUI();
	},
	
	// Bind DOM events
	bindEvents() {
		const attackBtn = document.getElementById('btn-attack');
		const defendBtn = document.getElementById('btn-defend');
		const attackLock = document.getElementById('attack-lock');
		const defendLock = document.getElementById('defend-lock');

		if (attackBtn) attackBtn.addEventListener('click', () => this.onAttackClick());
		if (defendBtn) defendBtn.addEventListener('click', () => this.onDefendClick());
		if (attackLock) attackLock.addEventListener('click', (e) => {
			e.stopPropagation();
			this.onAttackLockClick();
		});
		if (defendLock) defendLock.addEventListener('click', (e) => {
			e.stopPropagation();
			this.onDefendLockClick();
		});
	},
	
	// Update UI elements
	updateUI() {
		// Update button states
		const attackBtn = document.getElementById('btn-attack');
		const defendBtn = document.getElementById('btn-defend');
		const attackLock = document.getElementById('attack-lock');
		const defendLock = document.getElementById('defend-lock');
		const attackCooldownUI = document.getElementById('attack-cooldown');
		const defendCooldownUI = document.getElementById('defend-cooldown');
		
		// Button availability
		if (attackBtn) {
			const disabled = this.attackCooldown > 0 || (this.activeAction && this.activeAction !== 'attack');
			attackBtn.style.pointerEvents = disabled ? 'none' : 'auto';
			attackBtn.style.opacity = disabled ? '0.6' : '1';
		}
		
		if (defendBtn) {
			const disabled = this.defendCooldown > 0 || (this.activeAction && this.activeAction !== 'defend');
			defendBtn.style.pointerEvents = disabled ? 'none' : 'auto';
			defendBtn.style.opacity = disabled ? '0.6' : '1';
		}
		
		// Lock button states
		if (attackLock) {
			attackLock.textContent = this.lockedAction === 'attack' ? '🔓' : '🔒';
			attackLock.style.opacity = this.lockedAction === 'attack' ? '1' : '0.7';
		}
		
		if (defendLock) {
			defendLock.textContent = this.lockedAction === 'defend' ? '🔓' : '🔒';
			defendLock.style.opacity = this.lockedAction === 'defend' ? '1' : '0.7';
		}
		
		// Cooldown overlays
		if (attackCooldownUI) {
			if (this.attackCooldown > 0) {
				attackCooldownUI.style.opacity = '1';
				attackCooldownUI.textContent = `${Math.ceil(this.attackCooldown * 10) / 10}s`;
			} else {
				attackCooldownUI.style.opacity = '0';
			}
		}
		
		if (defendCooldownUI) {
			if (this.defendCooldown > 0) {
				defendCooldownUI.style.opacity = '1';
				defendCooldownUI.textContent = `${Math.ceil(this.defendCooldown * 10) / 10}s`;
			} else {
				defendCooldownUI.style.opacity = '0';
			}
		}
	}
};
