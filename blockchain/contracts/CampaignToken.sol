// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CampaignToken is ERC20, Ownable {
    
    constructor(
        string memory name,
        string memory symbol,
        address campaignContract
    ) ERC20(name, symbol) Ownable(campaignContract) {}

    // Only the Campaign contract can mint tokens
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}