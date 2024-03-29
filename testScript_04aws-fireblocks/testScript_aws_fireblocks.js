// web3-provider by dual-mode(aws and fireblocks)

// suppress message while AWS-SDK v2
require('aws-sdk/lib/maintenance_mode_message').suppress = true;


require('dotenv').config({ path: '.env'});
require('dotenv').config({ path: 'ca.env'});

const fs = require('fs');
const path = require('path');
const { inspect } = require('util');
const Web3 = require("web3");
const { FireblocksWeb3Provider, ChainId } = require("@fireblocks/fireblocks-web3-provider")
const AWSHttpProvider = require('@aws/web3-http-provider');
const { toASCII } = require('punycode');

//// common environment
const network = process.env.NETWORK;
const COIN_CA = process.env.MNBC_COIN_CA;
const GACHA_CA = process.env.MNBC_GACHA_CA;
const COIN_ABI = require('../artifacts/contracts/ManabitCoin.sol/ManabitCoin.json').abi;
const GACHA_ABI = require('../artifacts/contracts/ManabitGacha.sol/ManabitGacha.json').abi;

//// fireblocks
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
let signer_addressFB;
let CoinFB;
let GachaFB;
let CoinAWS;
let GachaAWS;

//// AMB
const amb_endpoint = process.env.AMB_HTTP_ENDPOINT;





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

////// send functions /////////

const sendTx = async (_to ,_tx ,_signer,_gasLimit) => {

    // check toAddress
    toAddress = web3aws.utils.toChecksumAddress(_to);
    console.log(' toAddress:',toAddress);

    // gasLimit
    const setGasLimit = _gasLimit;
    console.log(' setGasLimit:', setGasLimit);

    // gasPrice
    const gasPrice = await web3aws.eth.getGasPrice();
    const gasPriceInGwei = await web3aws.utils.fromWei(gasPrice, 'gwei');
    console.log(' gasPrice:', gasPrice,'(', gasPriceInGwei,'Gwei)');

    // estimate max Transaction Fee
    const estimateMaxTxFee = setGasLimit * gasPrice;
    const estimateMaxTxFeeETH = await web3aws.utils.fromWei(estimateMaxTxFee.toString(), 'ether');
    console.log(' estimate MAX Tx Fee:', estimateMaxTxFee, '(', estimateMaxTxFeeETH, 'ETH)');

//---------------------------削除予定----------------------------------------
/*
    // Sign Tx
    const createTransaction = await web3FB.eth.signTransaction(
        {
            to: toAddress,
            from: _signer,
            data: _tx.encodeABI(),
            gas: await web3FB.utils.toHex(setGasLimit)
        }
    );

    // Send Tx and Wait for Receipt
    const createReceipt = await web3aws.eth
        .sendSignedTransaction(createTransaction.rawTransaction)
        .once("transactionHash", (txhash) => {
            console.log(` Send transaction ...`);
            console.log(` https://${network}.etherscan.io/tx/${txhash}`);

        })
    console.log(` Tx successful with hash: ${createReceipt.transactionHash} in block ${createReceipt.blockNumber}`);
*/


    const createReceipt = await web3FB.eth.sendTransaction({
        to: toAddress,
        from: _signer,
        data: _tx.encodeABI(),
        gas: await web3FB.utils.toHex(setGasLimit)
    }).once("transactionHash", (txhash) => {
        console.log(` Send transaction ...`);
        console.log(` https://${network}.etherscan.io/tx/${txhash}`);
    })
    console.log(` Tx successful with hash: ${createReceipt.transactionHash} in block ${createReceipt.blockNumber}`);



    return(createReceipt);
}


// Gachaコントラクトに対して必要量のMNBCトークン使用許可を与える
async function approveGacha(signerAddr,amount){
    try{
        const weiAmount = await web3aws.utils.toWei(amount.toString(),"ether");
        const tx = await CoinFB.methods.approve(GACHA_CA, weiAmount);
        const receipt = await sendTx(COIN_CA,tx,signerAddr,150000);

        console.log((`approve ${amount} MNBC to GACHA_CA: ${GACHA_CA}`));
        
    } catch(error){
        console.error('Error:', error);
    }
}

// まなびっと送信
async function sendManabit(signerAddr, to, amount, comment){
    try{
        const weiAmount = web3aws.utils.toWei(amount.toString(),"ether");
        const tx = GachaFB.methods.sendManabitCoin(comment, to, weiAmount);
        const receipt = await sendTx(GACHA_CA,tx,signerAddr,300000);

        console.log((`send Manabit ${amount} MNBC to ${to} with comment "${comment}"`));

    } catch(error){
        console.error("Error sending Manabit:", error);
    }
}


//-----------------------------------getManabitListはReact化予定-------------------------------
async function getManabitList(){
    try{

        const createdBlock = 9096880; // The block number created Gacha-Contract
        const latestBlock = await web3FB.eth.getBlockNumber(); // The latest block number
        const last1day = 8192;
        const last1dayBlock = latestBlock - last1day;
        const blockRange = 1000;
        let fromBlock = last1dayBlock;
        let toBlock = (fromBlock + blockRange) > latestBlock ? latestBlock : fromBlock + blockRange;
        let events = [];

        while (true) {
            const event = await GachaFB.getPastEvents(
                'Manabit',
                {
                    fromBlock: fromBlock,
                    toBlock: toBlock
                }
            ).then(console.log);

            events = events.concat(event);

            if (toBlock >= latestBlock) {
                break;
                }
            fromBlock = toBlock + 1;
            toBlock = (fromBlock + blockRange) > latestBlock ? latestBlock : fromBlock + blockRange;
           
        }
        console.log('get_Manabit_List inspect: ',inspect(events, false, null, true));


/*
        const events2 = await CoinFB.getPastEvents(
            'allEvents',
            {
                fromBlock: 1,
                toBlock: 'latest'
            }
        ).then(console.log);
        console.log('get_Coin inspect: ',inspect(events2, false, null, true));
*/

        return events;

    } catch (err) {
        console.error(err);
        return null;
    }
}





(async() => {
  
    // initializer on fireblocks ////////////////////////////////////////////
    web3FB = new Web3(eip1193Provider);
    myAddrFB = web3FB.eth.getAccounts()
    CoinFB = new web3FB.eth.Contract(COIN_ABI, COIN_CA);
    GachaFB = new web3FB.eth.Contract(GACHA_ABI, GACHA_CA);


    // initializer on AMB ////////////////////////////////////////////
    web3aws = new Web3(new AWSHttpProvider(amb_endpoint));
    // web3aws.eth.getNodeInfo().then(console.log);
    // CoinAWS = new web3aws.eth.Contract(COIN_ABI, COIN_CA);
    // GachaAWS = new web3aws.eth.Contract(GACHA_ABI, GACHA_CA);


    // get Account Balance
    const test_addr = process.env.MY_TEST_ADDRESS;
    await getAccountBalance(test_addr);
    

    // get Fireblocks vault accounts
    myAddrFB = await web3FB.eth.getAccounts();
    console.log('myAdderFB=',inspect(myAddrFB, false, null, true));
    signer_addressFB = myAddrFB[0]
    await getAccountBalance(signer_addressFB);



    // get Allowance
    await getAllowance(signer_addressFB,GACHA_CA);

    // approveGacha
    await approveGacha(signer_addressFB,5000)

    // get Allowance
    await getAllowance(signer_addressFB,GACHA_CA);

    // send Manabit
    // await sendManabit(signer_addressFB,test_addr,1,"2023/06/08_17:01|testScript");

    // get Allowance
    await getAllowance(signer_addressFB,GACHA_CA);

    // get Balance
    await getAccountBalance(signer_addressFB);


    // get ManabitList
    //await getManabitList();



})().catch(error => {
    console.log(error)
});