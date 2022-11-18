// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

contract ABToken is ERC1155, Ownable {
    constructor() ERC1155("uri.com/") {}

    function uri(uint256 id) public view override returns (string memory) {
     string memory hexstringtokenID =  Strings.toString(id);
        return string( abi.encodePacked( super.uri(id), hexstringtokenID, ".json"));
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint( uint256 id, uint256 amount, bytes memory data)
        public
    {
        _mint(msg.sender, id, amount, data);
    }

    function mintBatch(uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
    {
        _mintBatch(msg.sender, ids, amounts, data);
    }



    function getType(bytes4 b) public view returns(bool) {
        return supportsInterface(b);
    }

    using ERC165Checker for address;

    // 0xd9b67a26
    // function checkSupportedAddress(address _address) external view returns (bool) {
    //     return _address.supportsInterface(type(IERC1155).interfaceId) || 
    //     _address.supportsInterface(type(IERC1155MetadataURI).interfaceId) ||
    //     super.supportsInterface(type(IERC165).interfaceId);
    // }
    
}



contract  Marketplace {

    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    IERC1155 private nftContract;
    uint256 private platformFee = 2;

    constructor(address _nftContract) {
        
        nftContract = ABToken(_nftContract);
    }


    struct NFTMarketItem{
        uint256 itemId;
        uint256 nftId;
        uint256 amount;
        uint256 price;
        address payable seller;
        bool sold;
    }

    mapping(uint256 => NFTMarketItem) public marketItem;
     
    function listNft(uint256 nftId,uint256 amount, uint256 price) external {

        require(nftId > 0, "Token doesnot exist");
        require(nftContract.isApprovedForAll(msg.sender, address(this)), "Token not approved");
        require(nftContract.balanceOf(msg.sender, nftId) >= amount, "Insufficient token balance");


        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        marketItem[itemId] = NFTMarketItem(
            itemId,
            nftId,
            amount,
            price,
            payable(msg.sender),
            false
        );

        // IERC1155(nftContract).safeTransferFrom(msg.sender, address(this), nftId, amount, "");
    }

   
    /// It will buy the NFT from marketplace.
    /// User will able to buy NFT and transfer to respectively owner or user and platform fees, roylty fees also deducted          from this function.

    function buyNFT(uint256 itemId, uint256 amount) external payable {


        NFTMarketItem storage nftMarketItem = marketItem[itemId];

        require(nftContract.isApprovedForAll(msg.sender, address(this)), "Token not listed.");
        require(!nftMarketItem.sold, "Item soled.");
        require(nftMarketItem.amount >= amount, "Invalid amount");
        require(msg.value >= nftMarketItem.price/nftMarketItem.amount * amount,"Insufficient balance for buy");

        uint256 marketFee = nftMarketItem.price * platformFee / 100;
        uint price = nftMarketItem.price - marketFee;

        nftMarketItem.seller.transfer(price);
        // onERC1155Received(address(this), msg.sender, itemId, amount, "");
        // nftContract.safeTransferFrom(address(this), msg.sender, itemId, amount, "");
        IERC1155(nftContract).safeTransferFrom(nftMarketItem.seller, msg.sender, nftMarketItem.nftId, amount, "");


        nftMarketItem.amount -= amount;
        nftMarketItem.price -= nftMarketItem.price/nftMarketItem.amount * amount;
        if (nftMarketItem.amount == 0)
        {
            nftMarketItem.sold = true;
        }
    }

}