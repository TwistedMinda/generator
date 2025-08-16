// Crypto price API fetcher

async function fetchCryptoPrice(symbol) {
    try {
        const coinId = symbol.toLowerCase();
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        const data = await response.json();
        const price = data[coinId].usd;
        console.log(`${symbol} price: $${price.toLocaleString()}`);
        return price;
    } catch (error) {
        console.error(`Failed to fetch ${symbol} price:`, error);
        return null;
    }
}


