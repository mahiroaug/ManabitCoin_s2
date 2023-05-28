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
