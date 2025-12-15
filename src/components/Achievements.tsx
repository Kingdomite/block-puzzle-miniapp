import { useState } from 'react';
import './Achievements.css';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  minted: boolean;
  requirement: string;
}

const Achievements = () => {
  const [achievements] = useState<Achievement[]>([
    {
      id: 1,
      name: 'First Blood',
      description: 'Complete your first line',
      icon: '🎯',
      earned: true,
      minted: true,
      requirement: 'Clear 1 line'
    },
    {
      id: 2,
      name: 'Speed Demon',
      description: 'Complete a game in under 2 minutes',
      icon: '⚡',
      earned: true,
      minted: false,
      requirement: 'Complete game < 2min'
    },
    {
      id: 3,
      name: 'Combo Master',
      description: 'Clear 5 lines in a row',
      icon: '🔥',
      earned: true,
      minted: false,
      requirement: 'Clear 5 consecutive lines'
    },
    {
      id: 4,
      name: 'High Scorer',
      description: 'Reach 10,000 points',
      icon: '⭐',
      earned: false,
      minted: false,
      requirement: 'Score 10,000 points'
    },
    {
      id: 5,
      name: 'Marathon Runner',
      description: 'Play 50 games',
      icon: '🏃',
      earned: false,
      minted: false,
      requirement: 'Complete 50 games'
    },
    {
      id: 6,
      name: 'Perfectionist',
      description: 'Clear entire board',
      icon: '💎',
      earned: false,
      minted: false,
      requirement: 'Clear all cells'
    }
  ]);

  const handleMint = (id: number) => {
    console.log('Minting achievement:', id);
    // Will connect to smart contract
  };

  const earnedCount = achievements.filter(a => a.earned).length;
  const mintedCount = achievements.filter(a => a.minted).length;

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h2>⭐ Achievements</h2>
        <p className="achievements-subtitle">Soulbound NFTs on Base</p>
      </div>

      <div className="achievements-stats">
        <div className="stat-badge">
          <span className="stat-number">{earnedCount}</span>
          <span className="stat-text">Earned</span>
        </div>
        <div className="stat-badge minted">
          <span className="stat-number">{mintedCount}</span>
          <span className="stat-text">Minted</span>
        </div>
        <div className="stat-badge total">
          <span className="stat-number">{achievements.length}</span>
          <span className="stat-text">Total</span>
        </div>
      </div>

      <div className="achievements-info">
        <h3>🏅 About Soulbound Achievements</h3>
        <ul>
          <li>Achievement NFTs are non-transferable (Soulbound)</li>
          <li>Mint fee: 0.00015 Base ETH per badge</li>
          <li>Minting is optional - gameplay is always free</li>
          <li>Achievements boost your tournament ranking</li>
          <li>Each badge is a unique proof of skill</li>
        </ul>
      </div>

      <div className="achievements-grid">
        {achievements.map(achievement => (
          <div 
            key={achievement.id} 
            className={`achievement-card ${achievement.earned ? 'earned' : 'locked'} ${achievement.minted ? 'minted' : ''}`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-content">
              <h3 className="achievement-name">{achievement.name}</h3>
              <p className="achievement-description">{achievement.description}</p>
              <p className="achievement-requirement">{achievement.requirement}</p>
              
              {achievement.earned && !achievement.minted && (
                <button 
                  className="mint-btn"
                  onClick={() => handleMint(achievement.id)}
                >
                  🪙 Mint Badge (0.00015 ETH)
                </button>
              )}
              
              {achievement.minted && (
                <div className="minted-badge">
                  ✓ Minted
                </div>
              )}
              
              {!achievement.earned && (
                <div className="locked-badge">
                  🔒 Locked
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="achievements-footer">
        <p>💡 Keep playing to unlock more achievements and strengthen your tournament profile!</p>
      </div>
    </div>
  );
};

export default Achievements;
