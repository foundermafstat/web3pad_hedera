// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IHederaTokenService
 * @dev Interface for Hedera Token Service integration
 */
interface IHederaTokenService {
    struct TokenInfo {
        string name;
        string symbol;
        uint8 decimals;
        uint256 totalSupply;
        address treasury;
        bool adminKey;
        bool kycKey;
        bool freezeKey;
        bool wipeKey;
        bool supplyKey;
        bool feeScheduleKey;
        bool pauseKey;
    }

    struct TokenKey {
        bool adminKey;
        bool kycKey;
        bool freezeKey;
        bool wipeKey;
        bool supplyKey;
        bool feeScheduleKey;
        bool pauseKey;
    }

    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        address treasury,
        TokenKey memory tokenKey
    ) external payable returns (address tokenId);

    function createNonFungibleToken(
        string memory name,
        string memory symbol,
        address treasury,
        TokenKey memory tokenKey
    ) external payable returns (address tokenId);

    function associateToken(address tokenId) external payable;

    function dissociateToken(address tokenId) external payable;

    function mintToken(address tokenId, uint256 amount) external payable;

    function burnToken(address tokenId, uint256 amount) external payable;

    function transferToken(
        address tokenId,
        address from,
        address to,
        uint256 amount
    ) external payable;

    function transferFrom(
        address tokenId,
        address from,
        address to,
        uint256 amount
    ) external payable;

    function approve(address tokenId, address spender, uint256 amount) external payable;

    function allowance(address tokenId, address owner, address spender) 
        external view returns (uint256);

    function balanceOf(address tokenId, address account) external view returns (uint256);

    function totalSupply(address tokenId) external view returns (uint256);

    function getTokenInfo(address tokenId) external view returns (TokenInfo memory);
}

