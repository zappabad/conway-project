import { loadProblem } from './problem.js';
import { loadDeck } from './deck.js';

let tree, deck;
const handDiv = document.getElementById('hand');
const stackDiv = document.getElementById('stack');
const memoryDiv = document.getElementById('memory');
const treeDiv = document.getElementById('problem-tree');
const shipBtn = document.getElementById('ship-it');

let hand = [];
let stack = [];

function renderHand() {
  handDiv.innerHTML = '';
  hand.forEach((card, i) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.textContent = card.color || card.number;
    div.draggable = true;
    div.dataset.index = i;
    div.addEventListener('dragstart', e => {
      e.dataTransfer.setData('index', i);
    });
    handDiv.appendChild(div);
  });
}

function renderStack() {
  stackDiv.innerHTML = '';
  stack.forEach(card => {
    const div = document.createElement('div');
    div.className = 'card';
    div.textContent = card.color || card.number;
    stackDiv.appendChild(div);
  });
}

function renderMemory() {
  memoryDiv.innerHTML = '';
  deck.drawMemory().forEach(card => {
    const div = document.createElement('div');
    div.className = 'card memory';
    div.textContent = card.color + ' ' + card.number;
    memoryDiv.appendChild(div);
  });
}

stackDiv.addEventListener('dragover', e => e.preventDefault());
stackDiv.addEventListener('drop', e => {
  const index = e.dataTransfer.getData('index');
  const card = hand.splice(index, 1)[0];
  stack.push(card);
  renderHand();
  renderStack();
});

shipBtn.addEventListener('click', () => {
  // Resolve logic placeholder
  console.log('Resolving:', stack);

  // For each resolved card, try attacking exposed tree nodes
  const exposed = tree.getExposedNodes();
  if (exposed.length > 0) {
    const node = exposed[0]; // Simplified for now
    tree.removeNode(node.id);
    deck.addToMemory({ color: node.color, number: node.number });
    renderMemory();
  }
  stack = [];
  hand = deck.drawHand();
  renderHand();
  renderStack();
  tree.draw(treeDiv);
});

async function init() {
  tree = await loadProblem('data/problems.json', treeDiv);
  deck = await loadDeck('data/deck.json');
  hand = deck.drawHand();
  renderHand();
  tree.draw(treeDiv);
}

init();
