(function () {
  'use strict';

  const LEVELS = {
    easy: { tiles: 8, pairs: 4, columns: 4 },
    normal: { tiles: 16, pairs: 8, columns: 4 },
    hard: { tiles: 32, pairs: 16, columns: 8 },
  };

  const state = {
    level: null,
    tiles: [],
    firstIndex: null,
    secondIndex: null,
    attempts: 0,
    matches: 0,
    totalPairs: 0,
    locked: false,
    started: false,
  };

  const els = {
    cellsContainer: document.getElementById('cells_container'),
    attempts: document.getElementById('attempts'),
    matches: document.getElementById('matches'),
    totalPairs: document.getElementById('total_pairs'),
    message: document.getElementById('message'),
    easy: document.getElementById('easy'),
    normal: document.getElementById('normal'),
    hard: document.getElementById('hard'),
  };

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function createDeck(pairs) {
    const deck = [];
    for (let i = 1; i <= pairs; i++) {
      deck.push(i);
      deck.push(i);
    }
    return shuffle(deck);
  }

  function resetState(level) {
    state.level = level;
    state.tiles = createDeck(LEVELS[level].pairs);
    state.firstIndex = null;
    state.secondIndex = null;
    state.attempts = 0;
    state.matches = 0;
    state.totalPairs = LEVELS[level].pairs;
    state.locked = false;
    state.started = true;
  }

  function updateStats() {
    els.attempts.textContent = state.attempts;
    els.matches.textContent = state.matches;
    els.totalPairs.textContent = state.totalPairs;
  }

  function renderBoard() {
    els.cellsContainer.innerHTML = '';
    els.cellsContainer.className = `cells_container ${state.level}`;

    state.tiles.forEach((value, index) => {
      const btn = document.createElement('button');
      btn.classList.add('cell');
      btn.dataset.index = index;
      btn.dataset.value = value;
      btn.textContent = value;
      btn.setAttribute('aria-label', 'Memory tile');
      btn.addEventListener('click', () => handleTileClick(index, btn));
      els.cellsContainer.appendChild(btn);
    });
  }

  function handleTileClick(index, btn) {
    if (!state.started || state.locked) return;
    if (btn.classList.contains('flipped') || btn.classList.contains('matched')) return;

    // Prevent clicking the same tile twice as the same selection
    if (state.firstIndex === index) return;

    btn.classList.add('flipped');

    if (state.firstIndex === null) {
      state.firstIndex = index;
      return;
    }

    state.secondIndex = index;
    state.attempts += 1;
    updateStats();

    checkMatch();
  }

  function checkMatch() {
    const firstVal = state.tiles[state.firstIndex];
    const secondVal = state.tiles[state.secondIndex];

    if (firstVal === secondVal) {
      // Match
      const firstEl = els.cellsContainer.querySelector(`[data-index="${state.firstIndex}"]`);
      const secondEl = els.cellsContainer.querySelector(`[data-index="${state.secondIndex}"]`);
      firstEl.classList.remove('flipped');
      secondEl.classList.remove('flipped');
      firstEl.classList.add('matched');
      secondEl.classList.add('matched');

      state.matches += 1;
      updateStats();
      resetSelection();

      if (state.matches === state.totalPairs) {
        endGame();
      }
    } else {
      // No match - lock briefly and flip back
      state.locked = true;
      setTimeout(() => {
        const firstEl = els.cellsContainer.querySelector(`[data-index="${state.firstIndex}"]`);
        const secondEl = els.cellsContainer.querySelector(`[data-index="${state.secondIndex}"]`);
        if (firstEl) firstEl.classList.remove('flipped');
        if (secondEl) secondEl.classList.remove('flipped');
        resetSelection();
        state.locked = false;
      }, 800);
    }
  }

  function resetSelection() {
    state.firstIndex = null;
    state.secondIndex = null;
  }

  function endGame() {
    state.started = false;
    els.message.textContent = `🎉 You solved it in ${state.attempts} attempts!`;
  }

  function startGame(level) {
    if (!level) return;
    els.message.textContent = '';
    resetState(level);
    updateStats();
    renderBoard();
  }

  els.easy.addEventListener('change', () => startGame('easy'));
  els.normal.addEventListener('change', () => startGame('normal'));
  els.hard.addEventListener('change', () => startGame('hard'));
})();
