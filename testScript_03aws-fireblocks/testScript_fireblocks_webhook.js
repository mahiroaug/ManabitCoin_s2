const crypto = require("crypto");
const express = require("express");
const bodyParser = require('body-parser')
const fs = require('fs');
const path = require('path');

const port = 3000;

const publicKey = fs.readFileSync(path.resolve("webhook_sig.pub"), "utf8");
console.log("publicKey: ",publicKey);

const app = express();

app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
    const message = JSON.stringify(req.body);
    const signature = req.headers["fireblocks-signature"];

    const verifier = crypto.createVerify('RSA-SHA512');
    verifier.write(message);
    verifier.end();

    const isVerified = verifier.verify(publicKey, signature, "base64");
    console.log("Verified:", isVerified);

    res.send("ok");
});

app.listen(port, () => {
    console.log(`Webhook running at http://localhost:${port}`);
});