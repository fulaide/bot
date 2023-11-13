
// /////static Config and Symbols to track
const bitfinexTickers = ["tSMRUSD", "tSMRUST"];
const percentageLevels = [-2, 2, -5, 5, -10, 10, -20, 20];

// const bitfinexTickers = import.meta.env.VITE_BITFINEX_TICKERS
// const coingeckoCoinId = import.meta.env.VITE_COINGECKO_COIN_ID
// const coingeckoExchangeId = import.meta.env.VITE_COINGECKO_EXCHANGE_ID
// const geckoterminalTicker = import.meta.env.VITE_GECKO_TERMINAL_TICKER
// const shimmerOnchainDepositAlias = import.meta.env.VITE_SHIMMER_ONCHAIN_DEPOSIT_ALIAS
// const percentageLevels = import.meta.env.VITE_PERCENTAGE_LEVELS


export async function getBitfinexOrderBookData (fetch, ticker) {

    /*
    ////////////////////////////////////////////////////////////////
    Get Bitfinex order book data for a specific ticker from the API.
    
    Args:
        ticker (str): The Bitfinex ticker symbol for the cryptocurrency pair.
        
    Returns:
        dict: A dictionary containing order book data for the specified ticker.
              The dictionary includes price, quantity, and other relevant information
              for both buy and sell orders in the order book.
    Raises:
        requests.exceptions.RequestException: If there is an issue with the HTTP request to the Bitfinex API.
    ////////////////////////////////////////////////////////////////
    */

    ///# Make the API request to get order book data
    let url = `https://api-pub.bitfinex.com/v2/book/${ticker}/R0?len=100`
    
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
            //console.log('response', data); // Process the response data here
            return data
        } else {
            console.log('Request failed with status:', response.status);
        }
    } catch (error) {
        console.log('Error:', error);
    }    
}

export async function combineBitfinexOrderBookData(fetch) {
    /*
     Combine order book data for multiple Bitfinex tickers into a dictionary.
    
    Returns:
        dict: A dictionary where keys are Bitfinex tickers, and values are dictionaries containing
              order book data for each ticker. Each inner dictionary includes price, quantity,
              and other relevant information for both buy and sell orders in the order book.
    Raises:
        requests.exceptions.RequestException: If there is an issue with the HTTP request to the Bitfinex API.
    */
    const orderBooksData = {};
    try {
        for (const ticker of bitfinexTickers) {
            const orderBookData = await getBitfinexOrderBookData(fetch, ticker);
            if (orderBookData !== undefined) {
                orderBooksData[ticker] = orderBookData;
                console.log(`Order book data: ${orderBookData}`);
            }
        }
        return orderBooksData;
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

export async function getBitfinexOrderBookDepth(usdPrice, fetch) {
    /*
     Get the order book depth for a list of Bitfinex tickers at various percentage levels.
    
    Args:
        tickers (list): A list of Bitfinex tickers for which order book depth is to be calculated.
        usd_price (float): The current USD price of the cryptocurrency.
        
    Returns:
        dict: A dictionary containing order book depth for each ticker at different percentage levels.
              The keys are tickers, and the values are dictionaries with buy and sell quantities
              for each specified percentage level.
    Raises:
        requests.exceptions.RequestException: If there is an issue with the HTTP request to the Bitfinex API.
    */

    const orderBook = await combineBitfinexOrderBookData(fetch);
    const orderBookDepth = {};

    try {
        for (const ticker in orderBook) {
            const orders = orderBook[ticker];
            const tickerDepth = {};

            for (const percentage of percentageLevels) {
                const priceLevel = usdPrice * (1 + percentage / 100);
                let buyQuantity = 0;
                let sellQuantity = 0;
                console.log('Order book in function: ', orderBook);

                for (const order of orders) {
                const price = order[1];
                const amount = order[2];

                if (price >= priceLevel && amount > 0) {
                    buyQuantity += amount;
                } else if (price <= priceLevel && amount < 0) {
                    sellQuantity -= amount;
                }
                }

                tickerDepth[`${percentage}%`] = { buy: buyQuantity, sell: sellQuantity };
                console.log('Depth after for loop: ', tickerDepth);
            }

            orderBookDepth[ticker] = tickerDepth;
        }

        console.log(`Order book depth: `, orderBookDepth);
        return orderBookDepth;
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

export async function calculateTotalBitfinexDepth(usdPrice, fetch) { 
    /*
     Calculate the total Bitfinex order book depth by summing buy and sell quantities
    for each percentage level across multiple tickers.
    
    Args:
        tickers (list): A list of Bitfinex tickers for which total order book depth is to be calculated.
        usd_price (float): The current USD price of the cryptocurrency.
        
    Returns:
        dict: A dictionary containing the total order book depth for each percentage level.
              The keys are percentage levels, and the values are dictionaries with total buy
              and sell quantities across all specified tickers.
    */
    try {
        console.log('Calculating the total Bitfinex Order Book Depth');
        const orderBookDepth = await getBitfinexOrderBookDepth(usdPrice, fetch);
        console.log('orderBookDepth for calculate total: ', orderBookDepth);
        const totalOrderBookDepth = {};

        for (const percentage in orderBookDepth[Object.keys(orderBookDepth)[0]]) {
            let totalBuy = 0;
            let totalSell = 0;

            for (const ticker in orderBookDepth) {
                totalBuy += orderBookDepth[ticker][percentage].buy;
                totalSell += orderBookDepth[ticker][percentage].sell;
            }
            totalOrderBookDepth[percentage] = { buy: totalBuy, sell: totalSell };
        }
        return { totalOrderBookDepth };
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}
