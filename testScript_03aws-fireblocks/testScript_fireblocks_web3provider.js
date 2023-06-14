// web3-provider by fireblocks

require('dotenv').config({ path: '.env'});
require('dotenv').config({ path: 'ca.env'});

const fs = require('fs');
const path = require('path');
const { inspect } = require('util');
const Web3 = require("web3");
const { FireblocksWeb3Provider, ChainId } = require("@fireblocks/fireblocks-web3-provider")


const COIN_CA = process.env.MNBC_COIN_CA;
const GACHA_CA = process.env.MNBC_GACHA_CA;
const COIN_ABI = require('../artifacts/contracts/ManabitCoin.sol/ManabitCoin.json').abi;
const GACHA_ABI = require('../artifacts/contracts/ManabitGacha.sol/ManabitGacha.json').abi;

const fb_apiSecret = fs.readFileSync(path.resolve("fireblocks_secret.key"), "utf8");
const fb_apiKey = process.env.FIREBLOCKS_API_KEY
const fb_vaultId = process.env.FIREBLOCKS_VAULT_ACCOUNT_ID

const eip1193Provider = new FireblocksWeb3Provider({
    privateKey: fb_apiSecret,
    apiKey: fb_apiKey,
    vaultAccountIds: fb_vaultId,
    chainId: ChainId.GOERLI,
});

let web3FB;
let myAddrFB;
let CoinFB;
let GachaFB;


////// call functions /////////

async function getAccountBalance(address) {
    console.log(`Account: ${address}`);

    // ETH Balance
    const balance = await web3FB.eth.getBalance(address);
    console.log(`ETH Balance : ${web3FB.utils.fromWei(balance, 'ether')} ETH`);

    // MNBC Balance
    const mnbcBalance = await CoinFB.methods.balanceOf(address).call();
    console.log(`MNBC Balance: ${web3FB.utils.fromWei(mnbcBalance, 'ether')} MNBC`);
}

async function getAllowance(signer_address,spender_address){
    try{
        const allowance = await CoinFB.methods.allowance(signer_address,spender_address).call();
        const mnbcAllowance = web3FB.utils.fromWei(allowance.toString(),"ether");
        console.log('Allowance: ',mnbcAllowance);

    } catch(error){
        console.error("Error getAllowance: ", error);
    }
}



(async() => {
  
    // initializer ////////////////////////////////////////////
    web3FB = new Web3(eip1193Provider);
    myAddrFB = web3FB.eth.getAccounts()
    CoinFB = new web3FB.eth.Contract(COIN_ABI, COIN_CA);
    GachaFB = new web3FB.eth.Contract(GACHA_ABI, GACHA_CA);


    // get Fireblocks vault accounts
    myAddrFB = await web3FB.eth.getAccounts();
    console.log('myAdderFB=',inspect(myAddrFB, false, null, true));
    await getAccountBalance(myAddrFB[0]);

    // get Account Balance
    const test_addr = process.env.MY_TEST_ADDRESS;
    //await getAccountBalance(test_addr);

    // get Allowance
    await getAllowance(process.env.OWNER_ADDRESS,GACHA_CA);




})().catch(error => {
    console.log(error)
});