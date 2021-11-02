pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/Vesting.sol";
import "../../contracts/test/ERC20_test.sol";

contract TestVesting{
    Vesting public vesting;
    ERC20_test public token;

    address account_0 = 0x627306090abaB3A6e1400e9345bC60c78a8BEf57;

    uint MINT_AMOUNT = 100000000000000000000;

    function beforeEach() public {
        vesting = new Vesting();
        token = new ERC20_test();

        token.mint(account_0, MINT_AMOUNT);
    }
}