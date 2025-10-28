// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ITokenEconomy
 * @dev Interface for HPLAY token economy and governance
 */
interface ITokenEconomy is IERC20 {
    struct Distribution {
        address gameRewardsPool;      // 40% (4,000,000,000 HPLAY)
        address developerIncentives;   // 20% (2,000,000,000 HPLAY)
        address daoTreasury;          // 20% (2,000,000,000 HPLAY)
        address marketingEvents;      // 10% (1,000,000,000 HPLAY)
        address liquidityReserve;     // 10% (1,000,000,000 HPLAY)
    }

    struct TokenParams {
        uint256 transferFeePercent;    // Default: 50 (0.5%)
        uint256 burnFeePercent;         // Default: 10 (0.1%)
        uint256 stakingRewardPercent;   // Default: 100 (1%)
        bool mintingEnabled;
    }

    event RewardMinted(address indexed recipient, uint256 amount);
    event TokenBurned(address indexed account, uint256 amount);
    event TokensStaked(address indexed account, uint256 amount);
    event TokensUnstaked(address indexed account, uint256 amount, uint256 rewards);
    event ParamsUpdated(TokenParams newParams);

    function mintRewards(address recipient, uint256 amount) 
        external returns (bool);

    function burn(uint256 amount) external;

    function burnFrom(address account, uint256 amount) external;

    function maxSupply() external view returns (uint256);

    function stake(uint256 amount) external returns (bool);

    function unstake(uint256 amount) external returns (bool);

    function getStakedBalance(address account) external view returns (uint256);

    function calculateRewards(address account, uint256 amount) 
        external view returns (uint256);

    function updateParams(TokenParams memory newParams) external;

    function associateToken(address tokenId) external payable;
}

