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

async function getAccountBalance(address) {
    await init_ENV();

    console.log(`Account: ${address}`);
    try{
        // ETH Balance
        const balanceWei = await web3.eth.getBalance(address);
        const balanceETH = await web3.utils.fromWei(balanceWei, 'ether');
        console.log(`ETH Balance : ${balanceETH} ETH`);

        // MNBC Balance
        const balanceMNBCw = await Coin.methods.balanceOf(address).call();
        const balanceMNBC = await web3.utils.fromWei(balanceMNBCw, 'ether');
        console.log(`MNBC Balance: ${balanceMNBC} MNBC`);

        return {
            Address: address,
            BalanceWei: balanceWei,
            BalanceETH: balanceETH,
            BalanceMNBC: balanceMNBC
        }
        
    } catch(error){
        console.error("Error getAccountBalance: ", error);
    }
}

async function getAllowance(spender_address){
    await init_ENV();

    console.log(`spender Account: ${spender_address}`);
    try{
        const allowance = await Coin.methods.allowance(signer.address,spender_address).call();
        const allowanceMNBC = await web3.utils.fromWei(allowance.toString(),"ether");
        console.log('Allowance: ',allowanceMNBC);

        return {
            Address: spender_address,
            Allowance: allowanceMNBC
        }

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
    await init_ENV();

    console.log(`Approve amount to GACHA_CA: ${amount} MNBC`);
    try{
        const weiAmount = await web3.utils.toWei(amount.toString(),"ether");
        const tx = await Coin.methods.approve(GACHA_CA, weiAmount);
        const receipt = await sendTx(COIN_CA,tx,owner,150000);
        console.log(('receipt:',receipt));

        const txhash = receipt.transactionHash;
        const etherscan = `https://${network}.etherscan.io/tx/${txhash}`;

        return {
            tx_receipt : receipt,
            transactionHash : txhash,
            sender_address : receipt.from,
            receiver_address : receipt.to,
            gasUsed : receipt.gasUsed,
            gasPrice : receipt.effectiveGasPrice,
            etherscan : etherscan
        }
        
    } catch(error){
        console.error('Error:', error);
    }
}

// 未完成（動作未確認）
async function transferMNBC(to_address, amount){
    await init_ENV();

    console.log((`transfer ${amount} MNBC to ${to_address}`));

    try{
        const weiAmount = web3.utils.toWei(amount.toString(),"ether");
        const tx = Coin.methods.transfer(to_address, weiAmount);
        const receipt = await sendTx(COIN_CA,tx,owner,150000);
        console.log(('receipt:',receipt));

        const txhash = receipt.transactionHash;
        const etherscan = `https://${network}.etherscan.io/tx/${txhash}`;

        return {
            tx_receipt : receipt,
            transactionHash : txhash,
            sender_address : receipt.from,
            receiver_address : receipt.to,
            gasUsed : receipt.gasUsed,
            gasPrice : receipt.effectiveGasPrice,
            etherscan : etherscan
        }
        
    } catch(error){
        console.error('Error:', error);
    }
}


async function sendManabit(to, amount, comment){
    await init_ENV();

    console.log((`send Manabit ${amount} MNBC to ${to} with comment "${comment}"`));

    try{
        const weiAmount = web3.utils.toWei(amount.toString(),"ether");
        const tx = Gacha.methods.sendManabitCoin(comment, to, weiAmount);
        const receipt = await sendTx(GACHA_CA,tx,owner,300000);
        console.log(('receipt:',receipt));

        const txhash = receipt.transactionHash;
        const etherscan = `https://${network}.etherscan.io/tx/${txhash}`;

        return {
            tx_receipt : receipt,
            transactionHash : txhash,
            sender_address : receipt.from,
            receiver_address : receipt.to,
            gasUsed : receipt.gasUsed,
            gasPrice : receipt.effectiveGasPrice,
            etherscan : etherscan
        }
        
    } catch(error){
        console.error('Error:', error);
    }
}


module.exports = {
    getAccountBalance,
    getAllowance,
    approveGacha,
    transferMNBC,
    sendManabit
}


