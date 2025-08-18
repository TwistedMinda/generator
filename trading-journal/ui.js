const UI = {
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.loadTradeHistory();
            this.loadAnalytics();
        });
    },

    setupEventListeners() {
        const startTradeBtn = document.getElementById('startTradeBtn');
        if (startTradeBtn) {
            startTradeBtn.addEventListener('click', () => {
                if (state.start) {
                    closeCurrentTrade();
                    this.closeTradingPanel();
                } else {
                    startTrade();
                    this.openTradingPanel();
                }
            });
        }

        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all trade history? This action cannot be undone.')) {
                    Storage.clear();
                    this.reload();
                }
            });
        }
    },

    displayHistory(show = true) {
        const mainGrid = document.querySelector('.grid');
        if (show) {
            mainGrid.classList.remove('hidden');
            mainGrid.classList.add('animate-fade-in');
            this.loadTradeHistory();
        } else {
            mainGrid.classList.add('animate-fade-out');
            setTimeout(() => {
                mainGrid.classList.add('hidden');
                mainGrid.classList.remove('animate-fade-out');
            }, 300);
        }
    },

    displayAnalytics(show = true) {
        this.displayHistory(show);
    },

    openTradingPanel() {
        this.displayHistory(false);
        
        const startTradeBtn = document.getElementById('startTradeBtn');
        const startBtnSpan = startTradeBtn.querySelector('span');
        
        startTradeBtn.classList.remove('bg-gradient-to-r', 'from-trading-blue', 'to-blue-600', 'hover:from-blue-600', 'hover:to-blue-700');
        startTradeBtn.classList.add('bg-gradient-to-r', 'from-red-600', 'to-red-700', 'hover:from-red-700', 'hover:to-red-800');
        
        if (startBtnSpan) {
            startBtnSpan.textContent = 'Close Trade';
        }
        
        setTimeout(() => {
            const container = document.querySelector('.container');
            if (container) {
                const tradingPanel = document.createElement('div');
                tradingPanel.id = 'trading-panel';
                tradingPanel.className = 'bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-slide-up opacity-0';
                tradingPanel.innerHTML = `
                    <h2 class="text-2xl font-bold mb-6 text-center text-blue-300">
                        <svg class="w-6 h-6 inline mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        Trading Panel
                    </h2>
                    <div class="text-center space-y-4">
                        <div class="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                            <p class="text-green-300 font-semibold">Trade is Active</p>
                            <p class="text-gray-300 text-sm">Monitor your position</p>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-white/5 rounded-lg p-3">
                                <p class="text-gray-400 text-xs">Symbol</p>
                                <p class="text-white font-mono">UNKNOWN</p>
                            </div>
                            <div class="bg-white/5 rounded-lg p-3">
                                <p class="text-gray-400 text-xs">Status</p>
                                <p class="text-green-400 font-semibold">OPEN</p>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(tradingPanel);
                
                setTimeout(() => {
                    tradingPanel.classList.remove('opacity-0');
                    tradingPanel.classList.add('animate-fade-in');
                }, 50);
            }
        }, 300);
    },

    closeTradingPanel() {
        const startTradeBtn = document.getElementById('startTradeBtn');
        const startBtnSpan = startTradeBtn.querySelector('span');
        const tradingPanel = document.getElementById('trading-panel');
        
        startTradeBtn.classList.remove('bg-gradient-to-r', 'from-red-600', 'to-red-700', 'hover:from-red-700', 'hover:to-red-800');
        startTradeBtn.classList.add('bg-gradient-to-r', 'from-trading-blue', 'to-blue-600', 'hover:from-blue-600', 'hover:to-blue-700');
        
        if (startBtnSpan) {
            startBtnSpan.textContent = 'Start Trade';
        }
        
        if (tradingPanel) {
            tradingPanel.classList.add('animate-slide-down');
            setTimeout(() => {
                tradingPanel.remove();
            }, 300);
        }
        
        setTimeout(() => {
            this.displayHistory(true);
        }, 150);
    },

    loadTradeHistory() {
        const historyContainer = document.getElementById('historyContainer');
        const trades = getTrades();
        
        if (trades.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-400 text-center animate-pulse">No trades recorded yet</p>';
            return;
        }

        let historyHTML = '<div class="space-y-3">';
        trades.forEach((trade, index) => {
            const statusColor = trade.open ? 'text-yellow-400' : (trade.profit > 0 ? 'text-green-400' : 'text-red-400');
            const status = trade.open ? 'Open' : 'Closed';
            
            historyHTML += `
                <div class="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-200 transform hover:scale-105 animate-slide-in" style="animation-delay: ${index * 0.1}s">
                    <div class="flex justify-between items-center">
                        <span class="font-medium">${trade.symbol}</span>
                        <span class="${statusColor} font-semibold">${status}</span>
                    </div>
                    <div class="text-sm text-gray-400 mt-1">
                        ${new Date(trade.timestamp).toLocaleDateString()}
                    </div>
                    ${trade.profit !== 0 && trade.profit !== undefined ? `<div class="text-sm mt-1 ${trade.profit > 0 ? 'text-green-400' : 'text-red-400'}">P&L: ${trade.profit > 0 ? '+' : ''}${(trade.profit || 0).toFixed(2)}</div>` : ''}
                </div>
            `;
        });
        historyHTML += '</div>';
        
        historyContainer.innerHTML = historyHTML;
    },

    loadAnalytics() {
        const analyticsContainer = document.getElementById('analyticsContainer');
        const trades = getTrades();
        
        if (trades.length === 0) {
            analyticsContainer.innerHTML = '<p class="text-gray-400 text-center animate-pulse">Analytics will appear here</p>';
            return;
        }

        const closedTrades = trades.filter(trade => !trade.open && trade.gains !== undefined);
        const totalTrades = closedTrades.length;
        const winningTrades = closedTrades.filter(trade => trade.gains > 0).length;
        const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : 0;
        const totalProfit = closedTrades.reduce((sum, trade) => sum + trade.gains, 0);

        analyticsContainer.innerHTML = `
            <div class="space-y-4">
                <div class="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-200 transform hover:scale-105 animate-slide-in" style="animation-delay: 0.1s">
                    <div class="text-sm text-gray-400">Total Trades</div>
                    <div class="text-2xl font-bold animate-count-up">${totalTrades}</div>
                </div>
                <div class="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-200 transform hover:scale-105 animate-slide-in" style="animation-delay: 0.2s">
                    <div class="text-sm text-gray-400">Win Rate</div>
                    <div class="text-2xl font-bold text-green-400 animate-count-up">${winRate}%</div>
                </div>
                <div class="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-200 transform hover:scale-105 animate-slide-in" style="animation-delay: 0.3s">
                    <div class="text-sm text-gray-400">Total P&L</div>
                    <div class="text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'} animate-count-up">
                        ${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
                    </div>
                </div>
            </div>
        `;
    },

    updateTradeStatus(tradeId, status) {
        Storage.updateLastTrade({ open: status === 'open' });
        this.reload();
    },

    reload() {
        this.loadTradeHistory();
        this.loadAnalytics();
    }
};

UI.init();