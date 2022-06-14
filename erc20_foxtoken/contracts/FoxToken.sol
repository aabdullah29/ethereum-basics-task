// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


contract FoxToken {
    //1: Token Name
    string public name = "Fox Token";
    //2: Symbol
    string public symbol = "FET";
    //3: Standard
    string public standard = "Fox Token v1.0";
    //Total Token Supply
    uint256 public totalSupply;
    //Ballance of each account
    mapping(address=>uint256) public balanceOf;
    
    // assign value at deployment
    constructor(uint256 _initialSupply){
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    //4: Transfer Event
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    //5: Transfer Function and Event
    function transfer(address _to, uint256 _value) public returns(bool success){
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value); //Event Call
        success = true;
    }

    //6: Allowance
    mapping (address => mapping(address => uint256)) public allowance;
    //7: Approval Event
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    //8: Approve => store ammount in Allowance and triger the Approval Event
    function approve(address _spender, uint256 _value) public returns(bool success){
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value); //Event Call
        success = true;
    }
    
    //9: TransferFrom
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value; //clear the balance
        emit Transfer(_from, _to, _value); //Event Call
        return true;
    }

}

//Standerd for ERC20
//https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md


//Testing on Truffle Console
//truffle migerate --reset
//truffle console
//FoxToken.deployed().then((instance)=>{tokenInstance=instance;})
//tokenInstance.name()
//tokenInstance.symbol()
//tokenInstance.standard()
//tokenInstance.totalSupply().then((s)=>{supply=s})
//supply.toNumber()
//web3.eth.getAccounts()
//web3.eth.getAccounts().then((a)=>{return a[0]})
//web3.eth.getAccounts().then((a)=>{admin = a[0]})
//tokenInstance.balanceOf(admin).then((b)=>{return b.toNumber();})
//web3.eth.getAccounts().then((a)=>{account1 = a[1]})
//tokenInstance.transfer(account1, 1 , {from: admin})
//tokenInstance.balanceOf(account1).then((b)=>{return b.toNumber();})
//tokenInstance.approve(account1, 100)
//tokenInstance.allowance(admin, account1).then((b)=>{return b.toNumber()})
//web3.eth.getAccounts().then((a)=>{account2 = a[2]})
//web3.eth.getAccounts().then((a)=>{account3 = a[3]})
//web3.eth.getAccounts().then((a)=>{account4 = a[4]})
//web3.eth.getAccounts().then((a)=>{account4 = a[5]})
//tokenInstance.transfer(account2, 100, {from: admin})
//tokenInstance.balanceOf(account2).then((b)=>{return b.toNumber();})
//tokenInstance.approve(account3, 10, {from: account2})
//tokenInstance.allowance(account2, account3).then((b)=>{return b.toNumber()})
//tokenInstance.transferFrom(account5, account4, 10, {from: account3}) //error
//tokenInstance.transferFrom(account3, account4, 10, {from: account3}) //error
//tokenInstance.balanceOf(account4).then((b)=>{return b.toNumber();})
//tokenInstance.transferFrom(account2, account4, 10, {from: account3})
//tokenInstance.balanceOf(account4).then((b)=>{return b.toNumber();})
//tokenInstance.allowance(account2, account3).then((b)=>{return b.toNumber()})
//tokenInstance.balanceOf(account2).then((b)=>{return b.toNumber();})
//.exit


