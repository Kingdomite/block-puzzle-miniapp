import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import GameBoard from './components/GameBoard';
import Tournament from './components/Tournament';
import Achievements from './components/Achievements';
import Header from './components/Header';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'play' | 'tournament' | 'achievements'>('play');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize Farcaster Mini App SDK
    const initSDK = async () => {
      try {
        await sdk.actions.ready();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize SDK:', error);
        setIsReady(true); // Proceed anyway for development
      }
    };

    initSDK();
  }, []);

  if (!isReady) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Block Puzzle...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      
      <nav className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'play' ? 'active' : ''}`}
          onClick={() => setActiveTab('play')}
        >
          🎮 Free Play
        </button>
        <button
          className={`tab-btn ${activeTab === 'tournament' ? 'active' : ''}`}
          onClick={() => setActiveTab('tournament')}
        >
          🏆 Tournament
        </button>
        <button
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          ⭐ Achievements
        </button>
      </nav>

      <main className="content">
        {activeTab === 'play' && <GameBoard />}
        {activeTab === 'tournament' && <Tournament />}
        {activeTab === 'achievements' && <Achievements />}
      </main>
    </div>
  );
}

export default App;
