// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PhysicalPunkAuction is ERC721, ERC721URIStorage {
    uint256 private _nextTokenId;
    uint256 public auctionDuration = 10 minutes;

    struct Auction {
        uint256 id;
        address payable owner;
        uint256 startingPrice;
        uint256 highestBid;
        address payable highestBidder;
        uint256 endTime;
        bool isEnded;
    }

    mapping(uint256 => Auction) public auctions;
    mapping(address => uint256[]) internal ownerTokens;
    uint256[] private auctionedTokenIds;

    event NFTMinted(uint256 indexed tokenId, string name, string description);
    event AuctionCreated(uint256 indexed tokenId, uint256 startingPrice);
    event BidPlaced(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount
    );
    event AuctionEnded(
        uint256 indexed tokenId,
        address indexed winner,
        uint256 amount
    );

    constructor() ERC721("PhysicalPunk", "PNK") {}

    function mint(string memory uri) external {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        ownerTokens[msg.sender].push(tokenId);
        emit NFTMinted(tokenId, "NFT Name", "NFT Description");
    }

    function createAuction(uint256 _tokenId, uint256 _startingPrice) external {
        require(
            ownerOf(_tokenId) == msg.sender,
            "createAuction::Only the owner can create an auction"
        );
        require(
            _startingPrice > 10000000000000000,
            "createAuction::Starting price must be greater than 0.01 ETH"
        );
        require(
            !auctions[_tokenId].isEnded,
            "createAuction::Auction already ended"
        );

        auctions[_tokenId] = Auction({
            id: _tokenId,
            owner: payable(msg.sender),
            startingPrice: _startingPrice,
            highestBid: _startingPrice,
            highestBidder: payable(address(0)),
            endTime: block.timestamp + auctionDuration,
            isEnded: false
        });
        auctionedTokenIds.push(_tokenId);
        emit AuctionCreated(_tokenId, _startingPrice);
    }

    function placeBid(uint256 _tokenId) external payable {
        Auction storage auction = auctions[_tokenId];
        require(!auction.isEnded, "placeBid::Auction ended");
        require(
            msg.value > auction.highestBid,
            "placeBid::Bid must be higher than current highest bid"
        );
        require(
            msg.value > auction.startingPrice,
            "placeBid::Bid must be greater than the starting price"
        );
        if (auction.highestBidder != address(0)) {
            auction.highestBidder.transfer(auction.highestBid);
        }
        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);

        emit BidPlaced(_tokenId, msg.sender, msg.value);
    }

    function checkAuctionEnd(uint256 _tokenId) external {
        Auction storage auction = auctions[_tokenId];
        if (!auction.isEnded && block.timestamp >= auction.endTime) {
            auction.isEnded = true;

            if (auction.highestBidder != address(0)) {
                payable(ownerOf(_tokenId)).transfer(auction.highestBid);
                _transfer(ownerOf(_tokenId), auction.highestBidder, _tokenId);
                emit AuctionEnded(
                    _tokenId,
                    auction.highestBidder,
                    auction.highestBid
                );
            }
        }
    }

    function getAllAuctions() external view returns (Auction[] memory) {
        uint256 activeAuctionCount = 0;
        for (uint256 i = 0; i < auctionedTokenIds.length; i++) {
            if (!auctions[auctionedTokenIds[i]].isEnded) {
                activeAuctionCount++;
            }
        }
        Auction[] memory activeAuctions = new Auction[](activeAuctionCount);
        uint256 index = 0;
        for (uint256 i = 0; i < auctionedTokenIds.length; i++) {
            if (!auctions[auctionedTokenIds[i]].isEnded) {
                activeAuctions[index] = auctions[auctionedTokenIds[i]];
                index++;
            }
        }
        return activeAuctions;
    }

    function isAuctionEnded(uint256 _tokenId) external view returns(bool) {
        return auctions[_tokenId].isEnded;
    }

    function isAuctionStarted(uint256 _tokenId) external view returns(bool) {
        return auctions[_tokenId].endTime > 0;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getOwnersTokenId(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        return ownerTokens[_owner];
    }

    
}
