import { redirect } from '@sveltejs/kit'

import { getCoingeckoExchangeData } from "./../../../lib/helper/coingecko.js"
import { calculateTotalBitfinexDepth } from "./../../../lib/helper/bifinex.js"
import { getDefillamaData } from "./../../../lib/helper/defilama.js"
import { getGeckoterminalData } from "./../../../lib/helper/geckoTerminal.js"
import { getShimmerData } from "./../../../lib/helper/shimmer.js"
import { formatCurrency , formatShimmerAmount} from "./../../../lib/helper/formatting.js"

///firebase Trends
import { getLastNDaysDataFromFirestore, addDocumentToFirestore } from './../../../lib/utils/firebase.js'
import { calculateAveragePrice, analyzePriceTrend, analyzeRankTrend } from './../../../lib/utils/trend.js'


//////store
import {get, writable} from 'svelte/store'
import trend from './../../../lib/stores/trendStore.js';



const collections = [
    "book",
    "defiVol",
    "onchain",
    "price",
    "rank",
    "tvl",
    "tx",
    "volume"
]


/////format timeStamp
async function formatTimeStampToDate (time) {
    // ////////////format timeStamp to normal js date
    const fireBaseTime = new Date(
        time.seconds * 1000 + time.nanoseconds / 1000000,
    );
    const date = fireBaseTime.toDateString();
    const atTime = fireBaseTime.toLocaleTimeString();
    const day = fireBaseTime.getDate();
    console.log(`on ${date} at ${atTime} - day ${day}`)

    return {
        date,
        atTime,
        day
    }
}


/////main API calls to fetch data
async function fetchNewMarketData(fetch) {


    ///set Time of call
    const currentTime = new Date().toLocaleString();

    ///call this first to get Price
    const coingecko = await getCoingeckoExchangeData(fetch)
    const usdPrice = coingecko.usd_price
    const totalVolume = coingecko.total_volume

    ///use this price to get orderBook 
    const bookDepth = await calculateTotalBitfinexDepth( usdPrice, fetch)

    ///Get TVL + Rank
    const defiLama = await getDefillamaData(fetch)
    const tvl = defiLama.shimmer_tvl
    const rank = defiLama.shimmer_rank

    ///get Terminal transaction Volume and 24hr Total
    const geckoTerminal = await getGeckoterminalData(fetch)
    const defiTotalVolume = geckoTerminal.defi_total_volume 
    const defiTx24hr = geckoTerminal.total_defi_tx_24h 

    ///get shimmer Onchain Token
    const shimmer = await getShimmerData(fetch)
    const onChainAmount = shimmer.shimmer_onchain_token_amount

    // console.log("coingecko ", coingecko)
    // console.log("Total book depth ",bookDepth)
    // console.log("Lama data ",defiLama)
    // console.log("Terminal data ",geckoTerminal)
    // console.log("shimmer data ",shimmer)


    //////////////////////////
    //Orderbook Formatting

    let positiveOrderBookDepthStr2Percent = '';
    let negativeOrderBookDepthStr2Percent = '';
    let positiveOrderBookDepthStr5Percent = '';
    let negativeOrderBookDepthStr5Percent = '';
    let positiveOrderBookDepthStr10Percent = '';
    let negativeOrderBookDepthStr10Percent = '';
    let positiveOrderBookDepthStr20Percent = '';
    let negativeOrderBookDepthStr20Percent = '';


    for (const [percentage, data] of Object.entries(bookDepth.totalOrderBookDepth)) {

        let buyData = undefined
        let sellData = undefined


        console.log(`DAT in loop ${JSON.stringify(data)}`);

        // Format the 'buy' data using formatCurrency() function
        if (data.buy > 0 ) {
            const formattedBuyData = await formatCurrency(data.buy, '');
           // buyData = `Buy: ${formattedBuyData}\n\n`;
            buyData = `${formattedBuyData}`;
        }

        // if ('buy' in data) {
        //     const formattedBuyData = await formatCurrency(data.buy, 'SMR');
        //     buyData = `Buy: ${formattedBuyData}\n\n`;
        // } else {
        //     console.log(`Missing 'buy' key for percentage level ${percentage}`);
        // }


        if (data.sell > 0 ) {
            const formattedSellData = await formatCurrency(data.sell, '');
            //sellData = `Sell: ${formattedSellData}\n\n`;
            sellData = `${formattedSellData}`;
        }

        // // Format the 'sell' data using formatCurrency() function
        // if ('sell' in data) {
        //     const formattedSellData = await formatCurrency(data.sell, 'SMR');
        //     sellData = `Sell: ${formattedSellData}\n\n`;
        // } else {
        //     console.log(`Missing 'sell' key for percentage level ${percentage}`);
        // }

       // const buySellInfo = `**${percentage}**:\n${buyData ? buyData : sellData}`;

       const buySellInfo = `${buyData ? buyData : sellData}`;

    //    const buySellInfo = {
    //         percentage,
    //         buyData,
    //         sellData
    //    }

        if (parseInt(percentage) === -2) {
            negativeOrderBookDepthStr2Percent += buySellInfo;
        } else if (parseInt(percentage) === -5) {
            negativeOrderBookDepthStr5Percent += buySellInfo;
        } else if (parseInt(percentage) === -10) {
            negativeOrderBookDepthStr10Percent += buySellInfo;
        } else if (parseInt(percentage) === -20) {
            negativeOrderBookDepthStr20Percent += buySellInfo;
        } else if (parseInt(percentage) === 2) {
            positiveOrderBookDepthStr2Percent += buySellInfo;
        } else if (parseInt(percentage) === 5) {
            positiveOrderBookDepthStr5Percent += buySellInfo;
        } else if (parseInt(percentage) === 10) {
            positiveOrderBookDepthStr10Percent += buySellInfo;
        } else if (parseInt(percentage) === 20) {
            positiveOrderBookDepthStr20Percent += buySellInfo;
        }

    }

    ///////////////
    console.log('Price (Coingecko)', `${await formatCurrency(usdPrice)}`)
    console.log('24h Volume (Bitfinex)', `${await formatCurrency(totalVolume)}`)

    console.log('Shimmer Rank (DefiLlama)', rank)
    console.log('Shimmer Onchain Amount (Shimmer API)', `${await formatCurrency(await formatShimmerAmount(onChainAmount), 'SMR')}`)
    console.log('Total Value Locked (DefiLlama)', `${await formatCurrency(tvl)}`)
    console.log('24h DeFi Transactions (GeckoTerminal)', defiTx24hr)
    console.log('24h DeFi Volume (GeckoTerminal)', `${await formatCurrency(defiTotalVolume)}`)


    console.log('Order Book depth ±2%', `${negativeOrderBookDepthStr2Percent} ${positiveOrderBookDepthStr2Percent}`)
    console.log('Order Book depth ±5%', `${negativeOrderBookDepthStr5Percent} ${positiveOrderBookDepthStr5Percent}`)
    console.log('Order Book depth ±10%', `${negativeOrderBookDepthStr10Percent} ${positiveOrderBookDepthStr10Percent}`)
    console.log('Order Book depth ±20%', `${negativeOrderBookDepthStr20Percent} ${positiveOrderBookDepthStr20Percent}`)


    const formatedData = {
        price : `Price (Coingecko) ${await formatCurrency(usdPrice)}`,
        volume24hr: `24h Volume (Bitfinex) ${await formatCurrency(totalVolume)}`,
        defiRank: `Shimmer Rank (DefiLlama) ${rank}`,
        shimmerOnChainAmount: `Shimmer Onchain Amount (Shimmer API) ${await formatCurrency(await formatShimmerAmount(onChainAmount), 'SMR')}`,
        defiTvl: `Total Value Locked (DefiLlama) ${await formatCurrency(tvl)}`,
        tx24hr: `24h DeFi Transactions (GeckoTerminal) ${defiTx24hr}`,
        totalVolume: `24h DeFi Volume (GeckoTerminal) ${await formatCurrency(defiTotalVolume)}`,
        book2: `Order Book depth ±2% ${negativeOrderBookDepthStr2Percent} ${positiveOrderBookDepthStr2Percent}`,
        book5: `Order Book depth ±5% ${negativeOrderBookDepthStr5Percent} ${positiveOrderBookDepthStr5Percent}`,
        book10: `Order Book depth ±10% ${negativeOrderBookDepthStr10Percent} ${positiveOrderBookDepthStr10Percent}`,
        book20: `Order Book depth ±20% ${negativeOrderBookDepthStr20Percent} ${positiveOrderBookDepthStr20Percent}`,
    }

    const book = [
        {   
            percent: 2,
            neg: negativeOrderBookDepthStr2Percent,
            pos: positiveOrderBookDepthStr2Percent
        },
        {   
            percent: 5,
            neg: negativeOrderBookDepthStr5Percent,
            pos: positiveOrderBookDepthStr5Percent
        },
        {   
            percent: 10,
            neg: negativeOrderBookDepthStr10Percent,
            pos: positiveOrderBookDepthStr10Percent
        },
        {   
            percent: 20,
            neg: negativeOrderBookDepthStr20Percent,
            pos: positiveOrderBookDepthStr20Percent
        }
    ]
    

    return {
        bookDepth,
        usdPrice,
        totalVolume,
        tvl,
        rank,
        defiTotalVolume,
        defiTx24hr,
        onChainAmount,
        formatedData,
        currentTime,
        book,
    }

}


async function saveRetrievedDataInFirestore(data) {

    if (!data) 
        return

    try {
        const book = await data.book
        const defiTx24hr = await data.defiTx24hr
        const onChainAmount = await data.onChainAmount
        const defiTotalVolume = await data.defiTotalVolume
        const tvl = await data.tvl
        const rank = await data.rank
        const usdPrice = await data.usdPrice
        const totalVolume = await data.totalVolume

        ///saving each new value to its firebase collection
        const savedPrice = await addDocumentToFirestore('price', usdPrice)
        const savedVolume = await addDocumentToFirestore('volume',totalVolume )
        const savedRank = await addDocumentToFirestore('rank', rank)
        const savedTVL = await addDocumentToFirestore('tvl',tvl )
        const savedOnchainAmount = await addDocumentToFirestore('onchain', onChainAmount)
        const savedDefiTx = await addDocumentToFirestore('tx',defiTx24hr )
        const savedDefiVol = await addDocumentToFirestore('defiVol',defiTotalVolume )
        const savedBook = await addDocumentToFirestore('book',book )

        const disk = {
            pricee : savedPrice.id,
            vol: savedVolume.id,
            defiRank: savedRank.id,
            defiTVL: savedTVL.id,
            amount: savedOnchainAmount.id, 
            tx: savedDefiTx.id,
            defiVol: savedDefiVol.id,
            book: savedBook.id
        }

        return disk

    } catch (error) {
        console.error('Error adding document to Firestore:', error);
        throw error;
    }
}





async function dateCheckOnceADay (fetch) {

    const currentDay = new Date().getDate()
    const latestPrice = await getLastNDaysDataFromFirestore('price', 1);
    const dataTimeStamp = await formatTimeStampToDate(latestPrice[0].createdAt)


    if (currentDay === dataTimeStamp.day) {
        ///same day
        console.log('same day - do nothing')

        return true
    } else {
        console.log('not the same day')
        ////////////////////////
        ////make api calls to fetch market data 
        ///// take the respond and save it Firebase db


        const marketData = await fetchNewMarketData(fetch);
        const savedData = await saveRetrievedDataInFirestore(marketData)
        console.log('saved', savedData)

        return false
    }
}


export async function GET({ url, params, fetch }) {


    const isSameDay =  await dateCheckOnceADay(fetch)
    
    const options = {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
    }
    
    return new Response(JSON.stringify(isSameDay), options)
}


// export const load = async ({ params, event, fetch  }) => {    

//     ///fetch new Data from Market places
//     const marketData = await fetchNewMarketData(fetch);
//     //const savedData = await saveRetrievedDataInFirestore(marketData)
//     //console.log('saved', savedData)


//     // const response = await fetch('./api/firebase/save', {
//     //     method: 'POST',
//     //     body: marketData
//     // });


//     console.log('saved via post', response)

// }