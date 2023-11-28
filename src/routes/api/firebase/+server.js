import { redirect } from '@sveltejs/kit'

import { getCoingeckoExchangeData } from "../../../lib/helper/coingecko.js"
import { calculateTotalBitfinexDepth } from "../../../lib/helper/bifinex.js"
import { getDefillamaData } from "../../../lib/helper/defilama.js"
import { getGeckoterminalData } from "../../../lib/helper/geckoTerminal.js"
import { getShimmerData } from "../../../lib/helper/shimmer.js"
import { formatCurrency , formatShimmerAmount } from "../../../lib/helper/formatting.js"

///firebase Trends
import { getLastNDaysDataFromFirestore, addDocumentToFirestore } from '../../../lib/utils/firebase.js'
import { calculateAveragePrice, analyzePriceTrend, analyzeRankTrend } from './../../../lib/utils/trend.js'


//////store
import {get, writable} from 'svelte/store'
import trend from '../../../lib/stores/trendStore.js';

import { json } from '@sveltejs/kit'

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

const loadTodaysDataFromFirebase  = async (days)  => {

    let resultObject = {}
    let timeStamp = {}
    const numberOfDays = days
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

    const currentTime = await formatTimeStampToDate(timeStamp)

    resultObject = {...resultObject, currentTime}
    return resultObject
}



//////////////////
////Trend fetching and calc

////////////Trands Data from Firebase
const retrieveTrendData = async (collectionName, currentValue, numberOfDaysToRetrieve) => {

    // Data comaprision
    let lastNDaysData = []
    //fetch last Ndays of Data
    const lastNDaysDataSet = await getLastNDaysDataFromFirestore(collectionName, numberOfDaysToRetrieve);
    console.log(`Last ${numberOfDaysToRetrieve} Days Data:`, lastNDaysDataSet);


    //// NdaysData and extract value
    const dataRange = await lastNDaysDataSet.forEach((day) => {
        lastNDaysData.push(day.value)
    });

    //////////////////// 
    ///calc average
    //console.log('HHHHHHHHHHH', lastNDaysData, numberOfDaysToRetrieve);
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

    //console.log('days in func 2', numberOfDaysToRetrieve)

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

/////combine both in one call 
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


export async function GET({ url, params }) {

    const slug = url.searchParams.get('direction')
    let numberOfDays = url.searchParams.get('days')

    let pageData ={}
    let trendData = {}
    let trendDataPrice = {}
    let data = {}

    console.log('days', numberOfDays)

    if(!numberOfDays) {
        numberOfDays = 2
    } 


    if(slug === 'retreive' ) {

         /////Getting Today's data from Firebase db
        pageData = await loadTodaysDataFromFirebase(1)
        //console.log(pageData)

        const allData = await pageData
        const currentPrice = await pageData.price


        trendDataPrice = await retrieveTrendData('price', currentPrice, numberOfDays )
        trendData = await calcTrendforAllDataPoints(allData, numberOfDays)

        //console.log('tend', trendData)

        data = {
            pageData,
            trendDataPrice,
            trendData
        }
    }

    const options = {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
    }
  
    return new Response(JSON.stringify(data), options)
}




// export async function POST({ request }) {
// 	const { a, b } = await request.json();
// 	return json(a + b);
// }



