document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.querySelector('.cells_container');
  const attemptsEl = document.getElementById('attempts_count');
  const matchesEl = document.getElementById('matches_count');
  const startBtn = document.getElementById('start_btn');
  const winMessage = document.getElementById('win_message');
  const radioButtons = document.querySelectorAll('input[name="difficulty"]');

  let pairsCount = 8; // Default normal mode
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let attempts = 0;
  let isLockGrid = false;

  function initGame() {
    // Reset state variables
    flippedCards = [];
    matchedPairs = 0;
    attempts = 0;
    isLockGrid = false;
    winMessage.classList.add('hidden');
    attemptsEl.textContent = `Attempts: ${attempts}`;
    matchesEl.textContent = `Matches: ${matchedPairs}`;
    gridContainer.innerHTML = '';

    // Determine grid columns based on level
    const totalTiles = pairsCount * 2;
    const cols = totalTiles <= 8 ? 4 : totalTiles <= 16 ? 4 : 8;
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // Generate & shuffle pairs
    const numbers = [];
    for (let i = 1; i <= pairsCount; i++) {
      numbers.push(i, i);
    }
    numbers.sort(() => Math.random() - 0.5);

    // Create DOM tiles
    cards = numbers.map((val, index) => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.val = val;
      cell.dataset.index = index;
      cell.textContent = '?';

      cell.addEventListener('click', () => handleCardClick(cell));
      gridContainer.appendChild(cell);
      return cell;
    });
  }

  function handleCardClick(cell) {
    // Prevent invalid clicks (Edge Cases)
    if (
      isLockGrid ||
      cell.classList.contains('flipped') ||
      cell.classList.contains('matched')
    ) {
      return;
    }

    // Flip the tile
    cell.classList.add('flipped');
    cell.textContent = cell.dataset.val;
    flippedCards.push(cell);

    if (flippedCards.length === 2) {
      checkMatch();
    }
  }

  function checkMatch() {
    isLockGrid = true;
    attempts++;
    attemptsEl.textContent = `Attempts: ${attempts}`;

    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.val === card2.dataset.val;

    if (isMatch) {
      card1.classList.add('matched');
      card2.classList.add('matched');
      matchedPairs++;
      matchesEl.textContent = `Matches: ${matchedPairs}`;
      flippedCards = [];
      isLockGrid = false;

      if (matchedPairs === pairsCount) {
        winMessage.classList.remove('hidden');
      }
    } else {
      setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.textContent = '?';
        card2.textContent = '?';
        flippedCards = [];
        isLockGrid = false;
      }, 1000);
    }
  }

  // Handle Radio Selection
  radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
      pairsCount = parseInt(e.target.value, 10);
      initGame();
    });
  });

  startBtn.addEventListener('click', initGame);

  // Initialize on first load
  initGame();
});
