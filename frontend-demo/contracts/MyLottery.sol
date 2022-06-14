// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract MyLottery
{
    mapping(uint16=> address payable) players;
    address public manager;
    uint startTime;
    uint endTime;


    constructor(uint _startTime, uint _endTime){
        manager = msg.sender;
        startTime = block.timestamp + _startTime;
        endTime = block.timestamp + _endTime;
    }

    
    function getSum(uint16 num) private pure returns(uint16)
    {
        uint16 result;
         while(num/10 != 0)
        {
            result += num%10;
            num = num/10;
        }
        result += num;
        return result;
    }

    function startLottery(uint _startTime, uint _endTime) public
    {
        require(msg.sender == manager, "Onlay Manager can access.");
        require(endTime < block.timestamp && address(this).balance == 0, "Can not Restart.");
        startTime = block.timestamp + _startTime;
        endTime = block.timestamp + _endTime;
    }

    function getLottery(uint16 _userGues) payable external{
        _userGues = getSum(_userGues);
        require(block.timestamp > startTime && block.timestamp < endTime, "Time error.");
        require(players[_userGues]== address(0), "This number already taken");
        require(msg.value == 1 ether, "Your contribution should be 1 Ether");
        players[_userGues]= payable(msg.sender);
    }

    function getBalance() public view returns(uint){
        require(msg.sender == manager, "Onlay Manager can access.");
        return address(this).balance;
    }


    function pickWinner() public returns(address){
        require(block.timestamp > endTime,"Time is not End");
        require(msg.sender == manager);
        require (address(this).balance >= 1 ether);
        address payable winner;

        uint16 index = 25;
        if(players[index] != address(0)){
            winner = players[index];
        }
        else{
            uint16 i;
            while(winner == address(0))
            {
                if(players[index+i] != address(0)){
                    winner = players[index+i];
                }else if(players[index-i] != address(0)){
                    winner = players[index-i];
                }
                i++;
            }
        }
        winner.transfer(getBalance());
        return winner;
        // players = newPlayer;
    }
}