export class Card {
  constructor({ color = null, number = null, type = null }) {
    this.color = color;
    this.number = number;
    this.type = type || (color ? 'color' : 'number');
  }

  equals(other) {
    return this.color === other.color && this.number === other.number;
  }

  hasColor() {
    return this.color !== null;
  }

  hasNumber() {
    return this.number !== null;
  }

  isBlank() {
    return !this.hasColor() && !this.hasNumber();
  }
}
