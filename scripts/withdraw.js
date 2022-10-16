const { getNamedAccounts, ethers } = require('hardhat');

async function printBalance(account) {
  const balance = await ethers.provider.getBalance(account);
  console.log('Balance is', balance.toString());
}

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract('FundMe', deployer);
  console.log('Withdrawing from', fundMe.address);
  const transaction = await fundMe.withdraw();
  await transaction.wait(1);
  console.log('Withdrawn');
  await printBalance(fundMe.address);
}

main()
  .then(() => process.exit(0))
  .catch((e) => console.log('Error in main', e));
