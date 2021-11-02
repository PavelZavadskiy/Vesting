pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20_test is ERC20("TestToken20", "T20") {
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}