// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TokenEconomyV2
 * @dev Simplified HPLAY token WITHOUT lottery fees, burn fees, or hard cap
 * Focused on reliability and simplicity
 */
contract TokenEconomyV2 is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    uint8 private constant DECIMALS = 8;
    uint256 public maxSupply = 100_000_000_000 * 10**DECIMALS; // 100 billion (flexible)
    
    event MaxSupplyUpdated(uint256 newMaxSupply);
    
    constructor() ERC20("Hedera Play Token", "HPLAY") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
    
    /**
     * @dev Mint tokens to recipient
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(totalSupply() + amount <= maxSupply, "TokenEconomyV2: exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Update max supply (only admin)
     */
    function updateMaxSupply(uint256 newMaxSupply) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMaxSupply >= totalSupply(), "TokenEconomyV2: new max below current supply");
        maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(newMaxSupply);
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Hook that is called before any transfer of tokens
     */
    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }
}

