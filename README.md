# ManabitCoin WEB3

## 1.compile
### compile solidity
```shell
npx hardhat compile
```

### update javascript
`abi.js`


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

### update javascript
`contract_address.js`


## 3.launch
### launch WEB3

```shell
npx http-server ./public/
```

- access http://localhost:8080
