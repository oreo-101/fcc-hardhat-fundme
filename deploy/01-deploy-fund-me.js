const { networkConfig, devChains } = require('../helper-hardhat-config');
const { network } = require('hardhat');
const { verify } = require('../utils/verify');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;
  // need to mock price converter when deploying to local
  // deploy mocks!
  if (devChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get('MockV3Aggregator');
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]['ethUsdPriceFeed'];
  }

  const fundMeArgs = [ethUsdPriceFeedAddress];
  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: fundMeArgs, // singles args for priceFeedAddr
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log('Verifying');
    await verify(fundMe.address, fundMeArgs);
  }
};
module.exports.tags = ['all', 'fundme'];
