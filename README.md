# ManabitCoin contract creation

## 1.compile
```shell
npx hardhat compile
```

# ------localhost (HardHat Node)------

### launch local node
```shell
npx hardhat node
```

.env_localhost

```
## HardHat local node
OWNER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
OWNER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
COMMON_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```


### deploy ManabitCoin (ERC20 token)
```shell
npx hardhat run scripts/deploy-ManabitCoin.js --network localhost
```

### ca.env_localhost

```
MNBC_COIN_CA=0x5FbDB2315678afecb367f032d93F642f64180aa3
MNBC_GACHA_CA=

```
### deploy ManabitGacha
```shell
npx hardhat run scripts/deploy-ManabitGacha.js --network localhost
```

### update ca.env_localhost

```
MNBC_COIN_CA=0x5FbDB2315678afecb367f032d93F642f64180aa3
MNBC_GACHA_CA=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

```

## script test

`node operation/ManabitInfo.web3.js`


### WEB3

```shell
npx http-server ./public/
```

- access http://localhost:8080


(to be continued)






# ------Goerli Network with AMB------

## AWS Managed Blockchain(AMB)

### .env
```
NETWORK=goerli


## Goerli - ManabitCoin
SIGNER_PRIVATE_KEY=
OWNER_PRIVATE_KEY=
OWNER_ADDRESS=
COMMON_ADDRESS=


AWS_DEFAULT_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=


AMB_NODE_ID=
AMB_ACCESSOR_TOKEN=
AMB_HTTP_ENDPOINT=
AMB_WS_ENDPOINT=
```

## Contract Deploy in Goerli via AMB

Deployment ManabitCoin

```
npx hardhat run --network amb scripts/deploy-amb-ManabitCoin.js
```

update ca.env

```
MNBC_COIN_CA=<update>
MNBC_GACHA_CA=0x
```

Deployment ManabitGacha

```
npx hardhat run --network amb scripts/deploy-amb-ManabitGacha.js
```

### AWS Lambda Function

#### nodejs(layer)

create layer file

```
cd aws-lambda-layer

cd nodejs
npm install
cd ../

zip -r nodejs_layer.zip nodejs
```


#### lib(my scripts)

update lib

```
cd lib
<update contracts directory if you need>
```


#### deploy lambda

- nodejs_layer.zip -> layer
- lib(directory) -> code source
- index.js -> code source



# ------Goerli Network with AMB & Fireblocks------


### .env
```
FIREBLOCKS_API_KEY=
FIREBLOCKS_URL=https://api.fireblocks.io
FIREBLOCKS_VAULT_ACCOUNT_ID=
FIREBLOCKS_VAULT_ACCOUNT_NAME=
FIREBLOCKS_ASSET_ID_ETH=
FIREBLOCKS_ASSET_ID_MNBC=
FIREBLOCKS_GACHA_NAME=
```

allocate secret.key file on project root directory

`fireblocks_secret.key`


#### test Script

node testScript_03aws-fireblocks/<*.js>


### AWS Lambda Function

cd aws-lambda-layer02_fireblocks

#### deploy lambda

allocate secret.key file at `lib/fireblocks_secret.key`

- nodejs_layer.zip -> layer
- lib(directory) -> code source
- index.js -> code source

