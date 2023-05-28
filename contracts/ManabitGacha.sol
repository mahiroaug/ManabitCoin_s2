// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ManabitGacha {

    // ManabitCoin
    IERC20 public ManabitCoin;

    // Manabit event definition
    event Manabit(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        string comment
    );

    // initializer
    constructor(address ManabitCoinContractAddress) {
        ManabitCoin = IERC20(ManabitCoinContractAddress);
    }

    // sendManabitCoin non-payable
    function sendManabitCoin(
        string memory comment,
        address to,
        uint256 amount) public returns (bool)
        {
            // checking
            uint256 allowance = ManabitCoin.allowance(msg.sender, address(this));
            uint256 balance = ManabitCoin.balanceOf(msg.sender);

            // Must Step
            require(to != address(0), "ManabitGacha: send to zero address");
            require(amount > 0, "ManabitGacha: Amount must be greater than 0");
            require(balance >= amount, "ManabitGacha: Transfer amount exceeds MNBC balance");
            require(allowance >= amount, "ManabitGacha: Insufficient MNBC allowance");
            
            // send
            ManabitCoin.transferFrom(msg.sender, to, amount);

            // event trigger
            emit Manabit(msg.sender, to, amount, comment);

            return true;
        }

}