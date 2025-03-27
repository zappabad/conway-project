import { attackWithCard } from './attack.js';

export function renderStack(state) {
    const stackDiv = document.getElementById('stack');
    stackDiv.innerHTML = '';
  
    state.stack.forEach(card => {
      const el = document.createElement('div');
      el.className = `card ${card.color ? 'color-' + card.color : ''}`;
      el.textContent = card.color || card.number;
      stackDiv.appendChild(el);
    });
  }
  export function resolveStack(state) {
    const { stack, memory, problem } = state;
    const newStack = [...stack].reverse(); // top of the stack is at the start
    const fused = [];
  
    while (newStack.length) {
      let base = newStack.shift();
  
      if (base.type !== 'number') {
        memory.unshift(base);
        attackWithCard(base, state);
        continue;
      }
  
      const card = {
        number: parseInt(base.number),
        color: null,
        hasColor: false,
        hasNumber: true
      };
  
      // Try to combine with next card
      const next = newStack[0];
      if (next) {
        if (!card.hasColor && next.type === 'color') {
          card.color = next.color;
          card.hasColor = true;
          newStack.shift();
        } else if (!card.hasNumber && next.type === 'number') {
          card.number += parseInt(next.number);
          card.hasNumber = true;
          newStack.shift();
        }
      }
  
      memory.unshift({ color: card.color, number: card.number });
      attackWithCard(card, state);
    }
  
    state.stack = [];
  }