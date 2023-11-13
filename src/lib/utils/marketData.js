const Discord = require('discord.js');
const logger = console; // Replace with your actual logger
const fs = require('fs').promises;
const pickle = require('pickle'); // Make sure to install 'pickle' module

// Load configuration
const config = require('./helpers/configuration_manager').loadConfig('config.json');

// Functions
async function formatCurrency(value, currencySymbol = '$') {
  try {
    logger.info('Formatting for USD currency');
    // Split integer and decimal parts if there is a decimal point
    const parts = value.toString().split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : '';

    // Determine the number of decimal places based on the value
    const numDecimalPlaces = parseInt(integerPart) > 0 ? 2 : 5;

    // Limit decimal part to the specified number of digits
    let formattedDecimalPart = '';
    if (decimalPart && decimalPart.length > numDecimalPlaces) {
      formattedDecimalPart = decimalPart.substring(0, numDecimalPlaces);
    } else {
      formattedDecimalPart = decimalPart;
    }

    // Format integer part with commas
    let formattedIntegerPart = '';
    for (let i = integerPart.length; i > 0; i -= 3) {
      formattedIntegerPart =
        ',' + integerPart.substring(Math.max(i - 3, 0), i) + formattedIntegerPart;
    }

    // Remove leading comma if present
    if (formattedIntegerPart && formattedIntegerPart[0] === ',') {
      formattedIntegerPart = formattedIntegerPart.substring(1);
    }

    // Combine integer and decimal parts with appropriate separator
    const formattedValue =
      formattedIntegerPart + (formattedDecimalPart ? '.' + formattedDecimalPart : '');

    // Add the currency symbol and return the formatted string
    return `${currencySymbol} ${formattedValue}`;
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    return null;
  }
}

async function formatShimmerAmount(value) {
  try {
    logger.info('Formatting glow to SMR');
    // Convert the number to a float and then format it with 2 decimal places
    const formattedValue = (parseFloat(value) / 1000000).toFixed(2);
    return formattedValue;
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    return null;
  }
}

async function buildEmbed() {
  try {
    logger.info('Building Discord embed message');

    // Get data from API calls
    const current_time = new Date().toLocaleString();
    const coingecko_data = await getCoingeckoExchangeData();
    const defillama_data = await getDefillamaData();
    const geckoterminal_data = await getGeckoterminalData();
    const shimmer_data = await getShimmerData();
    const total_defi_tx_24h = geckoterminal_data.total_defi_tx_24h;
    const shimmer_rank = defillama_data.shimmer_rank;

    // Set up Bitfinex order book depth
    const bitfinex_order_book_data = await calculateTotalBitfinexDepth(coingecko_data.usd_price);
    logger.debug('Final bitfinex_order_book_data:', bitfinex_order_book_data);

    let positive_order_book_depth_str_2_percent = '';
    let negative_order_book_depth_str_2_percent = '';
    let positive_order_book_depth_str_5_percent = '';
    let negative_order_book_depth_str_5_percent = '';
    let positive_order_book_depth_str_10_percent = '';
    let negative_order_book_depth_str_10_percent = '';
    let positive_order_book_depth_str_20_percent = '';
    let negative_order_book_depth_str_20_percent = '';

    // Iterate through the order book data and format the strings
    for (const [percentage, data] of Object.entries(bitfinex_order_book_data.total_order_book_depth)) {
      // Format the 'buy' data using formatCurrency() function
      if ('buy' in data) {
        const formattedBuyData = await formatCurrency(data.buy, 'SMR');
        const buyData = `Buy: ${formattedBuyData}\n\n`;
      } else {
        logger.error(`Missing 'buy' key for percentage level ${percentage}`);
      }

      // Format the 'sell' data using formatCurrency() function
      if ('sell' in data) {
        const formattedSellData = await formatCurrency(data.sell, 'SMR');
        const sellData = `Sell: ${formattedSellData}\n\n`;
      } else {
        logger.error(`Missing 'sell' key for percentage level ${percentage}`);
      }

      const buySellInfo = `**${percentage}**:\n${buyData ? buyData : sellData}`;

      if (parseInt(percentage) === -2) {
        negative_order_book_depth_str_2_percent += buySellInfo;
      } else if (parseInt(percentage) === -5) {
        negative_order_book_depth_str_5_percent += buySellInfo;
      } else if (parseInt(percentage) === -10) {
        negative_order_book_depth_str_10_percent += buySellInfo;
      } else if (parseInt(percentage) === -20) {
        negative_order_book_depth_str_20_percent += buySellInfo;
      } else if (parseInt(percentage) === 2) {
        positive_order_book_depth_str_2_percent += buySellInfo;
      } else if (parseInt(percentage) === 5) {
        positive_order_book_depth_str_5_percent += buySellInfo;
      } else if (parseInt(percentage) === 10) {
        positive_order_book_depth_str_10_percent += buySellInfo;
      } else if (parseInt(percentage) === 20) {
        positive_order_book_depth_str_20_percent += buySellInfo;
      }
    }

    // Create an embed instance
    const embed = new Discord.MessageEmbed()
      .setTitle('Shimmer Market Data')
      .setColor(0x00FF00)
      .addField('Price (Coingecko)', `${await formatCurrency(coingecko_data.usd_price)}`, false)
      .addField('24h Volume (Bitfinex)', `${await formatCurrency(coingecko_data.total_volume)}`, false)
      .addField('\u200b', '\u200b', false)
      .addField('Defi Data', '\u200b', false)
      .addField('Shimmer Rank (DefiLlama)', shimmer_rank, true)
      .addField('Shimmer Onchain Amount (Shimmer API)', `${await formatCurrency(await formatShimmerAmount(shimmer_data.shimmer_onchain_token_amount), 'SMR')}`, true)
      .addField('Total Value Locked (DefiLlama)', `${await formatCurrency(defillama_data.shimmer_tvl)}`, true)
      .addField('24h DeFi Transactions (GeckoTerminal)', total_defi_tx_24h, true)
      .addField('24h DeFi Volume (GeckoTerminal)', `${await formatCurrency(geckoterminal_data.defi_total_volume)}`, true)
      .addField('\u200b', '\u200b', false)
      .addField('ShimmerEVM Order Books', '\u200b', false)
      .addField('Order Book depth ±2%', `${negative_order_book_depth_str_2_percent} ${positive_order_book_depth_str_2_percent}`, true)
      .addField('\u200b', '\u200b', false)
      .addField('Order Book depth ±5%', `${negative_order_book_depth_str_5_percent} ${positive_order_book_depth_str_5_percent}`, true)
      .addField('\u200b', '\u200b', false)
      .addField('Order Book depth ±10%', `${negative_order_book_depth_str_10_percent} ${positive_order_book_depth_str_10_percent}`, true)
      .addField('\u200b', '\u200b', false)
      .addField('Order Book depth ±20%', `${negative_order_book_depth_str_20_percent} ${positive_order_book_depth_str_20_percent}`, true)
      .addField('\u200b', '\u200b', false)
      .addField('Sources', 'Bitfinex, Coingecko, DefiLlama, GeckoTerminal, Shimmer API', false)
      .setFooter(`Data updated every 24h; last updated: ${current_time}\nMade with IOTA-❤️ by Antonio\nOut of beta SOON™`);

    // Save the embed to a pickle file
    await fs.writeFile('assets/embed_shimmer_market_data.pkl', pickle.dumps(embed));

  } catch (error) {
    logger.info(error.stack);
  }
}

async function main() {
  await buildEmbed();
}

main();
