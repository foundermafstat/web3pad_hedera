// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title INFTManager
 * @dev Interface for NFT management and achievement system
 */
interface INFTManager {
    struct AchievementNFT {
        uint256 tokenId;
        address owner;
        string achievementType; // "rare", "legendary", "epic", "common"
        string metadataURI;
        uint256 mintedTimestamp;
        uint256 rarityScore;
    }

    event NFTMinted(
        address indexed player,
        uint256 tokenId,
        string indexed achievementType,
        string metadataURI
    );

    event NFTBurned(
        uint256 indexed tokenId,
        address indexed player,
        uint256 burnFee
    );

    function mintAchievementNFT(
        address player,
        string memory achievementType,
        string memory metadataURI
    ) external returns (uint256 tokenId);

    function burnNFTForUpgrade(
        address player,
        uint256 tokenId,
        uint256 hplayAmount
    ) external;

    function getNFT(uint256 tokenId) external view returns (AchievementNFT memory);

    function getPlayerNFTs(address player) external view returns (uint256[] memory);

    function getPlayerNFTCount(address player) external view returns (uint256);

    function setRarityBurnFee(string memory rarity, uint256 fee) external;

    function getRarityBurnFee(string memory rarity) external view returns (uint256);
}

