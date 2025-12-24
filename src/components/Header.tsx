import { useState, useEffect } from 'react';
import './Header.css';
import { web3Service } from '../contracts/web3Service';

const Header = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const address = await web3Service.getAddress();
        if (address) {
          setWalletConnected(true);
          setWalletAddress(address);
        } else {
          setWalletConnected(false);
          setWalletAddress(null);
        }
      } catch (error) {
        setWalletConnected(false);
        setWalletAddress(null);
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setWalletConnected(false);
          setWalletAddress(null);
        } else {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const connectWallet = async () => {
    if (walletConnected) {
      // Disconnect wallet
      setWalletConnected(false);
      setWalletAddress(null);
      return;
    }

    try {
      const address = await web3Service.connect();
      if (address) {
        setWalletConnected(true);
        setWalletAddress(address);
      } else {
        setWalletConnected(false);
        setWalletAddress(null);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setWalletConnected(false);
      setWalletAddress(null);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">🧩</span>
          <h1>Base-Puzzle</h1>
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
