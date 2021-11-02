//const ethers = require('ethers');
const truffleAssert = require('truffle-assertions');
const BN = require('bn.js');

const { expectRevert, time } = require('@openzeppelin/test-helpers');

let Vesting = artifacts.require("Vesting.sol"); 

let Token20 = artifacts.require("ERC20_test.sol"); 

contract("Vesting", async accounts =>{
    let vestingContract;
    let token20;

    const MINT_AMOUNT = new BN('100000000000000000000');
    const PAID_AMOUNT =     new BN('1000000000000000000');
    const REDIRECT_AMOUNT = new BN('25000000000000000');
    const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

    const SHIFT_START_BLOCK = new BN('100');
    const SHIFT_END_BLOCK = new BN('300');

    before(  async () => {
        console.log( "Init Vesting >>" );

        vestingContract = await Vesting.new();

        token20 = await Token20.new("TTV", 18);
        
        console.log(`Contract address: ${vestingContract.address}`);
        console.log(`Contract token 20 address: ${token20.address}`);

        await token20.mint(accounts[0], MINT_AMOUNT);
        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        await token20.mint(accounts[1], MINT_AMOUNT);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);
    });

    //For the test, you need to change the function  _currentPayment() from private to public
        /*Result
        Start block: 10; end block: 100; current block:7; result: 0
        Start block: 10; end block: 100; current block:10; result: 0
        Start block: 10; end block: 100; current block:50; result: 1
        Start block: 10; end block: 100; current block:100; result: 3
        Start block: 10; end block: 100; current block:110; result: 3
        Start block: 10; end block: 100; current block:7; result: 0
        Start block: 10; end block: 100; current block:10; result: 0
        Start block: 10; end block: 100; current block:50; result: 44444444444444444444
        Start block: 10; end block: 100; current block:100; result: 100000000000000000000
        Start block: 10; end block: 100; current block:110; result: 100000000000000000000*/
/*    it("-> _currentPayment: full test function", async ()=> {
        console.log( "\n _currentPayment() >>" );
        let startBlock = new BN("10");
        let endBlock = new BN("100");
        let amount = new BN("3");

        let currBlock = new BN("7");
        let res = await vestingContract._currentPayment(startBlock, endBlock, currBlock, amount);
        console.log(`Start block: ${startBlock}; end block: ${endBlock}; current block:${currBlock}; result: ${res}`);

        currBlock = new BN("10");
        res = await vestingContract._currentPayment(startBlock, endBlock, currBlock, amount);
        console.log(`Start block: ${startBlock}; end block: ${endBlock}; current block:${currBlock}; result: ${res}`);

        currBlock = new BN("50");
        res = await vestingContract._currentPayment(startBlock, endBlock, currBlock, amount);
        console.log(`Start block: ${startBlock}; end block: ${endBlock}; current block:${currBlock}; result: ${res}`);

        currBlock = new BN("100");
        res = await vestingContract._currentPayment(startBlock, endBlock, currBlock, amount);
        console.log(`Start block: ${startBlock}; end block: ${endBlock}; current block:${currBlock}; result: ${res}`);

        currBlock = new BN("110");
        res = await vestingContract._currentPayment(startBlock, endBlock, currBlock, amount);
        console.log(`Start block: ${startBlock}; end block: ${endBlock}; current block:${currBlock}; result: ${res}`);

        amount = new BN("100000000000000000000");

        currBlock = new BN("7");
        res = await vestingContract._currentPayment(startBlock, endBlock, currBlock, amount);
        console.log(`Start block: ${startBlock}; end block: ${endBlock}; current block:${currBlock}; result: ${res}`);

        currBlock = new BN("10");
        res = await vestingContract._currentPayment(startBlock, endBlock, currBlock, amount);
        console.log(`Start block: ${startBlock}; end block: ${endBlock}; current block:${currBlock}; result: ${res}`);

        currBlock = new BN("50");
        res = await vestingContract._currentPayment(startBlock, endBlock, currBlock, amount);
        console.log(`Start block: ${startBlock}; end block: ${endBlock}; current block:${currBlock}; result: ${res}`);

        currBlock = new BN("100");
        res = await vestingContract._currentPayment(startBlock, endBlock, currBlock, amount);
        console.log(`Start block: ${startBlock}; end block: ${endBlock}; current block:${currBlock}; result: ${res}`);

        currBlock = new BN("110");
        res = await vestingContract._currentPayment(startBlock, endBlock, currBlock, amount);
        console.log(`Start block: ${startBlock}; end block: ${endBlock}; current block:${currBlock}; result: ${res}`);

    });*/

    it("-> addPlan(): Add two new plans, from accounts [0] and [1] to [2]. Successful", async () => {
        console.log( "\n addPlan() >>" );

        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        let current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        let starBlock = current.add(SHIFT_START_BLOCK);
        let endBlock = starBlock.add(SHIFT_END_BLOCK);
        console.log(`starBlock=${starBlock}, endBlock=${endBlock}, currBlock=${current}`);

        await token20.approve(vestingContract.address, PAID_AMOUNT, {from: accounts[0]});

//        let estimatedGas = await vestingContract.addPlan.estimateGas(accounts[2], starBlock, endBlock, token20.address, new BN('1000000000000000000'), {from: accounts[0]});
//        console.log( `Estimate Gas addPlan(): ${estimatedGas}` ); 
        
        console.log( "addPlan() from account [0] to [2] >>" );
        let resAddPlan = await vestingContract.addPlan(accounts[2], starBlock, endBlock, token20.address, PAID_AMOUNT, {from: accounts[0]});
                                                        
            truffleAssert.eventEmitted(resAddPlan, 'AddPlan', (ev) => {
                console.log(`Result event AddPlan :\n frdm = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
                return true;
        });

        current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        starBlock = current.add(SHIFT_START_BLOCK);
        endBlock = starBlock.add(SHIFT_END_BLOCK);
        console.log(`starBlock=${starBlock}, endBlock=${endBlock}, currBlock=${current}`);

        await token20.approve(vestingContract.address, PAID_AMOUNT, {from: accounts[1]});

        console.log( "addPlan() from account [1] to [2] >>" );
        resAddPlan = await vestingContract.addPlan(accounts[2], starBlock, endBlock, token20.address, PAID_AMOUNT, {from: accounts[1]});
                                                        
        truffleAssert.eventEmitted(resAddPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n from = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });

        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
    });

    it("-> addPlan(): Add new plan. Decline. Address to=0x0000000000000000000000000000000000000000", async () => {
        console.log( "\n addPlan() >>" );

        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        let current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        let starBlock = current.add(SHIFT_START_BLOCK);
        let endBlock = starBlock.add(SHIFT_END_BLOCK);
        console.log(`starBlock=${starBlock}, endBlock=${endBlock}, currBlock=${current}`);

        await token20.approve(vestingContract.address, PAID_AMOUNT, {from: accounts[0]});

//        let estimatedGas = await vestingContract.addPlan.estimateGas(accounts[2], starBlock, endBlock, token20.address, new BN('1000000000000000000'), {from: accounts[0]});
//        console.log( `Estimate Gas addPlan(): ${estimatedGas}` ); 
        
        console.log( "addPlan() from account [0] to [NULL_ADDRESS] >>" );
        let resAddPlan = await vestingContract.addPlan(NULL_ADDRESS, starBlock, endBlock, token20.address, PAID_AMOUNT, {from: accounts[0]});
        truffleAssert.eventEmitted(resAddPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n frdm = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });
    });

    it("-> addPlan(): Add new plan. Decline. End block = 0", async () => {
        console.log( "\n addPlan() >>" );

        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        let current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        let starBlock = new BN('0');
        let endBlock = new BN('0');
        console.log(`starBlock=${starBlock}, endBlock=${endBlock}, currBlock=${current}`);

        await token20.approve(vestingContract.address, PAID_AMOUNT, {from: accounts[0]});

//        let estimatedGas = await vestingContract.addPlan.estimateGas(accounts[2], starBlock, endBlock, token20.address, new BN('1000000000000000000'), {from: accounts[0]});
//        console.log( `Estimate Gas addPlan(): ${estimatedGas}` ); 
        
        console.log( "addPlan() from account [0] to [2] >>" );
        let resAddPlan = await vestingContract.addPlan(accounts[2], starBlock, endBlock, token20.address, PAID_AMOUNT, {from: accounts[0]});
        truffleAssert.eventEmitted(resAddPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n frdm = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });
    });

    it("-> addPlan(): Add new plan. Decline. End block < start block", async () => {
        console.log( "\n addPlan() >>" );

        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        let current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        let starBlock = current.add(SHIFT_END_BLOCK);
        let endBlock = current.add(SHIFT_START_BLOCK);
        console.log(`starBlock=${starBlock}, endBlock=${endBlock}, currBlock=${current}`);

        await token20.approve(vestingContract.address, PAID_AMOUNT, {from: accounts[0]});

//        let estimatedGas = await vestingContract.addPlan.estimateGas(accounts[2], starBlock, endBlock, token20.address, new BN('1000000000000000000'), {from: accounts[0]});
//        console.log( `Estimate Gas addPlan(): ${estimatedGas}` ); 
        
        console.log( "addPlan() from account [0] to [2] >>" );
        let resAddPlan = await vestingContract.addPlan(accounts[2], starBlock, endBlock, token20.address, PAID_AMOUNT, {from: accounts[0]});
        truffleAssert.eventEmitted(resAddPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n frdm = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });
    });

    it("-> addPlan(): Add new plan. Decline. Token address=0x0000000000000000000000000000000000000000", async () => {
        console.log( "\n addPlan() >>" );

        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        let current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        let starBlock = current.add(SHIFT_START_BLOCK);
        let endBlock = starBlock.add(SHIFT_END_BLOCK);
        console.log(`starBlock=${starBlock}, endBlock=${endBlock}, currBlock=${current}`);

        await token20.approve(vestingContract.address, PAID_AMOUNT, {from: accounts[0]});

//        let estimatedGas = await vestingContract.addPlan.estimateGas(accounts[2], starBlock, endBlock, token20.address, new BN('1000000000000000000'), {from: accounts[0]});
//        console.log( `Estimate Gas addPlan(): ${estimatedGas}` ); 
        
        console.log( "addPlan() from account [0] to [2] >>" );
        let resAddPlan = await vestingContract.addPlan(accounts[2], starBlock, endBlock, NULL_ADDRESS, PAID_AMOUNT, {from: accounts[0]});
        truffleAssert.eventEmitted(resAddPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n frdm = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });
    });

    it("-> addPlan(): Add new plan. Decline. Amount=0", async () => {
        console.log( "\n addPlan() >>" );

        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        let current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        let starBlock = current.add(SHIFT_START_BLOCK);
        let endBlock = starBlock.add(SHIFT_END_BLOCK);
        console.log(`starBlock=${starBlock}, endBlock=${endBlock}, currBlock=${current}`);

        await token20.approve(vestingContract.address, PAID_AMOUNT, {from: accounts[0]});

//        let estimatedGas = await vestingContract.addPlan.estimateGas(accounts[2], starBlock, endBlock, token20.address, new BN('1000000000000000000'), {from: accounts[0]});
//        console.log( `Estimate Gas addPlan(): ${estimatedGas}` ); 
        
        console.log( "addPlan() from account [0] to [2] >>" );
        let resAddPlan = await vestingContract.addPlan(accounts[2], starBlock, endBlock, token20.address, new BN('0'), {from: accounts[0]});
        truffleAssert.eventEmitted(resAddPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n frdm = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });
    });

    it("-> addPaymentToPlan(): Add paiment to plan (startBlok > currentBlock), from accounts [1] to [2]. Successful", async () => {
        console.log( "\n addPaymentToPlan() >>" );
 
        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        await token20.approve(vestingContract.address, PAID_AMOUNT, {from: accounts[1]});

//        let estimatedGas = await vestingContract.addPaymentToPlan.estimateGas(accounts[2],  new BN('0'), new BN('1000000000000000000'), {from: accounts[1]});
//        console.log( `Estimate Gas addPaymentToPlan(): ${estimatedGas}` ); 
        
        let resAddPlan = await vestingContract.addPaymentToPlan(accounts[2],  new BN('0'), PAID_AMOUNT, {from: accounts[1]});
        truffleAssert.eventEmitted(resAddPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n from = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });

        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
    });

    it("-> addPaymentToPlan(): Add paiment to plan. Decline. Wrong index plan", async () => {
        console.log( "\n addPaymentToPlan() >>" );
 
        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        let idx = new BN(countPlans+1);

        await token20.approve(vestingContract.address, PAID_AMOUNT, {from: accounts[1]});

//        let estimatedGas = await vestingContract.addPaymentToPlan.estimateGas(accounts[2],  new BN('0'), new BN('1000000000000000000'), {from: accounts[1]});
//        console.log( `Estimate Gas addPaymentToPlan(): ${estimatedGas}` ); 
        
        let resAddPlan = await vestingContract.addPaymentToPlan(accounts[2],  idx, PAID_AMOUNT, {from: accounts[1]});
        truffleAssert.eventEmitted(resAddPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n from = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });
    });

    it("-> addPaymentToPlan(): Add paiment to plan. Decline. Address to=0x0000000000000000000000000000000000000000", async () => {
        console.log( "\n addPaymentToPlan() >>" );
 
        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        await token20.approve(vestingContract.address, PAID_AMOUNT, {from: accounts[1]});

//        let estimatedGas = await vestingContract.addPaymentToPlan.estimateGas(accounts[2],  new BN('0'), new BN('1000000000000000000'), {from: accounts[1]});
//        console.log( `Estimate Gas addPaymentToPlan(): ${estimatedGas}` ); 
        
        let resAddPlan = await vestingContract.addPaymentToPlan(NULL_ADDRESS,  new BN('0'), PAID_AMOUNT, {from: accounts[1]});
        truffleAssert.eventEmitted(resAddPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n from = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });
    });

    it("-> addPaymentToPlan(): Add paiment to plan. Decline. Amount=0", async () => {
        console.log( "\n addPaymentToPlan() >>" );
 
        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        await token20.approve(vestingContract.address, PAID_AMOUNT, {from: accounts[1]});

//        let estimatedGas = await vestingContract.addPaymentToPlan.estimateGas(accounts[2],  new BN('0'), new BN('1000000000000000000'), {from: accounts[1]});
//        console.log( `Estimate Gas addPaymentToPlan(): ${estimatedGas}` ); 
        
        let resAddPlan = await vestingContract.addPaymentToPlan(accounts[2],  new BN('0'), new BN('0'), {from: accounts[1]});
        truffleAssert.eventEmitted(resAddPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n from = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });
    });

    it("-> redirectPlan(): Redirect paiment from accounts [2] plan [0] to account [0] (startBlock > currentBlock). Successful", async () => {
        console.log( "\n redirectPlan() >>" );

        let countPlans = await vestingContract.getPlanCount(accounts[0]);
        console.log(`Count plans accounts[0]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[0], i);
            console.log(`accounts[0] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

//        let estimatedGas = await vestingContract.redirectPlan.estimateGas(new BN('0'), accounts[0], REDIRECT_AMOUNT, {from: accounts[2]});
//        console.log( `Estimate Gas redirectPlan(): ${estimatedGas}` ); 

        let resRedirectPlan = await vestingContract.redirectPlan(new BN('0'), accounts[0], REDIRECT_AMOUNT, {from: accounts[2]});
        truffleAssert.eventEmitted(resRedirectPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n from = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });

        countPlans = await vestingContract.getPlanCount(accounts[0]);
        console.log(`Count plans accounts[0]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[0], i);
            console.log(`accounts[0] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
    });

    it("-> redirectPlan(): Redirect paiment. Decline. Wrong index plan", async () => {
        console.log( "\n redirectPlan() >>" );

        let countPlans = await vestingContract.getPlanCount(accounts[0]);
        console.log(`Count plans accounts[0]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[0], i);
            console.log(`accounts[0] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

//        let estimatedGas = await vestingContract.redirectPlan.estimateGas(new BN('0'), accounts[0], REDIRECT_AMOUNT, {from: accounts[2]});
//        console.log( `Estimate Gas redirectPlan(): ${estimatedGas}` ); 

        let resRedirectPlan = await vestingContract.redirectPlan(new BN(countPlans+1), accounts[0], REDIRECT_AMOUNT, {from: accounts[2]});
        truffleAssert.eventEmitted(resRedirectPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n from = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });
    });

    it("-> redirectPlan(): Redirect paiment. Decline. Address to=0x0000000000000000000000000000000000000000", async () => {
        console.log( "\n redirectPlan() >>" );

        let countPlans = await vestingContract.getPlanCount(accounts[0]);
        console.log(`Count plans accounts[0]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[0], i);
            console.log(`accounts[0] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

//        let estimatedGas = await vestingContract.redirectPlan.estimateGas(new BN('0'), accounts[0], REDIRECT_AMOUNT, {from: accounts[2]});
//        console.log( `Estimate Gas redirectPlan(): ${estimatedGas}` ); 

        let resRedirectPlan = await vestingContract.redirectPlan(new BN('0'), NULL_ADDRESS, REDIRECT_AMOUNT, {from: accounts[2]});
        truffleAssert.eventEmitted(resRedirectPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n from = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });
    });

    it("-> redirectPlan(): Redirect paiment.  Decline. Amount=0", async () => {
        console.log( "\n redirectPlan() >>" );

        let countPlans = await vestingContract.getPlanCount(accounts[0]);
        console.log(`Count plans accounts[0]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[0], i);
            console.log(`accounts[0] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

//        let estimatedGas = await vestingContract.redirectPlan.estimateGas(new BN('0'), accounts[0], REDIRECT_AMOUNT, {from: accounts[2]});
//        console.log( `Estimate Gas redirectPlan(): ${estimatedGas}` ); 

        let resRedirectPlan = await vestingContract.redirectPlan(new BN('0'), accounts[0], new BN('0'), {from: accounts[2]});
        truffleAssert.eventEmitted(resRedirectPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n from = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });
    });

    it("-> redirectPlan(): Redirect paiment.  Decline. Amount > residual amount", async () => {
        console.log( "\n redirectPlan() >>" );

        let countPlans = await vestingContract.getPlanCount(accounts[0]);
        console.log(`Count plans accounts[0]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[0], i);
            console.log(`accounts[0] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

//        let estimatedGas = await vestingContract.redirectPlan.estimateGas(new BN('0'), accounts[0], REDIRECT_AMOUNT, {from: accounts[2]});
//        console.log( `Estimate Gas redirectPlan(): ${estimatedGas}` ); 
        let plan = await vestingContract.getPlan(accounts[2], 0);
        let _residualAmountPlan = new BN(plan.residualAmount);
        console.log(`acount[2][0].residualAmount = ${_residualAmountPlan}`);
        let _redirectAmount = _residualAmountPlan.mul(new BN('2'));
        console.log(`_redirectAmount = ${_redirectAmount}`);

        let resRedirectPlan = await vestingContract.redirectPlan(new BN('0'), accounts[0], _redirectAmount, {from: accounts[2]});
        truffleAssert.eventEmitted(resRedirectPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n from = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });
    });

    it("-> getCurrentPayment(): Current paiment account[2].  Decline. Current block < start block. The function should return 0", async () => {
        console.log( "\n getCurrentPayment() >>" );

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        let resRedirectPlan = await vestingContract.getCurrentPayment(new BN('0'), accounts[2]);
        console.log(`getCurrentPayment returned : amount = ${new BN(resRedirectPlan)}`);
    });

    it("-> getCurrentPayment(): Current paiment account[2].  Decline. Wrong index. The function should return 0", async () => {
        console.log( "\n getCurrentPayment() >>" );

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        let resRedirectPlan = await vestingContract.getCurrentPayment(countPlans+1, accounts[2]);
        console.log(`getCurrentPayment returned : amount = ${new BN(resRedirectPlan)}`);
    });

    it("-> getCurrentPayment(): Current paiment account[1].  Decline. No this address in mapping. The function should return 0", async () => {
        console.log( "\n getCurrentPayment() >>" );       
        let resRedirectPlan = await vestingContract.getCurrentPayment(new BN('0'), accounts[1]);
        console.log(`getCurrentPayment account[1] returned : amount = ${new BN(resRedirectPlan)}`);
    });

    it("-> claimPayment(): Claim current payment. Decline. This account has no plans", async () => {
        console.log( "\n claimPayment() >>" );
 
        let current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        let plan = await vestingContract.getPlan(accounts[2], 0);

        current = await time.latestBlock();
        console.log(`Current block: ${current}`);
        
        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

//        let estimatedGas = await vestingContract.claimPayment.estimateGas(new BN('0'), {from: accounts[2]});
//        console.log( `Estimate Gas claimPayment(): ${estimatedGas}` ); 

        let resClaimPayment = await vestingContract.claimPayment(new BN('0'), {from: accounts[5]});
        truffleAssert.eventEmitted(resClaimPayment, 'ClaimPayment', (ev) => {
            console.log(`Result event ClaimPayment :\n to = ${ev._to},\n token = ${ev._token},\n paymentAmount = ${new BN(ev._paymentAmount)},\n residualAmount = ${new BN(ev._residualAmount)}`);
            return true;
        });
    });

    it("-> claimPayment(): Claim current payment. Decline. Current block < start block", async () => {
        console.log( "\n claimPayment() >>" );
 
        let current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        let plan = await vestingContract.getPlan(accounts[2], 0);

        current = await time.latestBlock();
        console.log(`Current block: ${current}`);
        
        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        //let estimatedGas = await vestingContract.claimPayment.estimateGas(new BN('0'), {from: accounts[2]});
        //console.log( `Estimate Gas claimPayment(): ${estimatedGas}` ); 

        let resClaimPayment = await vestingContract.claimPayment(new BN('0'), {from: accounts[2]});
        truffleAssert.eventEmitted(resClaimPayment, 'ClaimPayment', (ev) => {
            console.log(`Result event ClaimPayment :\n to = ${ev._to},\n token = ${ev._token},\n paymentAmount = ${new BN(ev._paymentAmount)},\n residualAmount = ${new BN(ev._residualAmount)}`);
            return true;
        });
    });

    it("-> claimPayment(): Claim current payment account [2]. Successful", async () => {
        console.log( "\n claimPayment() >>" );
 
        let current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        let plan = await vestingContract.getPlan(accounts[2], 0);
        let startBlock = new BN(plan.startBlock);
        let endBlock = new BN(plan.endBlock);
        let testBlock = startBlock.add(endBlock.sub(startBlock).div(new BN('2')));
        console.log(`Test block: ${testBlock}`);

        await time.advanceBlockTo(testBlock);

        current = await time.latestBlock();
        console.log(`Current block: ${current}`);
        
        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

//        let estimatedGas = await vestingContract.claimPayment.estimateGas(new BN('0'), {from: accounts[2]});
//        console.log( `Estimate Gas claimPayment(): ${estimatedGas}` ); 

        let resClaimPayment = await vestingContract.claimPayment(new BN('0'), {from: accounts[2]});
        truffleAssert.eventEmitted(resClaimPayment, 'ClaimPayment', (ev) => {
            console.log(`Result event ClaimPayment :\n to = ${ev._to},\n token = ${ev._token},\n paymentAmount = ${new BN(ev._paymentAmount)},\n residualAmount = ${new BN(ev._residualAmount)}`);
            return true;
        });

        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
    });

    it("-> claimPayment(): Claim current payment. Decline. Wrong index plan", async () => {
        console.log( "\n claimPayment() >>" );
 
        let current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        let plan = await vestingContract.getPlan(accounts[2], 0);

        current = await time.latestBlock();
        console.log(`Current block: ${current}`);
        
        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

//        let estimatedGas = await vestingContract.claimPayment.estimateGas(new BN('0'), {from: accounts[2]});
//        console.log( `Estimate Gas claimPayment(): ${estimatedGas}` ); 

        let resClaimPayment = await vestingContract.claimPayment(countPlans+1, {from: accounts[2]});
        truffleAssert.eventEmitted(resClaimPayment, 'ClaimPayment', (ev) => {
            console.log(`Result event ClaimPayment :\n to = ${ev._to},\n token = ${ev._token},\n paymentAmount = ${new BN(ev._paymentAmount)},\n residualAmount = ${new BN(ev._residualAmount)}`);
            return true;
        });
    });

    it("-> getCurrentPayment(): Current paiment account[2]. Successful", async () => {
        console.log( "\n getCurrentPayment() >>" );

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
       
        let resRedirectPlan = await vestingContract.getCurrentPayment(new BN('0'), accounts[2]);
        console.log(`getCurrentPayment returned : amount = ${new BN(resRedirectPlan)}`);
    });

    it("-> addPaymentToPlan(): Add paiment to plan after claim, from accounts [1] to [2]. Successful", async () => {
        console.log( "\n addPaymentToPlan() >>" );
 
        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        let countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        await token20.approve(vestingContract.address, PAID_AMOUNT, {from: accounts[1]});

//        let estimatedGas = await vestingContract.addPaymentToPlan.estimateGas(accounts[2],  new BN('0'), new BN('1000000000000000000'), {from: accounts[1]});
//        console.log( `Estimate Gas addPaymentToPlan(): ${estimatedGas}` ); 
        
        let resAddPlan = await vestingContract.addPaymentToPlan(accounts[2],  new BN('0'), PAID_AMOUNT, {from: accounts[1]});
        truffleAssert.eventEmitted(resAddPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n from = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });

        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
    });

    it("-> redirectPlan(): Redirect paiment after claim from account [2] plan [0] to account [0]. Successful", async () => {
        console.log( "\n redirectPlan() >>" );

        let countPlans = await vestingContract.getPlanCount(accounts[0]);
        console.log(`Count plans accounts[0]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[0], i);
            console.log(`accounts[0] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        //let estimatedGas = await vestingContract.redirectPlan.estimateGas(new BN('0'), accounts[0], REDIRECT_AMOUNT, {from: accounts[2]});
        //console.log( `Estimate Gas redirectPlan(): ${estimatedGas}` ); 

        let resRedirectPlan = await vestingContract.redirectPlan(new BN('0'), accounts[0], REDIRECT_AMOUNT, {from: accounts[2]});
        truffleAssert.eventEmitted(resRedirectPlan, 'AddPlan', (ev) => {
            console.log(`Result event AddPlan :\n from = ${ev._from},\n to = ${ev._to},\n startBlock = ${new BN(ev._startBlock)},\n endBlock = ${new BN(ev._endBlock)},\n token = ${ev._token},\n amount = ${new BN(ev._amount)}`);
            return true;
        });

        countPlans = await vestingContract.getPlanCount(accounts[0]);
        console.log(`Count plans accounts[0]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[0], i);
            console.log(`accounts[0] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
    });

    it("-> claimPayment(): Claim full payment account [2] plan [0].  Successful", async () => {
        console.log( "\n claimPayment() >>" );
 
        let current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        let plan = await vestingContract.getPlan(accounts[2], 0);
        let endBlock = new BN(plan.endBlock);
        let testBlock = endBlock.add(SHIFT_START_BLOCK);
        console.log(`Test block: ${testBlock}`);

        await time.advanceBlockTo(testBlock);

        current = await time.latestBlock();
        console.log(`Current block: ${current}`);
        
        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }

        //let estimatedGas = await vestingContract.claimPayment.estimateGas(new BN('0'), {from: accounts[2]});
        //console.log( `Estimate Gas claimPayment(): ${estimatedGas}` ); 

        let resClaimPayment = await vestingContract.claimPayment(new BN('0'), {from: accounts[2]});
        truffleAssert.eventEmitted(resClaimPayment, 'ClaimPayment', (ev) => {
            console.log(`Result event ClaimPayment :\n to = ${ev._to},\n token = ${ev._token},\n paymentAmount = ${new BN(ev._paymentAmount)},\n residualAmount = ${new BN(ev._residualAmount)}`);
            return true;
        });

        console.log(`Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}`);
        console.log(`Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}`);
        console.log(`Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}`);
        console.log(`Balance this contract: ${vestingContract.address} = ${await token20.balanceOf(vestingContract.address)}`);

        countPlans = await vestingContract.getPlanCount(accounts[2]);
        console.log(`Count plans accounts[2]: ${countPlans}`);
        for(let i=0; i<countPlans; i++){
            let plan = await vestingContract.getPlan(accounts[2], i);
            console.log(`accounts[2] plan[${i}] :\n startBlock=${plan.startBlock},\n endBlock=${plan.endBlock},\n token=${plan.token},\n residualAmount=${plan.residualAmount}`);
        }
    });
});