(function () {
  'use strict';

  // ---------- Configuration ----------
  const LEVELS = {
    easy: { tiles: 8, pairs: 4, cols: 4 },
    normal: { tiles: 16, pairs: 8, cols: 4 },
    hard: { tiles: 32, pairs: 16, cols: 8 }
  };

  // ---------- State ----------
  let state = {
    level: 'easy',
    tiles: [],          // array of tile objects { id, value, matched, revealed }
    firstPick: null,    // index of first flipped tile
    secondPick: null,   // index of second flipped tile
    lockBoard: false,   // prevents clicking during comparison
    attempts: 0,        // counts only valid attempts (2 tiles flipped)
    matches: 0,
    totalPairs: 4
  };

  // ---------- DOM Elements ----------
  const cellsContainer = document.getElementById('cells_container');
  const attemptsEl = document.getElementById('attempts');
  const matchesEl = document.getElementById('matches');
  const totalPairsEl = document.getElementById('total-pairs');
  const winMessageEl = document.getElementById('win-message');
  const restartBtn = document.getElementById('restart');
  const levelRadios = {
    easy: document.getElementById('easy'),
    normal: document.getElementById('normal'),
    hard: document.getElementById('hard')
  };

  // ---------- Utilities ----------
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function generateTiles(pairs) {
    const values = [];
    for (let i = 1; i <= pairs; i++) {
      values.push(i, i);
    }
    return shuffle(values).map((value, index) => ({
      id: index,
      value,
      matched: false,
      revealed: false
    }));
  }

  // ---------- Rendering ----------
  function renderBoard() {
    cellsContainer.innerHTML = '';
    cellsContainer.className = `cells_container ${state.level}`;

    state.tiles.forEach((tile, index) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = index;
      cell.dataset.value = tile.value;

      if (tile.matched) {
        cell.classList.add('matched');
      } else if (tile.revealed) {
        cell.classList.add('revealed');
        cell.textContent = tile.value;
      } else {
        cell.textContent = '';
      }

      cell.addEventListener('click', () => handleTileClick(index));
      cellsContainer.appendChild(cell);
    });
  }

  function updateStats() {
    attemptsEl.textContent = state.attempts;
    matchesEl.textContent = state.matches;
    totalPairsEl.textContent = state.totalPairs;
  }

  function updateCellUI(index) {
    const cell = cellsContainer.querySelector(`[data-index="${index}"]`);
    if (!cell) return;
    const tile = state.tiles[index];

    if (tile.matched) {
      cell.classList.add('matched');
      cell.classList.remove('revealed');
      cell.textContent = '';
    } else if (tile.revealed) {
      cell.classList.add('revealed');
      cell.textContent = tile.value;
    } else {
      cell.classList.remove('revealed', 'matched');
      cell.textContent = '';
    }
  }

  // ---------- Game Logic ----------
  function handleTileClick(index) {
    // Guard conditions
    if (state.lockBoard) return;
    const tile = state.tiles[index];
    if (tile.matched || tile.revealed) return;

    // Reveal the tile
    tile.revealed = true;
    updateCellUI(index);

    // First pick
    if (state.firstPick === null) {
      state.firstPick = index;
      return;
    }

    // Second pick
    state.secondPick = index;
    state.attempts++;
    updateStats();

    // Lock board while comparing
    state.lockBoard = true;
    checkMatch();
  }

  function checkMatch() {
    const firstTile = state.tiles[state.firstPick];
    const secondTile = state.tiles[state.secondPick];

    if (firstTile.value === secondTile.value) {
      // Match found
      firstTile.matched = true;
      secondTile.matched = true;
      state.matches++;
      updateStats();

      updateCellUI(state.firstPick);
      updateCellUI(state.secondPick);

      resetPicks();

      if (state.matches === state.totalPairs) {
        endGame();
      }
    } else {
      // No match — flip back after delay
      setTimeout(() => {
        firstTile.revealed = false;
        secondTile.revealed = false;

        updateCellUI(state.firstPick);
        updateCellUI(state.secondPick);

        resetPicks();
      }, 800);
    }
  }

  function resetPicks() {
    state.firstPick = null;
    state.secondPick = null;
    state.lockBoard = false;
  }

  function endGame() {
    winMessageEl.classList.remove('hidden');
    winMessageEl.textContent = `🎉 You Won in ${state.attempts} attempts! 🎉`;
  }

  // ---------- Game Setup ----------
  function startGame(level) {
    const config = LEVELS[level];
    state = {
      level,
      tiles: generateTiles(config.pairs),
      firstPick: null,
      secondPick: null,
      lockBoard: false,
      attempts: 0,
      matches: 0,
      totalPairs: config.pairs
    };

    winMessageEl.classList.add('hidden');
    renderBoard();
    updateStats();
  }

  // ---------- Event Listeners ----------
  Object.entries(levelRadios).forEach(([level, radio]) => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) startGame(level);
    });
  });

  restartBtn.addEventListener('click', () => {
    startGame(state.level);
  });

  // ---------- Init ----------
  startGame('easy');
})();
