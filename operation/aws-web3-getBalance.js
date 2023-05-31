require('dotenv').config({ path: '.env' });
const Web3 = require('web3');
const AWSHttpProvider = require('./aws-http-provider.js');


const endpoint = process.env.AMB_HTTP_ENDPOINT;
const web3 = new Web3(new AWSHttpProvider(endpoint));

// get node info
web3.eth.getNodeInfo().then(console.log);

// get balance
const account =  process.env.OWNER_ADDRESS;
web3.eth.getBalance(account).then(console.log);