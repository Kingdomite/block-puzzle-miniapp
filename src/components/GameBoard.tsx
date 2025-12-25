import { useState, useEffect } from 'react';
import './GameBoard.css';

type BlockShape = number[][];
type GridCell = boolean;

const GRID_SIZE = 8;

const BLOCK_SHAPES: BlockShape[] = [
  [[1, 1, 1]], // Line 3
  [[1], [1], [1]], // Vertical 3
  [[1, 1], [1, 1]], // Square
  [[1, 1, 1, 1]], // Line 4
  [[1, 0], [1, 1]], // L-shape
  [[1, 1], [0, 1]], // Reverse L
];

interface GameBoardProps {
  tournamentMode?: boolean;
}

const GameBoard = ({ tournamentMode = false }: GameBoardProps) => {
  const [grid, setGrid] = useState<GridCell[][]>(() =>
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false))
  );
  const [score, setScore] = useState(0);
  const [currentBlock, setCurrentBlock] = useState<BlockShape | null>(null);
  const [gameOver, setGameOver] = useState(false);

  // Sound effects using Web Audio API
  const playSound = (type: 'place' | 'clear' | 'gameOver') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'place') {
      // Quick click sound
      oscillator.frequency.value = 400;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'clear') {
      // Rising success sound
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === 'gameOver') {
      // Descending game over sound
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  useEffect(() => {
    generateNewBlock();
  }, []);

  const generateNewBlock = () => {
    const randomShape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
    setCurrentBlock(randomShape);
  };

  // Check game over whenever grid or current block changes
  useEffect(() => {
    if (!currentBlock || gameOver) return;
    
    const checkGameOver = () => {
      // Check every possible position on the grid
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (canPlaceBlock(row, col, currentBlock)) {
            // Found at least one valid position, game continues
            return;
          }
        }
      }
      // No valid position found - Game Over!
      playSound('gameOver');
      setGameOver(true);
    };
    
    checkGameOver();
  }, [currentBlock, grid, gameOver]);

  const canPlaceBlock = (row: number, col: number, block: BlockShape): boolean => {
    for (let r = 0; r < block.length; r++) {
      for (let c = 0; c < block[r].length; c++) {
        if (block[r][c]) {
          const gridRow = row + r;
          const gridCol = col + c;
          if (
            gridRow >= GRID_SIZE ||
            gridCol >= GRID_SIZE ||
            grid[gridRow][gridCol]
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placeBlock = (row: number, col: number) => {
    if (!currentBlock || !canPlaceBlock(row, col, currentBlock)) {
      return;
    }

    const newGrid = grid.map(row => [...row]);
    currentBlock.forEach((blockRow, r) => {
      blockRow.forEach((cell, c) => {
        if (cell) {
          newGrid[row + r][col + c] = true;
        }
      });
    });

    const clearedLines = clearCompleteLines(newGrid);
    setGrid(newGrid);
    setScore(prev => prev + 10 + (clearedLines * 50));
    
    // Play sounds
    playSound('place');
    if (clearedLines > 0) {
      setTimeout(() => playSound('clear'), 100);
    }
    
    generateNewBlock();
  };

  const clearCompleteLines = (grid: GridCell[][]): number => {
    let cleared = 0;

    // Clear complete rows
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r].every(cell => cell)) {
        grid[r].fill(false);
        cleared++;
      }
    }

    // Clear complete columns
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid.every(row => row[c])) {
        grid.forEach(row => row[c] = false);
        cleared++;
      }
    }

    return cleared;
  };

  const resetGame = () => {
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false)));
    setScore(0);
    setGameOver(false);
    generateNewBlock();
  };

  return (
    <div className="game-board-container">
      {tournamentMode && (
        <div style={{
          background: 'linear-gradient(135deg, #00d4ff 0%, #0000FF 100%)',
          padding: '12px',
          borderRadius: '12px',
          marginBottom: '16px',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '14px',
          border: '2px solid rgba(0, 212, 255, 0.3)'
        }}>
          🏆 Tournament Mode - Your score counts!
        </div>
      )}
      <div className="game-header">
        <div className="score-display">
          <span className="score-label">Score</span>
          <span className="score-value">{score}</span>
        </div>
      </div>

      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${cell ? 'filled' : ''}`}
                onClick={() => placeBlock(rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>

      {currentBlock && (
        <div className="current-block-preview">
          <p className="preview-label">Next Block:</p>
          <div className="preview-grid">
            {currentBlock.map((row, r) => (
              <div key={r} className="preview-row">
                {row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`preview-cell ${cell ? 'filled' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-over-modal">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <button onClick={resetGame} className="reset-btn">
            Play Again
          </button>
        </div>
      )}

      <div className="info-box">
        <h3>🎮 How to Play</h3>
        <ul>
          <li>Click on the grid to place blocks</li>
          <li>Complete rows or columns to clear them</li>
          <li>Build your score and unlock achievements</li>
          <li>Practice for free before joining tournaments!</li>
        </ul>
      </div>
    </div>
  );
};

export default GameBoard;
