// // /////static Config and Symbols to track
const shimmerOnchainDepositAlias = "0xccc7018e4fa63e5014332f45ddc8a5450da89572676d12d4d5e51c98d64155b3";

export async function getShimmerData (fetch) {
    ///# Make the API request
    let url =  `https://api.shimmer.network/api/indexer/v1/outputs/alias/${shimmerOnchainDepositAlias}`
    
    try {
        const headers = new Headers();
        // headers.append('Authorization', 'Bearer yourAccessToken');
        headers.append('accept', 'application/json');
        
        const response = await fetch(url , {
            method: 'GET',
            headers: headers,
            timeout: 10000
        });
        

        if (response.ok) {
            const data = await response.json()
            const shimmerApiResponse = data || {}

            console.log('shimmer test', shimmerApiResponse)

            const responseLedgerIndex =  shimmerApiResponse.ledgerIndex
            const responseOutputId = (shimmerApiResponse.items || [])[0];
            let shimmerOnchainTokenAmount = null;


            if (responseOutputId) {
                let outputUrl = `https://api.shimmer.network/api/core/v2/outputs/${responseOutputId}`;
        
                while (true) {
                    const responseOutputIdData = await fetch(outputUrl);
                    const outputData = await responseOutputIdData.json()
                    const outputIdData = outputData || {};
            
                    if (outputIdData.metadata?.isSpent) {
                        const itemContent = outputIdData.metadata.transactionIdSpent;
                        outputUrl = `https://api.shimmer.network/api/core/v2/outputs/${itemContent}`;
                    } else {
                        shimmerOnchainTokenAmount = outputIdData.output?.amount;
                        break;
                    }
                }
            }

            if (shimmerOnchainTokenAmount !== null) {
                console.log(`Shimmer On Chain Amount: ${shimmerOnchainTokenAmount}`);
                return { shimmer_onchain_token_amount: shimmerOnchainTokenAmount };
            } else {
                console.log('Shimmer TVL Value not found in the response.');
            }
        } else {
            console.log('Error: Unable to fetch data from the API.', response.status);
        }
    } catch (error) {
        console.log('Error:', error);
    }    
}