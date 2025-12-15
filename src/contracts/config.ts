// Contract ABIs - Simplified versions
export const ACHIEVEMENT_BADGES_ABI = [
  "function mintAchievement(uint256 achievementId, bytes signature) external payable",
  "function hasAchievement(address player, uint256 achievementId) external view returns (bool)",
  "function hasMinted(address player, uint256 achievementId) external view returns (bool)",
  "function MINT_FEE() external view returns (uint256)",
  "event AchievementMinted(address indexed player, uint256 indexed achievementId)"
];

export const TOURNAMENT_MANAGER_ABI = [
  "function enterTournament() external payable",
  "function getEntryFeeETH() external view returns (uint256)",
  "function currentTournamentId() external view returns (uint256)",
  "function hasEnteredCurrent(address player) external view returns (bool)",
  "function getCurrentTournament() external view returns (tuple(uint256 id, uint256 startTime, uint256 endTime, uint256 totalPrizePool, uint256 participantCount, bool finalized, address[] winners, uint256[] prizes))",
  "event PlayerEntered(uint256 indexed tournamentId, address indexed player, uint256 entryFee)",
  "event TournamentFinalized(uint256 indexed tournamentId, address[] winners, uint256[] prizes)"
];

export const GAME_CONTROLLER_ABI = [
  "function getPlayerStats(address player) external view returns (tuple(uint256 gamesPlayed, uint256 highScore, uint256 totalScore, uint256 achievementsEarned, uint256 tournamentsEntered))",
  "function hasEarnedAchievement(address player, uint256 achievementId) external view returns (bool)",
  "event AchievementEarned(address indexed player, uint256 indexed achievementId)",
  "event ScoreVerified(address indexed player, uint256 score, uint256 tournamentId)"
];

// Contract addresses on Base (update after deployment)
export const CONTRACT_ADDRESSES = {
  ACHIEVEMENT_BADGES: '0x0000000000000000000000000000000000000000', // Deploy and update
  TOURNAMENT_MANAGER: '0x0000000000000000000000000000000000000000', // Deploy and update
  GAME_CONTROLLER: '0x0000000000000000000000000000000000000000'    // Deploy and update
};

// Base network configuration
export const BASE_NETWORK = {
  chainId: 8453,
  name: 'Base',
  rpcUrl: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org'
};

export const BASE_SEPOLIA = {
  chainId: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org'
};
