const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://base-puzzle-backend.onrender.com'
  : 'http://localhost:3001';

export const apiService = {
  // Submit game score
  async submitScore(
    playerAddress: string,
    score: number,
    linesCleared: number,
    duration: number,
    isTournament: boolean = false,
    tournamentId?: number
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerAddress,
          score,
          linesCleared,
          duration,
          isTournament,
          tournamentId
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to submit score:', error);
      return null;
    }
  },

  // Get player stats
  async getPlayerStats(address: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players/${address}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch player stats:', error);
      return null;
    }
  },

  // Get achievement signature
  async getAchievementSignature(playerAddress: string, achievementId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/achievements/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerAddress, achievementId })
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to get achievement signature:', error);
      return null;
    }
  },

  // Get tournament leaderboard
  async getTournamentLeaderboard(tournamentId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tournaments/${tournamentId}/leaderboard`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return null;
    }
  }
};
