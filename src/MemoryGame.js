import React, { useState, useEffect, useCallback } from 'react';

function MemoryGame() {
  const [level, setLevel] = useState('easy');
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const levels = {
    easy: { gridSize: 4, pairs: 4 },
    normal: { gridSize: 8, pairs: 8 },
    hard: { gridSize: 16, pairs: 16 }
  };

  const initGame = useCallback(() => {
    const config = levels[level];
    const pairCount = config.pairs;
    
    let cardValues = [];
    for (let i = 1; i <= pairCount; i++) {
      cardValues.push(i, i);
    }
    
    const shuffled = [...cardValues];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setCards(shuffled.map((value, index) => ({
      id: index,
      value: value,
      isFlipped: false,
      isMatched: false
    })));
    setFlippedIndices([]);
    setMatchedPairs(0);
    setAttempts(0);
    setGameComplete(false);
    setIsLocked(false);
    setStartTime(null);
    setElapsedTime(0);
  }, [level]);

  const handleCardClick = (index) => {
    if (isLocked) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length === 2) return;

    if (!startTime && !gameComplete) {
      setStartTime(Date.now());
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setAttempts(attempts + 1);
      
      const firstIndex = newFlipped[0];
      const secondIndex = newFlipped[1];
      
      if (cards[firstIndex].value === cards[secondIndex].value) {
        setTimeout(() => {
          const updatedCards = [...cards];
          updatedCards[firstIndex].isMatched = true;
          updatedCards[secondIndex].isMatched = true;
          setCards(updatedCards);
          setFlippedIndices([]);
          setIsLocked(false);
          
          const newMatchedPairs = matchedPairs + 1;
          setMatchedPairs(newMatchedPairs);
          
          if (newMatchedPairs === levels[level].pairs) {
            setGameComplete(true);
          }
        }, 500);
      } else {
        setTimeout(() => {
          const updatedCards = [...cards];
          updatedCards[firstIndex].isFlipped = false;
          updatedCards[secondIndex].isFlipped = false;
          setCards(updatedCards);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  useEffect(() => {
    let interval;
    if (startTime && !gameComplete) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, gameComplete]);

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
  };

  const handleReset = () => {
    initGame();
  };

  useEffect(() => {
    initGame();
  }, [level, initGame]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCardDisplay = (card) => {
    if (card.isMatched) return '✅';
    if (card.isFlipped) return card.value;
    return '?';
  };

  const getPairs = () => {
    return levels[level].pairs;
  };

  return (
    <div className="memory-game-container">
      <h1>🧠 Memory Game</h1>
      <p className="subtitle">Match pairs of numbers to win!</p>

      <div className="levels_container">
        <label className="level-label">Select Difficulty:</label>
        <div className="level-buttons">
          <label className="level-option">
            <input type="radio" id="easy" name="level" value="easy" checked={level === 'easy'} onChange={() => handleLevelChange('easy')} />
            Easy (4x4)
          </label>
          <label className="level-option">
            <input type="radio" id="normal" name="level" value="normal" checked={level === 'normal'} onChange={() => handleLevelChange('normal')} />
            Normal (8x8)
          </label>
          <label className="level-option">
            <input type="radio" id="hard" name="level" value="hard" checked={level === 'hard'} onChange={() => handleLevelChange('hard')} />
            Hard (16x16)
          </label>
        </div>
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">Pairs Matched:</span>
          <span className="stat-value">{matchedPairs} / {getPairs()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Attempts:</span>
          <span className="stat-value">{attempts}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Time:</span>
          <span className="stat-value">{formatTime(elapsedTime)}</span>
        </div>
        <button className="reset-btn" onClick={handleReset}>🔄 New Game</button>
      </div>

      <div 
        className="cells_container"
        style={{
          gridTemplateColumns: `repeat(${Math.sqrt(cards.length)}, 1fr)`,
          maxWidth: Math.sqrt(cards.length) * 80 + 'px'
        }}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`cell ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <span className="cell-content">{getCardDisplay(card)}</span>
          </div>
        ))}
      </div>

      {gameComplete && (
        <div className="game-complete-modal">
          <div className="modal-content">
            <h2>🎉 Congratulations!</h2>
            <p>You matched all {getPairs()} pairs!</p>
            <div className="final-stats">
              <p>Attempts: <strong>{attempts}</strong></p>
              <p>Time: <strong>{formatTime(elapsedTime)}</strong></p>
            </div>
            <button className="play-again-btn" onClick={handleReset}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoryGame;
