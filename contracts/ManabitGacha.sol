// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ManabitGacha {

    // data structure
    struct Manabit {
        uint id;
        address sender;
        address receiver;
        string comment;
        uint256 amount;
    }

    // table
    Manabit[] public ManabitList;

    // ManabitCoin
    IERC20 public ManabitCoin;

    // initializer
    constructor(address ManabitAddress) {
        ManabitCoin = IERC20(ManabitAddress);
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
            require(balance >= amount, "ManabitGacha: Transfer amount exceeds MHR balance");
            require(allowance >= amount, "ManabitGacha: Insufficient MHR allowance");
            
            // send
            ManabitCoin.transferFrom(msg.sender, to, amount);

            // regist in List
            Manabit memory manabit = Manabit(
                ManabitList.length,
                msg.sender,
                to,
                comment,
                amount
            );
            ManabitList.push(manabit);

            return true;
        }

    // sentManabitList view
    function sentManabitList(address sender) public view returns (Manabit[] memory) {
        //TODO
    }

    // receivedManabitList view
    function receivedManabitList(address receiver) public view returns (Manabit[] memory) {
        //TODO
    }
}