// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPlayerSBT
 * @dev Interface for SoulBound Token representing player identity and stats
 */
interface IPlayerSBT {
    struct PlayerStats {
        uint256 totalGamesPlayed;
        uint256 totalWins;
        uint256 totalPoints;
        uint256 totalLosses;
        uint256 averageScore;
        uint256 lastGameTimestamp;
    }

    struct GameStat {
        uint256 gamesPlayed;
        uint256 wins;
        uint256 totalScore;
        uint256 highestScore;
        uint256 lastPlayed;
    }

    event PlayerSBTMinted(address indexed player, uint256 tokenId);
    event StatsUpdated(
        address indexed player,
        string indexed gameId,
        uint256 score,
        uint256 totalGames
    );

    function mintSBT(address player, string memory tokenURI) 
        external returns (uint256 tokenId);

    function updateStats(
        address player,
        string memory gameId,
        uint256 score,
        bool isWin
    ) external;

    function getPlayerStats(address player) 
        external view returns (PlayerStats memory);

    function getGameSpecificStats(address player, string memory gameId)
        external view returns (GameStat memory);

    function hasSBT(address player) external view returns (bool);

    function calculateReward(uint256 score, string memory gameId) 
        external view returns (uint256 hplayAmount);
}

