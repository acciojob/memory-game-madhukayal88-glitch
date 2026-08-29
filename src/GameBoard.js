import React, { useState } from "react";
import GameBoard from "./GameBoard";

export default function App() {
  const [level, setLevel] = useState(null);

  return (
    <div>
      <section className="levels_container">
        <label>
          <input
            type="radio"
            id="easy"
            name="level"
            onChange={() => setLevel("easy")}
          /> Easy
        </label>
        <label>
          <input
            type="radio"
            id="normal"
            name="level"
            onChange={() => setLevel("normal")}
          /> Normal
        </label>
        <label>
          <input
            type="radio"
            id="hard"
            name="level"
            onChange={() => setLevel("hard")}
          /> Hard
        </label>
      </section>

      {level && <GameBoard level={level} />}
    </div>
  );
}
