const Storage = {
    getTrades() {
        try {
            const trades = localStorage.getItem('trading-journal-trades');
            return trades ? JSON.parse(trades) : [];
        } catch (error) {
            console.error('Error getting trades:', error);
            return [];
        }
    },

    addTrade(trade) {
        try {
            const trades = this.getTrades();
            const newTrade = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                open: true,
                ...trade
            };
            trades.push(newTrade);
            localStorage.setItem('trading-journal-trades', JSON.stringify(trades));
            return newTrade;
        } catch (error) {
            console.error('Error adding trade:', error);
            return null;
        }
    },

    updateLastTrade(updates) {
        try {
            const trades = this.getTrades();
            if (trades.length === 0) return false;
            
            trades[trades.length - 1] = { ...trades[trades.length - 1], ...updates };
            localStorage.setItem('trading-journal-trades', JSON.stringify(trades));
            return true;
        } catch (error) {
            console.error('Error updating last trade:', error);
            return false;
        }
    },

    clear() {
        try {
            localStorage.removeItem('trading-journal-trades');
            return true;
        } catch (error) {
            console.error('Error clearing trades:', error);
            return false;
        }
    }
};