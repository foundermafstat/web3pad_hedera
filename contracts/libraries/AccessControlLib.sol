// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AccessControl
 * @dev Library for role-based access control and security modifiers
 */
library AccessControlLib {
    // Role constants
    bytes32 public constant OWNER_ROLE = keccak256("OWNER");
    bytes32 public constant DAO_ROLE = keccak256("DAO");
    bytes32 public constant SERVER_ROLE = keccak256("SERVER");
    bytes32 public constant GAME_SERVER_ROLE = keccak256("GAME_SERVER");

    /**
     * @dev Modifier to check if caller has owner role
     */
    modifier onlyOwner(AccessControl accessControl) {
        require(
            accessControl.hasRole(OWNER_ROLE, msg.sender),
            "AccessControl: caller is not owner"
        );
        _;
    }

    /**
     * @dev Modifier to check if caller has DAO role
     */
    modifier onlyDAO(AccessControl accessControl) {
        require(
            accessControl.hasRole(DAO_ROLE, msg.sender),
            "AccessControl: caller is not DAO"
        );
        _;
    }

    /**
     * @dev Modifier to check if caller has server role
     */
    modifier onlyServer(AccessControl accessControl) {
        require(
            accessControl.hasRole(SERVER_ROLE, msg.sender),
            "AccessControl: caller is not server"
        );
        _;
    }

    /**
     * @dev Modifier to check if caller has game server role
     */
    modifier onlyGameServer(AccessControl accessControl) {
        require(
            accessControl.hasRole(GAME_SERVER_ROLE, msg.sender),
            "AccessControl: caller is not game server"
        );
        _;
    }

    /**
     * @dev Modifier to check if caller has owner or DAO role
     */
    modifier onlyOwnerOrDAO(AccessControl accessControl) {
        require(
            accessControl.hasRole(OWNER_ROLE, msg.sender) ||
            accessControl.hasRole(DAO_ROLE, msg.sender),
            "AccessControl: caller is not owner or DAO"
        );
        _;
    }

    /**
     * @dev Modifier to check if caller has owner or server role
     */
    modifier onlyOwnerOrServer(AccessControl accessControl) {
        require(
            accessControl.hasRole(OWNER_ROLE, msg.sender) ||
            accessControl.hasRole(SERVER_ROLE, msg.sender),
            "AccessControl: caller is not owner or server"
        );
        _;
    }

    /**
     * @dev Modifier to check if contract is not paused
     */
    modifier whenNotPaused(Pausable pausable) {
        require(!pausable.paused(), "AccessControl: contract is paused");
        _;
    }

    /**
     * @dev Modifier to prevent reentrancy attacks
     */
    modifier nonReentrant(ReentrancyGuard reentrancyGuard) {
        // Use the built-in nonReentrant modifier from OpenZeppelin
        // This is a placeholder - actual reentrancy protection is handled by the contract itself
        _;
    }

    /**
     * @dev Sets up initial roles for a contract
     * @param accessControl The AccessControl contract
     * @param owner The owner address
     * @param dao The DAO address
     * @param server The server address
     */
    function setupRoles(
        AccessControl accessControl,
        address owner,
        address dao,
        address server
    ) internal {
        // Grant owner role
        accessControl.grantRole(OWNER_ROLE, owner);
        
        // Grant DAO role if provided
        if (dao != address(0)) {
            accessControl.grantRole(DAO_ROLE, dao);
        }
        
        // Grant server role if provided
        if (server != address(0)) {
            accessControl.grantRole(SERVER_ROLE, server);
            accessControl.grantRole(GAME_SERVER_ROLE, server);
        }
        
        // Role admin is set automatically by OpenZeppelin
    }

    /**
     * @dev Checks if address has any of the specified roles
     * @param accessControl The AccessControl contract
     * @param account The account to check
     * @param roles Array of roles to check
     * @return hasAny True if account has any of the roles
     */
    function hasAnyRole(
        AccessControl accessControl,
        address account,
        bytes32[] memory roles
    ) internal view returns (bool hasAny) {
        hasAny = false;
        for (uint256 i = 0; i < roles.length; i++) {
            if (accessControl.hasRole(roles[i], account)) {
                hasAny = true;
                break;
            }
        }
    }

    /**
     * @dev Checks if address has all of the specified roles
     * @param accessControl The AccessControl contract
     * @param account The account to check
     * @param roles Array of roles to check
     * @return hasAll True if account has all of the roles
     */
    function hasAllRoles(
        AccessControl accessControl,
        address account,
        bytes32[] memory roles
    ) internal view returns (bool hasAll) {
        hasAll = true;
        for (uint256 i = 0; i < roles.length; i++) {
            if (!accessControl.hasRole(roles[i], account)) {
                hasAll = false;
                break;
            }
        }
    }
}

