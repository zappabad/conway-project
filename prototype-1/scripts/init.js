import { Problem } from './problem.js';
import { Deck } from './deck.js';

export async function initGameState() {
  const [problemData, deckData] = await Promise.all([
    fetch('../data/problems.json').then(r => r.json()),
    fetch('../data/deck.json').then(r => r.json())
  ]);

  const problem = new Problem(problemData.problems[0]);
  const deck = new Deck(deckData.deck);
  deck.shuffle();

  return {
    problem,
    deck,
    hand: [],
    memory: [],
    stack: [],
    loot: 0
  };
}
