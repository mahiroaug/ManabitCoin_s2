// require('dotenv').config({ path: '.env'});
require('dotenv').config({ path: '.env.holesky'});
require("@fireblocks/hardhat-fireblocks");

const fs = require('fs');
const path = require('path');
const fb_apiSecret = fs.readFileSync(path.resolve("fireblocks_secret_holesky.key"), "utf8");

module.exports = {
    solidity: "0.8.17",
    networks: {
      holesky: {
        url: "https://rpc.ankr.com/eth_holesky",
        fireblocks: {
          apiBaseUrl: process.env.FIREBLOCKS_URL,
          privateKey: fb_apiSecret,
          apiKey: process.env.FIREBLOCKS_API_KEY,
          vaultAccountIds: process.env.FIREBLOCKS_VAULT_ACCOUNT_ID,
        }
      },
    },
  };