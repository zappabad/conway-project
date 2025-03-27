import { loadJSON } from './utils.js';

export class ProblemTree {
  constructor(data) {
    this.nodes = {};
    data.nodes.forEach(node => {
      this.nodes[node.id] = { ...node, parent: null };
    });
    data.nodes.forEach(node => {
      node.children.forEach(childId => {
        this.nodes[childId].parent = node.id;
      });
    });
    this.root = data.nodes.find(n => n.value === 'root');
  }

  getExposedNodes() {
    return Object.values(this.nodes).filter(node => {
      return !node.children.length || node.children.every(id => !(id in this.nodes));
    });
  }

  removeNode(nodeId) {
    delete this.nodes[nodeId];
  }

  draw(container) {
    // Just for prototyping: basic display
    container.innerHTML = '';
    const exposed = this.getExposedNodes();
    exposed.forEach(node => {
      const div = document.createElement('div');
      div.className = 'node';
      div.textContent = `${node.color} ${node.number}`;
      div.dataset.id = node.id;
      container.appendChild(div);
    });
  }
}

export async function loadProblem(path, container) {
  const data = await loadJSON(path);
  const tree = new ProblemTree(data.problems[0]);
  tree.draw(container);
  return tree;
}