const express = require("express");
const abiReader = require("./abiReader");
const app = express();
const port = 3000;

app.get("/", function (req, res){
    const coinFile = "./contracts/ManabitCoin.sol/ManabitCoin.json"
    
    abiReader.readFile(coinFile, function(err, coinABI){
        if (err) {
            console.error(err);
            res.send("Error: reading file");
        } else {
            res.json(coinABI);
        }
    })
});

app.listen(port, function (){
    console.log(`listen port: ${port}`);
});