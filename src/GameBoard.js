import React, { useState } from "react";

const levels = {
  easy: 4,
  normal: 8,
  hard: 16,
};

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

export default function GameBoard({ level }) {
  const totalPairs = levels[level];
  const [tiles, setTiles] = useState(() => {
    const nums = [];
    for (let i = 1; i <= totalPairs; i++) nums.push(i, i);
    return shuffle(nums).map((val, idx) => ({
      id: idx,
      value: val,
      revealed: false,
      matched: false,
    }));
  });

  const [firstPick, setFirstPick] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);

  const handleClick = (tile) => {
    if (tile.matched || tile.revealed) return;

    const newTiles = tiles.map((t) =>
      t.id === tile.id ? { ...t, revealed: true } : t
    );
    setTiles(newTiles);

    if (!firstPick) {
      setFirstPick(tile);
    } else {
      setAttempts(attempts + 1);
      if (firstPick.value === tile.value) {
        setTiles((prev) =>
          prev.map((t) =>
            t.value === tile.value ? { ...t, matched: true } : t
          )
        );
        setMatchedPairs(matchedPairs + 1);
        setFirstPick(null);
      } else {
        setTimeout(() => {
          setTiles((prev) =>
            prev.map((t) =>
              t.id === tile.id || t.id === firstPick.id
                ? { ...t, revealed: false }
                : t
            )
          );
          setFirstPick(null);
        }, 800);
      }
    }
  };

  const size = Math.sqrt(tiles.length);

  return (
    <section className="cells_container" style={{ gridTemplateColumns: `repeat(${size}, 60px)` }}>
      {tiles.map((tile) => (
        <div
          key={tile.id}
          className={`cell ${tile.matched ? "matched" : ""}`}
          onClick={() => handleClick(tile)}
        >
          {tile.revealed || tile.matched ? tile.value : ""}
        </div>
      ))}
      {matchedPairs === totalPairs && (
        <div className="result">🎉 All pairs matched in {attempts} attempts!</div>
      )}
    </section>
  );
}
