require('dotenv').config({ path: '.env'});
require('dotenv').config({ path: 'ca.env'});

// suppress message while AWS-SDK v2
require('aws-sdk/lib/maintenance_mode_message').suppress = true;


const COIN_CA = process.env.MNBC_COIN_CA;
const GACHA_CA = process.env.MNBC_GACHA_CA;
const COIN_ABI = require('../artifacts/contracts/ManabitCoin.sol/ManabitCoin.json').abi;
const GACHA_ABI = require('../artifacts/contracts/ManabitGacha.sol/ManabitGacha.json').abi;

const Web3 = require('web3');
const AWSHttpProvider = require('./aws-http-provider.js');
const endpoint = process.env.AMB_HTTP_ENDPOINT;
const web3 = new Web3(new AWSHttpProvider(endpoint));

const Coin = new web3.eth.Contract(COIN_ABI, COIN_CA);
const Gacha = new web3.eth.Contract(GACHA_ABI, GACHA_CA);
const owner = web3.eth.accounts.privateKeyToAccount(process.env.OWNER_PRIVATE_KEY);
let signer=owner;

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



async function createSignedTx(receiver,payload,signer,gasLimit){
    try{


        //console.log('estimateGas:', gas);
        
        const gasPriceInGwei = await web3.utils.fromWei(gasPrice, 'gwei');
        console.log('gasPrice:', gasPrice,'(', gasPriceInGwei,'Gwei)');


        const txParams = {
            gas: await web3.utils.numberToHex(gasLimit),
            gasPrice: await web3.utils.numberToHex(gasPrice),
            to: receiver,
            data: payload
        };

        const signedTx = await web3.eth.accounts.signTransaction(txParams, signer.privateKey);

        return(signedTx);

    } catch(error){
        console.error('Error:', error);
    }
}


// Gachaコントラクトに対して必要量のMNBCトークン使用許可を与える
async function approveGacha(amount){
    try{
        const weiAmount = await web3.utils.toWei(amount.toString(),"ether");
        const payload = await Coin.methods.approve(GACHA_CA, weiAmount).encodeABI();
        //const signedTx = await createSignedTx(COIN_CA,payload,owner,150000);




        //const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        //console.log('tx result:',receipt);
        console.log((`approve ${amount} MNBC tokens to GACHA_CA: ${GACHA_CA}`));

    } catch(error){
        console.error('Error:', error);
    }
}


async function transferToken(from_account, to_address, amount){
    try{
        const weiAmount = web3.utils.toWei(amount.toString(),"ether");
        //console.log(`weiAmount = ${weiAmount}`);
        //await Coin.methods.transfer(to, weiAmount).send({from: signer.address});
        payload = Coin.methods.transfer(to_address, weiAmount).encodeABI();
        var signedTx = createSignedTx(COIN_CA,payload,from_account,150000);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);


        console.log((`transferred ${amount} tokens to ${to}`));

    } catch(error){
        console.error('Error:', error);
    }
}




async function sendManabit(to, amount, comment){
    try{
        const weiAmount = web3.utils.toWei(amount.toString(),"ether");
        console.log(`weiAmount = ${weiAmount}`);

        await Gacha.methods.sendManabitCoin(comment, to, weiAmount).send({from: signer.address});
        console.log((`send ManabitCoin ${amount} tokens to ${to} with comment "${comment}"`));

    } catch(error){
        console.error("Error sending Manabit:", error);
    }
}






async function main() {
    try {

        console.log("---step1--------getOwnerBalance---------------");
        await getOwnerBalance();

        console.log("---step1b-------getAccountBalance-------------");
        await getAccountBalance(process.env.COMMON_ADDRESS);

        console.log("---step1c-------getAllowance(GACHA_CA)--------");
        await getAllowance(GACHA_CA);




        console.log("---step2--------approveGacha(1000)------------");
        await approveGacha(1000);

        console.log("---step2b-------getAllowance(GACHA_CA)--------");
        await getAllowance(GACHA_CA);




        console.log("---step3--------getOwnerBalance--------------------------");
        await getOwnerBalance();

        console.log("---step3--------getAccountBalance(MyWallet)--------------");
        await getAccountBalance(process.env.COMMON_ADDRESS);

        console.log("---step3b--------transfer 1 MNBC from OWNER to MyWallet--");
        await transferToken(owner,process.env.MY_TEST_ADDRESS, 1);

        console.log("---step3c--------getOwnerBalance-------------------------");
        await getOwnerBalance();

        console.log("---step3c--------getAccountBalance(MyWallet)-------------");
        await getAccountBalance(process.env.COMMON_ADDRESS);





        console.log("---step4-------------------------");
        //await sendManabit("0x70997970C51812dc3A010C7d01b50e0d17dc79C8",15,"");

        console.log("---step5-------------------------");
        //await getEvent();
        //await getAllowance(GACHA_CA);



    } catch (error) {
        console.error('Error:', error);
    }
}

// run script
main();

