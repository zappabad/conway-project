export function renderTree(node, container) {
    if (node.beaten) return;
  
    const nodeEl = document.createElement('div');
    nodeEl.className = `tree-node`;
    nodeEl.innerHTML = `<div class="card color-${node.color}">${node.color} ${node.number}</div>`;
  
    const wrapper = document.createElement('div');
    wrapper.className = 'tree-group';
    wrapper.appendChild(nodeEl);
  
    if (node.children.length > 0) {
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-children';
      node.children.forEach(child => renderTree(child, childrenContainer));
      wrapper.appendChild(childrenContainer);
    }
  
    container.appendChild(wrapper);
  }
  