const { network } = require('hardhat');
const {
  devChains,
  DECIMALS,
  INITIAL_PRICE,
} = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (devChains.includes(network.name)) {
    log('Local network, deploying mocks...');
    await deploy('MockV3Aggregator', {
      contract: 'MockV3Aggregator',
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    log('----------------------------------');
  }
};

module.exports.tags = ['all', 'mocks'];
