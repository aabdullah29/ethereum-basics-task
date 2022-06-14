// PROVISION TOKENS TO TOKEN SALE CONTRACT
// SET A TOKEN PRICE IN WEI
// ASSIGN AN ADMIN
// BUY TOKENS
// END SALE

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./FoxToken.sol";


contract SaleFoxToken {

    address admin;
    FoxToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    constructor(FoxToken _tokenContract, uint256 _tokenPrice){
        //Assign admin
        //Token Contract
        //Token Price in ETH
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    //Use https://github.com/dapphub/ds-math
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }
    //Sell Event For Buyer
    event Sell(address _buyer, uint256 _amount);
    //Buy Tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        //Now sender is the SaleFoxToken contract
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        tokensSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));

        // UPDATE: Let's not destroy the contract here
        // Just transfer the balance to the admin
        // admin.transfer(address(this).balance);

        address payable addr = payable(address(admin));
        selfdestruct(addr);
    }
}

//For converting number to string for big numbers, you can use:
//Number(value).toLocaleString('fullwide', { useGrouping: false })

//SaleFoxToken.deployed().then((instance)=>{tokenSaleInstance=instance})
//web3.eth.getAccounts().then((a)=>{admin = a[0]})
//web3.eth.getAccounts().then((a)=>{buyer = a[1]})
//var tokenPrice = 1000000000000000
//var tokensAvailable = 750000
//FoxToken.deployed().then((instance)=>{tokenInstance=instance;})
//tokenSaleInstance.address
//tokenInstance.transfer(tokenSaleInstance.address ,tokensAvailable , {from: admin}
//tokenInstance.balanceOf(tokenSaleInstance.address)
//tokenInstance.balanceOf(tokenSaleInstance.address).then((b)=>{return b.toNumber()})
//tokenSaleInstance.tokensSold()
//.exit

//Run Web
//npm start dev