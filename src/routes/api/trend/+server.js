import { redirect } from '@sveltejs/kit'

import { getCoingeckoExchangeData } from "../../../lib/helper/coingecko.js"
import { calculateTotalBitfinexDepth } from "../../../lib/helper/bifinex.js"
import { getDefillamaData } from "../../../lib/helper/defilama.js"
import { getGeckoterminalData } from "../../../lib/helper/geckoTerminal.js"
import { getShimmerData } from "../../../lib/helper/shimmer.js"
import { formatCurrency , formatShimmerAmount } from "../../../lib/helper/formatting.js"

///firebase Trends
import { getLastNDaysDataFromFirestore, addDocumentToFirestore } from '../../../lib/utils/firebase.js'
import { calculateAveragePrice, analyzePriceTrend, analyzeRankTrend } from '../../../lib/utils/trend.js'


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

    const isRank = url.searchParams.get('rank')
    let numberOfDays = url.searchParams.get('days')

    let pageData ={}
    console.log('days', numberOfDays)

    if(!numberOfDays) {
        numberOfDays = 1
    } 


    if(isRank === true ) {
         /////Getting Today's data from Firebase db
       // pageData = await loadTodaysDataFromFirebase(1)
        //console.log(pageData)
    }


    

    const options = {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
    }
  
    return new Response(JSON.stringify(pageData), options)
}
