export function renderMemory(state) {
    const memoryDiv = document.getElementById('memory');
    memoryDiv.innerHTML = '';
  
    state.memory.getAll().forEach((card, idx) => {
      const el = document.createElement('div');
      el.className = `card ${card.color ? 'color-' + card.color : ''}`;
      el.textContent = card.color || card.number;
      el.setAttribute('draggable', true);
      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('source', 'memory');
        e.dataTransfer.setData('index', idx);
      });
      memoryDiv.appendChild(el);
    });
  }
  