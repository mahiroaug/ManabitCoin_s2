require('dotenv').config({ path: '.env'});
require('dotenv').config({ path: 'ca.env'});

const COIN_CA = process.env.MNBC_COIN_CA;
const GACHA_CA = process.env.MNBC_GACHA_CA;
const COIN_ABI = require('../artifacts/contracts/ManabitCoin.sol/ManabitCoin.json').abi;
const GACHA_ABI = require('../artifacts/contracts/ManabitGacha.sol/ManabitGacha.json').abi;

const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545'); 

const Coin = new web3.eth.Contract(COIN_ABI, COIN_CA);
const Gacha = new web3.eth.Contract(GACHA_ABI, GACHA_CA);
const signer = web3.eth.accounts.privateKeyToAccount(process.env.OWNER_PRIVATE_KEY);


let owner;

async function getEvent() {
    // アカウント情報の取得
    const accounts = await web3.eth.getAccounts();

    // 最初のアカウントの残高を取得
    owner = accounts[0];
    const balance = await web3.eth.getBalance(owner);

    console.log(`Owner: ${owner}`);
    console.log(`Balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);

    //const Coin = new web3.eth.Contract(COIN_ABI, COIN_CA);
    //const Gacha = new web3.eth.Contract(GACHA_ABI, GACHA_CA);

    const mnbcBalance = await Coin.methods.balanceOf(owner).call();
    console.log(`mnbcBalance: ${web3.utils.fromWei(mnbcBalance, 'ether')} MNBC`);

    // get past Events
    const events = await Gacha.getPastEvents(
        'Manabit',
        {
            fromBlock: 0,
            toBlock: 'latest'
        }
    );
    console.log(events);
}

async function transferToken(to, amount){
    try{
        const weiAmount = web3.utils.toWei(amount.toString(),"ether");
        console.log(`weiAmount = ${weiAmount}`);

        await Coin.methods.transfer(to, weiAmount).send({from: signer.address});
        console.log((`transferred ${amount} tokens to ${to}`));

    } catch(error){
        console.error('Error:', error);
    }
}

// Gachaコントラクトに対して必要量のMNBCトークン使用許可を与える
async function approveGacha(amount){
    try{
        const weiAmount = web3.utils.toWei(amount.toString(),"ether");
        console.log(`weiAmount = ${weiAmount}`);

        await Coin.methods.approve(GACHA_CA, weiAmount).send({from: signer.address});
        console.log((`approve ${amount} tokens to CA ${GACHA_CA}`));

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


async function getAllowance(spender){
    try{
        const allowance = await Coin.methods.allowance(signer.address,spender).call();
        const mnbcAllowance = web3.utils.fromWei(allowance.toString(),"ether");
        console.log('Allowance: ',mnbcAllowance);

    } catch(error){
        console.error("Error getAllowance: ", error);
    }
}



async function main() {
    try {

        console.log("step1-------------------------");
        await getEvent();

        console.log("step2-------------------------");
        await transferToken("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 15);

        console.log("step3-------------------------");
        await getEvent();

        console.log("step3b-------------------------");
        await approveGacha(16);

        console.log("step4-------------------------");
        await sendManabit("0x70997970C51812dc3A010C7d01b50e0d17dc79C8",15,"15まなびっとコイン贈呈3");

        console.log("step5-------------------------");
        await getEvent();
        await getAllowance(GACHA_CA);



    } catch (error) {
        console.error('Error:', error);
    }
}

// run script
main();

