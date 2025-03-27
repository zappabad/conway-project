import { shuffleArray, loadJSON } from './utils.js';

export class Deck {
  constructor(cards) {
    this.cards = shuffleArray(cards.slice());
    this.memory = [];
  }

  drawHand(size = 8) {
    return this.cards.splice(0, size);
  }

  addToMemory(card) {
    this.memory.push(card);
  }

  drawMemory() {
    return this.memory;
  }
}

export async function loadDeck(path) {
  const data = await loadJSON(path);
  return new Deck(data.deck);
}