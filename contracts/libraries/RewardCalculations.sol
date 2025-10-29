// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RewardCalculations
 * @dev Library for reward calculations and economic formulas
 */
library RewardCalculations {
    uint256 public constant BASE_REWARD = 100 ether;
    uint256 public constant SCORE_DIVISOR = 1000;
    uint256 public constant MAX_SCORE_MULTIPLIER = 10;
    uint256 public constant PERCENTAGE_DIVISOR = 1000;

    /**
     * @dev Calculates base reward amount
     * @param score Player's game score
     * @param difficultyMultiplier Game difficulty multiplier
     * @param streakBonus Player's streak bonus
     * @return reward The calculated reward amount
     */
    function calculateBaseReward(
        uint256 score,
        uint256 difficultyMultiplier,
        uint256 streakBonus
    ) internal pure returns (uint256 reward) {
        // Score multiplier (1-10x)
        uint256 scoreMultiplier = (score / SCORE_DIVISOR) + 1;
        if (scoreMultiplier > MAX_SCORE_MULTIPLIER) {
            scoreMultiplier = MAX_SCORE_MULTIPLIER;
        }

        // Calculate reward: base * score_multiplier * difficulty * streak_bonus
        reward = (BASE_REWARD * scoreMultiplier * difficultyMultiplier * streakBonus) / PERCENTAGE_DIVISOR;
    }

    /**
     * @dev Calculates lottery weight for a participant
     * @param transactionCount Number of transactions
     * @param volume Total transaction volume
     * @param averageVolume Average volume across all participants
     * @return weight The calculated weight
     */
    function calculateLotteryWeight(
        uint256 transactionCount,
        uint256 volume,
        uint256 averageVolume
    ) internal pure returns (uint256 weight) {
        if (averageVolume == 0) {
            weight = sqrt(transactionCount);
        } else {
            weight = sqrt(transactionCount) * volume / averageVolume;
        }
    }

    /**
     * @dev Calculates staking rewards
     * @param stakedAmount Amount staked
     * @param stakingDuration Duration in seconds
     * @param rewardRate Annual reward rate (in basis points)
     * @return rewards The calculated rewards
     */
    function calculateStakingRewards(
        uint256 stakedAmount,
        uint256 stakingDuration,
        uint256 rewardRate
    ) internal pure returns (uint256 rewards) {
        // Calculate rewards: amount * duration * rate / (365 days * 10000)
        uint256 secondsInYear = 365 days;
        rewards = (stakedAmount * stakingDuration * rewardRate) / (secondsInYear * 10000);
    }

    /**
     * @dev Calculates burn fee based on rarity
     * @param rarity Rarity level
     * @return fee The burn fee amount
     */
    function calculateBurnFee(string memory rarity) internal pure returns (uint256 fee) {
        bytes32 rarityHash = keccak256(abi.encodePacked(rarity));
        
        if (rarityHash == keccak256(abi.encodePacked("common"))) {
            fee = 10 ether; // 10 HPLAY
        } else if (rarityHash == keccak256(abi.encodePacked("rare"))) {
            fee = 50 ether; // 50 HPLAY
        } else if (rarityHash == keccak256(abi.encodePacked("epic"))) {
            fee = 200 ether; // 200 HPLAY
        } else if (rarityHash == keccak256(abi.encodePacked("legendary"))) {
            fee = 1000 ether; // 1000 HPLAY
        } else {
            fee = 10 ether; // Default to common
        }
    }

    /**
     * @dev Calculates transfer fee
     * @param amount Transfer amount
     * @param feePercent Fee percentage in basis points
     * @return fee The calculated fee
     */
    function calculateTransferFee(uint256 amount, uint256 feePercent)
        internal pure returns (uint256 fee) {
        fee = (amount * feePercent) / 10000;
    }

    /**
     * @dev Calculates bonus multiplier for faucet swaps
     * @param activityScore User's activity score
     * @param maxMultiplier Maximum bonus multiplier
     * @return multiplier The calculated bonus multiplier
     */
    function calculateBonusMultiplier(uint256 activityScore, uint256 maxMultiplier)
        internal pure returns (uint256 multiplier) {
        if (activityScore >= 100) {
            multiplier = maxMultiplier; // 1.5x
        } else if (activityScore >= 50) {
            multiplier = 125; // 1.25x
        } else {
            multiplier = 100; // 1.0x
        }
    }

    /**
     * @dev Square root function using Babylonian method
     * @param x Input number
     * @return y Square root of x
     */
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        
        uint256 z = (x + 1) / 2;
        y = x;
        
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    /**
     * @dev Safe addition with overflow protection
     * @param a First number
     * @param b Second number
     * @return c Sum of a and b
     */
    function safeAdd(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        require(c >= a, "RewardCalculations: addition overflow");
    }

    /**
     * @dev Safe multiplication with overflow protection
     * @param a First number
     * @param b Second number
     * @return c Product of a and b
     */
    function safeMul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        if (a == 0) {
            return 0;
        }
        c = a * b;
        require(c / a == b, "RewardCalculations: multiplication overflow");
    }
}





