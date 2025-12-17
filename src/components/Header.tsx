import { useState } from 'react';
import './Header.css';
import { web3Service } from '../contracts/web3Service';

const Header = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      const address = await web3Service.connect();
      if (address) {
        setWalletConnected(true);
        setWalletAddress(address);
      }
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
          {walletConnected && walletAddress
            ? `🟢 ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : '⚪ Connect'}
        </button>
      </div>
      <div className="header-subtitle">
        Skill-Based Tournaments on Base
      </div>
    </header>
  );
};

export default Header;
