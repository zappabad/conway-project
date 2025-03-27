import random
from .card import DefaultCard
from .gamezone import AbstractGameZone

# Deck Logic
class Deck(AbstractGameZone):
    def __init__(self, x, y, cards):
        super().__init__(x, y)
        self.original = list(cards)
        self.cards = list(cards)
        self.shuffle()
        self.drop_into = False  # Cards shouldn't be dropped into the deck

    def shuffle(self):
        random.shuffle(self.cards)

    def draw_cards(self, n):
        drawn = []
        for _ in range(n):
            if not self.cards:
                self.shuffle()
            if self.cards:
                drawn.append(self.cards.pop())
        return drawn

    def handle_drop(self, card, from_zone):
        pass  # No-op, drop_into is already False



# Attack Logic
def attack_with_card(card, tree, memory, loot_counter):
    exposed = tree.get_exposed_nodes()
    color = card.color or 'red'
    number = card.number
    for node in exposed:
        if node.color == color and node.number == number:
            tree.beat_node(node.id)
            memory.insert(0, {'color': color, 'number': number})
            if node.loot:
                loot_counter[0] += node.loot
            return True
    memory.insert(0, {'color': color, 'number': number})
    return False


# Fusion Logic
def resolve_stack(stack, memory, tree, loot_counter):
    new_stack = list(reversed(stack))
    fused = []

    while new_stack:
        base = new_stack.pop()

        if not isinstance(base['number'], int):
            memory.insert(0, base)
            attack_with_card(base, tree, memory, loot_counter)
            continue

        fused_card = {
            'number': base['number'],
            'color': None,
            'hasColor': False,
            'hasNumber': True
        }

        if new_stack:
            next_card = new_stack[-1]
            if not fused_card['hasColor'] and next_card.get('color') and not next_card.get('number'):
                fused_card['color'] = next_card['color']
                fused_card['hasColor'] = True
                new_stack.pop()
            elif not fused_card['hasNumber'] and next_card.get('number'):
                fused_card['number'] += next_card['number']
                fused_card['hasNumber'] = True
                new_stack.pop()

        fused_obj = DefaultCard(fused_card['color'], fused_card['number'])
        memory.insert(0, {'color': fused_card['color'], 'number': fused_card['number']})
        attack_with_card(fused_obj, tree, memory, loot_counter)

    stack.clear()
