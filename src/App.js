'use strict';

const PAIRS_BY_LEVEL = { easy: 4, normal: 8, hard: 16 };

const landingEl = document.getElementById('landing');
const gameEl = document.getElementById('game');
const cellsContainer = document.querySelector('.cells_container');
const attemptsEl = document.getElementById('attempts');
const levelTitleEl = document.getElementById('level_title');
const statusEl = document.getElementById('status');

let currentLevel = null;
let firstTile = null;
let lockBoard = false;
let attempts = 0;
let matchedPairs = 0;
let totalPairs = 0;

// --- Level selection ---

document.querySelectorAll('.levels_container input[name="level"]').forEach((radio) => {
  radio.addEventListener('change', (event) => startGame(event.target.value));
});

document.getElementById('restart').addEventListener('click', () => {
  if (currentLevel) startGame(currentLevel);
});

document.getElementById('change_level').addEventListener('click', showLanding);

function startGame(level) {
  currentLevel = level;
  totalPairs = PAIRS_BY_LEVEL[level];
  matchedPairs = 0;
  attempts = 0;
  firstTile = null;
  lockBoard = false;

  attemptsEl.textContent = '0';
  levelTitleEl.textContent = level.charAt(0).toUpperCase() + level.slice(1);
  statusEl.classList.add('hidden');
  landingEl.classList.add('hidden');
  gameEl.classList.remove('hidden');

  renderTiles();
}

function showLanding() {
  currentLevel = null;
  gameEl.classList.add('hidden');
  landingEl.classList.remove('hidden');
  document.querySelectorAll('.levels_container input[name="level"]').forEach((r) => {
    r.checked = false;
  });
}

// --- Board ---

function renderTiles() {
  const numbers = [];
  for (let i = 1; i <= totalPairs; i += 1) {
    numbers.push(i, i);
  }
  shuffle(numbers);

  cellsContainer.innerHTML = '';
  cellsContainer.className = 'cells_container ' + currentLevel;

  numbers.forEach((number) => {
    const tile = document.createElement('div');
    tile.className = 'cell';
    tile.dataset.value = String(number);

    const label = document.createElement('span');
    label.className = 'tile_number';
    label.textContent = String(number);
    tile.appendChild(label);

    tile.addEventListener('click', () => handleTileClick(tile));
    cellsContainer.appendChild(tile);
  });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Gameplay ---

function handleTileClick(tile) {
  // Edge cases: ignore clicks while a mismatched pair is being shown,
  // on already matched tiles, or on the tile that is already flipped.
  if (lockBoard) return;
  if (tile.classList.contains('matched')) return;
  if (tile.classList.contains('flipped')) return;

  reveal(tile);

  if (!firstTile) {
    firstTile = tile;
    return;
  }

  // Second tile flipped: this counts as one complete attempt.
  attempts += 1;
  attemptsEl.textContent = String(attempts);

  if (firstTile.dataset.value === tile.dataset.value) {
    firstTile.classList.add('matched');
    tile.classList.add('matched');
    firstTile = null;
    matchedPairs += 1;
    if (matchedPairs === totalPairs) {
      statusEl.classList.remove('hidden');
    }
  } else {
    lockBoard = true;
    const first = firstTile;
    firstTile = null;
    setTimeout(() => {
      hide(first);
      hide(tile);
      lockBoard = false;
    }, 700);
  }
}

function reveal(tile) {
  tile.classList.add('flipped');
}

function hide(tile) {
  tile.classList.remove('flipped');
}
