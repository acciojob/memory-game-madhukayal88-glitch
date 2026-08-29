const levels = {
  easy: 4,
  normal: 8,
  hard: 16
};

const container = document.querySelector(".cells_container");
const startBtn = document.getElementById("startBtn");
let attempts = 0;
let firstPick = null;
let matchedPairs = 0;
let totalPairs = 0;

startBtn.addEventListener("click", startGame);

function startGame() {
  container.innerHTML = "";
  attempts = 0;
  matchedPairs = 0;
  firstPick = null;

  const level = document.querySelector("input[name='level']:checked");
  if (!level) {
    alert("Please select a difficulty level!");
    return;
  }

  totalPairs = levels[level.id];
  const tiles = generateTiles(totalPairs);
  renderGrid(tiles);
}

function generateTiles(pairs) {
  const numbers = [];
  for (let i = 1; i <= pairs; i++) {
    numbers.push(i, i); // each number twice
  }
  return shuffle(numbers);
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function renderGrid(tiles) {
  const size = Math.sqrt(tiles.length);
  container.style.gridTemplateColumns = `repeat(${size}, 60px)`;

  tiles.forEach(num => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.value = num;
    cell.textContent = "";
    cell.addEventListener("click", () => handleClick(cell));
    container.appendChild(cell);
  });
}

function handleClick(cell) {
  if (cell.classList.contains("matched") || cell.textContent) return;

  cell.textContent = cell.dataset.value;

  if (!firstPick) {
    firstPick = cell;
  } else {
    attempts++;
    if (firstPick.dataset.value === cell.dataset.value) {
      firstPick.classList.add("matched");
      cell.classList.add("matched");
      matchedPairs++;
      if (matchedPairs === totalPairs) {
        setTimeout(() => alert(`🎉 All pairs matched in ${attempts} attempts!`), 300);
      }
    } else {
      setTimeout(() => {
        firstPick.textContent = "";
        cell.textContent = "";
      }, 800);
    }
    firstPick = null;
  }
}
