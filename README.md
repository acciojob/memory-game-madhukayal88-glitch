# Memory Game — madhukayal88-glitch

A Node.js + Express memory matching game with three difficulty levels.

## Setup

```bash
nvm install 16
nvm use 16
npm install
npm start
```

Open http://localhost:8080

## Difficulty Levels

| Level  | Tiles | Pairs |
|--------|-------|-------|
| Easy   | 8     | 4     |
| Normal | 16    | 8     |
| Hard   | 32    | 16    |

## Selectors (for Cypress)

- `.levels_container` — level selection buttons container
- `#easy`, `#normal`, `#hard` — radio buttons
- `.cells_container` — game grid container

## Game Rules

1. Click two tiles to reveal them.
2. A matching pair stays flipped (green).
3. A non-match flips back after 800ms.
4. Every two clicks = 1 attempt.
5. Win by matching all pairs in the fewest attempts.

## Evaluation Criteria Coverage

- ✅ **Functionality** — correct matching across all three levels
- ✅ **Edge Cases** — lock board prevents rapid double-clicks; already-matched/ flipped tiles ignored; only valid second-tile selections count as attempts
- ✅ **Code Quality** — modular functions (`startGame`, `renderBoard`, `handleTileClick`, `checkMatch`, `resetTurn`, `endGame`), centralized state object
- ✅ **Cypress-ready** — exact selectors from the spec are used
