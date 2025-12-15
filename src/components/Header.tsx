import { useState } from 'react';
import './Header.css';

const Header = () => {
  const [walletConnected, setWalletConnected] = useState(false);

  const connectWallet = async () => {
    try {
      // Wallet connection will be handled by Farcaster SDK
      setWalletConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">🧩</span>
          <h1>Block Puzzle</h1>
        </div>
        <button 
          className={`wallet-btn ${walletConnected ? 'connected' : ''}`}
          onClick={connectWallet}
        >
          {walletConnected ? '🟢 Connected' : '⚪ Connect'}
        </button>
      </div>
      <div className="header-subtitle">
        Skill-Based Tournaments on Base
      </div>
    </header>
  );
};

export default Header;
