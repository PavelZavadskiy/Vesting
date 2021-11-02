require('dotenv').config();

let Vesting = artifacts.require("Vesting.sol");

module.exports = async function(deployer){
    if(deployer.network==="ropsten-fork"){

    }
    await deployer.deploy(Vesting);
}