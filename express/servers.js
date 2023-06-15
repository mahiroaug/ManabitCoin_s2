require('dotenv').config({ path: '.env'});
require('dotenv').config({ path: 'ca.env'});

const express = require("express");
//const path = require('path');
const Web3 = require('web3');
const ccxt = require('ccxt');
const fs = require('fs');
const path = require('path');
const e = require('express');

const app = express();

const binanceExchange = new ccxt.binance({ enableRateLimit: true });

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || "";
const MANABOT01_OWNER_ADDRESS = process.env.OWNER_ADDRESS; 

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

const get_Manabit_List = async () => {
    try {
        const events = await Gacha.getPastEvents(
            'Manabit',
            {
                fromtBlock: 0,
                toBlock: 'latest'
            }
        );

        /*
        const manabitList = document.getElementById('manabit-list');
        manabitList.innerHTML = `
            <tr>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Comment</th>
            </tr>
        `;

        events.forEach((event) => {
            const { sender, receiver, amount, comment } = event.returnValues;
            const newRow = manabitList.insertRow(-1);
            newRow.insertCell(0).innerText = sender;
            newRow.insertCell(1).innerText = receiver;
            newRow.insertCell(2).innerText = wev3.utils.fromWei(amount, 'ether');
            newRow.insertCell(3).innerText = comment;
        });
        */
        console.log('get_Manabit_List: ',events);
        return events;

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

app.post('/get_manabit', async(req,res) => {
    console.log('call POST[get_manabit]');
    const result = await get_Manabit_List();
    console.log('result: ',result);

});

const PORT = 3000;
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
