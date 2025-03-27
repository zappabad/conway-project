import { GameZone } from '../core/GameZone.js';
import { TreeNode } from './TreeNode.js';

export class TreeZone extends GameZone {
  constructor(rootData) {
    super();
    this.root = new TreeNode(rootData);
  }

  getExposedNodes() {
    const exposed = [];

    const traverse = (node) => {
      if (node.isExposed()) {
        exposed.push(node);
      } else {
        node.children.forEach(traverse);
      }
    };

    traverse(this.root);
    return exposed;
  }

  beatNodeById(id) {
    const traverse = (node) => {
      if (node.id === id) {
        node.beat();
        return true;
      }
      return node.children.some(traverse);
    };

    traverse(this.root);
  }
}
