// game.js
import { initGameState } from './init.js';
import { drawHand, renderHand } from './hand.js';
import { renderStack, resolveStack } from './stack.js';
import { renderMemory } from './memory.js';
import { renderTree } from './tree.js';

let gameState;

async function initGame() {
  gameState = await initGameState();
  drawHand(gameState);
  render();
}

function render() {
  renderHand(gameState);
  renderStack(gameState);
  renderMemory(gameState);

  const problemDiv = document.getElementById('problem-tree');
  problemDiv.innerHTML = '';

  if (gameState.problem.root.beaten) {
    const winMessage = document.createElement('div');
    winMessage.textContent = 'You Win!';
    winMessage.style.fontSize = '2em';
    winMessage.style.color = 'lime';
    problemDiv.appendChild(winMessage);
  } else {
    renderTree(gameState.problem.root, problemDiv);
  }

  const stackDiv = document.getElementById('stack');
  stackDiv.ondragover = e => e.preventDefault();
  stackDiv.ondrop = e => {
    const source = e.dataTransfer.getData('source');
    const index = parseInt(e.dataTransfer.getData('index'));

    if (source === 'hand') {
      const card = gameState.hand.splice(index, 1)[0];
      gameState.stack.push(card);
    } else if (source === 'memory') {
      const card = { ...gameState.memory[index] }; // clone
      gameState.stack.push(card);
    }

    render();
  };

  const lootCounter = document.getElementById('loot-counter');
  if (lootCounter) {
    lootCounter.textContent = `Loot: ${gameState.loot}`;
  }
}

function onShipIt() {
  resolveStack(gameState);
  drawHand(gameState);
  render();
}

document.getElementById('ship-it').addEventListener('click', onShipIt);

window.onload = initGame;
