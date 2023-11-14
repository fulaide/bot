import { redirect } from '@sveltejs/kit'



import { getCoingeckoExchangeData } from "./../lib/helper/coingecko.js"
import { calculateTotalBitfinexDepth } from "./../lib/helper/bifinex.js"
import { getDefillamaData } from "./../lib/helper/defilama.js"
import { getGeckoterminalData } from "./../lib/helper/geckoTerminal.js"
import { getShimmerData } from "./../lib/helper/shimmer.js"
import { formatCurrency , formatShimmerAmount} from "./../lib/helper/formatting.js"

// // /////static Config and Symbols to track
// const bitfinexTickers = ["tSMRUSD", "tSMRUST"];
// const coingeckoCoinId = "shimmer";
// const coingeckoExchangeId = "bitfinex";
// const geckoterminalTicker = "shimmerevm";
// const shimmerOnchainDepositAlias = "0xccc7018e4fa63e5014332f45ddc8a5450da89572676d12d4d5e51c98d64155b3";
// const percentageLevels = [-2, 2, -5, 5, -10, 10, -20, 20];



///firebase Trends
import { getLastNDaysDataFromFirestore } from './../lib/utils/firebase.js'
import { calculateAveragePrice, analyzePriceTrend } from './../lib/utils/trend.js'



/////main API calls to fetch data
async function main(fetch) {


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


////////////Trands Data from Firebase
const retrieveTrendData = async (collectionName, currentValue, numberOfDaysToRetrieve) => {

    // Data comaprision
    let lastNDaysData = []
    //fetch last Ndays of Data
    const lastNDaysDataSet = await getLastNDaysDataFromFirestore(collectionName, numberOfDaysToRetrieve);
    console.log(`Last ${numberOfDaysToRetrieve} Days Data:`, lastNDaysDataSet);


    //// NdaysData and extract value
    const dataRange = lastNDaysDataSet.forEach((day) => {
        lastNDaysData.push(day.value)
    });


    ///calc average
    const averageValueLastNDays = await calculateAveragePrice(lastNDaysData, numberOfDaysToRetrieve);
    console.log(`Average Value of Last ${numberOfDaysToRetrieve} Days: ${averageValueLastNDays.toFixed(4)}`);
    
    const result = await analyzePriceTrend(currentValue, averageValueLastNDays);
    console.log(`Trend: ${result.trend}, Percentage Difference: ${result.percentageDifference.toFixed(2)}%`);
    

    const data = {
        current: currentValue,
        trend: result.trend,
        differance: await result.percentageDifference.toFixed(2)
    }

    return data
}

export const load = async ({ params, event, fetch  }) => {    

    const pageData = await main(fetch);
    // const pageData = {}

    const currentPrice = await pageData.usdPrice
    const daysToCompare = 3

    const trendDataPrice = await retrieveTrendData('price', currentPrice, daysToCompare )
    //console.log('export', trendDataPrice)
    

    return {
        pageData,
        trendDataPrice,
    }
}