// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IResultVerifier
 * @dev Interface for cryptographic signature verification of game results
 */
interface IResultVerifier {
    struct GameResult {
        address player;
        string gameId;
        uint256 score;
        uint256 timestamp;
        uint256 nonce;
        bytes32 resultHash;
    }

    event GameResultVerified(
        address indexed player,
        string indexed gameId,
        uint256 score,
        uint256 timestamp
    );

    event InvalidSignature(
        address player,
        string gameId,
        bytes32 messageHash
    );

    function submitGameResult(
        address player,
        string memory gameId,
        uint256 score,
        bytes memory signature,
        uint256 nonce,
        uint256 timestamp
    ) external returns (bool);

    function getPlayerNonce(address player) external view returns (uint256);

    function isResultVerified(bytes32 messageHash) external view returns (bool);
}

