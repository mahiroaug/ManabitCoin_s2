require('dotenv').config({ path: '.env'});
require('dotenv').config({ path: 'ca.env'});

// suppress message while AWS-SDK v2
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const network = process.env.NETWORK;

const Web3 = require('web3');
const AWSHttpProvider = require('./aws-http-provider.js');
const endpoint = process.env.AMB_HTTP_ENDPOINT;
const web3 = new Web3(new AWSHttpProvider(endpoint));
const owner = web3.eth.accounts.privateKeyToAccount(process.env.OWNER_PRIVATE_KEY);

const signer = owner;
web3.eth.accounts.wallet.add(signer);

const COIN_CA = process.env.MNBC_COIN_CA;
const GACHA_CA = process.env.MNBC_GACHA_CA;
const COIN_ABI = require('../artifacts/contracts/ManabitCoin.sol/ManabitCoin.json').abi;
const GACHA_ABI = require('../artifacts/contracts/ManabitGacha.sol/ManabitGacha.json').abi;

const Coin = new web3.eth.Contract(COIN_ABI, COIN_CA, { from: signer.address });
const Gacha = new web3.eth.Contract(GACHA_ABI, GACHA_CA, { from: signer.address });



////// call functions /////////

async function getOwnerBalance() {
    console.log(`Owner: ${owner.address}`);

    // ETH Balance
    const balance = await web3.eth.getBalance(owner.address);
    console.log(`ETH Balance : ${web3.utils.fromWei(balance, 'ether')} ETH`);

    // MNBC Balance
    const mnbcBalance = await Coin.methods.balanceOf(owner.address).call();
    console.log(`MNBC Balance: ${web3.utils.fromWei(mnbcBalance, 'ether')} MNBC`);
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
    toAddress = web3.utils.toChecksumAddress(_to);
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


