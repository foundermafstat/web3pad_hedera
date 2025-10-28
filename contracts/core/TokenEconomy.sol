// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "../interfaces/ITokenEconomy.sol";
import "../interfaces/ILotteryPool.sol";
import "../libraries/RewardCalculations.sol";
import "../libraries/AccessControlLib.sol";

/**
 * @title TokenEconomy
 * @dev Implements and governs the HPLAY Token (HTS Fungible Token) using Hedera Token Service
 */
contract TokenEconomy is ITokenEconomy, ERC20, ERC20Burnable, ERC20Capped, AccessControl, Pausable, ReentrancyGuard {
    using RewardCalculations for uint256;
    using AccessControlLib for AccessControl;

    // Token parameters
    string public constant SYMBOL = "HPLAY";
    string public constant NAME = "Hedera Play Token";
    uint8 public constant DECIMALS = 8;
    uint256 public constant TOTAL_SUPPLY = 10_000_000_000 * 10**DECIMALS;

    // Dependencies
    ILotteryPool public lotteryPool;

    // Storage
    Distribution public initialDistribution;
    TokenParams public params;
    
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public lastStakeTimestamp;
    
    bool public initialDistributionComplete;

    // Events (inherited from interface)
    event InitialDistributionCompleted();

    // Modifiers
    modifier onlyGameServer() {
        require(hasRole(AccessControlLib.GAME_SERVER_ROLE, msg.sender), "AccessControl: game server role required");
        _;
    }

    modifier onlyDAO() {
        require(hasRole(AccessControlLib.DAO_ROLE, msg.sender), "AccessControl: DAO role required");
        _;
    }

    modifier onlyOwner() {
        require(hasRole(AccessControlLib.OWNER_ROLE, msg.sender), "AccessControl: owner role required");
        _;
    }

    // Modifiers inherited from OpenZeppelin contracts

    constructor(address _lotteryPool) ERC20(NAME, SYMBOL) ERC20Capped(TOTAL_SUPPLY) {
        lotteryPool = ILotteryPool(_lotteryPool);

        _grantRole(AccessControlLib.OWNER_ROLE, msg.sender);
        _grantRole(AccessControlLib.GAME_SERVER_ROLE, msg.sender);

        // Initialize default parameters
        params = TokenParams({
            transferFeePercent: 50,    // 0.5%
            burnFeePercent: 10,        // 0.1%
            stakingRewardPercent: 100,  // 1%
            mintingEnabled: true
        });
    }

    /**
     * @dev Mints rewards to recipient
     * @param recipient Recipient address
     * @param amount Amount to mint
     * @return success True if minting successful
     */
    function mintRewards(address recipient, uint256 amount) 
        external override onlyGameServer whenNotPaused returns (bool success) {
        require(params.mintingEnabled, "TokenEconomy: minting disabled");
        require(recipient != address(0), "TokenEconomy: invalid recipient");
        require(amount > 0, "TokenEconomy: invalid amount");
        require(totalSupply() + amount <= cap(), "TokenEconomy: exceeds maximum supply");

        _mint(recipient, amount);
        emit RewardMinted(recipient, amount);
        return true;
    }

    /**
     * @dev Burns tokens permanently
     * @param amount Amount to burn
     */
    function burn(uint256 amount) public override(ERC20Burnable, ITokenEconomy) {
        require(amount > 0, "TokenEconomy: invalid amount");
        require(balanceOf(msg.sender) >= amount, "TokenEconomy: insufficient balance");
        
        _burn(msg.sender, amount);
        emit TokenBurned(msg.sender, amount);
    }

    /**
     * @dev Gets maximum supply
     * @return maxSupply Maximum supply amount
     */
    function maxSupply() public view override returns (uint256) {
        return cap();
    }

    /**
     * @dev Stakes tokens for rewards
     * @param amount Amount to stake
     * @return success True if staking successful
     */
    function stake(uint256 amount) external override whenNotPaused nonReentrant returns (bool success) {
        require(amount > 0, "TokenEconomy: amount must be positive");
        require(balanceOf(msg.sender) >= amount, "TokenEconomy: insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        lastStakeTimestamp[msg.sender] = block.timestamp;
        
        emit TokensStaked(msg.sender, amount);
        return true;
    }

    /**
     * @dev Unstakes tokens and claims rewards
     * @param amount Amount to unstake
     * @return success True if unstaking successful
     */
    function unstake(uint256 amount) external override whenNotPaused nonReentrant returns (bool success) {
        require(stakedBalance[msg.sender] >= amount, "TokenEconomy: insufficient staked balance");
        
        stakedBalance[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
        
        // Calculate and distribute rewards
        uint256 rewards = calculateRewards(msg.sender, amount);
        if (rewards > 0 && params.mintingEnabled) {
            _mint(msg.sender, rewards);
        }
        
        emit TokensUnstaked(msg.sender, amount, rewards);
        return true;
    }

    /**
     * @dev Gets staked balance for an account
     * @param account Account address
     * @return balance Staked balance
     */
    function getStakedBalance(address account) external view override returns (uint256 balance) {
        balance = stakedBalance[account];
    }

    /**
     * @dev Calculates staking rewards
     * @param account Account address
     * @param amount Amount to calculate rewards for
     * @return rewards Calculated rewards
     */
    function calculateRewards(address account, uint256 amount) 
        public view override returns (uint256 rewards) {
        uint256 stakingDuration = block.timestamp - lastStakeTimestamp[account];
        rewards = RewardCalculations.calculateStakingRewards(
            amount,
            stakingDuration,
            params.stakingRewardPercent
        );
    }

    /**
     * @dev Updates token parameters
     * @param newParams New token parameters
     */
    function updateParams(TokenParams memory newParams) external override onlyDAO whenNotPaused {
        require(newParams.transferFeePercent <= 1000, "TokenEconomy: transfer fee too high");
        require(newParams.burnFeePercent <= 1000, "TokenEconomy: burn fee too high");
        require(newParams.stakingRewardPercent <= 2000, "TokenEconomy: staking reward too high");

        params = newParams;
        emit ParamsUpdated(newParams);
    }

    /**
     * @dev Associates token with Hedera Token Service
     * @param tokenId Token ID to associate
     */
    function associateToken(address tokenId) external override payable {
        // This would integrate with Hedera Token Service
        // Implementation depends on specific Hedera SDK integration
        emit ParamsUpdated(params); // Placeholder event
    }

    /**
     * @dev Distributes initial token supply
     * @param distribution Addresses for initial distribution
     */
    function distributeInitialSupply(Distribution memory distribution) external onlyOwner {
        require(!initialDistributionComplete, "TokenEconomy: already distributed");
        require(distribution.gameRewardsPool != address(0), "TokenEconomy: invalid game rewards pool");
        require(distribution.developerIncentives != address(0), "TokenEconomy: invalid developer incentives");
        require(distribution.daoTreasury != address(0), "TokenEconomy: invalid DAO treasury");
        require(distribution.marketingEvents != address(0), "TokenEconomy: invalid marketing events");
        require(distribution.liquidityReserve != address(0), "TokenEconomy: invalid liquidity reserve");

        initialDistribution = distribution;

        // Distribute tokens according to allocation
        _mint(distribution.gameRewardsPool, TOTAL_SUPPLY * 40 / 100);      // 40%
        _mint(distribution.developerIncentives, TOTAL_SUPPLY * 20 / 100);   // 20%
        _mint(distribution.daoTreasury, TOTAL_SUPPLY * 20 / 100);          // 20%
        _mint(distribution.marketingEvents, TOTAL_SUPPLY * 10 / 100);      // 10%
        _mint(distribution.liquidityReserve, TOTAL_SUPPLY * 10 / 100);     // 10%

        initialDistributionComplete = true;
        emit InitialDistributionCompleted();
    }

    /**
     * @dev Updates lottery pool dependency
     * @param _lotteryPool New lottery pool address
     */
    function updateLotteryPool(address _lotteryPool) external onlyOwner {
        require(_lotteryPool != address(0), "TokenEconomy: invalid lottery pool");
        lotteryPool = ILotteryPool(_lotteryPool);
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
     * @dev Override transfer to include lottery fee
     * @param to Recipient address
     * @param amount Transfer amount
     * @return success True if transfer successful
     */
    function transfer(address to, uint256 amount) 
        public override(ERC20, IERC20) returns (bool success) {
        uint256 fee = RewardCalculations.calculateTransferFee(amount, params.transferFeePercent);
        uint256 transferAmount = amount - fee;
        
        // Send fee to lottery pool
        if (fee > 0 && address(lotteryPool) != address(0)) {
            _transfer(msg.sender, address(lotteryPool), fee);
            lotteryPool.accumulateFee(fee);
        }
        
        // Transfer to recipient
        _transfer(msg.sender, to, transferAmount);
        
        return true;
    }

    /**
     * @dev Override transferFrom to include lottery fee
     * @param from Sender address
     * @param to Recipient address
     * @param amount Transfer amount
     * @return success True if transfer successful
     */
    function transferFrom(address from, address to, uint256 amount) 
        public override(ERC20, IERC20) returns (bool success) {
        uint256 fee = RewardCalculations.calculateTransferFee(amount, params.transferFeePercent);
        uint256 transferAmount = amount - fee;
        
        // Send fee to lottery pool
        if (fee > 0 && address(lotteryPool) != address(0)) {
            _transfer(from, address(lotteryPool), fee);
            lotteryPool.accumulateFee(fee);
        }
        
        // Transfer to recipient
        _transfer(from, to, transferAmount);
        
        return true;
    }

    /**
     * @dev Burns tokens from an account (for upgrades, etc.)
     * @param account Account to burn from
     * @param amount Amount to burn
     */
    function burnFrom(address account, uint256 amount) public override(ERC20Burnable, ITokenEconomy) {
        require(account != address(0), "TokenEconomy: invalid account");
        require(amount > 0, "TokenEconomy: invalid amount");
        require(balanceOf(account) >= amount, "TokenEconomy: insufficient balance");
        
        _burn(account, amount);
        emit TokenBurned(account, amount);
    }

    /**
     * @dev Override _update to handle capped token logic
     * @param from Sender address
     * @param to Recipient address  
     * @param value Amount to transfer
     */
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}

