// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title SignatureVerification
 * @dev Library for cryptographic signature verification and security
 */
library SignatureVerification {
    using ECDSA for bytes32;

    /**
     * @dev Generates message hash for signature verification
     * @param player Player address
     * @param gameId Game identifier
     * @param score Game score
     * @param timestamp Block timestamp
     * @param nonce Player nonce
     * @return messageHash The generated message hash
     */
    function generateMessageHash(
        address player,
        string memory gameId,
        uint256 score,
        uint256 timestamp,
        uint256 nonce
    ) internal pure returns (bytes32 messageHash) {
        messageHash = keccak256(abi.encodePacked(
            player,
            gameId,
            score,
            timestamp,
            nonce
        ));
    }

    /**
     * @dev Generates Ethereum signed message hash
     * @param messageHash The original message hash
     * @return ethSignedMessageHash The Ethereum signed message hash
     */
    function generateEthSignedMessageHash(bytes32 messageHash) 
        internal pure returns (bytes32 ethSignedMessageHash) {
        ethSignedMessageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            messageHash
        ));
    }

    /**
     * @dev Recovers signer address from signature
     * @param ethSignedMessageHash The Ethereum signed message hash
     * @param signature The signature bytes
     * @return signer The recovered signer address
     */
    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature)
        internal pure returns (address signer) {
        signer = ethSignedMessageHash.recover(signature);
    }

    /**
     * @dev Validates signature against expected signer
     * @param messageHash The message hash
     * @param signature The signature bytes
     * @param expectedSigner The expected signer address
     * @return isValid True if signature is valid
     */
    function validateSignature(
        bytes32 messageHash,
        bytes memory signature,
        address expectedSigner
    ) internal pure returns (bool isValid) {
        bytes32 ethSignedMessageHash = generateEthSignedMessageHash(messageHash);
        address signer = recoverSigner(ethSignedMessageHash, signature);
        isValid = (signer == expectedSigner);
    }

    /**
     * @dev Checks if signature is expired
     * @param timestamp Signature timestamp
     * @param expirationTime Expiration time in seconds (default: 300)
     * @return isExpired True if signature is expired
     */
    function isSignatureExpired(uint256 timestamp, uint256 expirationTime)
        internal view returns (bool isExpired) {
        isExpired = (block.timestamp - timestamp > expirationTime);
    }

    /**
     * @dev Validates nonce monotonicity
     * @param newNonce New nonce value
     * @param currentNonce Current nonce value
     * @return isValid True if nonce is valid
     */
    function validateNonce(uint256 newNonce, uint256 currentNonce)
        internal pure returns (bool isValid) {
        isValid = (newNonce > currentNonce);
    }
}

