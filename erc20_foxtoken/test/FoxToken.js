const FoxToken = artifacts.require("./FoxToken.sol");

contract('FoxToken', (accounts)=>{

    it('initializes the contract with the corrent values', ()=>{
        return FoxToken.deployed().then((instance)=>{
            tokenInstance = instance;
            return tokenInstance.name();
        }).then((name)=>{
            assert.equal(name, 'Fox Token', 'has the correct name');
            return tokenInstance.symbol();
        }).then((symbol)=>{
            assert.equal(symbol, 'FET', 'has the same symbol')
            return tokenInstance.standard();
        }).then((standard)=>{
            assert.equal(standard, 'Fox Token v1.0', 'has the same standard')
        });
    });


    it('allocate the initial supply upon deployment', ()=>{
        return FoxToken.deployed().then((instance)=>{
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then((totalSupply)=>{
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the totalSupply tp 1,000,000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then((adminBalance)=>{
            assert.equal(adminBalance.toNumber(), 1000000, 'it allocate the initialSupply to Admin')
        });
    });


    it('transfer token ownership', ()=>{
        return FoxToken.deployed().then((instance)=>{
            tokenInstance = instance;
            //Pass grater value => use call because it's never do any transaction and never triger the event
            return tokenInstance.transfer.call(accounts[1], 99999999);
        }).then(assert.fail).catch((error)=>{
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert')
            return tokenInstance.transfer.call(accounts[1], 200000, { from: accounts[0] });
        }).then(function(success) {
            assert.equal(success, true, 'it returns true');
            //Send token from one account to other
            return tokenInstance.transfer(accounts[1], 200000, {from: accounts[0]});
        }).then((receipt)=>{
            //Test the Transaction Event
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 200000, 'logs the transfer amount');
            //Get balance
            return tokenInstance.balanceOf(accounts[1]);
        }).then((balance)=>{
            assert.equal(balance.toNumber(), 200000, 'add amount in receiving account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then((balance)=>{
            assert.equal(balance.toNumber(), 800000, 'deducts amount from sending account' );
        });
    });


    it('approve tokens for deligated transfer', ()=>{
        return FoxToken.deployed().then((instance)=>{
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then((success)=>{
            assert.equal(success, true, 'its return true');
            return tokenInstance.approve(accounts[1], 100);
        }).then((receipt)=>{
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by (_owner)');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to (_spender)');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
            // check allowance mapping update or note after approve method call
            return tokenInstance.allowance(accounts[0], accounts[1]);
    }).then((allowance)=>{
        assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated trasnfer');
        });
    });

    it('handles delegated token transfers', function() {
        return FoxToken.deployed().then(function(instance) {
            //Initialise in one line
            [tokenInstance,fromAccount,toAccount,spendingAccount] = [instance,accounts[2],accounts[3],accounts[4]];
            // Transfer some tokens to fromAccount
            return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
            }).then(function(receipt) {
            // Approve spendingAccount to spend 10 tokens form fromAccount
            return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
            }).then(function(receipt) {
            // Try transferring something larger than the sender's balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
            }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
            // Try transferring something larger than the approved amount
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
            }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
            //Check the return value using call because it's never change the state
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
            }).then(function(success) {
            assert.equal(success, true);
            // Transfer the amount and check the event
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
            }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
            return tokenInstance.balanceOf(fromAccount);
            }).then(function(balance) {
            assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');
            return tokenInstance.balanceOf(toAccount);
            }).then(function(balance) {
            assert.equal(balance.toNumber(), 10, 'adds the amount from the receiving account');
            //Check the remaining balance
            return tokenInstance.allowance(fromAccount, spendingAccount);
            }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
            });
        });
})