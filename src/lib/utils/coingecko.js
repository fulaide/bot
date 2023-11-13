const fetch = require('node-fetch'); // For making HTTP requests
const axios = require('axios'); // For handling requests

const logger = console; // Replace with your actual logger

// Load configuration
const config = require('./config.json'); // Replace with your actual configuration file

// Shimmer data
const coingeckoCoinId = config.coingeckoCoinId;
const coingeckoExchangeId = config.coingeckoExchangeId;

async function getCoingeckoExchangeData() {
  try {
    logger.info('Getting the Coingecko Exchange data');
    const coingeckoExchangeUrl = `https://api.coingecko.com/api/v3/exchanges/${coingeckoExchangeId}/tickers?coin_ids=${coingeckoCoinId}`;
    const headers = { 'accept': 'application/json' };
    const exchangeResponse = await axios.get(coingeckoExchangeUrl, { headers, timeout: 10000 });
    logger.debug(`Coingecko exchange response: ${exchangeResponse.data}`);

    if (exchangeResponse.status === 200) {
      const tickers = exchangeResponse.data.tickers || [];
      const usdVolume = tickers.filter(ticker => ticker.target === 'USD').reduce((acc, ticker) => acc + ticker.converted_volume.usd, 0);
      const usdtVolume = tickers.filter(ticker => ticker.target === 'USDT').reduce((acc, ticker) => acc + ticker.converted_volume.usd, 0);
      const usdPrice = tickers.find(ticker => ticker.target === 'USD').last;
      const twentyfourhVolume = usdVolume + usdtVolume;

      logger.debug(`Last USD Price: ${usdPrice}`);
      logger.debug(`Total USD Converted Volume for Shimmer: ${twentyfourhVolume}`);

      return { usd_price: usdPrice, total_volume: twentyfourhVolume };
    } else {
      logger.debug('Error: Unable to fetch data from the API.');
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      logger.error('Coingecko API request timed out.');
    } else {
      logger.error(`Error: ${error.message}`);
    }
  }
}
