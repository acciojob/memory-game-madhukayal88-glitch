// ---------- Configuration ----------
const LEVELS = {
  easy: { tiles: 8, pairs: 4 },
  normal: { tiles: 16, pairs: 8 },
  hard: { tiles: 32, pairs: 16 },
};

// ---------- State ----------
let currentLevel = 'easy';
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let attempts = 0;
let matches = 0;
let totalPairs = LEVELS.easy.pairs;

// ---------- DOM References ----------
const cellsContainer = document.getElementById('cells_container');
const attemptsEl = document.getElementById('attempts');
const matchesEl = document.getElementById('matches');
const totalPairsEl = document.getElementById('totalPairs');
const resetBtn = document.getElementById('resetBtn');
const levelRadios = document.querySelectorAll('input[name="level"]');

// ---------- Helper: shuffle array (Fisher-Yates) ----------
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ---------- Build deck ----------
function buildDeck(pairs) {
  const deck = [];
  for (let i = 1; i <= pairs; i++) {
    deck.push(i, i); // two of each number
  }
  return shuffle(deck);
}

// ---------- Render the board ----------
function renderBoard() {
  const { tiles, pairs } = LEVELS[currentLevel];
  totalPairs = pairs;
  cellsContainer.innerHTML = '';
  cellsContainer.className = `cells_container ${currentLevel}`;

  const deck = buildDeck(pairs);

  deck.forEach((value) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.value = value;
    cell.textContent = ''; // hidden by default
    cell.addEventListener('click', () => handleCardClick(cell));
    cellsContainer.appendChild(cell);
  });

  updateStats();
}

// ---------- Handle click on a card ----------
function handleCardClick(cell) {
  // Prevent clicking already flipped/matched cards or while board is locked
  if (
    lockBoard ||
    cell.classList.contains('flipped') ||
    cell.classList.contains('matched')
  ) {
    return;
  }

  // Flip the card
  cell.classList.add('flipped');
  cell.textContent = cell.dataset.value;

  if (!firstCard) {
    // First card of the pair
    firstCard = cell;
    return;
  }

  // Second card of the pair
  secondCard = cell;
  attempts++;
  updateStats();
  checkMatch();
}

// ---------- Check if two flipped cards match ----------
function checkMatch() {
  const isMatch = firstCard.dataset.value === secondCard.dataset.value;

  if (isMatch) {
    // Disable further clicks on matched cards
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matches++;
    updateStats();
    resetFlipped();
    checkWin();
  } else {
    // Lock board and flip back after a short delay
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      firstCard.textContent = '';
      secondCard.textContent = '';
      resetFlipped();
    }, 800);
  }
}

// ---------- Reset first/second card refs ----------
function resetFlipped() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

// ---------- Update stats display ----------
function updateStats() {
  attemptsEl.textContent = attempts;
  matchesEl.textContent = matches;
  totalPairsEl.textContent = totalPairs;
}

// ---------- Check win condition ----------
function checkWin() {
  if (matches === totalPairs) {
    setTimeout(() => {
      alert(`🎉 You won in ${attempts} attempts!`);
    }, 300);
  }
}

// ---------- Start / reset the game ----------
function startGame(level) {
  currentLevel = level;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  attempts = 0;
  matches = 0;
  renderBoard();
}

// ---------- Event listeners ----------
levelRadios.forEach((radio) => {
  radio.addEventListener('change', (e) => {
    if (e.target.checked) {
      startGame(e.target.value);
    }
  });
});

resetBtn.addEventListener('click', () => {
  startGame(currentLevel);
});

// ---------- Initialize ----------
startGame('easy');
