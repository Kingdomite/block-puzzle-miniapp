// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GameController
 * @dev Trusted backend controller for game verification
 * - Verifies achievements off-chain
 * - Submits tournament scores
 * - Prevents cheating
 * - Only authorized backend can interact
 */
contract GameController is Ownable {
    // Contract addresses
    address public achievementBadges;
    address public tournamentManager;
    
    // Authorized backend signers
    mapping(address => bool) public authorizedSigners;
    
    // Player statistics (off-chain verified, on-chain stored)
    struct PlayerStats {
        uint256 gamesPlayed;
        uint256 highScore;
        uint256 totalScore;
        uint256 achievementsEarned;
        uint256 tournamentsEntered;
    }
    
    mapping(address => PlayerStats) public playerStats;
    
    // Achievement verification
    mapping(address => mapping(uint256 => bool)) public achievementEarned;
    
    // Anti-cheat tracking
    mapping(address => uint256) public lastGameTimestamp;
    uint256 public constant MIN_GAME_DURATION = 30 seconds;
    
    // Events
    event AchievementEarned(address indexed player, uint256 indexed achievementId);
    event ScoreVerified(address indexed player, uint256 score, uint256 tournamentId);
    event SignerUpdated(address indexed signer, bool authorized);
    event PlayerStatsUpdated(address indexed player);
    
    constructor() Ownable(msg.sender) {}
    
    modifier onlyAuthorized() {
        require(authorizedSigners[msg.sender] || msg.sender == owner(), "Unauthorized");
        _;
    }
    
    /**
     * @dev Set contract addresses
     */
    function setContracts(
        address _achievementBadges,
        address _tournamentManager
    ) external onlyOwner {
        achievementBadges = _achievementBadges;
        tournamentManager = _tournamentManager;
    }
    
    /**
     * @dev Add/remove authorized signer
     */
    function setAuthorizedSigner(address signer, bool authorized) external onlyOwner {
        authorizedSigners[signer] = authorized;
        emit SignerUpdated(signer, authorized);
    }
    
    /**
     * @dev Verify and record achievement earned
     */
    function recordAchievement(
        address player,
        uint256 achievementId
    ) external onlyAuthorized {
        require(!achievementEarned[player][achievementId], "Already earned");
        
        achievementEarned[player][achievementId] = true;
        playerStats[player].achievementsEarned++;
        
        emit AchievementEarned(player, achievementId);
        emit PlayerStatsUpdated(player);
    }
    
    /**
     * @dev Verify and submit tournament score
     */
    function submitTournamentScore(
        address player,
        uint256 tournamentId,
        uint256 score,
        uint256 gameDuration
    ) external onlyAuthorized {
        // Anti-cheat: minimum game duration
        require(gameDuration >= MIN_GAME_DURATION, "Game too short");
        
        // Anti-cheat: rate limiting
        require(
            block.timestamp >= lastGameTimestamp[player] + MIN_GAME_DURATION,
            "Rate limited"
        );
        
        lastGameTimestamp[player] = block.timestamp;
        
        // Update stats
        playerStats[player].gamesPlayed++;
        playerStats[player].totalScore += score;
        if (score > playerStats[player].highScore) {
            playerStats[player].highScore = score;
        }
        
        emit ScoreVerified(player, score, tournamentId);
        emit PlayerStatsUpdated(player);
    }
    
    /**
     * @dev Record tournament entry
     */
    function recordTournamentEntry(address player) external onlyAuthorized {
        playerStats[player].tournamentsEntered++;
        emit PlayerStatsUpdated(player);
    }
    
    /**
     * @dev Check if player has earned achievement
     */
    function hasEarnedAchievement(
        address player,
        uint256 achievementId
    ) external view returns (bool) {
        return achievementEarned[player][achievementId];
    }
    
    /**
     * @dev Get player statistics
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }
    
    /**
     * @dev Generate achievement verification signature (backend only)
     * This is a simplified version - implement proper ECDSA signing in production
     */
    function generateAchievementSignature(
        address player,
        uint256 achievementId
    ) external view onlyAuthorized returns (bytes memory) {
        require(achievementEarned[player][achievementId], "Not earned");
        
        // In production: Use ECDSA to sign the achievement data
        // For now, return a simple bytes array
        return abi.encodePacked(player, achievementId, block.timestamp);
    }
}
