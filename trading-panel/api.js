// Simple Solana price API fetcher

async function fetchSolanaPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        const price = data.solana.usd;
        console.log(`Solana price: $${price.toLocaleString()}`);
        return price;
    } catch (error) {
        console.error('Failed to fetch Solana price:', error);
        return null;
    }
}
