// UI helpers only manipulate classes/contents

function updateHealthBar() {
    const el = document.getElementById('health-bar');
    if (!el) return;
    const pct = Math.max(0, Math.min(100, (gameState.player.health / gameState.player.maxHealth) * 100));
    el.style.width = pct + '%';
    el.className = `h-full rounded-full transition-all duration-500 ${pct > 60 ? 'bg-gradient-to-r from-emerald-400 to-lime-300' : pct > 30 ? 'bg-gradient-to-r from-amber-400 to-orange-300' : 'bg-gradient-to-r from-rose-500 to-red-400'}`;
}

function updateScore() {
    const el = document.getElementById('score');
    if (el) el.textContent = String(gameState.score);
}

function showNotification(message, duration = 2500) {
    const div = document.createElement('div');
    div.className = 'fixed top-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg glass text-white font-semibold text-lg z-40 border border-cyan-300/30';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => { div.style.opacity = '0'; div.style.transition = 'opacity 300ms'; }, duration);
    setTimeout(() => div.remove(), duration + 320);
}


