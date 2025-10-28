// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IGameRegistry.sol";
import "../interfaces/IResultVerifier.sol";
import "../interfaces/IPlayerSBT.sol";
import "../interfaces/INFTManager.sol";
import "../interfaces/ITokenEconomy.sol";
import "../interfaces/IFaucetManager.sol";
import "../interfaces/ILotteryPool.sol";
import "../libraries/AccessControlLib.sol";

/**
 * @title HederaGameLaunchpad
 * @dev Main orchestrator contract for the Hedera Game Launchpad system
 */
contract HederaGameLaunchpad is AccessControl, Pausable, ReentrancyGuard {
    using AccessControlLib for AccessControl;

    // Contract dependencies
    IGameRegistry public gameRegistry;
    IResultVerifier public resultVerifier;
    IPlayerSBT public playerSBT;
    INFTManager public nftManager;
    ITokenEconomy public tokenEconomy;
    IFaucetManager public faucetManager;
    ILotteryPool public lotteryPool;

    // System state
    bool public systemInitialized;
    uint256 public totalGamesPlayed;
    uint256 public totalPlayers;
    uint256 public totalRewardsDistributed;

    // Events
    event SystemInitialized(
        address gameRegistry,
        address resultVerifier,
        address playerSBT,
        address nftManager,
        address tokenEconomy,
        address faucetManager,
        address lotteryPool
    );

    event GamePlayed(address indexed player, string indexed gameId, uint256 score);
    event PlayerRegistered(address indexed player, uint256 tokenId);
    event RewardDistributed(address indexed player, uint256 amount);
    event SystemPaused(address indexed pauser);
    event SystemUnpaused(address indexed unpauser);

    // Modifiers
    modifier onlyOwner() {
        require(hasRole(AccessControlLib.OWNER_ROLE, msg.sender), "AccessControl: owner role required");
        _;
    }

    modifier onlyDAO() {
        require(hasRole(AccessControlLib.DAO_ROLE, msg.sender), "AccessControl: DAO role required");
        _;
    }

    modifier onlyGameServer() {
        require(hasRole(AccessControlLib.GAME_SERVER_ROLE, msg.sender), "AccessControl: game server role required");
        _;
    }

    // Modifiers inherited from OpenZeppelin contracts

    modifier whenSystemInitialized() {
        require(systemInitialized, "HederaGameLaunchpad: system not initialized");
        _;
    }

    constructor() {
        _grantRole(AccessControlLib.OWNER_ROLE, msg.sender);
        _setRoleAdmin(AccessControlLib.DAO_ROLE, AccessControlLib.OWNER_ROLE);
        _setRoleAdmin(AccessControlLib.SERVER_ROLE, AccessControlLib.OWNER_ROLE);
        _setRoleAdmin(AccessControlLib.GAME_SERVER_ROLE, AccessControlLib.OWNER_ROLE);
    }

    /**
     * @dev Initializes the system with all contract dependencies
     * @param _gameRegistry Game registry contract address
     * @param _resultVerifier Result verifier contract address
     * @param _playerSBT Player SBT contract address
     * @param _nftManager NFT manager contract address
     * @param _tokenEconomy Token economy contract address
     * @param _faucetManager Faucet manager contract address
     * @param _lotteryPool Lottery pool contract address
     */
    function initializeSystem(
        address _gameRegistry,
        address _resultVerifier,
        address _playerSBT,
        address _nftManager,
        address _tokenEconomy,
        address _faucetManager,
        address _lotteryPool
    ) external onlyOwner {
        require(!systemInitialized, "HederaGameLaunchpad: already initialized");
        require(_gameRegistry != address(0), "HederaGameLaunchpad: invalid game registry");
        require(_resultVerifier != address(0), "HederaGameLaunchpad: invalid result verifier");
        require(_playerSBT != address(0), "HederaGameLaunchpad: invalid player SBT");
        require(_nftManager != address(0), "HederaGameLaunchpad: invalid NFT manager");
        require(_tokenEconomy != address(0), "HederaGameLaunchpad: invalid token economy");
        require(_faucetManager != address(0), "HederaGameLaunchpad: invalid faucet manager");
        require(_lotteryPool != address(0), "HederaGameLaunchpad: invalid lottery pool");

        gameRegistry = IGameRegistry(_gameRegistry);
        resultVerifier = IResultVerifier(_resultVerifier);
        playerSBT = IPlayerSBT(_playerSBT);
        nftManager = INFTManager(_nftManager);
        tokenEconomy = ITokenEconomy(_tokenEconomy);
        faucetManager = IFaucetManager(_faucetManager);
        lotteryPool = ILotteryPool(_lotteryPool);

        systemInitialized = true;

        emit SystemInitialized(
            _gameRegistry,
            _resultVerifier,
            _playerSBT,
            _nftManager,
            _tokenEconomy,
            _faucetManager,
            _lotteryPool
        );
    }

    /**
     * @dev Registers a new game module
     * @param serverAddress Authorized server address
     * @param publicKey Server's public key
     * @param gameId Unique game identifier
     * @param metadataURI IPFS metadata URI
     * @return success True if registration successful
     */
    function registerGameModule(
        address serverAddress,
        bytes32 publicKey,
        string memory gameId,
        string memory metadataURI
    ) external onlyOwner whenSystemInitialized whenNotPaused returns (bool success) {
        success = gameRegistry.registerGameModule(serverAddress, publicKey, gameId, metadataURI);
    }

    /**
     * @dev Submits game result for verification
     * @param player Player address
     * @param gameId Game identifier
     * @param score Game score
     * @param signature Server signature
     * @param nonce Player nonce
     * @param timestamp Signature timestamp
     * @return success True if verification successful
     */
    function submitGameResult(
        address player,
        string memory gameId,
        uint256 score,
        bytes memory signature,
        uint256 nonce,
        uint256 timestamp
    ) external onlyGameServer whenSystemInitialized whenNotPaused nonReentrant returns (bool success) {
        success = resultVerifier.submitGameResult(player, gameId, score, signature, nonce, timestamp);
        
        if (success) {
            totalGamesPlayed++;
            emit GamePlayed(player, gameId, score);
        }
    }

    /**
     * @dev Mints SBT to a new player
     * @param player Player address
     * @param tokenURI Token metadata URI
     * @return tokenId The minted token ID
     */
    function mintPlayerSBT(address player, string memory tokenURI) 
        external onlyGameServer whenSystemInitialized whenNotPaused returns (uint256 tokenId) {
        tokenId = playerSBT.mintSBT(player, tokenURI);
        totalPlayers++;
        emit PlayerRegistered(player, tokenId);
    }

    /**
     * @dev Mints achievement NFT to a player
     * @param player Player address
     * @param achievementType Achievement rarity type
     * @param metadataURI NFT metadata URI
     * @return tokenId The minted NFT token ID
     */
    function mintAchievementNFT(
        address player,
        string memory achievementType,
        string memory metadataURI
    ) external onlyGameServer whenSystemInitialized whenNotPaused returns (uint256 tokenId) {
        tokenId = nftManager.mintAchievementNFT(player, achievementType, metadataURI);
    }

    /**
     * @dev Swaps HBAR for HPLAY tokens
     * @return hplayAmount Amount of HPLAY received
     */
    function swapHBARforHPLAY() external payable whenSystemInitialized whenNotPaused returns (uint256 hplayAmount) {
        hplayAmount = faucetManager.swapHBARforHPLAY{value: msg.value}();
    }

    /**
     * @dev Executes lottery draw
     */
    function executeLotteryDraw() external whenSystemInitialized whenNotPaused {
        lotteryPool.executeDraw();
    }

    /**
     * @dev Gets comprehensive system statistics
     * @return gamesPlayed Total games played
     * @return players Total players
     * @return rewardsDistributed Total rewards distributed
     * @return poolBalance Current pool balance
     * @return totalParticipants Total participants
     * @return initialized System initialization status
     */
    function getSystemStats() external view returns (
        uint256 gamesPlayed,
        uint256 players,
        uint256 rewardsDistributed,
        uint256 poolBalance,
        uint256 totalParticipants,
        bool initialized
    ) {
        gamesPlayed = totalGamesPlayed;
        players = totalPlayers;
        rewardsDistributed = totalRewardsDistributed;
        poolBalance = lotteryPool.getPoolBalance();
        totalParticipants = lotteryPool.getTotalParticipants();
        initialized = systemInitialized;
    }

    /**
     * @dev Gets player information
     * @param player Player address
     * @return hasSBT Whether player has SBT
     * @return stats Player statistics
     * @return nftCount Number of NFTs owned
     * @return hplayBalance HPLAY token balance
     */
    function getPlayerInfo(address player) external view returns (
        bool hasSBT,
        IPlayerSBT.PlayerStats memory stats,
        uint256 nftCount,
        uint256 hplayBalance
    ) {
        hasSBT = playerSBT.hasSBT(player);
        if (hasSBT) {
            stats = playerSBT.getPlayerStats(player);
        }
        nftCount = nftManager.getPlayerNFTCount(player);
        hplayBalance = tokenEconomy.balanceOf(player);
    }

    /**
     * @dev Updates contract dependencies
     * @param contractType Type of contract to update
     * @param newAddress New contract address
     */
    function updateContractDependency(uint8 contractType, address newAddress) external onlyOwner {
        require(newAddress != address(0), "HederaGameLaunchpad: invalid address");
        
        if (contractType == 0) {
            gameRegistry = IGameRegistry(newAddress);
        } else if (contractType == 1) {
            resultVerifier = IResultVerifier(newAddress);
        } else if (contractType == 2) {
            playerSBT = IPlayerSBT(newAddress);
        } else if (contractType == 3) {
            nftManager = INFTManager(newAddress);
        } else if (contractType == 4) {
            tokenEconomy = ITokenEconomy(newAddress);
        } else if (contractType == 5) {
            faucetManager = IFaucetManager(newAddress);
        } else if (contractType == 6) {
            lotteryPool = ILotteryPool(newAddress);
        } else {
            revert("HederaGameLaunchpad: invalid contract type");
        }
    }

    /**
     * @dev Emergency pause function
     */
    function pauseSystem() external onlyOwner {
        _pause();
        emit SystemPaused(msg.sender);
    }

    /**
     * @dev Unpause system function
     */
    function unpauseSystem() external onlyOwner {
        _unpause();
        emit SystemUnpaused(msg.sender);
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
     * @dev Gets all contract addresses
     * @return addresses Array of contract addresses
     */
    function getContractAddresses() external view returns (address[7] memory addresses) {
        addresses[0] = address(gameRegistry);
        addresses[1] = address(resultVerifier);
        addresses[2] = address(playerSBT);
        addresses[3] = address(nftManager);
        addresses[4] = address(tokenEconomy);
        addresses[5] = address(faucetManager);
        addresses[6] = address(lotteryPool);
    }

    /**
     * @dev Checks if system is fully operational
     * @return operational True if system is operational
     */
    function isSystemOperational() external view returns (bool operational) {
        operational = systemInitialized && !paused();
    }
}

