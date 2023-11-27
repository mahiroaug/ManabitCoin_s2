require('dotenv').config({ path: '.env.holesky'});
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-web3');

const hardhat = require('hardhat');
const path = require('path');
const myERC20 = require(path.join(__dirname, '..', 'artifacts', 'contracts', 'ManabitCoin.sol', 'ManabitCoin.json'));
const contract = new web3.eth.Contract(myERC20.abi);

const privateKey = process.env.OWNER_PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);

async function main() {
  const name = "ManabitCoin";
  const symbol = "MNBC";
  const initialSupply = web3.utils.toWei("1000000");
  const tx = contract.deploy({ data: myERC20.bytecode, arguments: [name, symbol, initialSupply, account.address] });
  const gas = await tx.estimateGas()*3;
  const gasPrice = await web3.eth.getGasPrice();

  console.log('gas(estimated):', gas);
  console.log('gasPrice(getGasPrice):', gasPrice);

  const createTransaction = await account.signTransaction(
    {
      data: tx.encodeABI(),
      gas,
      gasPrice,
    }
  );

  const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
  console.log('Contract deployed at', createReceipt.contractAddress);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});