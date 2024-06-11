# PhysicalPunkAuction Smart Contract

This Solidity contract implements an NFT auction platform named **PhysicalPunkAuction**. It uses the ERC721 standard and integrates features for minting, auctioning, and bidding on NFTs.

## Features

- **NFT Minting**: Users can mint new NFTs.
- **Auction Creation**: NFT owners can create auctions for their tokens.
- **Bidding**: Users can place bids on active auctions.
- **Auction End Check**: Verify if an auction has ended and transfer the NFT to the highest bidder if it has.

## Contract Overview

### Inherited Contracts

- `ERC721`: Implements the basic ERC721 functionality.
- `ERC721URIStorage`: Extension of ERC721 for token URI storage.
- `Ownable`: Provides ownership control functions.

### State Variables

- `uint256 private _nextTokenId`: Keeps track of the next token ID to be minted.
- `uint256 public auctionDuration`: Duration of each auction (default is 10 minutes).
- `mapping(uint256 => Auction) public auctions`: Maps token IDs to their respective auctions.
- `mapping(address => uint256[]) internal ownerTokens`: Maps owner addresses to their owned token IDs.
- `uint256[] private auctionedTokenIds`: Stores IDs of tokens that are auctioned.

### Structs

- `Auction`: Represents an auction with details such as ID, owner, starting price, highest bid, highest bidder, end time, and status.

### Events

- `NFTMinted(uint256 indexed tokenId, string name, string description)`: Emitted when a new NFT is minted.
- `AuctionCreated(uint256 indexed tokenId, uint256 startingPrice)`: Emitted when a new auction is created.
- `BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount)`: Emitted when a bid is placed on an auction.
- `AuctionEnded(uint256 indexed tokenId, address indexed winner, uint256 amount)`: Emitted when an auction ends.

## Functions

### Minting

- `function mint(string memory uri) external`: Allows users to mint a new NFT with a specified URI. Emits an `NFTMinted` event.

### Auction Management

- `function createAuction(uint256 _tokenId, uint256 _startingPrice) external`: Allows NFT owners to create an auction for their token with a specified starting price. Emits an `AuctionCreated` event.
- `function placeBid(uint256 _tokenId) external payable`: Allows users to place bids on active auctions. Emits a `BidPlaced` event.
- `function checkAuctionEnd(uint256 _tokenId) external`: Checks if the auction has ended and transfers the NFT to the highest bidder if true. Emits an `AuctionEnded` event if the auction has ended.

### View Functions

- `function getAllAuctions() external view returns (Auction[] memory)`: Returns all active auctions.
- `function isAuctionEnded(uint256 _tokenId) external view returns(bool)`: Checks if a specific auction has ended.
- `function isAuctionStarted(uint256 _tokenId) external view returns(bool)`: Checks if a specific auction has started.
- `function getOwnersTokenId(address _owner) external view returns (uint256[] memory)`: Returns the token IDs owned by a specific address.
- `function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory)`: Overrides the `tokenURI` function from ERC721 and ERC721URIStorage to return the token URI.
- `function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool)`: Overrides the `supportsInterface` function to check supported interfaces.

## Deployment

Sepolia Address: 0x43bA70c605fF68101d5eC64ac3E546E4bb70fbb9

## Usage

1. **Mint an NFT**:

   - Call the `mint` function with a URI to mint a new NFT.

2. **Create an Auction**:

   - Call the `createAuction` function with the token ID and a starting price to create a new auction.

3. **Place a Bid**:

   - Call the `placeBid` function with the token ID and send Ether to place a bid on an active auction.

4. **Check Auction End**:

   - Call the `checkAuctionEnd` function with the token ID to check if the auction has ended and handle the transfer if it has.

5. **View Auctions**:
   - Call `getAllAuctions` to view all active auctions.
   - Call `isAuctionEnded` to check if a specific auction has ended.
   - Call `isAuctionStarted` to check if a specific auction has started.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
