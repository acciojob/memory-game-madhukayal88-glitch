import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pairsCount, setPairsCount] = useState(8); // Default to Normal mode (8 pairs / 16 tiles)
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isLockGrid, setIsLockGrid] = useState(false);

  // Initialize or reset game grid
  const initGame = (numPairs = pairsCount) => {
    setFlippedCards([]);
    setMatchedPairs(0);
    setAttempts(0);
    setIsLockGrid(false);

    // Create pair array and shuffle
    const numbers = [];
    for (let i = 1; i <= numPairs; i++) {
      numbers.push(i, i);
    }
    numbers.sort(() => Math.random() - 0.5);

    const newCards = numbers.map((val, index) => ({
      id: index,
      val: val,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(newCards);
  };

  useEffect(() => {
    initGame(pairsCount);
  }, [pairsCount]);

  const handleDifficultyChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setPairsCount(val);
  };

  const handleCardClick = (clickedCard) => {
    // Prevent clicking locked grid, already flipped, or already matched tiles
    if (
      isLockGrid ||
      clickedCard.isFlipped ||
      clickedCard.isMatched ||
      flippedCards.length >= 2
    ) {
      return;
    }

    // Flip card
    const updatedCards = cards.map((card) =>
      card.id === clickedCard.id ? { ...card, isFlipped: true } : card
    );
    setCards(updatedCards);

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    // If two cards are flipped, check match
    if (newFlipped.length === 2) {
      setIsLockGrid(true);
      setAttempts((prev) => prev + 1);

      const [first, second] = newFlipped;
      if (first.val === second.val) {
        // Match found
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.val === first.val ? { ...card, isMatched: true } : card
          )
        );
        setMatchedPairs((prev) => prev + 1);
        setFlippedCards([]);
        setIsLockGrid(false);
      } else {
        // Not a match: reset after delay
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === first.id || card.id === second.id
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsLockGrid(false);
        }, 1000);
      }
    }
  };

  const totalTiles = pairsCount * 2;
  const gridColumns = totalTiles <= 8 ? 4 : totalTiles <= 16 ? 4 : 8;

  return (
    <div className="game-wrapper">
      <h1>Memory Matching Game</h1>

      {/* Level Selection Container */}
      <div className="levels_container">
        <label>
          <input
            type="radio"
            name="difficulty"
            id="easy"
            value={4}
            checked={pairsCount === 4}
            onChange={handleDifficultyChange}
          />{' '}
          Easy (8 tiles)
        </label>
        <label>
          <input
            type="radio"
            name="difficulty"
            id="normal"
            value={8}
            checked={pairsCount === 8}
            onChange={handleDifficultyChange}
          />{' '}
          Normal (16 tiles)
        </label>
        <label>
          <input
            type="radio"
            name="difficulty"
            id="hard"
            value={16}
            checked={pairsCount === 16}
            onChange={handleDifficultyChange}
          />{' '}
          Hard (32 tiles)
        </label>
        <button id="start_btn" onClick={() => initGame(pairsCount)}>
          Start / Restart Game
        </button>
      </div>

      {/* Stats Display */}
      <div className="stats_container">
        <span id="attempts_count">Attempts: {attempts}</span> |{' '}
        <span id="matches_count">Matches: {matchedPairs}</span>
      </div>

      {/* Game Grid Container */}
      <div
        className="cells_container"
        style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className={`cell ${card.isFlipped ? 'flipped' : ''} ${
              card.isMatched ? 'matched' : ''
            }`}
            onClick={() => handleCardClick(card)}
          >
            {card.isFlipped || card.isMatched ? card.val : '?'}
          </div>
        ))}
      </div>

      {/* Win Banner */}
      {matchedPairs === pairsCount && (
        <div id="win_message">🎉 Game Completed! All pairs matched!</div>
      )}
    </div>
  );
}

export default App;
