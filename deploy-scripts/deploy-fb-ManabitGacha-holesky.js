require('dotenv').config({ path: '.env_localhost'});
require('dotenv').config({ path: 'ca.env_localhost'});

const hardhat = require('hardhat');
const path = require('path');
const mySol = require(path.join(__dirname, '..', 'artifacts', 'contracts', 'ManabitGacha.sol', 'ManabitGacha.json'));
const contract = new web3.eth.Contract(mySol.abi);

const privateKey = process.env.OWNER_PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);

async function main() {
  const name = "ManabitGacha";
  coinCA = process.env.MNBC_COIN_CA;

  const tx = contract.deploy({ data: mySol.bytecode, arguments: [coinCA] });
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
