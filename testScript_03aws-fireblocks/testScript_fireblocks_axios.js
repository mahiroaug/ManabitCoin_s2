require('dotenv').config({ path: '.env'});

const fs = require('fs');
const path = require('path');
const { FireblocksSDK } = require('fireblocks-sdk');
const { exit } = require('process');
const { inspect } = require('util');
const axios = require('axios');
const { sign } = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const crypto = require('crypto');

const fb_apiSecret = fs.readFileSync(path.resolve("fireblocks_secret.key"), "utf8");
const fb_apiKey = process.env.FIREBLOCKS_API_KEY
const fb_URL = process.env.FIREBLOCKS_URL
const fireblocks = new FireblocksSDK(fb_apiSecret,fb_apiKey,fb_URL)

const fd_GACHA_NAME = process.env.FIREBLOCKS_GACHA_NAME


class FireblocksRequestHandler{
    
    baseUrl;
    apiSecret;
    apiKey;


    constructor(apiSecret, apiKey, URL = "https://api.fireblocks.io"){
        this.baseUrl = URL;
        this.apiSecret = apiSecret;
        this.apiKey = apiKey;
    }

    async post(path, data){
        const jwt = this.jwtSign(path,data);
        return (await this.req(jwt, path, data, "POST"));
    }

    async get(path) {
        const jwt = this.jwtSign(path);
        return (await this.req(jwt, path, undefined, "GET"));
    }

    async req(jwt, path, data, method){
        const resp = await axios({
            url: `${this.baseUrl}${path}`,
            method: method,
            data,
            headers:{
                "X-API-Key":this.apiKey,
                "Authorization": `Bearer ${jwt}`
            }
        });
        return resp.data;
    }

    jwtSign(path, data){
        const token = sign({
            uri: path,
            nonce: uuid(),
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 55,
            sub: this.apiKey,
            bodyHash: crypto.createHash("sha256").update(JSON.stringify(data || "")).digest().toString("hex")
        }, this.apiSecret, {algorithm: "RS256"});
        return token;
    }

}

(async () => {

    const requestHandler = new FireblocksRequestHandler(fb_apiSecret, fb_apiKey);
    
    // Print vaults before creation
    //let vaults = await requestHandler.get("/v1/vault/accounts_paged");
    //console.log(inspect(vaults, false, null, true));

    // Create vault account
    //const vaultCreation = await requestHandler.post("/v1/vault/accounts", {"name":"QuickStart_Vault"});
    //console.log(inspect(vaultCreation, false, null, true));

    // Print list contracts
    let contracts = await requestHandler.get("/v1/contracts");
    console.log('/v1/contracts=',inspect(contracts, false, null, true));

    const contractGacha = contracts.filter(item => item.name === fd_GACHA_NAME);
    const contractGachaId = contractGacha[0].id;
    const contractGachaCA = contractGacha[0].assets[0].address;
    console.log('contractGachaId=',inspect(contractGachaId, false, null, true));
    console.log('contractGachaCA=',inspect(contractGachaCA, false, null, true));



})().catch((e)=>{
    console.error(`Failed: ${e}`);
    exit(-1);
});