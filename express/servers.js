require('dotenv').config({ path: '.env'});
require('dotenv').config({ path: 'ca.env'});

const express = require("express");
//const path = require('path');
const Web3 = require('web3');
const ccxt = require('ccxt');
const fs = require('fs');
const path = require('path');
const e = require('express');
const { allowedNodeEnvironmentFlags } = require('process');
const { inspect } = require('util');

const app = express();

const binanceExchange = new ccxt.binance({ enableRateLimit: true });

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || "";
const MANABOT01_OWNER_ADDRESS = process.env.OWNER_ADDRESS; 
const MANABOT02_OWNER_ADDRESS = process.env.FIREBLOCKS_VAULT_ACCOUNT_ADDRESS

const web3 = new Web3(
    new Web3.providers.HttpProvider(
        `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`
    )
);

const COIN_CA = process.env.MNBC_COIN_CA;
const GACHA_CA = process.env.MNBC_GACHA_CA;
const COIN_JSON = JSON.parse(fs.readFileSync(path.resolve(__dirname,"./public/contracts/ManabitCoin.sol/ManabitCoin.json"))); 
const GACHA_JSON = JSON.parse(fs.readFileSync(path.resolve(__dirname,"./public/contracts/ManabitGacha.sol/ManabitGacha.json"))); 
const COIN_ABI = COIN_JSON.abi;
const GACHA_ABI = GACHA_JSON.abi;
const Coin = new web3.eth.Contract(COIN_ABI, COIN_CA);
const Gacha = new web3.eth.Contract(GACHA_ABI, GACHA_CA);

const get_MNBC_Balance = async (addr) => {
    try {
        const balance = await Coin.methods.balanceOf(addr).call();
        const balanceMNBC = web3.utils.fromWei(balance, 'ether');
        return balanceMNBC;
    } catch(err) {
        console.error(err);
        return null;
    }
};

const get_MNBC_Allowance = async (signer,spender) => {
    try {
        const allowance = await Coin.methods.allowance(signer,spender).call();
        const mnbcAllowance = web3.utils.fromWei(allowance.toString(),"ether");
        return mnbcAllowance;
    } catch(err) {
        console.error(err);
        return null;
    }
};


const fetch_ETH_Balance = async (addr) => {
    try {
        const balanceWEI = await web3.eth.getBalance(addr);
        const balanceETH = web3.utils.fromWei(balanceWEI, 'ether');
        return balanceETH;
    } catch (err) {
        console.error(err);
        return null;
    }
};

const fetch_price_In_USD = async () => {
    try {
        const tickerInfo = await binanceExchange.fetchTicker('ETH/USDT');
        return tickerInfo.last;
    } catch (err) {
        console.error(err);
        return null;
    }
};


const get_Allowance = async () => {
    try {
        const allowance01 = await Coin.methods.allowance(MANABOT01_OWNER_ADDRESS,GACHA_CA).call();
        const allowance02 = await Coin.methods.allowance(MANABOT02_OWNER_ADDRESS,GACHA_CA).call();
        const allow01 = web3.utils.fromWei(allowance01, 'ether');
        const allow02 = web3.utils.fromWei(allowance02, 'ether');

        return {
            allowance01: allow01,
            allowance02: allow02
        };

    } catch (err) {
        console.error(err);
        return null;
    }
};


const get_Manabit_List = async () => {
    try {

        const createdBlock = 9096880; // The block number created Gacha-Contract
        const latestBlock = await web3.eth.getBlockNumber(); // The latest block number
        const last1day = 8192;
        const lastdaysBlock = latestBlock - last1day*7;
        const blockRange = 100000;
        let fromBlock = lastdaysBlock;
        let toBlock = (fromBlock + blockRange) > latestBlock ? latestBlock : fromBlock + blockRange;
        let events = [];
        let event;

        while (true) {
            event = await Gacha.getPastEvents(
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

        const extractedData = events.map(function(obj){
            blockHash: obj.blockHash,
            address: obj.address,
            comment: obj.returnValues.comment
          }));
        const jsonData = JSON.stringify(extractedData);

        //console.log('get_Manabit_List: ',inspect(events, false, null, true));
        return jsonData;

    } catch (err) {
        console.error(err);
        return null;
    }
};



app.use(express.json());

app.post('/get_balance', async (req,res) => {
    const { address } = req.body;
    console.log('Address: ', address);

    const balanceETH = await fetch_ETH_Balance(address);
    console.log('balance ETH: ', balanceETH);

    const balanceMNBC = await get_MNBC_Balance(address);
    console.log('balance MNBC: ', balanceMNBC);

    const allowanceMNBC = await get_MNBC_Allowance(MANABOT01_OWNER_ADDRESS,address);
    console.log('allowance MNBC: ', allowanceMNBC);


    const priceUSD = await fetch_price_In_USD();
    if(balanceETH !== null && priceUSD !== null){
        const balanceUSD = parseFloat(balanceETH) * priceUSD;
        console.log('by USD: ', balanceUSD);

        // responce to client
        res.json({ balanceETH, balanceUSD, priceUSD, balanceMNBC, allowanceMNBC });
    } else {
        res.status(500).json({ error: 'server error'});
    }

});

app.post('/get_allowance', async(req,res) => {
    console.log('call POST[get_allowance]');
    const result = await get_Allowance();

    const addr01 = MANABOT01_OWNER_ADDRESS; 
    const addr02 = MANABOT02_OWNER_ADDRESS;
    const eth01 = await fetch_ETH_Balance(addr01);
    const eth02 = await fetch_ETH_Balance(addr02);
    const mnbc01 = await get_MNBC_Balance(addr01);
    const mnbc02 = await get_MNBC_Balance(addr02);

    if(result.allowance01 !== null && result.allowance02 !== null){ 
        console.log('result: ',result);
        const allow01 = result.allowance01;
        const allow02 = result.allowance02;

        console.log("inspect: ",addr01,allow01,mnbc01,eth01,addr02,allow02,mnbc02,eth02);
        // responce to client
        res.json({addr01,allow01,mnbc01,eth01,addr02,allow02,mnbc02,eth02});
    } else {
        res.status(500).json({ error: 'server error'});
    }

});


app.post('/get_manabit', async(req,res) => {
    console.log('call POST[get_manabit]');
    const events = await get_Manabit_List();

    if(events !== null){
        console.log('inspect: ',inspect(events, false, null, true));
        res.json(events[0]);
    } else {
        res.status(500).json({ error: 'server error'});
    }

});

const PORT = 3000;
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
