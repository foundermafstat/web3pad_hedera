// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IFaucetManager
 * @dev Interface for HBAR to HPLAY swap functionality
 */
interface IFaucetManager {
    struct SwapRate {
        uint256 hbarToHplayRate;      // e.g., 1 HBAR = 500 HPLAY
        uint256 bonusMultiplierMin;    // e.g., 100 (1.0x)
        uint256 bonusMultiplierMax;    // e.g., 150 (1.5x)
        uint256 dailyLimitHbar;        // 1000 HBAR per user
        bool faucetEnabled;
    }

    struct UserSwapInfo {
        uint256 totalSwappedToday;
        uint256 lastSwapTimestamp;
        uint256 swapsCount;
    }

    event FaucetSwapExecuted(
        address indexed user,
        uint256 hbarAmount,
        uint256 hplayAmount
    );

    event SwapRateUpdated(uint256 newRate);
    event DailyLimitUpdated(uint256 newLimit);
    event HPLAYDeposited(address indexed depositor, uint256 amount);

    function swapHBARforHPLAY() external payable returns (uint256 hplayAmount);

    function updateSwapRate(uint256 newRate) external;

    function setDailyLimit(uint256 newLimit) external;

    function depositHPLAY(uint256 amount) external;

    function getUserSwapInfo(address user) external view returns (UserSwapInfo memory);

    function getSwapRate() external view returns (SwapRate memory);

    function calculateBonusFactor(address user) external view returns (uint256);
}

