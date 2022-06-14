// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT721Token is ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    constructor() ERC721("Fox", "FER") {}

    //onlyOwner available in "access/Ownable.sol'
    //minting NFT
    function mintNFT(address recipient, string memory tokenURI)
        public onlyOwner returns (uint256)
    {
        //increment(), current() available in "utils/Counters.sol"
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        //_mint(), _setTokenURI() available in "extensions/ERC721URIStorage.sol"
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}