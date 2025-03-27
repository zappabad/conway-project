import { initGameState } from './src/init/initGameState.js';
import { renderHand } from './render/renderHand.js';
import { renderStack } from './render/renderStack.js';
import { renderMemory } from './render/renderMemory.js';
import { renderTree } from './render/renderTree.js';
import { attack } from './src/logic/attack.js';

let gameState;

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

  document.getElementById('loot-counter').textContent = `Loot: ${gameState.loot}`;
}

function onShipIt() {
  gameState.stack.resolve(gameState);           // create memory cards + fill attack queue
  attack(gameState.problem, gameState.attackers, gameState);
  render();
}

async function init() {
  gameState = await initGameState();
  render();

  document.getElementById('stack').ondragover = e => e.preventDefault();
  document.getElementById('stack').ondrop = e => {
    const source = e.dataTransfer.getData('source');
    const index = parseInt(e.dataTransfer.getData('index'), 10);
    if (source === 'hand') {
      gameState.stack.add(gameState.hand.remove(index));
    } else if (source === 'memory') {
      const card = structuredClone(gameState.memory.cards[index]);
      gameState.stack.add(card);
    }
    render();
  };

  document.getElementById('ship-it').addEventListener('click', onShipIt);
}

window.onload = init;
