# Node.js Memory Matching Game

A browser-based number matching game served by Node.js and Express.

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:8080](http://localhost:8080).

## Gameplay

- Select **Easy** (8 tiles / 4 pairs), **Normal** (16 tiles / 8 pairs), or **Hard** (32 tiles / 16 pairs).
- Reveal two tiles to make one attempt.
- A correct pair remains visible; an incorrect pair is concealed after a short delay.
- The completion message reports the total number of valid attempts.

The level selector uses `.levels_container`; its radio controls are `#easy`, `#normal`, and `#hard`. The generated tiles live in `.cells_container`.
