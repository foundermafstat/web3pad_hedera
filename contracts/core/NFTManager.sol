// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "../interfaces/INFTManager.sol";
import "../interfaces/ITokenEconomy.sol";
import "../libraries/RewardCalculations.sol";
import "../libraries/AccessControlLib.sol";

/**
 * @title NFTManager
 * @dev Manages NFT minting and burning using Hedera HTS NFT standard
 */
contract NFTManager is INFTManager, ERC721, ERC721URIStorage, ERC721Burnable, AccessControl, Pausable, ReentrancyGuard {
    using RewardCalculations for string;
    using AccessControlLib for AccessControl;

    // Dependencies
    ITokenEconomy public tokenEconomy;

    // Storage
    mapping(uint256 => AchievementNFT) public nfts;
    mapping(address => uint256[]) public playerNFTs;
    mapping(string => uint256) public rarityBurnFees;
    
    uint256 private _tokenIdCounter;
    uint256 public constant MAX_NFTS = 1000000;

    // Events (inherited from interface)
    event RarityBurnFeeUpdated(string indexed rarity, uint256 fee);

    // Modifiers
    modifier onlyGameServer() {
        require(hasRole(AccessControlLib.GAME_SERVER_ROLE, msg.sender), "AccessControl: game server role required");
        _;
    }

    modifier onlyDAO() {
        require(hasRole(AccessControlLib.DAO_ROLE, msg.sender), "AccessControl: DAO role required");
        _;
    }

    modifier onlyOwner() {
        require(hasRole(AccessControlLib.OWNER_ROLE, msg.sender), "AccessControl: owner role required");
        _;
    }

    // Modifiers inherited from OpenZeppelin contracts

    constructor(address _tokenEconomy) ERC721("HederaGameAchievements", "GAME_NFT") {
        tokenEconomy = ITokenEconomy(_tokenEconomy);

        _grantRole(AccessControlLib.OWNER_ROLE, msg.sender);
        _grantRole(AccessControlLib.GAME_SERVER_ROLE, msg.sender);

        // Initialize default burn fees
        rarityBurnFees["common"] = 10 ether;    // 10 HPLAY
        rarityBurnFees["rare"] = 50 ether;       // 50 HPLAY
        rarityBurnFees["epic"] = 200 ether;      // 200 HPLAY
        rarityBurnFees["legendary"] = 1000 ether; // 1000 HPLAY
    }

    /**
     * @dev Mints achievement NFT after game milestone
     * @param player Player address
     * @param achievementType Achievement rarity type
     * @param metadataURI NFT metadata URI
     * @return tokenId The minted NFT token ID
     */
    function mintAchievementNFT(
        address player,
        string memory achievementType,
        string memory metadataURI
    ) external override onlyGameServer whenNotPaused nonReentrant returns (uint256 tokenId) {
        require(player != address(0), "NFTManager: invalid player address");
        require(bytes(achievementType).length > 0, "NFTManager: empty achievement type");
        require(bytes(metadataURI).length > 0, "NFTManager: empty metadata URI");
        require(_tokenIdCounter < MAX_NFTS, "NFTManager: max NFTs reached");

        tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(player, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Store NFT data
        AchievementNFT storage nft = nfts[tokenId];
        nft.tokenId = tokenId;
        nft.owner = player;
        nft.achievementType = achievementType;
        nft.metadataURI = metadataURI;
        nft.mintedTimestamp = block.timestamp;
        nft.rarityScore = _calculateRarityScore(achievementType);

        // Add to player's NFT list
        playerNFTs[player].push(tokenId);

        emit NFTMinted(player, tokenId, achievementType, metadataURI);
    }

    /**
     * @dev Burns NFT and upgrades player's abilities
     * @param player Player address
     * @param tokenId NFT token ID to burn
     * @param hplayAmount HPLAY amount for upgrade
     */
    function burnNFTForUpgrade(
        address player,
        uint256 tokenId,
        uint256 hplayAmount
    ) external override whenNotPaused nonReentrant {
        require(ownerOf(tokenId) == player, "NFTManager: not token owner");
        require(
            tokenEconomy.balanceOf(player) >= hplayAmount,
            "NFTManager: insufficient HPLAY"
        );

        AchievementNFT storage nft = nfts[tokenId];
        require(nft.owner == player, "NFTManager: not NFT owner");

        // Calculate burn fee based on rarity
        uint256 burnFee = rarityBurnFees[nft.achievementType];
        require(hplayAmount >= burnFee, "NFTManager: burn fee not met");

        // Burn tokens
        tokenEconomy.burnFrom(player, burnFee);

        // Transfer remaining HPLAY for upgrade (if any)
        uint256 upgradeAmount = hplayAmount - burnFee;
        if (upgradeAmount > 0) {
            tokenEconomy.transferFrom(player, address(this), upgradeAmount);
        }

        // Remove from player's NFT list
        _removeFromPlayerNFTs(player, tokenId);

        // Burn NFT
        _burn(tokenId);

        // Clear NFT data
        delete nfts[tokenId];

        emit NFTBurned(tokenId, player, burnFee);
    }

    /**
     * @dev Gets NFT information
     * @param tokenId NFT token ID
     * @return nft NFT information
     */
    function getNFT(uint256 tokenId) external view override returns (AchievementNFT memory nft) {
        nft = nfts[tokenId];
    }

    /**
     * @dev Gets all NFTs owned by a player
     * @param player Player address
     * @return tokenIds Array of NFT token IDs
     */
    function getPlayerNFTs(address player) external view override returns (uint256[] memory tokenIds) {
        tokenIds = playerNFTs[player];
    }

    /**
     * @dev Gets count of NFTs owned by player
     * @param player Player address
     * @return count Number of NFTs owned
     */
    function getPlayerNFTCount(address player) external view override returns (uint256) {
        return playerNFTs[player].length;
    }

    /**
     * @dev Sets burn fee for a rarity level
     * @param rarity Rarity level
     * @param fee Burn fee amount
     */
    function setRarityBurnFee(string memory rarity, uint256 fee) external override onlyDAO whenNotPaused {
        require(fee > 0, "NFTManager: invalid fee");
        rarityBurnFees[rarity] = fee;
        emit RarityBurnFeeUpdated(rarity, fee);
    }

    /**
     * @dev Gets burn fee for a rarity level
     * @param rarity Rarity level
     * @return fee Burn fee amount
     */
    function getRarityBurnFee(string memory rarity) external view override returns (uint256 fee) {
        fee = rarityBurnFees[rarity];
        if (fee == 0) {
            fee = 10 ether; // Default to common rarity fee
        }
    }

    /**
     * @dev Gets total number of minted NFTs
     * @return total Total number of NFTs
     */
    function getTotalNFTs() external view returns (uint256 total) {
        total = _tokenIdCounter;
    }

    /**
     * @dev Updates token economy dependency
     * @param _tokenEconomy New token economy address
     */
    function updateTokenEconomy(address _tokenEconomy) external onlyOwner {
        require(_tokenEconomy != address(0), "NFTManager: invalid token economy");
        tokenEconomy = ITokenEconomy(_tokenEconomy);
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Grants role to an account
     * @param role Role to grant
     * @param account Account to grant role to
     */
    function grantRole(bytes32 role, address account) public override onlyOwner {
        _grantRole(role, account);
    }

    /**
     * @dev Revokes role from an account
     * @param role Role to revoke
     * @param account Account to revoke role from
     */
    function revokeRole(bytes32 role, address account) public override onlyOwner {
        _revokeRole(role, account);
    }

    /**
     * @dev Calculates rarity score based on achievement type
     * @param achievementType Achievement type
     * @return score Rarity score
     */
    function _calculateRarityScore(string memory achievementType) private pure returns (uint256 score) {
        bytes32 typeHash = keccak256(abi.encodePacked(achievementType));
        
        if (typeHash == keccak256(abi.encodePacked("common"))) {
            score = 100;
        } else if (typeHash == keccak256(abi.encodePacked("rare"))) {
            score = 500;
        } else if (typeHash == keccak256(abi.encodePacked("epic"))) {
            score = 2000;
        } else if (typeHash == keccak256(abi.encodePacked("legendary"))) {
            score = 10000;
        } else {
            score = 100; // Default to common
        }
    }

    /**
     * @dev Removes NFT from player's NFT list
     * @param player Player address
     * @param tokenId NFT token ID to remove
     */
    function _removeFromPlayerNFTs(address player, uint256 tokenId) private {
        uint256[] storage nftList = playerNFTs[player];
        for (uint256 i = 0; i < nftList.length; i++) {
            if (nftList[i] == tokenId) {
                nftList[i] = nftList[nftList.length - 1];
                nftList.pop();
                break;
            }
        }
    }

    // Required overrides for multiple inheritance

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
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

