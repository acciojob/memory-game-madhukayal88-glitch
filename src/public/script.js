// ---------- Configuration ----------
const DIFFICULTY_CONFIG = {
  easy:   { tiles: 8,  pairs: 4  },
  normal: { tiles: 16, pairs: 8  },
  hard:   { tiles: 32, pairs: 16 }
};

// ---------- State ----------
let state = {
  difficulty: 'easy',
  tiles: [],
  firstTile: null,
  secondTile: null,
  lockBoard: false,
  attempts: 0,
  matches: 0,
  totalPairs: 4
};

// ---------- DOM References ----------
const cellsContainer = document.getElementById('cells_container');
const attemptsEl = document.getElementById('attempts');
const matchesEl = document.getElementById('matches');
const totalPairsEl = document.getElementById('total-pairs');
const winMessageEl = document.getElementById('win-message');
const finalAttemptsEl = document.getElementById('final-attempts');
const restartBtn = document.getElementById('restart');
const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');

// ---------- Helpers ----------
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
  return shuffle(values);
}

// ---------- Game Setup ----------
function startGame(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];
  state = {
    difficulty,
    tiles: generateTiles(config.pairs),
    firstTile: null,
    secondTile: null,
    lockBoard: false,
    attempts: 0,
    matches: 0,
    totalPairs: config.pairs
  };

  attemptsEl.textContent = '0';
  matchesEl.textContent = '0';
  totalPairsEl.textContent = config.pairs;
  winMessageEl.classList.add('hidden');

  renderBoard();
}

function renderBoard() {
  cellsContainer.innerHTML = '';
  cellsContainer.className = `cells_container ${state.difficulty}`;

  state.tiles.forEach((value, index) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = index;
    cell.dataset.value = value;
    cell.textContent = ''; // hidden by default
    cell.addEventListener('click', () => handleTileClick(cell));
    cellsContainer.appendChild(cell);
  });
}

// ---------- Game Logic ----------
function handleTileClick(cell) {
  // Ignore if board is locked, cell already flipped/matched, or same tile clicked twice
  if (state.lockBoard) return;
  if (cell.classList.contains('flipped') || cell.classList.contains('matched')) return;

  // Reveal tile
  cell.classList.add('flipped');
  cell.textContent = cell.dataset.value;

  if (!state.firstTile) {
    state.firstTile = cell;
    return;
  }

  // Second tile selected
  state.secondTile = cell;
  state.attempts++;
  attemptsEl.textContent = state.attempts;

  checkMatch();
}

function checkMatch() {
  const first = state.firstTile;
  const second = state.secondTile;

  const isMatch = first.dataset.value === second.dataset.value;

  if (isMatch) {
    first.classList.add('matched');
    second.classList.add('matched');
    first.classList.remove('flipped');
    second.classList.remove('flipped');

    state.matches++;
    matchesEl.textContent = state.matches;

    resetTurn();

    if (state.matches === state.totalPairs) {
      endGame();
    }
  } else {
    // Lock board briefly to prevent extra clicks
    state.lockBoard = true;
    setTimeout(() => {
      first.classList.remove('flipped');
      second.classList.remove('flipped');
      first.textContent = '';
      second.textContent = '';
      resetTurn();
    }, 800);
  }
}

function resetTurn() {
  state.firstTile = null;
  state.secondTile = null;
  state.lockBoard = false;
}

function endGame() {
  winMessageEl.classList.remove('hidden');
  finalAttemptsEl.textContent = state.attempts;
}

// ---------- Event Listeners ----------
difficultyRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.checked) {
      startGame(e.target.value);
    }
  });
});

restartBtn.addEventListener('click', () => {
  startGame(state.difficulty);
});

// ---------- Init ----------
startGame('easy');
