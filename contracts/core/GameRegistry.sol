// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IGameRegistry.sol";
import "../libraries/AccessControlLib.sol";

/**
 * @title GameRegistry
 * @dev Manages registration of off-chain games and their authorized servers
 */
contract GameRegistry is IGameRegistry, AccessControl, Pausable, ReentrancyGuard {
    using AccessControlLib for AccessControl;

    // Storage
    mapping(string => GameModule) public registeredGames;
    mapping(address => bool) public authorizedServers;
    mapping(string => uint256) public difficultyMultipliers;
    
    uint256 public totalGamesRegistered;
    uint256 public constant MAX_GAMES = 1000;

    // Events (inherited from interface)
    event DifficultyMultiplierUpdated(string indexed gameId, uint256 multiplier);

    // Modifiers
    modifier onlyOwner() {
        require(hasRole(AccessControlLib.OWNER_ROLE, msg.sender), "AccessControl: owner role required");
        _;
    }

    modifier onlyDAO() {
        require(hasRole(AccessControlLib.DAO_ROLE, msg.sender), "AccessControl: DAO role required");
        _;
    }

    // Modifiers inherited from OpenZeppelin contracts

    constructor() {
        _grantRole(AccessControlLib.OWNER_ROLE, msg.sender);
        _setRoleAdmin(AccessControlLib.DAO_ROLE, AccessControlLib.OWNER_ROLE);
        _setRoleAdmin(AccessControlLib.SERVER_ROLE, AccessControlLib.OWNER_ROLE);
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
    ) external override onlyOwner whenNotPaused nonReentrant returns (bool success) {
        require(serverAddress != address(0), "GameRegistry: invalid server address");
        require(bytes(gameId).length > 0, "GameRegistry: empty game ID");
        require(bytes(metadataURI).length > 0, "GameRegistry: empty metadata URI");
        require(totalGamesRegistered < MAX_GAMES, "GameRegistry: max games reached");
        require(!registeredGames[gameId].isActive, "GameRegistry: game already registered");

        // Create game module
        GameModule storage game = registeredGames[gameId];
        game.authorizedServer = serverAddress;
        game.serverPublicKey = publicKey;
        game.gameId = gameId;
        game.metadataURI = metadataURI;
        game.registrationTimestamp = block.timestamp;
        game.isActive = true;
        game.nonce = 0;

        // Mark server as authorized
        authorizedServers[serverAddress] = true;
        totalGamesRegistered++;

        // Set default difficulty multiplier
        difficultyMultipliers[gameId] = 1000; // 1.0x

        emit GameModuleRegistered(serverAddress, gameId, metadataURI);
        return true;
    }

    /**
     * @dev Revokes a game module
     * @param gameId Game identifier to revoke
     */
    function revokeGameModule(string memory gameId) external override onlyOwner whenNotPaused {
        require(registeredGames[gameId].isActive, "GameRegistry: game not registered");

        GameModule storage game = registeredGames[gameId];
        game.isActive = false;

        emit GameModuleRevoked(gameId);
    }

    /**
     * @dev Updates server public key for a game
     * @param gameId Game identifier
     * @param newPublicKey New public key
     */
    function updateServerPublicKey(
        string memory gameId,
        bytes32 newPublicKey
    ) external override onlyOwner whenNotPaused {
        require(registeredGames[gameId].isActive, "GameRegistry: game not registered");

        GameModule storage game = registeredGames[gameId];
        game.serverPublicKey = newPublicKey;

        emit ServerPublicKeyUpdated(gameId, newPublicKey);
    }

    /**
     * @dev Sets difficulty multiplier for a game
     * @param gameId Game identifier
     * @param multiplier Difficulty multiplier (1000 = 1.0x)
     */
    function setDifficultyMultiplier(string memory gameId, uint256 multiplier) 
        external onlyDAO whenNotPaused {
        require(registeredGames[gameId].isActive, "GameRegistry: game not registered");
        require(multiplier >= 100 && multiplier <= 5000, "GameRegistry: invalid multiplier");

        difficultyMultipliers[gameId] = multiplier;
        emit DifficultyMultiplierUpdated(gameId, multiplier);
    }

    /**
     * @dev Gets game module information
     * @param gameId Game identifier
     * @return game Game module struct
     */
    function getGameModule(string memory gameId) 
        external view override returns (GameModule memory game) {
        game = registeredGames[gameId];
    }

    /**
     * @dev Checks if server is valid for a game
     * @param gameId Game identifier
     * @param server Server address
     * @return isValid True if server is valid
     */
    function isValidServer(string memory gameId, address server) 
        external view override returns (bool isValid) {
        GameModule memory game = registeredGames[gameId];
        isValid = (game.isActive && game.authorizedServer == server);
    }

    /**
     * @dev Gets difficulty multiplier for a game
     * @param gameId Game identifier
     * @return multiplier Difficulty multiplier
     */
    function getDifficultyMultiplier(string memory gameId) 
        external view override returns (uint256 multiplier) {
        multiplier = difficultyMultipliers[gameId];
        if (multiplier == 0) {
            multiplier = 1000; // Default 1.0x
        }
    }

    /**
     * @dev Increments nonce for a game (called by authorized server)
     * @param gameId Game identifier
     */
    function incrementNonce(string memory gameId) external {
        require(registeredGames[gameId].isActive, "GameRegistry: game not registered");
        require(
            registeredGames[gameId].authorizedServer == msg.sender,
            "GameRegistry: unauthorized server"
        );

        registeredGames[gameId].nonce++;
    }

    /**
     * @dev Gets current nonce for a game
     * @param gameId Game identifier
     * @return nonce Current nonce value
     */
    function getCurrentNonce(string memory gameId) external view returns (uint256 nonce) {
        nonce = registeredGames[gameId].nonce;
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
}

