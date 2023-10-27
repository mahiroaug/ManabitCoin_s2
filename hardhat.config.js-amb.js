require('dotenv').config({ path: '.env'});
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-web3');

aws_region = process.env.AWS_DEFAULT_REGION;
node_id = process.env.AMB_NODE_ID;
accessor_token = process.env.AMB_ACCESSOR_TOKEN;
endpoint_https = `https://${node_id}.t.ethereum.managedblockchain.${aws_region}.amazonaws.com/?billingtoken=${accessor_token}`;


extendEnvironment((hre) => {
  const Web3 = require("web3");
  hre.Web3 = Web3;
  hre.web3 = new Web3(new Web3.providers.HttpProvider(endpoint_https));

});

task('account', 'Print address and private key of primary account', async (taskArgs, hre) => {
  const account = hre.web3.eth.accounts.privateKeyToAccount(process.env.OWNER_PRIVATE_KEY);
  console.log('Address', account.address);
  console.log('PrivateKey', account.privateKey);

});

module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {},
    amb: {
      url: endpoint_https,
      account: [process.env.OWNER_PRIVATE_KEY]
    }
  }
};