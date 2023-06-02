'use strict'

// suppress message while AWS-SDK v2
require('aws-sdk/lib/maintenance_mode_message').suppress = true;


const SecretsManager = require('lib/secretsManager.js');
const Web3 = require('web3');
//const AWSHttpProvider = require('lib/aws-http-provider.js');
const AWSHttpProvider = require('@aws/web3-http-provider');

let network;
let web3;
let owner;
let signer;

let COIN_CA;
let GACHA_CA;
let COIN_ABI;
let GACHA_ABI;
let Coin;
let Gacha;

let secrets;

////// initializer ////////////

async function init_ENV() {
    try{
        const secretName = 'web3-manaBit-ssm';
        const region = 'ap-northeast-1';
        const secretsString = await SecretsManager.getSecret(secretName, region);
        secrets = JSON.parse(secretsString);

        // web3
        network = secrets.NETWORK;
        const endpoint = secrets.AMB_HTTP_ENDPOINT;

        web3 = new Web3(new AWSHttpProvider(endpoint));
        owner = web3.eth.accounts.privateKeyToAccount(secrets.OWNER_PRIVATE_KEY);
        signer = owner;
        web3.eth.accounts.wallet.add(signer);

        // contract
        COIN_CA = secrets.MNBC_COIN_CA;
        COIN_ABI = require('lib/contracts/ManabitCoin.sol/ManabitCoin.json').abi;
        Coin = new web3.eth.Contract(COIN_ABI, COIN_CA, { from: signer.address });
        GACHA_CA = secrets.MNBC_GACHA_CA;
        GACHA_ABI = require('lib/contracts/ManabitGacha.sol/ManabitGacha.json').abi;
        Gacha = new web3.eth.Contract(GACHA_ABI, GACHA_CA, { from: signer.address });

    } catch(error){
        console.error("Error init_ENV: ", error);
    }
}


////// call functions /////////

async function getOwnerBalance() {
    await init_ENV();

    await console.log(`Owner address: ${owner.address}`);
    ///await console.log(`AMB HTTP: ${secrets.AMB_HTTP_ENDPOINT}`);

    // ETH Balance
    const balanceWei = await web3.eth.getBalance(owner.address);
    const balanceETH = await web3.utils.fromWei(balanceWei, 'ether')
    await console.log(`ETH Balance : ${balanceETH} ETH`);

    // MNBC Balance
    const balanceMNBC = await Coin.methods.balanceOf(owner.address).call();
    await console.log(`MNBC Balance: ${web3.utils.fromWei(balanceMNBC, 'ether')} MNBC`);

    return {
        ownerAddress: owner.address,
        ownerBalanceWei: balanceWei,
        ownerBalanceETH: balanceETH,
        ownerBalanceMNBC: balanceMNBC
    }
}

async function getAccountBalance(address) {
    console.log(`Account: ${address}`);

    // ETH Balance
    const balance = await web3.eth.getBalance(address);
    console.log(`ETH Balance : ${web3.utils.fromWei(balance, 'ether')} ETH`);

    // MNBC Balance
    const mnbcBalance = await Coin.methods.balanceOf(address).call();
    console.log(`MNBC Balance: ${web3.utils.fromWei(mnbcBalance, 'ether')} MNBC`);
}

async function getAllowance(spender){
    try{
        const allowance = await Coin.methods.allowance(signer.address,spender).call();
        const mnbcAllowance = web3.utils.fromWei(allowance.toString(),"ether");
        console.log('Allowance: ',mnbcAllowance);

    } catch(error){
        console.error("Error getAllowance: ", error);
    }
}

////// send functions /////////

const sendTx = async (_to ,_tx ,_signer,_gasLimit) => {

    // check toAddress
    const toAddress = web3.utils.toChecksumAddress(_to);
    console.log(' toAddress:',toAddress);

    // gasLimit
    /* ****** existing bug : ERC20: approce from the zero address
    const estimateGas = await web3.eth.estimateGas(
    {
        to: _to,
        data: _tx.encodeABI()
    });
    const setGasLimit = estimateGas+10000;
    console.log('gas(estimated):', estimateGas, 'gasLimit:', setgGasLimit);
    */
    const setGasLimit = _gasLimit;
    console.log(' setGasLimit:', setGasLimit);

    // gasPrice
    const gasPrice = await web3.eth.getGasPrice();
    const gasPriceInGwei = await web3.utils.fromWei(gasPrice, 'gwei');
    console.log(' gasPrice:', gasPrice,'(', gasPriceInGwei,'Gwei)');

    // estimate max Transaction Fee
    const estimateMaxTxFee = setGasLimit * gasPrice;
    const estimateMaxTxFeeETH = await web3.utils.fromWei(estimateMaxTxFee.toString(), 'ether');
    console.log(' estimate MAX Tx Fee:', estimateMaxTxFee, '(', estimateMaxTxFeeETH, 'ETH)');


    // Sign Tx
    const createTransaction = await web3.eth.accounts.signTransaction(
        {
            to: toAddress,
            data: _tx.encodeABI(),
            gas: await web3.utils.toHex(_gasLimit)
        },
        _signer.privateKey
    );

    // Send Tx and Wait for Receipt
    const createReceipt = await web3.eth
        .sendSignedTransaction(createTransaction.rawTransaction)
        .once("transactionHash", (txhash) => {
            console.log(` Send transaction ...`);
            console.log(` https://${network}.etherscan.io/tx/${txhash}`);

        })
    console.log(` Tx successful with hash: ${createReceipt.transactionHash} in block ${createReceipt.blockNumber}`);
    return(createReceipt);
};



// Gachaコントラクトに対して必要量のMNBCトークン使用許可を与える
async function approveGacha(amount){
    try{
        const weiAmount = await web3.utils.toWei(amount.toString(),"ether");
        const tx = await Coin.methods.approve(GACHA_CA, weiAmount);
        const receipt = await sendTx(COIN_CA,tx,owner,150000);

        console.log((`approve ${amount} MNBC to GACHA_CA: ${GACHA_CA}`));
        
    } catch(error){
        console.error('Error:', error);
    }
}


async function transferMNBC(to_address, amount){
    try{
        const weiAmount = web3.utils.toWei(amount.toString(),"ether");
        const tx = Coin.methods.transfer(to_address, weiAmount);
        const receipt = await sendTx(COIN_CA,tx,owner,150000);

        console.log((`transferred ${amount} MNBC to ${to_address}`));

    } catch(error){
        console.error('Error:', error);
    }
}

async function sendManabit(to, amount, comment){
    try{
        const weiAmount = web3.utils.toWei(amount.toString(),"ether");
        const tx = Gacha.methods.sendManabitCoin(comment, to, weiAmount);
        const receipt = await sendTx(GACHA_CA,tx,owner,300000);

        console.log((`send Manabit ${amount} MNBC to ${to} with comment "${comment}"`));

    } catch(error){
        console.error("Error sending Manabit:", error);
    }
}


module.exports = {
    getOwnerBalance,
    getAccountBalance,
    getAllowance,
    approveGacha,
    transferMNBC,
    sendManabit
}


