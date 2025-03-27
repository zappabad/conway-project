from abc import ABC, abstractmethod
import random
from typing import List, Optional, Callable
from core.card import DefaultCard

class AbstractGameZone:
    def __init__(self, max_size: int = 5):
        self.cards: List[DefaultCard] = []
        self.max_size = max_size

    def add_card(self, card: DefaultCard) -> None:
        self.cards.append(card)

    def remove_card(self, card: DefaultCard) -> None:
        if card in self.cards:
            self.cards.remove(card)

    def move_zones(self, card: DefaultCard, from_zone: 'AbstractGameZone', to_zone: 'AbstractGameZone') -> None:
        if card in from_zone.cards and len(to_zone.cards) < to_zone.max_size:
            from_zone.remove_card(card)
            to_zone.add_card(card)

class HandZone(AbstractGameZone):
    def play_to_stack(self, card: DefaultCard, stack_zone: 'StackZone') -> None:
        if card in self.cards and len(stack_zone.cards) < stack_zone.max_size:
            self.move_zones(card, self, stack_zone)
    
    def drag_to_discard(self, card: DefaultCard, discard_zone: 'DiscardZone') -> None:
        if card in self.cards:
            self.move_zones(card, self, discard_zone)

class MemoryZone(AbstractGameZone):
    def play_to_stack(self, card: DefaultCard, stack_zone: 'StackZone') -> None:
        if card in self.cards and len(stack_zone.cards) < stack_zone.max_size:
            self.move_zones(card, self, stack_zone)

class DeckZone(AbstractGameZone):
    pass

class StackZone(AbstractGameZone):
    pass

# A helper class to represent nodes in the ProblemZone tree.
class ProblemNode:
    def __init__(self, card: DefaultCard, children: Optional[List['ProblemNode']] = None):
        self.card = card
        self.children = children if children is not None else []
    
    def add_child(self, child: 'ProblemNode') -> None:
        self.children.append(child)
    
    def __repr__(self):
        return f"ProblemNode(card={self.card}, children={self.children})"

class ProblemZone:
    def __init__(self):
        self.root: Optional[ProblemNode] = None

    @staticmethod
    def generate_random_tree(depth: int, max_children: int, card_generator: Callable[[], DefaultCard]) -> 'ProblemZone':
        def generate_node(current_depth: int) -> Optional[ProblemNode]:
            if current_depth > depth:
                return None
            card = card_generator()
            num_children = random.randint(0, max_children)
            children = []
            for _ in range(num_children):
                child = generate_node(current_depth + 1)
                if child is not None:
                    children.append(child)
            return ProblemNode(card, children)
        
        instance = ProblemZone()
        instance.root = generate_node(1)
        return instance

    def __repr__(self):
        return f"ProblemZone(root={self.root})"