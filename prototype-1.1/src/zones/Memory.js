import { GameZone } from '../core/GameZone.js';

export class Memory extends GameZone {
  constructor() {
    super();
  }

  add(card) {
    this.cards.unshift(card); // Memory adds to top
  }
}
