export async function analyzePriceTrend(currentPrice, averagePriceLast7Days) {
    // Calculate the percentage difference
    const percentageDifference = ((currentPrice - averagePriceLast7Days) / averagePriceLast7Days) * 100;

    // Determine the trend based on the sign of the percentage difference
    const trend = percentageDifference > 0 ? 'up' : 'down';

    // Return the trend and percentage difference
    return {
        trend,
        percentageDifference
    };
}


// const currentPrice = 0.04397; // Replace with your actual current price
// const averagePriceLast7Days = 0.04315; // Replace with your actual average price

// const result = analyzePriceTrend(currentPrice, averagePriceLast7Days);
// console.log(`Trend: ${result.trend}, Percentage Difference: ${result.percentageDifference.toFixed(2)}%`);




export async function calculateAveragePrice(lastNDaysData, numberOfDays) {
    if (lastNDaysData.length !== numberOfDays) {
        // Ensure there are exactly seven days of prices
        throw new Error('Please provide exactly N days of data.');
    }

    const sum = lastNDaysData.reduce((acc, price) => acc + Number(price), 0);
    console.log('summ', sum)
    const averagePrice = sum / lastNDaysData.length;

    return averagePrice;
}

// Example usage:
// const lastSevenDaysPrices = [45, 48, 52, 49, 47, 50, 46]; // Replace with your actual prices

// const averagePriceLast7Days = calculateAveragePrice(lastSevenDaysPrices);
// console.log(`Average Price of Last 7 Days: ${averagePriceLast7Days.toFixed(2)}`);
