class ProblemNode {
  constructor(id, color, number, children = []) {
    this.id = id;
    this.color = color;
    this.number = number;
    this.children = children.map(
      child => new ProblemNode(child.id, child.color, child.number, child.children)
    );
    this.beaten = false;
  }

  isExposed() {
    return !this.beaten && this.children.every(c => c.beaten);
  }
}

export class Problem {
  constructor(data) {
    this.root = new ProblemNode(data.root.id, data.root.color, data.root.number, data.root.children);
  }

  getExposedNodes() {
    const exposed = [];
    const traverse = node => {
      if (node.isExposed()) exposed.push(node);
      else node.children.forEach(traverse);
    };
    traverse(this.root);
    return exposed;
  }

  beatNode(id) {
    const markBeaten = node => {
      if (node.id === id) {
        node.beaten = true;
        return true;
      }
      return node.children.some(markBeaten);
    };
    markBeaten(this.root);
  }
}
