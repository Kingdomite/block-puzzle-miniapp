import { useState, useEffect } from 'react';
import './Tournament.css';
import { web3Service } from '../contracts/web3Service';

interface TournamentData {
  prizePool: number;
  participants: number;
  timeRemaining: string;
  entryFee: number;
}

interface TournamentProps {
  onStartGame?: () => void;
}

const Tournament = ({ onStartGame }: TournamentProps) => {
  const [isEntered, setIsEntered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tournamentData, setTournamentData] = useState<TournamentData>({
    prizePool: 42.5,
    participants: 127,
    timeRemaining: '18:32:45',
    entryFee: 0.35
  });

  useEffect(() => {
    const checkIfEntered = async () => {
      try {
        const address = await web3Service.getAddress();
        if (address) {
          const entered = await web3Service.hasEnteredTournament(address);
          setIsEntered(entered);
        }
      } catch (e) {
        console.error('Failed to check tournament entry status:', e);
      } finally {
        setIsChecking(false);
      }
    };

    checkIfEntered();
  }, []);

  useEffect(() => {
    const loadTournamentData = async () => {
      try {
        const data = await web3Service.getCurrentTournament();
        if (data) {
          setTournamentData(prev => ({
            ...prev,
            prizePool: Number(data.totalPrizePool) / 1e18 * 3000,
            participants: Number(data.participantCount)
          }));
        }
      } catch (e) {
        console.error('Failed to load tournament data:', e);
      }
    };

    if (!isChecking) {
      loadTournamentData();
      const interval = setInterval(loadTournamentData, 30000);
      return () => clearInterval(interval);
    }
  }, [isChecking]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate countdown
      const parts = tournamentData.timeRemaining.split(':');
      let hours = parseInt(parts[0]);
      let minutes = parseInt(parts[1]);
      let seconds = parseInt(parts[2]);

      if (seconds > 0) {
        seconds--;
      } else if (minutes > 0) {
        minutes--;
        seconds = 59;
      } else if (hours > 0) {
        hours--;
        minutes = 59;
        seconds = 59;
      }

      setTournamentData(prev => ({
        ...prev,
        timeRemaining: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [tournamentData.timeRemaining]);

  const handleEnterTournament = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Make sure wallet is connected
      let address = await web3Service.getAddress();
      if (!address) {
        address = await web3Service.connect();
      }

      if (!address) {
        setError('Please connect your wallet using the button at the top first.');
        setIsLoading(false);
        return;
      }

      const success = await web3Service.enterTournament();
      if (success) {
        setIsEntered(true);
      } else {
        setError('Transaction failed or was rejected in your wallet.');
      }
    } catch (e) {
      console.error(e);
      setError('Something went wrong entering the tournament.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tournament-container">
      {isChecking ? (
        <div className="loading-screen" style={{ padding: '40px', textAlign: 'center' }}>
          <p>Checking tournament status...</p>
        </div>
      ) : (
        <>
      <div className="tournament-header">
        <h2>🏆 Daily Tournament</h2>
        <p className="tournament-subtitle">Compete for Real Prizes on Base</p>
      </div>

      <div className="tournament-stats">
        <div className="stat-card prize-pool">
          <span className="stat-icon">💰</span>
          <div className="stat-content">
            <span className="stat-label">Prize Pool</span>
            <span className="stat-value">${tournamentData.prizePool.toFixed(2)}</span>
            <span className="stat-eth">(≈ 0.0156 ETH)</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div className="stat-content">
            <span className="stat-label">Participants</span>
            <span className="stat-value">{tournamentData.participants}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⏰</span>
          <div className="stat-content">
            <span className="stat-label">Time Left</span>
            <span className="stat-value countdown">{tournamentData.timeRemaining}</span>
          </div>
        </div>
      </div>

      <div className="rewards-breakdown">
        <h3>💎 Reward Distribution</h3>
        <div className="rewards-list">
          <div className="reward-item gold">
            <span className="position">🥇 1st Place</span>
            <span className="reward">50% of pool (${(tournamentData.prizePool * 0.9 * 0.5).toFixed(2)})</span>
          </div>
          <div className="reward-item silver">
            <span className="position">🥈 2nd Place</span>
            <span className="reward">30% of pool (${(tournamentData.prizePool * 0.9 * 0.3).toFixed(2)})</span>
          </div>
          <div className="reward-item bronze">
            <span className="position">🥉 3rd Place</span>
            <span className="reward">20% of pool (${(tournamentData.prizePool * 0.9 * 0.2).toFixed(2)})</span>
          </div>
        </div>
      </div>

      {!isEntered ? (
        <div className="entry-section">
          <div className="entry-info">
            <p className="entry-fee">Entry Fee: <strong>${tournamentData.entryFee}</strong> in Base ETH</p>
            <p className="fee-breakdown">
              • 95% → Prize Pool<br/>
              • 5% → Platform Fee
            </p>
          </div>
          <button className="enter-tournament-btn" onClick={handleEnterTournament} disabled={isLoading}>
            {isLoading ? 'Waiting for wallet...' : `Join Daily Tournament - $${tournamentData.entryFee}`}
          </button>
          {error && <p className="disclaimer" style={{ color: '#ffcccc' }}>{error}</p>}
        </div>
      ) : (
        <div className="entered-status">
          <div className="success-icon">✓</div>
          <h3>You're In!</h3>
          <p>Play your best game before time runs out</p>
          <button className="play-tournament-btn" onClick={onStartGame}>
            Start Tournament Game
          </button>
        </div>
      )}

      <div className="tournament-rules">
        <h3>📋 Tournament Rules</h3>
        <ul>
          <li>Entry fee: $0.35 in Base ETH per day</li>
          <li>Rankings based on score, speed, and achievements</li>
          <li>90% of prize pool distributed to top 3 players</li>
          <li>10% of prize pool goes to treasury for future rewards</li>
          <li>Anti-cheat system enforced - fair play only</li>
          <li>New tournament starts every 24 hours</li>
        </ul>
      </div>

      <div className="leaderboard">
        <h3>🎯 Today's Top Scores</h3>
        <div className="leaderboard-list">
          <div className="leaderboard-item rank-1">
            <span className="rank">1</span>
            <span className="player">0x7a3...9f2</span>
            <span className="score">12,450</span>
          </div>
          <div className="leaderboard-item rank-2">
            <span className="rank">2</span>
            <span className="player">0x4b1...6e8</span>
            <span className="score">11,890</span>
          </div>
          <div className="leaderboard-item rank-3">
            <span className="rank">3</span>
            <span className="player">0x9c5...2a7</span>
            <span className="score">10,320</span>
          </div>
          <div className="leaderboard-item">
            <span className="rank">4</span>
            <span className="player">0x2f8...4d1</span>
            <span className="score">9,750</span>
          </div>
          <div className="leaderboard-item">
            <span className="rank">5</span>
            <span className="player">0x6e3...8b9</span>
            <span className="score">8,990</span>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default Tournament;
