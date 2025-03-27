export class Deck {
  constructor(cards) {
    this.original = [...cards];
    this.cards = [...cards];
  }

  draw(n = 8) {
    const drawn = [];
    for (let i = 0; i < n; i++) {
      if (this.cards.length === 0) this.shuffle();
      drawn.push(this.cards.pop());
    }
    return drawn;
  }

  shuffle() {
    this.cards = [...this.original];
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
}
