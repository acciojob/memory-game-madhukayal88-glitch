(() => {
  "use strict";

  const LEVELS = {
    easy: { pairs: 4 },
    normal: { pairs: 8 },
    hard: { pairs: 16 },
  };

  const grid = document.querySelector(".cells_container");
  const toolbar = document.querySelector(".game-toolbar");
  const emptyState = document.getElementById("empty-state");
  const attemptsNode = document.getElementById("attempts");
  const matchesNode = document.getElementById("matches");
  const result = document.getElementById("result");
  const resultText = result.querySelector("p");
  const restart = document.getElementById("restart");
  const levelInputs = document.querySelectorAll('input[name="level"]');

  let activeLevel = null;
  let firstTile = null;
  let secondTile = null;
  let attempts = 0;
  let matchedPairs = 0;
  let boardLocked = false;
  let resetTimer = null;

  function shuffle(values) {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }

  function createDeck(pairCount) {
    const values = [];
    for (let value = 1; value <= pairCount; value += 1) values.push(value, value);
    return shuffle(values);
  }

  function updateScore() {
    attemptsNode.textContent = attempts;
    matchesNode.innerHTML = `${matchedPairs} <i>/</i> ${LEVELS[activeLevel].pairs}`;
  }

  function clearSelection() {
    firstTile = null;
    secondTile = null;
    boardLocked = false;
  }

  function reveal(tile) {
    tile.classList.add("flipped");
    tile.textContent = tile.dataset.value;
    tile.setAttribute("aria-label", `Tile ${tile.dataset.value}`);
  }

  function hide(tile) {
    tile.classList.remove("flipped");
    tile.textContent = "";
    tile.setAttribute("aria-label", "Hidden tile");
  }

  function showCompletion() {
    const noun = attempts === 1 ? "attempt" : "attempts";
    resultText.textContent = `You completed ${activeLevel} mode in ${attempts} ${noun}.`;
    result.hidden = false;
  }

  function handleTileClick(tile) {
    if (boardLocked || tile.classList.contains("flipped") || tile.classList.contains("matched")) return;

    reveal(tile);
    if (!firstTile) {
      firstTile = tile;
      return;
    }

    secondTile = tile;
    attempts += 1;
    updateScore();

    if (firstTile.dataset.value === secondTile.dataset.value) {
      firstTile.classList.add("matched");
      secondTile.classList.add("matched");
      firstTile.disabled = true;
      secondTile.disabled = true;
      matchedPairs += 1;
      updateScore();
      clearSelection();
      if (matchedPairs === LEVELS[activeLevel].pairs) showCompletion();
      return;
    }

    boardLocked = true;
    resetTimer = window.setTimeout(() => {
      hide(firstTile);
      hide(secondTile);
      clearSelection();
      resetTimer = null;
    }, 700);
  }

  function startGame(level) {
    if (resetTimer) {
      window.clearTimeout(resetTimer);
      resetTimer = null;
    }

    activeLevel = level;
    attempts = 0;
    matchedPairs = 0;
    clearSelection();
    grid.replaceChildren();
    grid.className = `cells_container ${level}`;

    createDeck(LEVELS[level].pairs).forEach((value, index) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "cell";
      tile.dataset.value = String(value);
      tile.dataset.index = String(index);
      tile.setAttribute("aria-label", "Hidden tile");
      tile.addEventListener("click", () => handleTileClick(tile));
      grid.append(tile);
    });

    emptyState.hidden = true;
    toolbar.hidden = false;
    result.hidden = true;
    updateScore();
  }

  levelInputs.forEach((input) => {
    input.addEventListener("change", (event) => {
      if (event.target.checked) startGame(event.target.value);
    });
  });

  restart.addEventListener("click", () => {
    if (activeLevel) startGame(activeLevel);
  });
})();
