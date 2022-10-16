const { assert, expect } = require('chai');
const { deployments, ethers, getNamedAccounts } = require('hardhat');

describe('FundMe Test', async function () {
  let fundMe, deployer;
  const sendValue = ethers.utils.parseEther('1');

  beforeEach(async function () {
    // deploy the contract
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(['all']);
    fundMe = await ethers.getContract('FundMe', deployer);
    mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer);
  });

  describe('constructor', async function () {
    it('set the price feed address correctly', async function () {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe('receive and fallback', async function () {
    it('fallback', async function () {
      await fundMe.fallback({ value: sendValue });
    });

    it('receive', async function () {
      // this errors
      // await fundMe.receive({ value: sendValue });
    });
  });

  describe('fund', async function () {
    it('Not enought ETH', async () => {
      await expect(fundMe.fund()).to.be.revertedWith(
        'You need to spend more ETH!'
      );
    });

    it('Fund successful', async () => {
      console.log('sending amount', sendValue);
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });

    it('Adds funder', async () => {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.funders(0);
      assert.equal(funder, deployer);
    });
  });

  describe('Widthdraw', async () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });

    it('Withdraw ETH from a single founder', async () => {
      const startingBalanceFundMe = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingBalanceDeployer = await fundMe.provider.getBalance(
        deployer
      );

      // act
      const transactionRes = await fundMe.withdraw();
      const transactionReceipt = await transactionRes.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      // gas cost
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingBalanceFundMe = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingBalanceDeployer = await fundMe.provider.getBalance(deployer);

      // assert
      assert.equal(endingBalanceFundMe, 0);
      assert.equal(
        startingBalanceFundMe.add(startingBalanceDeployer).toString(),
        endingBalanceDeployer.add(gasCost).toString()
      );
    });

    it('withdraw many accounts', async () => {
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }

      // starting
      const startingBalanceFundMe = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingBalanceDeployer = await fundMe.provider.getBalance(
        deployer
      );

      // withdraw
      const transactionRes = await fundMe.withdraw();
      const transactionReceipt = await transactionRes.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      // gas cost
      const gasCost = gasUsed.mul(effectiveGasPrice);

      // end state
      const endingBalanceFundMe = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingBalanceDeployer = await fundMe.provider.getBalance(deployer);

      // assert
      assert.equal(endingBalanceFundMe, 0);
      assert.equal(
        startingBalanceFundMe.add(startingBalanceDeployer).toString(),
        endingBalanceDeployer.add(gasCost).toString()
      );

      await expect(fundMe.funders(0)).to.be.reverted;

      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.addressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it('Only owner can withdraw', async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConn = await fundMe.connect(attacker);

      await expect(attackerConn.withdraw()).to.be.revertedWith(
        'FundMe__NotOwner'
      );
    });
  });
});
