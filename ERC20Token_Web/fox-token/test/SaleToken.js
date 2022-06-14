const SaleFoxToken = artifacts.require("./SaleFoxToken.sol");
const FoxToken = artifacts.require("./FoxToken.sol");

contract('SaleFoxToken', (accounts)=>{
    
    var tokenInstance;
    var tokenSaleInstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokenPrice = 1000000000000000; // in wei (0.001 Ether)
    var tokensAvailable = 75000;
    var numberOfTokensBuy;

    it('initializes the contract with the correct values', ()=> {
        return SaleFoxToken.deployed().then((instance)=> {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address
        }).then((address)=> {
            assert.notEqual(address, 0x0, 'has contract address');
            //Check the FoxToken Address
            return tokenSaleInstance.tokenContract();
        }).then((address)=> {
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokenSaleInstance.tokenPrice();
        }).then((price)=> {
            assert.equal(price, tokenPrice, 'token price is correct');
        });
    });

    
    it('facilitates token buying', function() {
        return FoxToken.deployed().then(function(instance) {
            // Grab FoxToken instance first
            tokenInstance = instance;
            return SaleFoxToken.deployed();
        }).then(function(instance) {
            // Then grab SaleToken instance
            tokenSaleInstance = instance;
            // Provision 75% of all tokens to the token sale
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
        }).then(function(receipt){
            return tokenInstance.balanceOf(tokenSaleInstance.address)
        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailable, 'token should be transfer to SaleFoxToken contract')
            numberOfTokensBuy = 10;
            return tokenSaleInstance.buyTokens(numberOfTokensBuy, { from: buyer, value: numberOfTokensBuy * tokenPrice })
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokensBuy, 'logs the number of tokens purchased');
            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokensBuy, 'increments the number of tokens sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), numberOfTokensBuy, 'buyer balance should be increase');
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokensBuy, 'contract Balanse should be decrease');
            // Try to buy tokens different from the ether value(price)
            return tokenSaleInstance.buyTokens(numberOfTokensBuy, { from: buyer, value: 1 });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
            //For converting number to string for big numbers
            let moreThanAvailable = 80000;
            let value = moreThanAvailable * tokenPrice;
            value = value.toLocaleString('fullwide', { useGrouping: false });
            return tokenSaleInstance.buyTokens(moreThanAvailable, { from: buyer, value: value })
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
        });
    });

    
    it('ends token sale', function() {
        return FoxToken.deployed().then(function(instance) {
            // Grab FoxToken instance first
            tokenInstance = instance;
            return SaleFoxToken.deployed();
        }).then(function(instance) {
            // Then grab token sale instance
            tokenSaleInstance = instance;
            // Try to end sale from account other than the admin
            return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert' >= 0, 'must be admin to end sale'));
            // End sale as admin
            return tokenSaleInstance.endSale({ from: admin });
        }).then(function(receipt) {
            return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
            assert.equal(balance, 999990, 'returns all unsold FoxTokens to admin');
            // Check that the contract has no balance
            balance = web3.eth.getBalance(tokenSaleInstance.address);
        //     assert.equal(balance, 0, 'account balance should be 0');
        //     return tokenSaleInstance.tokenPrice();
        // }).then(function(price){
        //     assert.equal(price, 0, 'token proce was reset');
        });
    });
})