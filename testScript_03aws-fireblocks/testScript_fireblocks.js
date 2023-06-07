require('dotenv').config({ path: '.env'});
require('dotenv').config({ path: 'ca.env'});

const fs = require('fs');
const path = require('path');
const { FireblocksSDK, PeerType, TransactionArguments, TransactionOperation, TransactionStatus} = require('fireblocks-sdk');
const { exit } = require('process');
const { inspect } = require('util');

const fb_apiSecret = fs.readFileSync(path.resolve("fireblocks_secret.key"), "utf8");
const fb_apiKey = process.env.FIREBLOCKS_API_KEY
const fb_URL = process.env.FIREBLOCKS_URL
const fireblocks = new FireblocksSDK(fb_apiSecret,fb_apiKey,fb_URL)

const fb_vault_account_name=process.env.FIREBLOCKS_VAULT_ACCOUNT_NAME
const fb_asset_id_ETH=process.env.FIREBLOCKS_ASSET_ID_ETH
const fb_asset_id_MNBC=process.env.FIREBLOCKS_ASSET_ID_MNBC


async function _getVaultAccountById(aid){
    try{    

        // ALL
        //const vaultAccount = await fireblocks.getVaultAccountsWithPageInfo({});

        // by ID
        const vaultAccount = await fireblocks.getVaultAccountById(aid);

        console.log(inspect(vaultAccount,false,null,true));
    } catch(error){
        console.error("Error _getVaultAccountById: ", error);
    }
}

async function _getVaultAccountAsset(accountId,assetId){
    try{    
        const vaultAccount = await fireblocks.getVaultAccountAsset(accountId,assetId);
        console.log(inspect(vaultAccount,false,null,true));
    } catch(error){
        console.error("Error _getVaultAccountAsset: ", error);
    }
}

async function _getVaultAccountAssetMNBC(accountId,assetId){
    try{    
        const vaultAccount = await fireblocks.getVaultAccountAsset(accountId,assetId);
        console.log(inspect(vaultAccount,false,null,true));
    } catch(error){
        console.error("Error _getVaultAccountAssetMNBC: ", error);
    }
}

async function _getContracts(){
    const options = {method: 'GET', headers: {accept: '*/*'}};

    fetch('https://api.fireblocks.io/v1/contracts', options)
      .then(response => response.json())
      .then(response => console.log(response))
      .catch(err => console.error(err));

}



async function _createTransaction(){

    const payload = {
        assetId: fb_asset_id_ETH,
        source: {
            type: "VAULT_ACCOUNT",
            id: vaultId
        },
        operation: "RAW",
        extraParameters: {
            rawMessageData: {
                message: [
                    {
                        content: encoded
                    }
                ]
            }
        }
    };
    const result = await fireblocks.createTransaction()

}




(async () => {

    const vault = await fireblocks.getVaultAccountsWithPageInfo({
        namePrefix: fb_vault_account_name,
      });
    const vaultId = vault.accounts[0].id;
    console.log(inspect(vaultId,false,null,true));

    await _getVaultAccountById(vaultId);
    //await _getVaultAccountAsset(vaultId,fb_asset_id_ETH);
    //await _getVaultAccountAssetMNBC(vaultId,fb_asset_id_MNBC);
    //await _getContracts();

})().catch((e)=>{
    console.error(`Failed: ${e}`);
    exit(-1);
})