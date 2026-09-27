/**
 * app.js — Memory Matching Game logic.
 *
 * Architecture:
 *   - State object tracks level, tiles, attempts, pairsMatched, selected.
 *   - generateTiles(level) creates a deterministic set of numbers (1..N duplicated).
 *   - renderGrid() builds DOM cells with data-value attributes.
 *   - onCellClick handles selection, match check, mismatch, and game completion.
 *   - completeGame disables interaction and shows a win message.
 *
 * Exposed globals: `window.memoryGame` for test/debugging convenience.
 */

(function () {
  'use strict';

  // ===== Configuration =====
  const LEVEL_CONFIG = {
    easy:   { pairs: 4,  cols: 4 },
    normal: { pairs: 8,  cols: 4 },
    hard:   { pairs: 16, cols: 4 },
  };

  // ===== State =====
  let state = {
    level: 'easy',
    tiles: [],          // array of { value, el } — value is the number shown
    attempts: 0,
    pairsMatched: 0,
    selected: null,     // reference to the currently selected tile element
    gameSolved: false,
  };

  // ===== DOM References =====
  const gameBoard    = document.getElementById('game-board');
  const cellsContainer = document.querySelector('.cells_container');
  const attemptsEl   = document.getElementById('attempts');
  const statusMsg    = document.getElementById('status-message');
  const startButton  = document.getElementById('start-button');

  // ===== Helpers =====

  /**
   * Generate an array of numbers for a given level.
   * For N pairs, use numbers 1..N each appearing exactly twice.
   * Shuffle the array so pairs are not adjacent (deterministic shuffle via simple swap).
   *
   * @param {string} level - 'easy' | 'normal' | 'hard'
   * @returns {number[]} shuffled array of length N*2
   */
  function generateTiles(level) {
    const { pairs } = LEVEL_CONFIG[level];
    const numbers = [];
    for (let i = 1; i <= pairs; i++) {
      numbers.push(i, i);
    }

    // Fisher-Yates shuffle (simple, deterministic enough for a single run)
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    return numbers;
  }

  /**
   * Render the grid of tiles into the cells container.
   * Each tile gets:
   *   - class .cell
   *   - data-value attribute (the number)
   *   - textContent = the number
   *
   * @param {number[]} values - array of numbers to render
   */
  function renderGrid(values) {
    cellsContainer.innerHTML = '';
    state.tiles = [];

    values.forEach((value, index) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.textContent = value;
      cell.dataset.value = value;
      cell.dataset.index = index;
      cell.setAttribute('role', 'listitem');
      cell.setAttribute('aria-label', `Tile showing ${value}`);
      cell.addEventListener('click', () => onCellClick(cell));
      cellsContainer.appendChild(cell);

      state.tiles.push({ value, el: cell });
    });
  }

  /**
   * Update the attempts display in the DOM.
   */
  function updateAttemptsDisplay() {
    attemptsEl.textContent = `Attempts: ${state.attempts}`;
  }

  /**
   * Clear any selected state from the grid.
   */
  function clearSelection() {
    state.tiles.forEach(({ el }) => {
      el.classList.remove('selected', 'revealed');
    });
    state.selected = null;
  }

  /**
   * Handle a tile click.
   *
   * Behavior:
   *   - If game is solved, ignore.
   *   - If the clicked tile is already matched, ignore.
   *   - If the same tile is clicked twice, deselect and do NOT count an attempt.
   *   - If a first tile is selected and a second is clicked:
   *     - If same value → mark both matched, increment pairsMatched, check win.
   *     - If different value → increment attempts, reveal both briefly, then flip back.
   *
   * @param {HTMLElement} cell - the clicked tile element
   */
  function onCellClick(cell) {
    if (state.gameSolved) return;

    // Ignore clicks on already-matched tiles
    if (cell.classList.contains('matched')) return;

    // If no tile is currently selected, select this one
    if (!state.selected) {
      cell.classList.add('selected');
      state.selected = cell;
      return;
    }

    // If the same tile is clicked again, deselect it (no attempt counted)
    if (state.selected === cell) {
      cell.classList.remove('selected');
      state.selected = null;
      return;
    }

    // A second tile has been clicked — evaluate the pair
    const firstEl  = state.selected;
    const firstVal = parseInt(firstEl.dataset.value, 10);
    const secondVal = parseInt(cell.dataset.value, 10);

    // Deselect the first tile's highlight before processing
    firstEl.classList.remove('selected');
    state.selected = null;

    if (firstVal === secondVal) {
      // Correct match
      checkMatch(firstEl, cell);
    } else {
      // Mismatch
      handleMismatch(firstEl, cell);
    }
  }

  /**
   * Mark two tiles as matched.
   *
   * @param {HTMLElement} el1 - first matched tile
   * @param {HTMLElement} el2 - second matched tile
   */
  function checkMatch(el1, el2) {
    el1.classList.add('matched');
    el2.classList.add('matched');
    el1.style.pointerEvents = 'none';
    el2.style.pointerEvents = 'none';

    state.pairsMatched += 1;

    // Check if the game is complete
    const totalPairs = LEVEL_CONFIG[state.level].pairs;
    if (state.pairsMatched === totalPairs) {
      completeGame();
    }
  }

  /**
   * Handle a mismatch: reveal both tiles briefly, then flip back.
   * Increment the attempt counter.
   *
   * @param {HTMLElement} el1 - first tile
   * @param {HTMLElement} el2 - second tile
   */
  function handleMismatch(el1, el2) {
    state.attempts += 1;
    updateAttemptsDisplay();

    el1.classList.add('revealed');
    el2.classList.add('revealed');

    // After a short delay, flip both back
    setTimeout(() => {
      el1.classList.remove('revealed');
      el2.classList.remove('revealed');
    }, 600);
  }

  /**
   * Game is solved: show a win message and disable further interaction.
   */
  function completeGame() {
    state.gameSolved = true;
    statusMsg.textContent = `Solved in ${state.attempts} attempts! 🎉`;
    statusMsg.style.color = '#4ecdc4';

    // Disable all tiles
    state.tiles.forEach(({ el }) => {
      el.style.pointerEvents = 'none';
      el.classList.add('matched');
    });
  }

  // ===== Level / Start Handler =====

  /**
   * Start (or restart) the game with the currently selected level.
   */
  function startGame() {
    const selectedLevel = document.querySelector('input[name="level"]:checked').value;
    state.level = selectedLevel;
    state.attempts = 0;
    state.pairsMatched = 0;
    state.selected = null;
    state.gameSolved = false;

    statusMsg.textContent = '';
    updateAttemptsDisplay();

    const values = generateTiles(selectedLevel);
    renderGrid(values);

    // Show the game board
    gameBoard.style.display = 'flex';
    document.querySelector('.levels_container').style.display = 'none';
  }

  // ===== Event Wiring =====

  document.addEventListener('DOMContentLoaded', () => {
    startButton.addEventListener('click', startGame);

    // Optional: allow changing level via radio without clicking Start
    // (The Start button is the primary trigger; radios just update the checked value)
    document.querySelectorAll('input[name="level"]').forEach(radio => {
      radio.addEventListener('change', () => {
        // No action needed — startGame reads the checked value
      });
    });
  });

  // Expose minimal API for debugging / tests
  window.memoryGame = {
    state,
    generateTiles,
    startGame,
    onCellClick,
    checkMatch,
    handleMismatch,
    completeGame,
  };
})();
