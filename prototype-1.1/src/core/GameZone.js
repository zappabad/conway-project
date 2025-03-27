export class GameZone {
    constructor() {
      this.cards = [];
    }
  
    add(card) {
      this.cards.push(card);
    }
  
    remove(index) {
      return this.cards.splice(index, 1)[0];
    }
  
    getAll() {
      return this.cards;
    }
  
    isEmpty() {
      return this.cards.length === 0;
    }
  
    contains(card) {
      return this.cards.includes(card);
    }
  
    canPlay(card) {
      return true;
    }
  }
  