const { providers } = require('ethers');
const { getNamedAccounts, ethers } = require('hardhat');

async function printBalance(account) {
  const balance = await ethers.provider.getBalance(account);
  console.log('Balance is', balance.toString());
}

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract('FundMe', deployer);
  console.log('Funding to', deployer);
  const transaction = await fundMe.fund({
    value: ethers.utils.parseEther('0.1'),
  });
  await transaction.wait(1);
  console.log('Funded');
  await printBalance(fundMe.address);
}

main()
  .then(() => process.exit(0))
  .catch((e) => console.log('Error in main', e));
