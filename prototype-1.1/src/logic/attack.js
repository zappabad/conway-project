export function attack(treeZone, attackQueue, state) {
    const exposed = treeZone.getExposedNodes();
  
    for (const attacker of attackQueue) {
      for (const node of exposed) {
        if (attacker.color === node.color && attacker.number === node.number) {
          node.beat();
          state.loot += node.loot || 0;
          break; // each attacker attacks only once
        }
      }
    }
  
    // Clear the queue after attack
    attackQueue.length = 0;
  }
  