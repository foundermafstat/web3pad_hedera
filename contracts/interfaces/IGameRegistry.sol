// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IGameRegistry
 * @dev Interface for game module registration and management
 */
interface IGameRegistry {
    struct GameModule {
        address authorizedServer;
        bytes32 serverPublicKey;
        string gameId;
        string metadataURI;
        uint256 registrationTimestamp;
        bool isActive;
        uint256 nonce;
    }

    event GameModuleRegistered(
        address indexed server,
        string indexed gameId,
        string metadataURI
    );

    event GameModuleRevoked(string indexed gameId);
    event ServerPublicKeyUpdated(string indexed gameId, bytes32 newPublicKey);

    function registerGameModule(
        address serverAddress,
        bytes32 publicKey,
        string memory gameId,
        string memory metadataURI
    ) external returns (bool);

    function revokeGameModule(string memory gameId) external;

    function updateServerPublicKey(
        string memory gameId,
        bytes32 newPublicKey
    ) external;

    function getGameModule(string memory gameId) 
        external view returns (GameModule memory);

    function isValidServer(string memory gameId, address server) 
        external view returns (bool);

    function getDifficultyMultiplier(string memory gameId) 
        external view returns (uint256);
}

