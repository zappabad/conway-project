export function renderHand(state) {
    const handDiv = document.getElementById('hand');
    handDiv.innerHTML = '';
  
    state.hand.getAll().forEach((card, idx) => {
      const el = document.createElement('div');
      el.className = `card ${card.color ? 'color-' + card.color : ''}`;
      el.textContent = card.color || card.number;
      el.setAttribute('draggable', true);
      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('source', 'hand');
        e.dataTransfer.setData('index', idx);
      });
      handDiv.appendChild(el);
    });
  }
  