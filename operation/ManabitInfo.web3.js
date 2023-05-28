require('dotenv').config({ path: 'ca.env'});
const COIN_CA = process.env.MNBC_COIN_CA;
const GACHA_CA = process.env.MNBC_GACHA_CA;
const COIN_ABI = require('../artifacts/contracts/ManabitCoin.sol/ManabitCoin.json').abi;
const GACHA_ABI = require('../artifacts/contracts/ManabitGacha.sol/ManabitGacha.json').abi;

const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545'); 


async function getEvent() {
    // アカウント情報の取得
    const accounts = await web3.eth.getAccounts();

    // 最初のアカウントの残高を取得
    const account = accounts[1];
    const balance = await web3.eth.getBalance(account);

    console.log(`Account: ${account}`);
    console.log(`Balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);

    const Coin = new web3.eth.Contract(COIN_ABI, COIN_CA);
    const Gacha = new web3.eth.Contract(GACHA_ABI, GACHA_CA);

    const mnbcBalance = await Coin.methods.balanceOf(account).call();
    console.log(`mnbcBalance: ${web3.utils.fromWei(mnbcBalance, 'ether')} ETH`);

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

// スクリプトの実行
getEvent().catch(console.error);