import { Card } from '../core/Card.js';

export class TreeNode extends Card {
  constructor({ id, color, number, children = [], loot = 0 }) {
    super({ color, number });
    this.id = id;
    this.children = children.map(child => new TreeNode(child));
    this.beaten = false;
    this.loot = loot;
  }

  isExposed() {
    return !this.beaten && this.children.every(c => c.beaten);
  }

  beat() {
    this.beaten = true;
  }
}
