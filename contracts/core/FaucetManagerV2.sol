// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ITokenEconomyV2 {
    function mint(address to, uint256 amount) external;
}

/**
 * @title FaucetManagerV2
 * @dev Simplified faucet that MINTS tokens directly to users
 * Fixed calculation: uses 1e8 (tinybars) instead of 1e18 (Wei)
 */
contract FaucetManagerV2 is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    ITokenEconomyV2 public tokenEconomy;
    
    struct SwapRate {
        uint256 hbarToHplayRate;    // HPLAY per HBAR (with 8 decimals)
        uint256 dailyLimitHbar;     // Daily limit per user in tinybars
        bool enabled;
    }
    
    struct UserInfo {
        uint256 totalSwappedToday;
        uint256 lastSwapTimestamp;
        uint256 swapsCount;
    }
    
    SwapRate public rate;
    mapping(address => UserInfo) public userSwaps;
    
    uint256 public totalHbarDeposited;
    uint256 public totalHplayMinted;
    uint256 public constant SECONDS_IN_DAY = 86400;
    
    event SwapExecuted(address indexed user, uint256 hbarAmount, uint256 hplayAmount);
    event RateUpdated(uint256 newRate);
    event DailyLimitUpdated(uint256 newLimit);
    
    constructor(address _tokenEconomy) {
        tokenEconomy = ITokenEconomyV2(_tokenEconomy);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Default: 1 HBAR = 500 HPLAY
        rate = SwapRate({
            hbarToHplayRate: 500 * 10**8,
            dailyLimitHbar: 1000 * 10**8, // 1000 HBAR per day
            enabled: true
        });
    }
    
    /**
     * @dev Main swap function - mints HPLAY directly to user
     */
    function swapHBARforHPLAY() external payable whenNotPaused nonReentrant returns (uint256 hplayAmount) {
        require(rate.enabled, "FaucetManagerV2: swaps disabled");
        require(msg.value > 0, "FaucetManagerV2: must send HBAR");
        
        UserInfo storage userInfo = userSwaps[msg.sender];
        
        // Check daily limit
        if (isNewDay(userInfo.lastSwapTimestamp)) {
            userInfo.totalSwappedToday = 0;
        }
        
        require(
            userInfo.totalSwappedToday + msg.value <= rate.dailyLimitHbar,
            "FaucetManagerV2: daily limit exceeded"
        );
        
        // Calculate HPLAY output
        // CRITICAL: On Hedera, msg.value is in tinybars (1e8), not Wei (1e18)
        hplayAmount = (msg.value * rate.hbarToHplayRate) / 1e8;
        
        // Update user info
        userInfo.totalSwappedToday += msg.value;
        userInfo.lastSwapTimestamp = block.timestamp;
        userInfo.swapsCount++;
        
        // Update totals
        totalHbarDeposited += msg.value;
        totalHplayMinted += hplayAmount;
        
        // Mint HPLAY directly to user
        tokenEconomy.mint(msg.sender, hplayAmount);
        
        emit SwapExecuted(msg.sender, msg.value, hplayAmount);
    }
    
    /**
     * @dev Update swap rate
     */
    function updateSwapRate(uint256 newRate) external onlyRole(ADMIN_ROLE) {
        require(newRate > 0, "FaucetManagerV2: invalid rate");
        rate.hbarToHplayRate = newRate;
        emit RateUpdated(newRate);
    }
    
    /**
     * @dev Update daily limit
     */
    function setDailyLimit(uint256 newLimit) external onlyRole(ADMIN_ROLE) {
        require(newLimit > 0, "FaucetManagerV2: invalid limit");
        rate.dailyLimitHbar = newLimit;
        emit DailyLimitUpdated(newLimit);
    }
    
    /**
     * @dev Enable/disable swaps
     */
    function setEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        rate.enabled = enabled;
    }
    
    /**
     * @dev Check if it's a new day
     */
    function isNewDay(uint256 lastTimestamp) public view returns (bool) {
        if (lastTimestamp == 0) return true;
        return (block.timestamp - lastTimestamp) / SECONDS_IN_DAY > 0;
    }
    
    /**
     * @dev Get user info
     */
    function getUserInfo(address user) external view returns (UserInfo memory) {
        return userSwaps[user];
    }
    
    /**
     * @dev Get swap rate
     */
    function getSwapRate() external view returns (SwapRate memory) {
        return rate;
    }
    
    /**
     * @dev Get remaining daily limit for user
     */
    function getRemainingLimit(address user) external view returns (uint256) {
        UserInfo memory info = userSwaps[user];
        if (isNewDay(info.lastSwapTimestamp)) {
            return rate.dailyLimitHbar;
        }
        return rate.dailyLimitHbar - info.totalSwappedToday;
    }
    
    /**
     * @dev Withdraw HBAR (emergency)
     */
    function withdrawHBAR(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount <= address(this).balance, "FaucetManagerV2: insufficient balance");
        payable(msg.sender).transfer(amount);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    receive() external payable {}
}

