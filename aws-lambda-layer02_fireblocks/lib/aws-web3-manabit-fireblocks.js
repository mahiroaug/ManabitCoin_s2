'use strict'

///// common 
const SecretsManager = require('lib/secretsManager.js');
const Web3 = require('web3');

///// fireblocks
const { FireblocksWeb3Provider, ChainId } = require("@fireblocks/fireblocks-web3-provider")
const fs = require('fs');
const path = require('path');
const { inspect } = require('util');

///// aws AMB
const AWSHttpProvider = require('@aws/web3-http-provider');

///// set ENV
secretName = process.env.SSM_SECRET_NAME;
region = process.env.SSM_REGION;

///// file path
const contract_path_coin = 'lib/contracts/ManabitCoin.sol/ManabitCoin.json'
const contract_path_gacha = 'lib/contracts/ManabitGacha.sol/ManabitGacha.json'
const fireblocks_path_key = 'lib/fireblocks_secret.key'

///// definition
let network;

//let owner;
//let signer;

let COIN_CA;
let GACHA_CA;
let COIN_ABI;
let GACHA_ABI;
let Coin;
let Gacha;

let web3aws;
let web3fb;

let signerAddr;

let secrets;

////// initializer ////////////

async function init_ENV() {
    try{
        const secretsString = await SecretsManager.getSecret(secretName, region);
        secrets = JSON.parse(secretsString);

        // web3
        network = secrets.NETWORK;

        // contract
        COIN_CA = secrets.MNBC_COIN_CA;
        COIN_ABI = require(contract_path_coin).abi;
        GACHA_CA = secrets.MNBC_GACHA_CA;
        GACHA_ABI = require(contract_path_gacha).abi;

        // aws
        const endpoint = secrets.AMB_HTTP_ENDPOINT;
        web3aws = new Web3(new AWSHttpProvider(endpoint));
        web3aws.eth.getNodeInfo().then(console.log);
        //owner = web3aws.eth.accounts.privateKeyToAccount(secrets.OWNER_PRIVATE_KEY);
        //signer = owner;
        //web3aws.eth.accounts.wallet.add(signer);

        // fireblocks
        const fb_apiSecret = fs.readFileSync(path.resolve(fireblocks_path_key), "utf8");
        const fb_apiKey = secrets.FIREBLOCKS_API_KEY
        const fb_vaultId = secrets.FIREBLOCKS_VAULT_ACCOUNT_ID
        const eip1193Provider = new FireblocksWeb3Provider({
            privateKey: fb_apiSecret,
            apiKey: fb_apiKey,
            vaultAccountIds: fb_vaultId,
            chainId: ChainId.GOERLI,
        });
        web3fb = new Web3(eip1193Provider);
        const myAddr = await web3fb.eth.getAccounts();
        signerAddr = myAddr[0];
        console.log('signerAddr=',inspect(signerAddr, false, null, true));

        // contract object
        Coin = new web3fb.eth.Contract(COIN_ABI, COIN_CA);
        Gacha = new web3fb.eth.Contract(GACHA_ABI, GACHA_CA);
        //Coin = new web3.eth.Contract(COIN_ABI, COIN_CA, { from: signer.address });
        //Gacha = new web3.eth.Contract(GACHA_ABI, GACHA_CA, { from: signer.address });

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
        const balanceWei = await web3aws.eth.getBalance(address);
        const balanceETH = await web3aws.utils.fromWei(balanceWei, 'ether');
        console.log(`ETH Balance : ${balanceETH} ETH`);

        // MNBC Balance
        const balanceMNBCw = await Coin.methods.balanceOf(address).call();
        const balanceMNBC = await web3aws.utils.fromWei(balanceMNBCw, 'ether');
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

async function getAllowance(signer_address,spender_address){
    await init_ENV();

    console.log(`spender Account: ${spender_address}`);
    try{
        const allowance = await Coin.methods.allowance(signer_address,spender_address).call();
        const allowanceMNBC = await web3aws.utils.fromWei(allowance.toString(),"ether");
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
    const toAddress = web3aws.utils.toChecksumAddress(_to);
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
    const gasPrice = await web3aws.eth.getGasPrice();
    const gasPriceInGwei = await web3aws.utils.fromWei(gasPrice.toString(), 'gwei');
    console.log(' gasPrice:', gasPrice,'(', gasPriceInGwei,'Gwei)');

    // estimate max Transaction Fee
    const estimateMaxTxFee = setGasLimit * gasPrice;
    const estimateMaxTxFeeETH = await web3aws.utils.fromWei(estimateMaxTxFee.toString(), 'ether');
    console.log(' estimate MAX Tx Fee:', estimateMaxTxFee, '(', estimateMaxTxFeeETH, 'ETH)');

/*
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
 */

    const createReceipt = await web3fb.eth.sendTransaction({
        to: toAddress,
        from: _signer,
        data: _tx.encodeABI(),
        gas: await web3fb.utils.toHex(setGasLimit)
    }).once("transactionHash", (txhash) => {
        console.log(` Send transaction ...`);
        console.log(` https://${network}.etherscan.io/tx/${txhash}`);
    })
    console.log(` Tx successful with hash: ${createReceipt.transactionHash} in block ${createReceipt.blockNumber}`);
    console.log('createReceipt: ',createReceipt);

    // result 
    const etherscan = `https://${network}.etherscan.io/tx/${createReceipt.transactionHash}`;

    const effectiveGasPriceGwei = await web3aws.utils.fromWei(createReceipt.effectiveGasPrice.toString(), 'gwei');
    const effectiveGasPrice_str = createReceipt.effectiveGasPrice + ' wei (' + effectiveGasPriceGwei + ' Gwei)'
    console.log('',effectiveGasPrice_str);

    const effectiveTxFee = createReceipt.gasUsed * createReceipt.effectiveGasPrice;
    const effectiveTxFeeGwei = await web3aws.utils.fromWei(effectiveTxFee.toString(), 'gwei');
    const effectiveTxFeeETH = await web3aws.utils.fromWei(effectiveTxFee.toString(), 'ether');
    const effectiveTxFee_str = effectiveTxFee +  ' wei (' + effectiveTxFeeGwei + ' Gwei) (' + effectiveTxFeeETH + ' ETH)'
    console.log(' ',effectiveTxFee_str);


    return {
        tx_receipt : createReceipt,
        transactionHash : createReceipt.transactionHash,
        sender_address : createReceipt.from,
        receiver_address : createReceipt.to,
        gasUsed : createReceipt.gasUsed,
        gasPrice : createReceipt.effectiveGasPrice,
        gasPriceGwei : effectiveGasPriceGwei,
        gasPriceString : effectiveGasPrice_str,
        txFeeETH : effectiveTxFeeETH,
        txFeeString : effectiveTxFee_str,
        etherscan : etherscan
    }

};



// Gachaコントラクトに対して必要量のMNBCトークン使用許可を与える
async function approveGacha(signerAddr,amount){
    await init_ENV();

    console.log(`Approve amount to GACHA_CA: ${amount} MNBC`);
    try{
        const weiAmount = await web3aws.utils.toWei(amount.toString(),"ether");
        const tx = await Coin.methods.approve(GACHA_CA, weiAmount);
        const receipt = await sendTx(COIN_CA,tx,signerAddr,150000);
        console.log(('receipt:',receipt));
        return {
            receipt
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
        const weiAmount = await web3aws.utils.toWei(amount.toString(),"ether");
        const tx = await Coin.methods.transfer(to_address, weiAmount);
        const receipt = await sendTx(COIN_CA,tx,owner,150000);
        console.log(('receipt:',receipt));
        return {
            receipt
        }
    } catch(error){
        console.error('Error:', error);
    }
}


async function sendManabit(signerAddr, to, amount, comment){
    await init_ENV();

    console.log((`send Manabit ${amount} MNBC to ${to} with comment "${comment}"`));

    try{
        const weiAmount = await web3aws.utils.toWei(amount.toString(),"ether");
        const tx = await Gacha.methods.sendManabitCoin(comment, to, weiAmount);
        const receipt = await sendTx(GACHA_CA,tx,signerAddr,300000);
        console.log(('receipt:',receipt));
        return {
            receipt
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


