
// Shimmer data
const coingeckoCoinId = "shimmer";
const coingeckoExchangeId = "bitfinex";


export async function getCoingeckoExchangeData (fetch) {

    ///# Make the API request to get order book data
    let url = `https://api.coingecko.com/api/v3/exchanges/${coingeckoExchangeId}/tickers?coin_ids=${coingeckoCoinId}`;
    
    try {
        console.log('Getting the Coingecko Exchange data')
        const headers = new Headers();
        headers.append('accept', 'application/json');
    
        const response = await fetch(url , {
            method: 'GET',
            headers: headers,
            timeout: 10000
        });
        
        if (response.ok) {
            const data = await response.json()
            //console.log('response ', data)
    
            const tickers = data.tickers || [];
            const usdVolume = tickers.filter(ticker => ticker.target === 'USD').reduce((acc, ticker) => acc + ticker.converted_volume.usd, 0);
            const usdtVolume = tickers.filter(ticker => ticker.target === 'USDT').reduce((acc, ticker) => acc + ticker.converted_volume.usd, 0);
            const usdPrice = tickers.find(ticker => ticker.target === 'USD').last;
            const twentyfourhVolume = usdVolume + usdtVolume;

            console.log(`Last USD Price: ${usdPrice}`);
            console.log(`Total USD Converted Volume for Shimmer: ${twentyfourhVolume}`);

            return { usd_price: usdPrice, total_volume: twentyfourhVolume };
        } else {
            console.log('Error: Unable to fetch data from the API', response.status);
        }
    } catch (error) {
        console.log('Error:', error);
    }
}
