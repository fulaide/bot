const fetch = require('node-fetch'); // For making HTTP requests
const axios = require('axios'); // For handling requests

const logger = console; // Replace with your actual logger

// Load configuration
const config = require('./config.json'); // Replace with your actual configuration file

// Shimmer data
const shimmerOnchainDepositAlias = config.shimmerOnchainDepositAlias;

async function getShimmerData() {
  try {
    logger.info('Getting data from Shimmer API');
    const shimmerExplorerApiUrl = `https://api.shimmer.network/api/indexer/v1/outputs/alias/${shimmerOnchainDepositAlias}`;
    const headers = { 'accept': 'application/json' };

    const shimmerApiResponse = await axios.get(shimmerExplorerApiUrl, { headers, timeout: 10000 });
    shimmerApiResponse.data = shimmerApiResponse.data || {};
    logger.debug(`Shimmer Explorer API response: ${JSON.stringify(shimmerApiResponse.data)}`);

    if (shimmerApiResponse.status === 200) {
      const responseOutputId = (shimmerApiResponse.data.items || [])[0];
      let shimmerOnchainTokenAmount = null;

      if (responseOutputId) {
        let outputUrl = `https://api.shimmer.network/api/core/v2/outputs/${responseOutputId}`;

        while (true) {
          const responseOutputIdData = await axios.get(outputUrl);
          const outputIdData = responseOutputIdData.data || {};

          if (outputIdData.metadata?.isSpent) {
            const itemContent = outputIdData.metadata.transactionIdSpent;
            outputUrl = `https://api.shimmer.network/api/core/v2/outputs/${itemContent}`;
          } else {
            shimmerOnchainTokenAmount = outputIdData.output?.amount;
            break;
          }
        }
      }

      if (shimmerOnchainTokenAmount !== null) {
        logger.debug(`Shimmer On Chain Amount: ${shimmerOnchainTokenAmount}`);
        return { shimmer_onchain_token_amount: shimmerOnchainTokenAmount };
      } else {
        logger.debug('Shimmer TVL Value not found in the response.');
      }
    } else {
      logger.debug('Error: Unable to fetch data from the API.');
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      logger.error('Shimmer API request timed out.');
    } else {
      logger.error(`Error: ${error.message}`);
    }
  }
}
