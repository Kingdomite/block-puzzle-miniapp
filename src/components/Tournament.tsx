import { useState, useEffect } from 'react';
import './Tournament.css';
import { web3Service } from '../contracts/web3Service';
import { apiService } from '../services/apiService';

interface TournamentData {
  prizePool: number;
  participants: number;
  timeRemaining: string;
  entryFee: number;
}

interface LeaderboardEntry {
  player_address: string;
  best_score: number;
  games_played: number;
}

interface TournamentProps {
  onStartGame?: () => void;
}

const Tournament = ({ onStartGame }: TournamentProps) => {
  const [isEntered, setIsEntered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [tournamentData, setTournamentData] = useState<TournamentData>({
    prizePool: 0,
    participants: 0,
    timeRemaining: '00:00:00',
    entryFee: 0.001
  });

  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Rising success chime
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  };

  useEffect(() => {
    const checkIfEntered = async () => {
      try {
        const address = await web3Service.getAddress();
        if (address) {
          setUserAddress(address);
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

  // Load leaderboard
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await apiService.getTournamentLeaderboard(1); // Tournament ID 1
        if (data && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      } catch (e) {
        console.error('Failed to load leaderboard:', e);
      }
    };

    if (!isChecking) {
      loadLeaderboard();
      const interval = setInterval(loadLeaderboard, 15000); // Refresh every 15s
      return () => clearInterval(interval);
    }
  }, [isChecking]);

  useEffect(() => {
    const loadTournamentData = async () => {
      try {
        const data = await web3Service.getCurrentTournament();
        console.log('🎯 Tournament data from contract:', data);
        if (data) {
          const prizePoolETH = Number(data.totalPrizePool) / 1e18;
          const prizePoolUSD = prizePoolETH * 3000; // Approximate ETH price
          const now = Math.floor(Date.now() / 1000);
          const endTime = Number(data.endTime);
          const timeLeft = Math.max(0, endTime - now);
          
          const hours = Math.floor(timeLeft / 3600);
          const minutes = Math.floor((timeLeft % 3600) / 60);
          const seconds = timeLeft % 60;
          
          console.log('📊 Calculated values:', {
            prizePoolETH,
            prizePoolUSD,
            participants: Number(data.participantCount),
            timeLeft,
            hours,
            minutes,
            seconds
          });
          
          setTournamentData(prev => ({
            ...prev,
            prizePool: prizePoolUSD,
            participants: Number(data.participantCount),
            timeRemaining: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
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

      const success = true; // Temporarily bypass tournament entry
      // const success = await web3Service.enterTournament();
      if (success) {
        setIsEntered(true);
        playSuccessSound();
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
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>
              No scores yet. Be the first to play!
            </div>
          ) : (
            leaderboard.map((entry, index) => {
              const isCurrentUser = userAddress && entry.player_address.toLowerCase() === userAddress.toLowerCase();
              const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
              
              return (
                <div 
                  key={entry.player_address} 
                  className={`leaderboard-item ${rankClass} ${isCurrentUser ? 'current-user' : ''}`}
                  style={isCurrentUser ? { background: 'rgba(0, 212, 255, 0.2)', border: '2px solid #00d4ff' } : {}}
                >
                  <span className="rank">{index + 1}</span>
                  <span className="player">
                    {entry.player_address.slice(0, 6)}...{entry.player_address.slice(-4)}
                    {isCurrentUser && ' (You)'}
                  </span>
                  <span className="score">{entry.best_score.toLocaleString()}</span>
                  <span className="games" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    {entry.games_played} {entry.games_played === 1 ? 'game' : 'games'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default Tournament;
