const { assert } = require('chai');
const { getNamedAccounts, ethers, network } = require('hardhat');
const { devChains } = require('../../helper-hardhat-config');

devChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', async () => {
      let fundMe, deployer;
      const sendValue = ethers.utils.parseEther('1');
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract('FundMe', deployer);
      });

      it('can fund and withdraw', async () => {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);

        assert.equal(endingBalance.toString(), '0');
      });
    });
