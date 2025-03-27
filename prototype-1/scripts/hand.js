export function drawHand(state) {
    const toDraw = 8 - state.hand.length;
    if (toDraw > 0) {
      state.hand.push(...state.deck.draw(toDraw));
    }
  }
  
  export function renderHand(state) {
    const handDiv = document.getElementById('hand');
    handDiv.innerHTML = '';
  
    state.hand.forEach((card, idx) => {
      const el = document.createElement('div');
      el.className = `card ${card.type === 'color' ? 'color-' + card.color : ''}`;
      el.textContent = card.color || card.number;
      el.setAttribute('draggable', true);
      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('source', 'hand');
        e.dataTransfer.setData('index', idx);
      });
      handDiv.appendChild(el);
    });
  }
  