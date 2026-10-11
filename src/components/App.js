import React, { useState, useEffect, useRef } from "react";
import "./../styles/App.css";

/**
 * Difficulty configuration.
 * Each level defines how many pairs (and therefore tiles) are used.
 */
const LEVELS = {
  easy: { pairs: 4, label: "Easy Mode" },
  normal: { pairs: 8, label: "Normal Mode" },
  hard: { pairs: 16, label: "Hard Mode" },
};

/**
 * Fisher-Yates shuffle. Returns a new array so we never mutate state.
 */
const shuffle = (items) => {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Build a fresh, shuffled deck for the given level.
 * Each tile keeps a stable id (its index) so React keys stay consistent.
 */
const createDeck = (level) => {
  const { pairs } = LEVELS[level];
  const values = [];
  for (let value = 1; value <= pairs; value += 1) {
    values.push(value, value);
  }
  return shuffle(values).map((value, index) => ({
    id: index,
    value,
    matched: false,
  }));
};

const App = () => {
  const [level, setLevel] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [locked, setLocked] = useState(false);
  const revealTimer = useRef(null);

  const clearRevealTimer = () => {
    if (revealTimer.current) {
      clearTimeout(revealTimer.current);
      revealTimer.current = null;
    }
  };

  /**
   * Start (or restart) a game for the given level. Selecting a level
   * immediately begins play so the board reacts right away.
   */
  const startGame = (nextLevel) => {
    if (!nextLevel) return;
    clearRevealTimer();
    setLevel(nextLevel);
    setTiles(createDeck(nextLevel));
    setFlipped([]);
    setAttempts(0);
    setSolved(false);
    setLocked(false);
  };

  const handleLevelChange = (event) => {
    startGame(event.target.value);
  };

  const handleStartClick = () => {
    if (level) startGame(level);
  };

  const handleNewGame = () => {
    clearRevealTimer();
    setLevel(null);
    setTiles([]);
    setFlipped([]);
    setAttempts(0);
    setSolved(false);
    setLocked(false);
  };

  const handleTileClick = (id) => {
    // Ignore clicks while a mismatch is being revealed, on an already
    // flipped tile, on a matched tile, or when two tiles are already up.
    if (locked) return;
    if (flipped.includes(id)) return;
    if (flipped.length >= 2) return;

    const tile = tiles.find((item) => item.id === id);
    if (!tile || tile.matched) return;

    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setAttempts((count) => count + 1);
      const first = tiles.find((item) => item.id === nextFlipped[0]);
      const second = tiles.find((item) => item.id === nextFlipped[1]);

      if (first.value === second.value) {
        setTiles((prev) =>
          prev.map((item) =>
            item.id === first.id || item.id === second.id
              ? { ...item, matched: true }
              : item
          )
        );
        setFlipped([]);
      } else {
        // Keep both tiles visible briefly, then hide them again.
        setLocked(true);
        revealTimer.current = setTimeout(() => {
          setFlipped([]);
          setLocked(false);
          revealTimer.current = null;
        }, 600);
      }
    }
  };

  // Detect a win as soon as every tile has been matched.
  useEffect(() => {
    if (tiles.length > 0 && tiles.every((tile) => tile.matched)) {
      setSolved(true);
    }
  }, [tiles]);

  // Clean up any pending timer when the component unmounts.
  useEffect(() => clearRevealTimer, []);

  const isFaceUp = (tile) => tile.matched || flipped.includes(tile.id);
  const matchedPairs = tiles.filter((tile) => tile.matched).length / 2;
  const totalPairs = level ? LEVELS[level].pairs : 0;

  return (
    <div id="main" className="app">
      <div className="levels_container">
        {!level && <h1 className="welcome">Welcome!</h1>}
        {!level && (
          <p className="instructions">
            Choose a difficulty and match every pair.
          </p>
        )}
        <div className="level-options">
          {Object.keys(LEVELS).map((key) => (
            <label key={key} className="level-option" htmlFor={key}>
              <input
                type="radio"
                id={key}
                name="level"
                value={key}
                checked={level === key}
                onChange={handleLevelChange}
              />
              <span className="level-name">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <span className="level-count">{LEVELS[key].pairs * 2} tiles</span>
            </label>
          ))}
        </div>
        <button
          id="start-button"
          type="button"
          className="start-button"
          onClick={handleStartClick}
          disabled={!level}
        >
          Start
        </button>
      </div>

      {level && (
        <div className="game">
          <h1 className="game-title">Memory Game</h1>
          <h2 className="mode-heading">{LEVELS[level].label}</h2>
          <div className="game-info">
            <span id="attempts" className="stat">
              Tries: {attempts}
            </span>
            <span className="stat">
              Matches: {matchedPairs}/{totalPairs}
            </span>
            {solved && (
              <span id="status-message" className="status">
                All Solved!
              </span>
            )}
          </div>

          <div className={`cells_container ${level}`}>
            {tiles.map((tile) => (
              <div
                key={tile.id}
                className={
                  "tile cell" +
                  (tile.matched ? " matched" : "") +
                  (isFaceUp(tile) ? " flipped" : "")
                }
                data-value={tile.value}
                data-id={tile.id}
                role="button"
                tabIndex={0}
                aria-label={
                  isFaceUp(tile) ? `Tile showing ${tile.value}` : "Hidden tile"
                }
                onClick={() => handleTileClick(tile.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleTileClick(tile.id);
                  }
                }}
              >
                <span className="tile-value">
                  {isFaceUp(tile) ? tile.value : ""}
                </span>
              </div>
            ))}
          </div>

          {solved && (
            <button
              id="new-game"
              type="button"
              className="new-game"
              onClick={handleNewGame}
            >
              New Game
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
