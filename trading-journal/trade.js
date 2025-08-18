const state = {
    start: false,
    currentTrade: null
};

function getTrades() {
    return Storage.getTrades();
}

function startTrade() {
    state.start = true;
    
    const newTrade = Storage.addTrade({
        symbol: 'UNKNOWN',
        type: 'manual',
        startTime: new Date().toISOString()
    });
    
    if (newTrade) {
        state.currentTrade = newTrade;
        console.log('Trade started:', newTrade);
        UI.reload();
    } else {
        console.error('Failed to create new trade');
    }
}

function closeCurrentTrade(profit = 0) {
    if (state.currentTrade) {
        Storage.updateLastTrade({ 
            open: false, 
            profit: profit,
            closedAt: new Date().toISOString()
        });
        state.currentTrade = null;
        state.start = false;
        console.log('Trade closed with profit:', profit);
        UI.reload();
    }
}

function updateCurrentTrade(updates) {
    if (state.currentTrade) {
        Storage.updateLastTrade(updates);
        state.currentTrade = { ...state.currentTrade, ...updates };
        UI.reload();
    }
}

function getCurrentTradeStatus() {
    return {
        isActive: state.start,
        currentTrade: state.currentTrade,
        hasActiveTrade: getTrades().some(trade => trade.open)
    };
}