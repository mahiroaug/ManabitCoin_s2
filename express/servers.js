const express = require("express");
const path = require("path");
const Web3 = require('web3');
const ccxt = require('ccxt');

const app = express();

const INFURA_PROJECT_ID = ""
const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`
    )
);
const binanceExchange = new ccxt.binance({ enableRateLimit: true });

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


app.use(express.json());

app.post('/get_balance', async (req,res) => {
    const { address } = req.body;
    console.log('Address: ', address);

    const balanceETH = await fetch_ETH_Balance(address);
    console.log('balance ETH: ', balanceETH);

    const priceUSD = await fetch_price_In_USD();
    if(balanceETH !== null && priceUSD !== null){
        const balanceUSD = parseFloat(balanceETH) * priceUSD;
        console.log('by USD: ', balanceUSD);

        // responce to client
        res.json({ balanceETH, balanceUSD, priceUSD });
    } else {
        res.status(500).json({ error: 'server error'});
    }

});

const PORT = 3000;
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
