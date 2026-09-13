(function () {
  'use strict';

  const LEVELS = {
    easy:   { pairs: 4  },
    normal: { pairs: 8  },
    hard:   { pairs: 16 }
  };

  const state = {
    level: 'easy',
    tiles: [],
    firstPick: null,
    secondPick: null,
    lockBoard: false,
    tries: 0,
    matched: 0,
    totalPairs: 4
  };

  // DOM
  const landingPage = document.getElementById('landing-page');
  const gamePage = document.getElementById('game-page');
  const cellsContainer = document.getElementById('cells_container');
  const triesEl = document.getElementById('tries');
  const solvedMsg = document.getElementById('solved-msg');
  const newGameBtn = document.getElementById('new-game-btn');
  const startBtn = document.getElementById('start-btn');

  // ---------- Helpers ----------
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function generateTiles(pairs) {
    const values = [];
    for (let i = 0; i < pairs; i++) {
      values.push(i, i); // 0,0,1,1,2,2,...
    }
    return shuffle(values).map((value, index) => ({
      id: index,
      value,
      matched: false,
      revealed: false
    }));
  }

  // ---------- Render ----------
  function renderBoard() {
    cellsContainer.innerHTML = '';
    cellsContainer.className = 'cells_container ' + state.level;

    state.tiles.forEach((tile, index) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = index;
      cell.dataset.value = tile.value;

      if (tile.matched || tile.revealed) {
        cell.textContent = tile.value;
      } else {
        cell.textContent = '';
      }

      if (tile.matched) cell.classList.add('matched');

      cell.addEventListener('click', () => handleClick(index));
      cellsContainer.appendChild(cell);
    });
  }

  function updateCell(index) {
    const cell = cellsContainer.querySelector(`[data-index="${index}"]`);
    if (!cell) return;
    const tile = state.tiles[index];

    if (tile.matched || tile.revealed) {
      cell.textContent = tile.value;
    } else {
      cell.textContent = '';
    }
    if (tile.matched) cell.classList.add('matched');
  }

  function updateTries() {
    triesEl.textContent = state.tries;
  }

  // ---------- Game Logic ----------
  function handleClick(index) {
    if (state.lockBoard) return;
    const tile = state.tiles[index];
    if (tile.matched || tile.revealed) return;

    tile.revealed = true;
    updateCell(index);

    if (state.firstPick === null) {
      state.firstPick = index;
      return;
    }

    // Second pick
    state.secondPick = index;
    state.tries++;
    updateTries();

    state.lockBoard = true;
    checkMatch();
  }

  function checkMatch() {
    const a = state.tiles[state.firstPick];
    const b = state.tiles[state.secondPick];

    if (a.value === b.value) {
      a.matched = true;
      b.matched = true;
      state.matched++;
      updateCell(state.firstPick);
      updateCell(state.secondPick);
      resetPicks();

      if (state.matched === state.totalPairs) {
        endGame();
      }
    } else {
      setTimeout(() => {
        a.revealed = false;
        b.revealed = false;
        updateCell(state.firstPick);
        updateCell(state.secondPick);
        resetPicks();
      }, 700);
    }
  }

  function resetPicks() {
    state.firstPick = null;
    state.secondPick = null;
    state.lockBoard = false;
  }

  function endGame() {
    solvedMsg.classList.remove('hidden');
    newGameBtn.classList.remove('hidden');
  }

  // ---------- Setup ----------
  function startGame(level) {
    const cfg = LEVELS[level];
    state.level = level;
    state.tiles = generateTiles(cfg.pairs);
    state.firstPick = null;
    state.secondPick = null;
    state.lockBoard = false;
    state.tries = 0;
    state.matched = 0;
    state.totalPairs = cfg.pairs;

    solvedMsg.classList.add('hidden');
    newGameBtn.classList.add('hidden');

    landingPage.classList.add('hidden');
    gamePage.classList.remove('hidden');

    renderBoard();
    updateTries();
  }

  // ---------- Events ----------
  startBtn.addEventListener('click', () => {
    const selected = document.querySelector('input[name="level"]:checked');
    startGame(selected ? selected.value : 'easy');
  });

  newGameBtn.addEventListener('click', () => {
    // Go back to landing page
    gamePage.classList.add('hidden');
    landingPage.classList.remove('hidden');
  });
})();
