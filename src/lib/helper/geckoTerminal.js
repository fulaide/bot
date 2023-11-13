

// Symbols to track
const geckoterminalTicker = "shimmerevm";


export async function getGeckoterminalData (fetch) {
    ///# Make the API request to get order book data
    let url = `https://api.geckoterminal.com/api/v2/networks/${geckoterminalTicker}/pools`;
    
    try {
        const headers = new Headers();
        headers.append('accept', 'application/json');
        let totalDefiVolumeUsdH24 = 0;
        let totalDefiTx24h = 0;
        let page = 1;

        while (true) {
            // Make a request to the GeckoTerminal API with the current page number
            const response = await fetch(`${url}?page=${page}`, { headers, timeout: 10000 });

            if (response.ok) {
                const data = await response.json()
                const defiVolumeData = data.data

                //console.log('response', defiVolumeData)

                for (const entry of defiVolumeData) {
                    const h24Volume = parseFloat(entry.attributes.volume_usd.h24);
                    totalDefiVolumeUsdH24 += h24Volume;
        
                    // Extract transactions data for h24
                    const transactionsH24 = entry.attributes.transactions.h24;
                    const buysH24 = transactionsH24.buys || 0;
                    const sellsH24 = transactionsH24.sells || 0;
                    // Perform operations with buysH24 and sellsH24 as needed
                    totalDefiTx24h += buysH24 + sellsH24;
                }

                console.log(`Total USD 24h Volume for all pools: ${totalDefiVolumeUsdH24}`);
                console.log(`Total 24h Defi Transactions for ShimmerEVM: ${totalDefiTx24h}`);
                

                if (totalDefiVolumeUsdH24 > 0 && totalDefiTx24h > 0) {
                    return { defi_total_volume: totalDefiVolumeUsdH24, total_defi_tx_24h: totalDefiTx24h };
                } else {
                    console.log('Shimmer Total Volume or Total Transactions not found in the response.');
                }

                return 
            } else if (defiVolume.status === 404) {
                console.log(`404 Client Error: Not Found for URL: ${response.config.url}`);
            } else {
                console.log(`Unexpected status code: ${response.status}`);
            }

            page += 1;
        }

    } catch (error) {
        console.log('Error:', error);
    }    
}