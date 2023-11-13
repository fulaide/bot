const fetch = require('node-fetch'); // For making HTTP requests
const axios = require('axios'); // For handling requests

const logger = console; // Replace with your actual logger

// Load configuration
const config = require('./config.json'); // Replace with your actual configuration file

async function getDefillamaData() {
  try {
    logger.info('Getting the DefiLlama TVL and rank');
    const defillamaUrl = 'https://api.llama.fi/v2/chains';
    const headers = { 'accept': '*/*' };
    let shimmerTvl = null;
    let rank = null;

    const tvlResponse = await axios.get(defillamaUrl, { headers, timeout: 10000 });
    logger.debug(`DefiLlama TVL response: ${tvlResponse.data}`);

    if (tvlResponse.status === 200) {
      const tvlData = tvlResponse.data;
      const shimmerEntry = tvlData.find(entry => entry.name === 'ShimmerEVM');

      if (shimmerEntry) {
        shimmerTvl = shimmerEntry.tvl;
        tvlData.sort((a, b) => (b.tvl || 0) - (a.tvl || 0));
        rank = tvlData.findIndex(entry => entry.name === 'ShimmerEVM') + 1;

        logger.debug(`Shimmer TVL Value: ${shimmerTvl}`);
        logger.debug(`Shimmer TVL Rank: ${rank}`);
      }
    }

    return { shimmer_tvl: shimmerTvl, shimmer_rank: rank };
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      logger.error('DefiLlama API request timed out.');
    } else {
      logger.error(`Error: ${error.message}`);
    }
  }
}
