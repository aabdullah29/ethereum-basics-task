# Blockchain_Tasks
 All Blockchain related Data


# constructor call in solidity

The place where you initialize each variable determines when the initialization code will run. During initialization the code is executed in the following order:

1. Expressions used as initializers in state variable declarations (least to most derived).
2. Base constructor arguments (most to the least derived).
3. Constructor bodies (least to the most derived).
 
 ```
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";

contract A {
    string[] order;

    constructor(uint _x) {
        console.log("_x in A is: ", _x);
        log(" constructor of A ");
    }

    function log(string memory _word) internal returns (uint) {
        order.push(_word);
        return 42;
    }
}

contract B is A {
    uint b = log(" declaration of b ");

    constructor(uint _x) A(log(" args of A ")) {
        console.log("_x in B is: ", _x);
        log(" constructor of B ");
    }
}

contract C is B {
    uint c = log(" declaration of c ");

    constructor() B(log(" args of B ")) {
        log(" constructor of C ");
    }

    function get() public view returns (string[] memory) {
        return order;
    }
}
 ```


### Dependencies between variables
The consequence of these rules is that it may be possible to access a variable before it is initialized:

```
contract C {
    uint a = 1;
    uint b;
    uint c = b + 1;

    constructor() {
        b = 2;
    }

    function get() public view returns (uint, uint, uint) {
        return (a, b, c);
    }
}
```

In this example running C.get() will give you (1, 2, 1) rather than the (1, 2, 3) you might expect. This is because C.c gets initialized before C.b. Unused storage is always zero-initialized so C.c is assigned 0 + 1.



# Importent Topics in Solidity


- multy sig:
call morethen one function in same transaction with same block timestemp using 'staticcall'.

- call, delegatecall and multi delegatecall:
`contractAddress.call` property is a low level function call it's use to call the other contract function from a contract and in this call `msg.sender` will be the contract address that will call to that other contract.

`contractAddress.delegatecall` property is also s low level function call it's use to call the other contract function from a contract but in delegatecall `msg.sender` will be the wallet address or the address that will initiate the transaction.

when we use multi call then msg.sender will be the contract. so, we use multi delegatecall for use wallet as msg.sender.

- abi encode and decode:
encode in byte and de code from byte.


- 3 ways to encode call data:
    
    use `contractAddres.call(bytesData)`

1: (bool responce, bytes data) = abi.encodeWithSignature("transfer(address,uint256)", to, amount);
2: (bool responce, bytes data) = return abi.encodeWithSelector(IERC20.transfer.selector, to, amount);
3: (bool responce, bytes data) = abi.encodeCall(IERC20.transfer, (to, amount))


- upgradeable smart contract or upgradeable proxy:


