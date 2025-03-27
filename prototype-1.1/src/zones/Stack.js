import { GameZone } from '../core/GameZone.js';
import { Card } from '../core/Card.js';

export class Stack extends GameZone {
  constructor() {
    super();
  }

  resolve(state) {
    const newStack = [...this.cards].reverse();
    this.cards = [];

    while (newStack.length) {
      const tempCard = new Card({});

      while (newStack.length) {
        const next = newStack.shift();

        if (!tempCard.hasNumber() && next.type === 'number') {
          tempCard.number = parseInt(next.number);
        } else if (!tempCard.hasColor() && next.type === 'color') {
          tempCard.color = next.color;
        } else if (tempCard.hasNumber() && next.type === 'number') {
          // Only allow one number add
          newStack.unshift(next); // Put it back
          break;
        } else if (tempCard.hasColor() && next.type === 'color') {
          // Skip extra colors
          continue;
        } else {
          // Other types or unusable — skip
          continue;
        }
      }

      if (!tempCard.isBlank()) {
        state.memory.add(tempCard);
        state.problem.attackers.push(tempCard); // assuming `attackers` exists
      }
    }
  }
}
