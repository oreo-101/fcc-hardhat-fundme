const networkConfig = {
  5: {
    name: 'Goerli',
    ethUsdPriceFeed: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
  },
};

const devChains = ['hardhat', 'localhost'];
const DECIMALS = 8;
const INITIAL_PRICE = 20000000000000;

module.exports = {
  networkConfig,
  devChains,
  DECIMALS,
  INITIAL_PRICE,
};
