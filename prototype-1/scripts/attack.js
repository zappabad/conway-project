export function attackWithCard(card, state) {
  const { problem, memory } = state;
  const numbersToTry = [];

  if (typeof card.number === 'number') {
    numbersToTry.push(card.number);
    // If there's an ace mechanic, it can be added here later
  }

  const color = card.color || 'red';
  let attacked = false;
  const exposed = problem.getExposedNodes();

  for (const node of exposed) {
    if (node.color === color && numbersToTry.includes(node.number)) {
      problem.beatNode(node.id);
      memory.unshift({ color, number: node.number });
      if (node.loot) state.loot += node.loot;
      attacked = true;
      break;
    }
  }

  if (!attacked) {
    memory.unshift({ color, number: card.number });
  }
}
