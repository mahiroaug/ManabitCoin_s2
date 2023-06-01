const Web3 = require("web3");

async function main() {
    // Configuring the connection to an Ethereum node
    const network = process.env.ETHEREUM_NETWORK;
    const web3 = new Web3(
        new Web3.providers.HttpProvider(
            `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        )
    );

    var fs = require('fs');
    var jsonFile = "ct_abi.json";

    var parsed=JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;

    const tokenAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
    const toAddress = "<insert_here_the_token_destination_address>"

    // Creating a signing account from a private key
    const signer = web3.eth.accounts.privateKeyToAccount(
        process.env.SIGNER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(signer);

    const contract = new web3.eth.Contract(abi, tokenAddress, { from: signer.address } )
    let amount = web3.utils.toHex(web3.utils.toWei("1"));  
 
     // Creating the transaction object
     const tx = {
         from: signer.address,
         to: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
         value: "0x0",
         data: contract.methods.transfer(toAddress, amount).encodeABI(),
         gas: web3.utils.toHex(5000000),
         nonce: web3.eth.getTransactionCount(signer.address),
         maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
         chainId: 5,
         type: 0x2
     };
 
     signedTx = await web3.eth.accounts.signTransaction(tx, signer.privateKey)
     console.log("Raw transaction data: " + signedTx.rawTransaction)
 
     // Sending the transaction to the network
     const receipt = await web3.eth
         .sendSignedTransaction(signedTx.rawTransaction)
         .once("transactionHash", (txhash) => {
             console.log(`Mining transaction ...`);
             console.log(`https://${network}.etherscan.io/tx/${txhash}`);
         });
     // The transaction is now on chain!
     console.log(`Mined in block ${receipt.blockNumber}`);
 
 }

require("dotenv").config();
main();