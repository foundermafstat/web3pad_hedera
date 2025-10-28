// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ILotteryPool
 * @dev Interface for lottery pool management and prize distribution
 */
interface ILotteryPool {
    struct LotteryPool {
        uint256 poolBalance;
        uint256 drawInterval;        // e.g., 24 hours (86400 seconds)
        uint256 lastDrawTimestamp;
        uint256 totalParticipants;
        mapping(address => uint256) transactionCount;
        mapping(address => uint256) totalVolume;
        address[] participants;
    }

    struct DrawResult {
        address winner;
        uint256 prizeAmount;
        uint256 drawTimestamp;
        uint256 totalParticipants;
    }

    event LotteryWinner(
        address indexed winner,
        uint256 prizeAmount,
        uint256 totalParticipants
    );

    event FeeAccumulated(address indexed payer, uint256 amount);
    event EmergencyWithdraw(uint256 amount);

    function accumulateFee(uint256 feeAmount) external;

    function executeDraw() external;

    function setDrawInterval(uint256 newInterval) external;

    function emergencyWithdraw() external;

    function getPoolBalance() external view returns (uint256);

    function getTotalParticipants() external view returns (uint256);

    function getLastDrawTimestamp() external view returns (uint256);

    function getDrawInterval() external view returns (uint256);

    function isParticipant(address user) external view returns (bool);

    function getParticipantTransactionCount(address user) external view returns (uint256);
}

