

const defilamaName = "ShimmerEVM";

export async function getDefillamaData (fetch) {
    ///# Make the API request to get order book data
    let url = 'https://api.llama.fi/v2/chains';
    
    try {
        const headers = new Headers();
        // headers.append('Authorization', 'Bearer yourAccessToken');
        headers.append('accept', 'application/json');
        
        const response = await fetch(url , {
            method: 'GET',
            headers: headers,
            timeout: 10000
        });
        

        let shimmerTvl = null
        let rank = null

        if (response.ok) {
            const data = await response.json()
        
            const shimmerEntry = data.find(entry => entry.name === defilamaName);

            if (shimmerEntry) {
                shimmerTvl = shimmerEntry.tvl;
                data.sort((a, b) => (b.tvl || 0) - (a.tvl || 0));
                rank = data.findIndex(entry => entry.name === defilamaName) + 1;

                console.log(`Shimmer TVL Value: ${shimmerTvl}`);
                console.log(`Shimmer TVL Rank: ${rank}`);
            }

            return { shimmer_tvl: shimmerTvl, shimmer_rank: rank }
        } else {
            console.log('DefiLlama API request timed out:', response.status);
        }
    } catch (error) {
        console.log('Error:', error);
    }    
}