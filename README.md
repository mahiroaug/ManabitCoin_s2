# ManabitCoin WEB3

## 1.compile
### compile solidity
```shell
npx hardhat compile
```

### launch local node
```shell
npx hardhat node
```

## 2.deploy contract
### deploy ManabitCoin (ERC20 token)
```shell
npx hardhat run scripts/deploy-ManabitCoin.js --network localhost
```

### modify
`deploy-ManabitGacha.js`

- `const coinContract = "<ManabitCoin Contract Address>"`

### deploy ManabitGacha
```shell
npx hardhat run scripts/deploy-ManabitGacha.js --network localhost
```

### update ca.env
write contract address

e.q.
```
MNBC_COIN_CA=0x5FbDB2315678afecb367f032d93F642f64180aa3
MNBC_GACHA_CA=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

## 3.script test
create .env

```
SIGNER_PRIVATE_KEY=
```


### write code
`operation/ManabitInfo.web3.js`

### run
`node operation/ManabitInfo.web3.js`




## 4.launch
### launch WEB3

```shell
npx http-server ./public/
```

- access http://localhost:8080


## 5.AWS Managed Blockchain
### add .env
```
## HardHat local node
#OWNER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
#OWNER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
#COMMON_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8


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

