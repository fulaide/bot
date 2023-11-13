const fetch = require('node-fetch'); // For making HTTP requests
const axios = require('axios'); // For handling requests

const logger = console; // Replace with your actual logger

// Load configuration
const config = require('./config.json'); // Replace with your actual configuration file

// Shimmer data
const geckoterminalTicker = config.geckoterminalTicker;

async function getGeckoterminalData() {
  try {
    logger.info('Getting GeckoTerminal Defi Volume data for ShimmerEVM');
    const geckoterminalUrl = `https://api.geckoterminal.com/api/v2/networks/${geckoterminalTicker}/pools`;
    const headers = { 'accept': 'application/json' };
    let totalDefiVolumeUsdH24 = 0;
    let totalDefiTx24h = 0;
    let page = 1;

    while (true) {
      // Make a request to the GeckoTerminal API with the current page number
      const defiVolume = await axios.get(`${geckoterminalUrl}?page=${page}`, { headers, timeout: 10000 });

      if (defiVolume.status === 200) {
        const defiVolumeData = defiVolume.data.data || [];

        for (const entry of defiVolumeData) {
          const h24Volume = parseFloat(entry.attributes.volume_usd.h24);
          totalDefiVolumeUsdH24 += h24Volume;

          // Extract transactions data for h24
          const transactionsH24 = entry.attributes.transactions.h24;
          const buysH24 = transactionsH24.buys || 0;
          const sellsH24 = transactionsH24.sells || 0;
          // Perform operations with buysH24 and sellsH24 as needed
          totalDefiTx24h += buysH24 + sellsH24;
        }

        logger.debug(`Total USD 24h Volume for all pools: ${totalDefiVolumeUsdH24}`);
        logger.debug(`Total 24h Defi Transactions for ShimmerEVM: ${totalDefiTx24h}`);

        if (totalDefiVolumeUsdH24 > 0 && totalDefiTx24h > 0) {
          return { defi_total_volume: totalDefiVolumeUsdH24, total_defi_tx_24h: totalDefiTx24h };
        } else {
          logger.debug('Shimmer Total Volume or Total Transactions not found in the response.');
        }
      } else if (defiVolume.status === 404) {
        logger.error(`404 Client Error: Not Found for URL: ${defiVolume.config.url}`);
      } else {
        logger.error(`Unexpected status code: ${defiVolume.status}`);
      }

      page += 1;
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      logger.error('GeckoTerminal API request timed out.');
    } else {
      logger.error(`Error: ${error.message}`);
    }
  }
}
