pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Vesting{ 

    using SafeERC20 for IERC20;

    struct Plan{
        uint startBlock;
        uint endBlock;
        IERC20 token;
        uint residualAmount;
    }

    mapping(address => Plan []) private usersPlans;

    event AddPlan(address indexed _from, address indexed _to, uint _startBlock, uint _endBlock, IERC20 indexed _token, uint _amount);
    event ClaimPayment(address indexed _to, IERC20 indexed _token, uint _paymentAmount, uint _residualAmount);

    //Use 171142 gas
    function addPlan(address _to, uint _startBlock, uint _endBlock, IERC20 _token, uint _amount) public{ 
        require(address(_to) != address(0), "addPlan: recipient with null address!"); //38 gas //if you set the address to zero, safeTransferFrom will be executed
        require(address(_token) != address(0), "addPlan: token with null address!");
        require(_amount > 0, "addPlan: amount is too small!");
        require(_startBlock < _endBlock, "addPlan: end block is smallest then start block!"); //23 gas
        usersPlans[_to].push(Plan(_startBlock, _endBlock, _token, _amount)); //102 068 gas
        _token.safeTransferFrom(msg.sender, address(this), _amount);
        emit AddPlan(msg.sender, _to, _startBlock, _endBlock, _token, _amount);
    }

    //Use 65073 gas
    function addPaymentToPlan(address _to, uint _idx, uint _amount) public{ 
        require(_idx < usersPlans[_to].length, "addPaymentToPlan: no this index in user plans!");
        require(_amount > 0, "addPaymentToPlan: amount is too small!");
        Plan storage _userPlan = usersPlans[_to][_idx];
        _userPlan.residualAmount += _amount;
       _userPlan.token.safeTransferFrom(msg.sender, address(this), _amount);
        emit AddPlan(msg.sender, _to, _userPlan.startBlock, _userPlan.endBlock, _userPlan.token, _userPlan.residualAmount);
    }

    function _currentPayment(uint _startBlock, uint _endBlock, uint _currentBlock, uint _residualAmount) private pure returns(uint){ 
        if(_currentBlock<=_startBlock)
            return 0;
        else if(_currentBlock>_endBlock)
            return _residualAmount;
        else
            return _residualAmount*(_currentBlock-_startBlock)/(_endBlock-_startBlock);
    }

    function getCurrentPayment(uint _idx, address _to) public view returns(uint){ 
        if(_idx >= usersPlans[_to].length) 
            return 0;
        Plan storage _userPlan = usersPlans[_to][_idx];
        return _currentPayment(_userPlan.startBlock, _userPlan.endBlock, block.number, _userPlan.residualAmount);
    }

    function _deletePlan(address _adr, uint _idx) private{ 
        Plan [] storage _userPlans = usersPlans[_adr];
        if (_idx >= _userPlans.length) 
            return;
        uint _length = _userPlans.length-1;
        if(_idx!=_length)
            _userPlans[_idx] = _userPlans[_length];
        _userPlans.pop();
    }

    //Use 76376 gas and 111856 when use _deletePlan()
    function claimPayment(uint _idx) public{
        require(_idx < usersPlans[msg.sender].length, "claimPayment: no this index in user plans!");
        Plan storage _userPlan = usersPlans[msg.sender][_idx];
        uint _currBlock = block.number;
        uint _amount = _currentPayment(_userPlan.startBlock, _userPlan.endBlock, _currBlock, _userPlan.residualAmount);
        require(_amount > 0, "claimPayment: paiment amount = 0!"); 
        if(_amount > 0){
            _userPlan.residualAmount -= _amount;
            _userPlan.startBlock = _currBlock;
        }

        IERC20 _token = _userPlan.token;
        uint _residualAmount = _userPlan.residualAmount;
        if(_userPlan.residualAmount == 0){
            _deletePlan(msg.sender, _idx);
            if(usersPlans[msg.sender].length == 0)
                delete usersPlans[msg.sender];
        }
        _token.safeTransfer(msg.sender, _amount);
        emit ClaimPayment(msg.sender, _token, _amount, _residualAmount);
    }

    //Use 124883 gas (139883)
    function redirectPlan(uint _idx, address _to, uint _amount) public{
        require(address(_to) != address(0), "redirectPlan: recipient with null address!");
        require(_idx < usersPlans[msg.sender].length, "redirectPlan: no this index in user plans!");
        require(_amount > 0, "redirectPlan: amount is 0!");
        Plan storage _userPlan = usersPlans[msg.sender][_idx];
        require(_userPlan.residualAmount >= _amount, "redirectPlan: plan amount is too small!");
        _userPlan.residualAmount -= _amount;
        uint _startBlock = _userPlan.startBlock;
        uint _endBlock = _userPlan.endBlock;
        IERC20 _token = _userPlan.token;
        if(_userPlan.residualAmount == 0){
            _deletePlan(msg.sender, _idx);
            if(usersPlans[msg.sender].length == 0)
                delete usersPlans[msg.sender];
        }
        usersPlans[_to].push(Plan(_startBlock, _endBlock, _token, _amount));
        emit AddPlan(msg.sender, _to, _startBlock, _endBlock, _token, _amount);
    }

    //Use 23047 gas
    function getPlanCount(address _adr) public view returns(uint){
        return usersPlans[_adr].length;
    } 

    //Use 27341 gas
    function getPlan(address _adr, uint _idx) public view returns(Plan memory){
        return usersPlans[_adr][_idx];
    }
}