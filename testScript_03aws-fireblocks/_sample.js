const payload: TransactionArguments = {
    assetId: asset, 
    source: {
         type: sourceType, id: sourceId || 0 
    }, 
    destination: {
        type: destinationType, 
        id: String(destinationId) 
    }, 
    amount: String(amount), 
    fee: String(fee), 
    note: "Created by fireblocks SDK" 
};

const result = await fireblocks.createTransaction(payload);

/////////////////////////////////////////////////////////////////////


import axios from 'axios';

const options = {
  method: 'POST',
  url: 'https://api.fireblocks.io/v1/transactions',
  headers: {accept: '*/*', 'content-type': 'application/json'},
  data: {
    source: {type: 'VAULT_ACCOUNT', id: '2'},
    destination: {type: 'VAULT_ACCOUNT'},
    operation: 'CONTRACT_CALL',
    assetId: 'ETH_TEST3',
    gasLimit: 300000
  }
};

axios
  .request(options)
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.error(error);
  });


/////////////////////////////////////////////////////////////////////

const vaultAccount = await fireblocks.getVaultAccount(vault_account_id);



/////////////////////////////////////////////////////////////////////