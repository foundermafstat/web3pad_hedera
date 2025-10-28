// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IResultVerifier.sol";
import "../interfaces/IGameRegistry.sol";
import "../interfaces/IPlayerSBT.sol";
import "../interfaces/ITokenEconomy.sol";
import "../libraries/SignatureVerification.sol";
import "../libraries/AccessControlLib.sol";

/**
 * @title ResultVerifier
 * @dev Handles off-chain result submission and cryptographic signature verification
 */
contract ResultVerifier is IResultVerifier, AccessControl, Pausable, ReentrancyGuard {
    using SignatureVerification for bytes32;
    using AccessControlLib for AccessControl;

    // Dependencies
    IGameRegistry public gameRegistry;
    IPlayerSBT public playerSBT;
    ITokenEconomy public tokenEconomy;

    // Storage
    mapping(address => uint256) private playerNonces;
    mapping(bytes32 => bool) private verifiedResults;
    mapping(string => uint256) public minimumScores;
    
    uint256 public constant SIGNATURE_EXPIRATION_TIME = 300; // 5 minutes
    uint256 public constant MAX_SCORE = 1000000;

    // Events (inherited from interface)
    event MinimumScoreUpdated(string indexed gameId, uint256 minimumScore);

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

    constructor(
        address _gameRegistry,
        address _playerSBT,
        address _tokenEconomy
    ) {
        gameRegistry = IGameRegistry(_gameRegistry);
        playerSBT = IPlayerSBT(_playerSBT);
        tokenEconomy = ITokenEconomy(_tokenEconomy);

        _grantRole(AccessControlLib.OWNER_ROLE, msg.sender);
        _grantRole(AccessControlLib.GAME_SERVER_ROLE, msg.sender);
    }

    /**
     * @dev Submits and verifies game result
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
    ) external override onlyGameServer whenNotPaused nonReentrant returns (bool success) {
        require(player != address(0), "ResultVerifier: invalid player");
        require(score <= MAX_SCORE, "ResultVerifier: score too high");
        require(score >= minimumScores[gameId], "ResultVerifier: score below minimum");

        // Generate message hash
        bytes32 messageHash = SignatureVerification.generateMessageHash(
            player,
            gameId,
            score,
            timestamp,
            nonce
        );

        // Check for replay attacks
        require(!verifiedResults[messageHash], "ResultVerifier: result already verified");
        verifiedResults[messageHash] = true;

        // Validate nonce monotonicity
        require(
            SignatureVerification.validateNonce(nonce, playerNonces[player]),
            "ResultVerifier: invalid nonce"
        );

        // Check signature expiration
        require(
            !SignatureVerification.isSignatureExpired(timestamp, SIGNATURE_EXPIRATION_TIME),
            "ResultVerifier: signature expired"
        );

        // Verify signature
        bytes32 ethSignedMessageHash = SignatureVerification.generateEthSignedMessageHash(messageHash);
        address signer = SignatureVerification.recoverSigner(ethSignedMessageHash, signature);

        // Check if server is authorized for this game
        require(
            gameRegistry.isValidServer(gameId, signer),
            "ResultVerifier: invalid server signature"
        );

        // Update player nonce
        playerNonces[player] = nonce;

        // Update player stats
        bool isWin = score >= minimumScores[gameId];
        playerSBT.updateStats(player, gameId, score, isWin);

        // Calculate and mint rewards
        uint256 rewardAmount = playerSBT.calculateReward(score, gameId);
        if (rewardAmount > 0) {
            tokenEconomy.mintRewards(player, rewardAmount);
        }

        emit GameResultVerified(player, gameId, score, timestamp);
        return true;
    }

    /**
     * @dev Gets player's current nonce
     * @param player Player address
     * @return nonce Current nonce value
     */
    function getPlayerNonce(address player) external view override returns (uint256 nonce) {
        nonce = playerNonces[player];
    }

    /**
     * @dev Checks if result hash is already verified
     * @param messageHash Message hash to check
     * @return verified True if already verified
     */
    function isResultVerified(bytes32 messageHash) external view override returns (bool verified) {
        verified = verifiedResults[messageHash];
    }

    /**
     * @dev Sets minimum score for a game
     * @param gameId Game identifier
     * @param minimumScore Minimum score required
     */
    function setMinimumScore(string memory gameId, uint256 minimumScore) 
        external onlyOwner whenNotPaused {
        require(minimumScore <= MAX_SCORE, "ResultVerifier: minimum score too high");
        minimumScores[gameId] = minimumScore;
        emit MinimumScoreUpdated(gameId, minimumScore);
    }

    /**
     * @dev Gets minimum score for a game
     * @param gameId Game identifier
     * @return minimumScore Minimum score required
     */
    function getMinimumScore(string memory gameId) external view returns (uint256 minimumScore) {
        minimumScore = minimumScores[gameId];
    }

    /**
     * @dev Updates dependencies
     * @param _gameRegistry New game registry address
     * @param _playerSBT New player SBT address
     * @param _tokenEconomy New token economy address
     */
    function updateDependencies(
        address _gameRegistry,
        address _playerSBT,
        address _tokenEconomy
    ) external onlyOwner {
        require(_gameRegistry != address(0), "ResultVerifier: invalid game registry");
        require(_playerSBT != address(0), "ResultVerifier: invalid player SBT");
        require(_tokenEconomy != address(0), "ResultVerifier: invalid token economy");

        gameRegistry = IGameRegistry(_gameRegistry);
        playerSBT = IPlayerSBT(_playerSBT);
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
}

