import { redirect } from '@sveltejs/kit'

import { getCoingeckoExchangeData } from "./../lib/helper/coingecko.js"
import { calculateTotalBitfinexDepth } from "./../lib/helper/bifinex.js"
import { getDefillamaData } from "./../lib/helper/defilama.js"
import { getGeckoterminalData } from "./../lib/helper/geckoTerminal.js"
import { getShimmerData } from "./../lib/helper/shimmer.js"
import { formatCurrency , formatShimmerAmount} from "./../lib/helper/formatting.js"

///firebase Trends
import { getLastNDaysDataFromFirestore, addDocumentToFirestore } from './../lib/utils/firebase.js'
import { calculateAveragePrice, analyzePriceTrend, analyzeRankTrend } from './../lib/utils/trend.js'


//////store
import {get, writable} from 'svelte/store'
import trend from './../lib/stores/trendStore.js';



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

    //////////////////// 
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

////////////Trands Rank ONLY from Firebase
const retrieveRankTrendData = async (currentValue, numberOfDaysToRetrieve) => {

    const collectionName = "rank"
    // Data comaprision
    let lastNDaysData = []
    //fetch last Ndays of Data
    const lastNDaysDataSet = await getLastNDaysDataFromFirestore(collectionName, numberOfDaysToRetrieve);
    console.log(`Last ${numberOfDaysToRetrieve} Days Data:`, lastNDaysDataSet);


    //// NdaysData and extract value
    const dataRange = lastNDaysDataSet.forEach((day) => {
        lastNDaysData.push(day.value)
    });
    //////////////////////// rank

    const averageRankLastNDays = await calculateAveragePrice(lastNDaysData, numberOfDaysToRetrieve);
    console.log(`Average Rank of Last ${numberOfDaysToRetrieve} Days: ${averageRankLastNDays.toFixed(4)}`);

    // const currentRank = 75; // Replace with your actual current rank
    // const averageRankLastNDays = 70; // Replace with your actual average rank

    const result = analyzeRankTrend(currentValue, averageRankLastNDays);
    console.log(`Trend: ${result.trend}, Rank Difference: ${result.rankDifference}, Absolute Difference: ${result.absoluteDifference}, Percentage Difference: ${result.percentageDifference.toFixed(2)}%`);



    const data = {
        current: currentValue,
        trend: result.trend,
        differance: await result.percentageDifference.toFixed(2),
        absolute: result.absoluteDifference
    }

    return data
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


        // await addDocumentToFirestore('price', usdPrice)
        // await addDocumentToFirestore('volume',totalVolume )
        // await addDocumentToFirestore('rank', rank)
        // await addDocumentToFirestore('tvl',tvl )
        // await addDocumentToFirestore('onchain', onChainAmount)
        // await addDocumentToFirestore('tx',defiTx24hr )
        // await addDocumentToFirestore('defiVol',defiTotalVolume )
        // await addDocumentToFirestore('book',book )


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

        //console.log("saved Price", savedPrice.id)

        return disk

    } catch (error) {
        console.error('Error adding document to Firestore:', error);
        throw error;
    }

}

const formatTimeStampToDate = async (time) => {
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

const loadTodaysDataFromFirebase  = async ()  => {

    let resultObject = {}
    let timeStamp = {}
    const numberOfDays = 1
    // Loop over the array
    for (const element of collections) {
        // Call the function with the current array element as a parameter
        const result = await getLastNDaysDataFromFirestore(element, numberOfDays);

        // Save the result in the object with the array element as the key
        /// get the first item in the array, becuase only one day 
        // now object has createdAt & value as keys
        resultObject[element] = result[0].value;
        ///check for the price collection
        if(element === "price") {
            ////fecth createdAt Firebase timeStamp
            timeStamp = result[0].createdAt
        }
    }
    // //////loop through resultObject to extract
    // for (const element of collections) {

    //     const value = resultObject[element].value 

    //     formattedObject[element] = value
    // }

    const currentTime = await formatTimeStampToDate(timeStamp)

    resultObject = {...resultObject, currentTime}

    //console.log('retrieved', resultObject)
    //console.log('time', timeStamp)
    return resultObject
}






const calcTrendforAllDataPoints  = async (data, daysToCompare)  => {

    let resultObject = {}
    let index = 0
    // Loop over the array
    for (const element of collections) {

        if (element === "rank") {
            // Example usage:
            // const currentRank = 75; // Replace with your actual current rank
            // const averageRankLastNDays = 70; // Replace with your actual average rank

            // const result = analyzeRankTrend(currentRank, averageRankLastNDays);
            // console.log(`Trend: ${result.trend}, Rank Difference: ${result.rankDifference}, Absolute Difference: ${result.absoluteDifference}, Percentage Difference: ${result.percentageDifference.toFixed(2)}%`);
            const currentVaue = Object.values(data)[index]

            const result = await retrieveRankTrendData(currentVaue, daysToCompare)

            resultObject[element] =  {
                trend: result.trend,
                differance: result.absolute
            }

        } else if(element === "book") {
            /// do nothing
        } else {

            //console.log('KEY',  Object.values(data)[index])
            const currentVaue = Object.values(data)[index]
            
            const result = await retrieveTrendData(element, currentVaue, daysToCompare);
            // Save the result in the object with the array element as the key
            /// get the first item in the array, becuase only one day 
            // now object has createdAt & value as keys
            resultObject[element] =  {
                trend: result.trend,
                differance: result.differance
            }
            
            console.log('inside loop', result)
        }

        index = index+1
    }

    //console.log('retrieved', resultObject)
    //console.log('time', timeStamp)
    return resultObject
}

export const load = async ({ params, event, fetch  }) => {    

    ////fire api call to get market data
    //const pageData = await main(fetch);
     ///const pageData = {}
     //const trendDataPrice = {}

     const currentDay = new Date().getDate()
     const latestPrice = await getLastNDaysDataFromFirestore('price', 1);
     const dataTimeStamp = await formatTimeStampToDate(latestPrice[0].createdAt)

    //  let time = await latestPrice[0].createdAt
    //  const fireBaseTime = new Date(
    //     time.seconds * 1000 + time.nanoseconds / 1000000,
    // );
    // const date = fireBaseTime
    // // console.log('date', date.getDate() )


    //  console.log('current', currentDay )
    //  console.log('saved', dataTimeStamp.date )
    if (currentDay === dataTimeStamp.day) {
        ///same day
        console.log('same day')
    } else {
        console.log('not the same day')
        ////////////////////////
        ////make api calls to fetch market data 
        ///// take the respond and save it Firebase db
    
        const marketData = await main(fetch);
        const savedData = await saveRetrievedDataInFirestore(marketData)
        console.log('saved', savedData)
    }

    
    

    ////////////////////////
    /////Getting Today's data from Firebase db
    const pageData = await loadTodaysDataFromFirebase()
    console.log(pageData)
    const currentPrice = await pageData.price

    const allData = await pageData


    ///////check Trend daysToCompare
    const daysToCompare = 2 // get(trend)

    let days = 1

    trend.subscribe((curr) => {
        // uid = curr?.currentUser?.uid;
        days = curr
        console.log("how many days", curr)
    });
    

    /////get trend data for all retrieved data points
   // const daysToCompare = 2
    const trendData = await calcTrendforAllDataPoints(allData, daysToCompare)

    //console.log('all TRENDS', trendData)

    ///calc price trend
    const trendDataPrice = await retrieveTrendData('price', currentPrice, daysToCompare )
    ////////console.log('export', trendDataPrice)






    // ////////get latest price from firebase not API
    // const latestPrice = await getLastNDaysDataFromFirestore('price', 1);
    // //console.log(`***********************Today ${1} Days Data:`, latestPrice);
    // // const time = latestPrice.createdAt.toDate().toLocaleTimeString('en-US')

    // /////taking retrieved data and saving it to indivdual firebase collections
    // //const savedData = await saveRetrievedDataInFirestore(pageData)
    // //console.log('saved', savedData)


    // ////////////format timeStamp to normal js date
    // let time = await latestPrice[0].createdAt
    // const fireBaseTime = new Date(
    //     time.seconds * 1000 + time.nanoseconds / 1000000,
    // );
    // const date = fireBaseTime.toDateString();
    // const atTime = fireBaseTime.toLocaleTimeString();
    // console.log(`latest Price: ${latestPrice[0].value} on ${date} at ${atTime}`)



    


    return {
        pageData,
        trendDataPrice,
        trendData,
    }
}