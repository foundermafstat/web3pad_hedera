// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../interfaces/IPlayerSBT.sol";
import "../interfaces/IGameRegistry.sol";
import "../libraries/RewardCalculations.sol";
import "../libraries/AccessControlLib.sol";

/**
 * @title PlayerSBT
 * @dev SoulBound Token representing player identity and stats using Hedera HTS NFT standard
 */
contract PlayerSBT is IPlayerSBT, ERC721, ERC721URIStorage, AccessControl, Pausable, ReentrancyGuard {
    using RewardCalculations for uint256;
    using AccessControlLib for AccessControl;

    // Dependencies
    IGameRegistry public gameRegistry;

    // Storage
    mapping(address => PlayerStats) private playerStats;
    mapping(address => bool) private sbtStatus;
    mapping(address => mapping(string => GameStat)) private gameSpecificStats;
    
    uint256 private _tokenIdCounter;
    uint256 public constant MAX_PLAYERS = 100000;

    // Events (inherited from interface)

    // Modifiers
    modifier onlyGameServer() {
        require(hasRole(AccessControlLib.GAME_SERVER_ROLE, msg.sender), "AccessControl: game server role required");
        _;
    }

    modifier onlyOwner() {
        require(hasRole(AccessControlLib.OWNER_ROLE, msg.sender), "AccessControl: owner role required");
        _;
    }

    // Modifiers inherited from OpenZeppelin contracts

    constructor(address _gameRegistry) ERC721("HederaGamePlayerSBT", "GAME_SBT") {
        gameRegistry = IGameRegistry(_gameRegistry);

        _grantRole(AccessControlLib.OWNER_ROLE, msg.sender);
        _grantRole(AccessControlLib.GAME_SERVER_ROLE, msg.sender);
    }

    /**
     * @dev Mints SBT to player (one-time operation)
     * @param player Player address
     * @param uri Token metadata URI
     * @return tokenId The minted token ID
     */
    function mintSBT(address player, string memory uri) 
        external override onlyGameServer whenNotPaused nonReentrant returns (uint256 tokenId) {
        require(player != address(0), "PlayerSBT: invalid player address");
        require(!sbtStatus[player], "PlayerSBT: player already has SBT");
        require(_tokenIdCounter < MAX_PLAYERS, "PlayerSBT: max players reached");

        tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(player, tokenId);
        _setTokenURI(tokenId, uri);

        sbtStatus[player] = true;

        // Initialize player stats
        PlayerStats storage stats = playerStats[player];
        stats.totalGamesPlayed = 0;
        stats.totalWins = 0;
        stats.totalPoints = 0;
        stats.totalLosses = 0;
        stats.averageScore = 0;
        stats.lastGameTimestamp = 0;

        emit PlayerSBTMinted(player, tokenId);
    }

    /**
     * @dev Updates player statistics after game completion
     * @param player Player address
     * @param gameId Game identifier
     * @param score Game score
     * @param isWin Whether player won
     */
    function updateStats(
        address player,
        string memory gameId,
        uint256 score,
        bool isWin
    ) external override onlyGameServer whenNotPaused {
        require(sbtStatus[player], "PlayerSBT: player does not have SBT");
        require(bytes(gameId).length > 0, "PlayerSBT: empty game ID");

        PlayerStats storage stats = playerStats[player];
        GameStat storage gameStat = gameSpecificStats[player][gameId];

        // Update overall stats
        stats.totalGamesPlayed++;
        stats.totalPoints += score;
        stats.lastGameTimestamp = block.timestamp;

        if (isWin) {
            stats.totalWins++;
            gameStat.wins++;
        } else {
            stats.totalLosses++;
        }

        // Update average score
        stats.averageScore = stats.totalPoints / stats.totalGamesPlayed;

        // Update game-specific stats
        gameStat.gamesPlayed++;
        gameStat.totalScore += score;
        gameStat.lastPlayed = block.timestamp;

        if (score > gameStat.highestScore) {
            gameStat.highestScore = score;
        }

        emit StatsUpdated(player, gameId, score, stats.totalGamesPlayed);
    }

    /**
     * @dev Gets comprehensive player statistics
     * @param player Player address
     * @return stats Player statistics
     */
    function getPlayerStats(address player) 
        external view override returns (PlayerStats memory stats) {
        stats = playerStats[player];
    }

    /**
     * @dev Gets game-specific statistics for a player
     * @param player Player address
     * @param gameId Game identifier
     * @return gameStat Game-specific statistics
     */
    function getGameSpecificStats(address player, string memory gameId)
        external view override returns (GameStat memory gameStat) {
        gameStat = gameSpecificStats[player][gameId];
    }

    /**
     * @dev Checks if player has SBT
     * @param player Player address
     * @return hasToken True if player has SBT
     */
    function hasSBT(address player) external view override returns (bool hasToken) {
        hasToken = sbtStatus[player];
    }

    /**
     * @dev Calculates reward amount based on score and game
     * @param score Game score
     * @param gameId Game identifier
     * @return hplayAmount Reward amount in HPLAY tokens
     */
    function calculateReward(uint256 score, string memory gameId) 
        external view override returns (uint256 hplayAmount) {
        uint256 difficultyMultiplier = gameRegistry.getDifficultyMultiplier(gameId);
        uint256 streakBonus = 1000; // Default 1.0x (can be enhanced later)

        hplayAmount = RewardCalculations.calculateBaseReward(
            score,
            difficultyMultiplier,
            streakBonus
        );
    }

    /**
     * @dev Gets player's token ID
     * @param player Player address
     * @return tokenId Player's SBT token ID
     */
    function getPlayerTokenId(address player) external view returns (uint256 tokenId) {
        require(sbtStatus[player], "PlayerSBT: player does not have SBT");
        
        // Find token ID by iterating through tokens
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (ownerOf(i) == player) {
                return i;
            }
        }
        revert("PlayerSBT: token not found");
    }

    /**
     * @dev Gets total number of minted SBTs
     * @return total Total number of SBTs
     */
    function getTotalSBTs() external view returns (uint256 total) {
        total = _tokenIdCounter;
    }

    /**
     * @dev Updates game registry dependency
     * @param _gameRegistry New game registry address
     */
    function updateGameRegistry(address _gameRegistry) external onlyOwner {
        require(_gameRegistry != address(0), "PlayerSBT: invalid game registry");
        gameRegistry = IGameRegistry(_gameRegistry);
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

    // Override transfer functions to make token SoulBound (non-transferable)
    // Required overrides for ERC721URIStorage

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

