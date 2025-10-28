// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IFaucetManager.sol";
import "../interfaces/ITokenEconomy.sol";
import "../libraries/RewardCalculations.sol";
import "../libraries/AccessControlLib.sol";

/**
 * @title FaucetManager
 * @dev Internal faucet allowing testnet users to acquire HPLAY using test HBAR
 */
contract FaucetManager is IFaucetManager, AccessControl, Pausable, ReentrancyGuard {
    using RewardCalculations for uint256;
    using AccessControlLib for AccessControl;

    // Dependencies
    ITokenEconomy public tokenEconomy;

    // Storage
    SwapRate public rate;
    mapping(address => UserSwapInfo) public userSwaps;
    
    uint256 public totalHbarDeposited;
    uint256 public totalHplayDistributed;
    uint256 public constant SECONDS_IN_DAY = 86400;

    // Events (inherited from interface)

    // Modifiers
    modifier onlyDAO() {
        require(hasRole(AccessControlLib.DAO_ROLE, msg.sender), "AccessControl: DAO role required");
        _;
    }

    modifier onlyOwner() {
        require(hasRole(AccessControlLib.OWNER_ROLE, msg.sender), "AccessControl: owner role required");
        _;
    }

    // Modifiers inherited from OpenZeppelin contracts

    constructor(address _tokenEconomy) {
        tokenEconomy = ITokenEconomy(_tokenEconomy);

        _grantRole(AccessControlLib.OWNER_ROLE, msg.sender);

        // Initialize default swap rate
        rate = SwapRate({
            hbarToHplayRate: 500 * 10**8,  // 1 HBAR = 500 HPLAY (with decimals)
            bonusMultiplierMin: 100,       // 1.0x
            bonusMultiplierMax: 150,       // 1.5x
            dailyLimitHbar: 1000 * 10**8,  // 1000 HBAR per user per day
            faucetEnabled: true
        });
    }

    /**
     * @dev Main swap function - converts HBAR to HPLAY
     * @return hplayAmount Amount of HPLAY received
     */
    function swapHBARforHPLAY() external override payable whenNotPaused nonReentrant returns (uint256 hplayAmount) {
        require(rate.faucetEnabled, "FaucetManager: faucet disabled");
        require(msg.value > 0, "FaucetManager: must send HBAR");
        
        UserSwapInfo storage userInfo = userSwaps[msg.sender];
        
        // Check daily limit
        if (isNewDay(userInfo.lastSwapTimestamp)) {
            userInfo.totalSwappedToday = 0;
        }
        
        require(
            userInfo.totalSwappedToday + msg.value <= rate.dailyLimitHbar,
            "FaucetManager: daily limit exceeded"
        );
        
        // Calculate HPLAY output
        uint256 baseAmount = (msg.value * rate.hbarToHplayRate) / 1e18;
        uint256 bonusFactor = calculateBonusFactor(msg.sender);
        hplayAmount = (baseAmount * bonusFactor) / 100;
        
        require(
            tokenEconomy.balanceOf(address(this)) >= hplayAmount,
            "FaucetManager: insufficient HPLAY reserves"
        );
        
        // Update user info
        userInfo.totalSwappedToday += msg.value;
        userInfo.lastSwapTimestamp = block.timestamp;
        userInfo.swapsCount++;
        
        // Update totals
        totalHbarDeposited += msg.value;
        totalHplayDistributed += hplayAmount;
        
        // Transfer HPLAY to user
        tokenEconomy.transfer(msg.sender, hplayAmount);
        
        emit FaucetSwapExecuted(msg.sender, msg.value, hplayAmount);
    }

    /**
     * @dev Updates swap rate
     * @param newRate New exchange rate
     */
    function updateSwapRate(uint256 newRate) external override onlyDAO whenNotPaused {
        require(newRate > 0, "FaucetManager: invalid rate");
        rate.hbarToHplayRate = newRate;
        emit SwapRateUpdated(newRate);
    }

    /**
     * @dev Sets daily limit
     * @param newLimit New daily limit
     */
    function setDailyLimit(uint256 newLimit) external override onlyDAO whenNotPaused {
        require(newLimit > 0, "FaucetManager: invalid limit");
        rate.dailyLimitHbar = newLimit;
        emit DailyLimitUpdated(newLimit);
    }

    /**
     * @dev Deposits HPLAY to faucet reserves
     * @param amount Amount to deposit
     */
    function depositHPLAY(uint256 amount) external override whenNotPaused {
        require(amount > 0, "FaucetManager: invalid amount");
        tokenEconomy.transferFrom(msg.sender, address(this), amount);
        emit HPLAYDeposited(msg.sender, amount);
    }

    /**
     * @dev Gets user swap information
     * @param user User address
     * @return userInfo User swap information
     */
    function getUserSwapInfo(address user) external view override returns (UserSwapInfo memory userInfo) {
        userInfo = userSwaps[user];
    }

    /**
     * @dev Gets current swap rate
     * @return swapRate Current swap rate
     */
    function getSwapRate() external view override returns (SwapRate memory swapRate) {
        swapRate = rate;
    }

    /**
     * @dev Calculates bonus factor for a user
     * @param user User address
     * @return factor Bonus factor (100 = 1.0x)
     */
    function calculateBonusFactor(address user) public view override returns (uint256 factor) {
        uint256 activityScore = userSwaps[user].swapsCount;
        factor = RewardCalculations.calculateBonusMultiplier(activityScore, rate.bonusMultiplierMax);
    }

    /**
     * @dev Checks if it's a new day since last swap
     * @param lastSwapTimestamp Last swap timestamp
     * @return isNew True if it's a new day
     */
    function isNewDay(uint256 lastSwapTimestamp) public view returns (bool isNew) {
        if (lastSwapTimestamp == 0) {
            return true;
        }
        
        uint256 daysSinceLastSwap = (block.timestamp - lastSwapTimestamp) / SECONDS_IN_DAY;
        isNew = (daysSinceLastSwap > 0);
    }

    /**
     * @dev Gets remaining daily limit for a user
     * @param user User address
     * @return remaining Remaining daily limit
     */
    function getRemainingDailyLimit(address user) external view returns (uint256 remaining) {
        UserSwapInfo memory userInfo = userSwaps[user];
        
        if (isNewDay(userInfo.lastSwapTimestamp)) {
            remaining = rate.dailyLimitHbar;
        } else {
            remaining = rate.dailyLimitHbar - userInfo.totalSwappedToday;
        }
    }

    /**
     * @dev Gets faucet statistics
     * @return totalHbar Total HBAR deposited
     * @return totalHplay Total HPLAY distributed
     * @return totalUsers Total unique users
     * @return currentReserves Current HPLAY reserves
     */
    function getFaucetStats() external view returns (
        uint256 totalHbar,
        uint256 totalHplay,
        uint256 totalUsers,
        uint256 currentReserves
    ) {
        totalHbar = totalHbarDeposited;
        totalHplay = totalHplayDistributed;
        currentReserves = tokenEconomy.balanceOf(address(this));
        // Note: totalUsers would require additional tracking
        totalUsers = 0; // Placeholder
    }

    /**
     * @dev Enables or disables faucet
     * @param enabled Whether faucet is enabled
     */
    function setFaucetEnabled(bool enabled) external onlyOwner {
        rate.faucetEnabled = enabled;
    }

    /**
     * @dev Updates token economy dependency
     * @param _tokenEconomy New token economy address
     */
    function updateTokenEconomy(address _tokenEconomy) external onlyOwner {
        require(_tokenEconomy != address(0), "FaucetManager: invalid token economy");
        tokenEconomy = ITokenEconomy(_tokenEconomy);
    }

    /**
     * @dev Withdraws HBAR (emergency function)
     * @param amount Amount to withdraw
     */
    function withdrawHBAR(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "FaucetManager: insufficient balance");
        payable(msg.sender).transfer(amount);
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

    /**
     * @dev Receives HBAR deposits
     */
    receive() external payable {
        // Allow direct HBAR deposits
    }
}

