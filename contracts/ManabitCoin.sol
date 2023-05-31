// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ManabitCoin is ERC20, Ownable {
    address public OWNER;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address payable owner
    ) payable ERC20(name, symbol) {
        OWNER = owner;
        _mint(OWNER, initialSupply);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}