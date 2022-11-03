// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract New {

    uint public count;

    event Count(uint count);
    event CountInd(uint indexed count);
    function inc(uint x) external returns(uint) {
        count = x;
        emit Count(count);
        emit CountInd(count);
        return count;
    }
}