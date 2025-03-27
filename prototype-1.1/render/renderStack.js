export function renderStack(state) {
    const stackDiv = document.getElementById('stack');
    stackDiv.innerHTML = '';
  
    state.stack.getAll().forEach(card => {
      const el = document.createElement('div');
      el.className = `card ${card.color ? 'color-' + card.color : ''}`;
      el.textContent = card.color || card.number;
      stackDiv.appendChild(el);
    });
  }
  