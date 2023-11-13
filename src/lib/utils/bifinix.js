const fetch = require('node-fetch'); // For making HTTP requests
const axios = require('axios'); // For handling requests

const logger = console; // Replace with your actual logger

// Load configuration
const config = require('./config.json'); // Replace with your actual configuration file

// Shimmer data
const bitfinexTickers = config.bitfinexTickers;
const percentageLevels = [-2, 2, -5, 5, -10, 10, -20, 20];

async function getBitfinexOrderBookData(ticker) {
  try {
    const url = `https://api-pub.bitfinex.com/v2/book/${ticker}/R0?len=100`;
    const headers = { 'accept': 'application/json' };
    const response = await axios.get(url, { headers, timeout: 10000 });
    logger.debug(`Bitfinex book response: ${response.data}`);

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      logger.error('Bitfinex API request timed out.');
    } else {
      logger.error(`Error: ${error.message}`);
    }
  }
}

async function combineBitfinexOrderBookData() {
  const orderBooksData = {};
  try {
    logger.debug(`Bitfinex tickers: ${bitfinexTickers}`);
    for (const ticker of bitfinexTickers) {
      const orderBookData = await getBitfinexOrderBookData(ticker);
      if (orderBookData !== undefined) {
        orderBooksData[ticker] = orderBookData;
        logger.debug(`Order book data: ${orderBookData}`);
      }
    }
    return orderBooksData;
  } catch (error) {
    logger.error(`Error: ${error.message}`);
  }
}

async function getBitfinexOrderBookDepth(usdPrice) {
  const orderBook = await combineBitfinexOrderBookData();
  const orderBookDepth = {};

  try {
    for (const ticker in orderBook) {
      const orders = orderBook[ticker];
      const tickerDepth = {};

      for (const percentage of percentageLevels) {
        const priceLevel = usdPrice * (1 + percentage / 100);
        let buyQuantity = 0;
        let sellQuantity = 0;
        logger.debug('Order book in function: ', orderBook);

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
        logger.debug('Depth after for loop: ', tickerDepth);
      }

      orderBookDepth[ticker] = tickerDepth;
    }

    logger.debug(`Order book depth: `, orderBookDepth);
    return orderBookDepth;
  } catch (error) {
    logger.error(`Error: ${error.message}`);
  }
}

async function calculateTotalBitfinexDepth(usdPrice) {
  try {
    logger.info('Calculating the total Bitfinex Order Book Depth');
    const orderBookDepth = await getBitfinexOrderBookDepth(usdPrice);
    logger.debug('orderBookDepth for calculate total: ', orderBookDepth);
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
    logger.error(`Error: ${error.message}`);
  }
}
