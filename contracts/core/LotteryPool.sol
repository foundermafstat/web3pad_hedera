// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/ILotteryPool.sol";
import "../interfaces/ITokenEconomy.sol";
import "../libraries/AccessControlLib.sol";

/**
 * @title LotteryPool
 * @dev Implements automatic lottery pool funded by transaction fees with weighted random selection
 */
contract LotteryPool is ILotteryPool, AccessControl, Pausable, ReentrancyGuard {
    using AccessControlLib for AccessControl;

    // Dependencies
    ITokenEconomy public tokenEconomy;

    // Storage
    LotteryPool public pool;
    mapping(address => bool) private participantStatus;
    
    uint256 public constant MIN_DRAW_INTERVAL = 1 hours;
    uint256 public constant MAX_DRAW_INTERVAL = 7 days;

    // Events (inherited from interface)
    event DrawIntervalUpdated(uint256 newInterval);

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

        // Initialize pool
        pool.poolBalance = 0;
        pool.drawInterval = 24 hours; // Default 24 hours
        pool.lastDrawTimestamp = block.timestamp;
        pool.totalParticipants = 0;
    }

    /**
     * @dev Accumulates fees from token transfers
     * @param feeAmount Fee amount to accumulate
     */
    function accumulateFee(uint256 feeAmount) external override whenNotPaused {
        require(msg.sender == address(tokenEconomy), "LotteryPool: unauthorized");
        require(feeAmount > 0, "LotteryPool: invalid fee amount");
        
        pool.poolBalance += feeAmount;
        
        // Add sender as participant if not already
        if (!participantStatus[msg.sender]) {
            pool.participants.push(msg.sender);
            pool.totalParticipants++;
            participantStatus[msg.sender] = true;
        }
        
        pool.transactionCount[msg.sender]++;
        pool.totalVolume[msg.sender] += feeAmount;
        
        emit FeeAccumulated(msg.sender, feeAmount);
    }

    /**
     * @dev Executes lottery draw
     */
    function executeDraw() external override whenNotPaused nonReentrant {
        require(
            block.timestamp >= pool.lastDrawTimestamp + pool.drawInterval,
            "LotteryPool: draw interval not met"
        );
        require(pool.totalParticipants > 0, "LotteryPool: no participants");
        require(pool.poolBalance > 0, "LotteryPool: no prize");
        
        // Select winner using weighted random selection
        address winner = selectWinner();
        uint256 prize = pool.poolBalance;
        
        // Reset pool
        pool.poolBalance = 0;
        pool.lastDrawTimestamp = block.timestamp;
        
        // Distribute prize
        tokenEconomy.transfer(winner, prize);
        
        emit LotteryWinner(winner, prize, pool.totalParticipants);
        
        // Reset for next round
        _resetParticipants();
    }

    /**
     * @dev Sets draw interval
     * @param newInterval New draw interval
     */
    function setDrawInterval(uint256 newInterval) external override onlyDAO whenNotPaused {
        require(newInterval >= MIN_DRAW_INTERVAL, "LotteryPool: interval too short");
        require(newInterval <= MAX_DRAW_INTERVAL, "LotteryPool: interval too long");
        
        pool.drawInterval = newInterval;
        emit DrawIntervalUpdated(newInterval);
    }

    /**
     * @dev Emergency withdraw function
     */
    function emergencyWithdraw() external override onlyOwner whenNotPaused {
        uint256 amount = pool.poolBalance;
        pool.poolBalance = 0;
        
        if (amount > 0) {
            tokenEconomy.transfer(msg.sender, amount);
        }
        
        emit EmergencyWithdraw(amount);
    }

    /**
     * @dev Gets pool balance
     * @return balance Current pool balance
     */
    function getPoolBalance() external view override returns (uint256 balance) {
        balance = pool.poolBalance;
    }

    /**
     * @dev Gets total participants
     * @return participants Total number of participants
     */
    function getTotalParticipants() external view override returns (uint256 participants) {
        participants = pool.totalParticipants;
    }

    /**
     * @dev Gets last draw timestamp
     * @return timestamp Last draw timestamp
     */
    function getLastDrawTimestamp() external view override returns (uint256 timestamp) {
        timestamp = pool.lastDrawTimestamp;
    }

    /**
     * @dev Gets draw interval
     * @return interval Draw interval
     */
    function getDrawInterval() external view override returns (uint256 interval) {
        interval = pool.drawInterval;
    }

    /**
     * @dev Checks if address is a participant
     * @param user User address
     * @return participant True if user is participant
     */
    function isParticipant(address user) external view override returns (bool participant) {
        participant = participantStatus[user];
    }

    /**
     * @dev Gets participant transaction count
     * @param user User address
     * @return count Transaction count
     */
    function getParticipantTransactionCount(address user) external view override returns (uint256 count) {
        count = pool.transactionCount[user];
    }

    /**
     * @dev Gets participant total volume
     * @param user User address
     * @return volume Total volume
     */
    function getParticipantVolume(address user) external view returns (uint256 volume) {
        volume = pool.totalVolume[user];
    }

    /**
     * @dev Gets all participants
     * @return participants Array of participant addresses
     */
    function getAllParticipants() external view returns (address[] memory participants) {
        participants = pool.participants;
    }

    /**
     * @dev Gets time until next draw
     * @return timeUntilNext Time in seconds until next draw
     */
    function getTimeUntilNextDraw() external view returns (uint256 timeUntilNext) {
        uint256 nextDrawTime = pool.lastDrawTimestamp + pool.drawInterval;
        if (nextDrawTime > block.timestamp) {
            timeUntilNext = nextDrawTime - block.timestamp;
        } else {
            timeUntilNext = 0;
        }
    }

    /**
     * @dev Updates token economy dependency
     * @param _tokenEconomy New token economy address
     */
    function updateTokenEconomy(address _tokenEconomy) external onlyOwner {
        require(_tokenEconomy != address(0), "LotteryPool: invalid token economy");
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

    /**
     * @dev Selects winner using weighted random selection
     * @return winner Selected winner address
     */
    function selectWinner() private view returns (address winner) {
        require(pool.totalParticipants > 0, "LotteryPool: no participants");
        
        // Generate pseudo-random seed
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.coinbase,
            pool.totalParticipants,
            pool.poolBalance
        )));
        
        // Calculate total weight (sum of transaction counts)
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < pool.totalParticipants; i++) {
            totalWeight += pool.transactionCount[pool.participants[i]];
        }
        
        require(totalWeight > 0, "LotteryPool: no weight");
        
        // Select random position
        uint256 randomIndex = seed % totalWeight;
        
        // Find winner by cumulative weight
        uint256 cumulativeWeight = 0;
        for (uint256 i = 0; i < pool.totalParticipants; i++) {
            cumulativeWeight += pool.transactionCount[pool.participants[i]];
            if (randomIndex < cumulativeWeight) {
                return pool.participants[i];
            }
        }
        
        // Fallback (should never reach here)
        return pool.participants[0];
    }

    /**
     * @dev Resets participants for next round
     */
    function _resetParticipants() private {
        // Clear participant flags
        for (uint256 i = 0; i < pool.totalParticipants; i++) {
            participantStatus[pool.participants[i]] = false;
        }
        
        // Reset arrays and counters
        delete pool.participants;
        pool.totalParticipants = 0;
    }
}

