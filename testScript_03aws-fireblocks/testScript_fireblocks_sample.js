require('dotenv').config({ path: '.env'});

const fs = require('fs');
const path = require('path');
const { FireblocksSDK, PeerType, TransactionArguments, TransactionOperation, TransactionStatus} = require('fireblocks-sdk');
const { exit } = require('process');
const { inspect } = require('util');

const fb_apiSecret = fs.readFileSync(path.resolve("fireblocks_secret.key"), "utf8");
const fb_apiKey = process.env.FIREBLOCKS_API_KEY
const fb_URL = process.env.FIREBLOCKS_URL
const fireblocks = new FireblocksSDK(fb_apiSecret,fb_apiKey,fb_URL)


async function _createVaultAccounts(assetId, vaultAccountNamePrefix){
    let vaultRes;
    let vault;
    let vaultWallet;

    vaultRes = await fireblocks.createVaultAccount(vaultAccountNamePrefix.toString());
    vault = { 
        vaultName: vaultRes.name,
        vaultID: vaultRes.id 
    };
    vaultWallet = await fireblocks.createVaultAsset(Number(vault.vaultID), assetId);
    
    console.log("Vault Account Details:", vault);
    console.log("Wallet Asset Details for ", vault.vaultName,":", vaultWallet);
    return {vault, vaultWallet};
}


async function _getVaultAccountAsset(accountId,assetId){
    try{    
        const vaultAccount = await fireblocks.getVaultAccountAsset(accountId,assetId);
        console.log(inspect(vaultAccount,false,null,true));
    } catch(error){
        console.error("Error _getVaultAccountAsset: ", error);
    }
}


async function _createTransaction(assetId, amount, srcId, destId){ 
    let payload = {
        assetId,
        amount,
        source: {
            type: PeerType.VAULT_ACCOUNT,
            id: String(srcId)
        },
        destination: {
            type: PeerType.VAULT_ACCOUNT,
            id: String(destId)
        },
        note: "Your first transaction!"
    };
    const result = await fireblocks.createTransaction(payload);
    console.log(JSON.stringify(result, null, 2));
}


(async () => {

    // 1 create wallet & create MATIC address
    const {vault, vaultWallet} = await _createVaultAccounts("MATIC_POLYGON_MUMBAI","test12");

    // 2 GET balance MATIC from Vault Asset
    await _getVaultAccountAsset(vault.vaultID,"MATIC_POLYGON_MUMBAI");

    //// 以下はご参考に ////

    // 3 Transfer
    await _createTransaction("MATIC_POLYGON_MUMBAI", "0.001", "8", "0");

    
})().catch((e)=>{
    console.error(`Failed: ${e}`);
    exit(-1);
})