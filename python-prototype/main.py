import pygame
import json
import os
import random
from typing import List, Optional, Callable
from core.card import AbstractCard, DefaultCard, colors as CARD_COLORS  # Import your card classes and color info

# ----------------------------
# Backend: Zone Implementations
# ----------------------------

class AbstractGameZone:
    def __init__(self, max_size: int = 5):
        self.cards: List[AbstractCard] = []
        self.max_size = max_size

    def add_card(self, card: AbstractCard) -> None:
        self.cards.append(card)

    def remove_card(self, card: AbstractCard) -> None:
        if card in self.cards:
            self.cards.remove(card)

    def move_zones(self, card: AbstractCard, from_zone: 'AbstractGameZone', to_zone: 'AbstractGameZone') -> None:
        if card in from_zone.cards and len(to_zone.cards) < to_zone.max_size:
            from_zone.remove_card(card)
            to_zone.add_card(card)

class HandZone(AbstractGameZone):
    def play_to_stack(self, card: AbstractCard, stack_zone: 'StackZone') -> None:
        if card in self.cards and len(stack_zone.cards) < stack_zone.max_size:
            self.move_zones(card, self, stack_zone)
    
    def drag_to_discard(self, card: AbstractCard, discard_zone: 'DiscardZone') -> None:
        if card in self.cards:
            self.move_zones(card, self, discard_zone)

class MemoryZone(AbstractGameZone):
    def play_to_stack(self, card: AbstractCard, stack_zone: 'StackZone') -> None:
        if card in self.cards and len(stack_zone.cards) < stack_zone.max_size:
            self.move_zones(card, self, stack_zone)

class DeckZone(AbstractGameZone):
    pass

class StackZone(AbstractGameZone):
    pass

class DiscardZone(AbstractGameZone):
    pass

# A helper class to represent nodes in the ProblemZone tree.
class ProblemNode:
    def __init__(self, card: AbstractCard, children: Optional[List['ProblemNode']] = None):
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
    def generate_random_tree(depth: int, max_children: int, card_generator: Callable[[], AbstractCard]) -> 'ProblemZone':
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

# ----------------------------
# Helper Functions to Load JSON Data
# ----------------------------

def load_deck(filepath: str) -> List[AbstractCard]:
    """Assumes deck.json is a list of card attribute dicts."""
    cards = []
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            data = json.load(f)
            for card_info in data:
                # Create a DefaultCard using provided attributes.
                card = DefaultCard(
                    color=card_info.get("color"),
                    number=card_info.get("number"),
                    edition=card_info.get("edition"),
                    stamp=card_info.get("stamp"),
                    zone=card_info.get("zone")
                )
                cards.append(card)
    return cards

def load_problem_tree(filepath: str) -> Optional[ProblemNode]:
    """
    Assumes problems.json has a structure like:
    {
        "card": { "color": "red", "number": 5, ... },
        "children": [ { "card": { ... }, "children": [ ... ] }, ... ]
    }
    """
    def parse_node(node_dict) -> ProblemNode:
        card_info = node_dict.get("card", {})
        card = DefaultCard(
            color=card_info.get("color"),
            number=card_info.get("number"),
            edition=card_info.get("edition"),
            stamp=card_info.get("stamp"),
            zone=card_info.get("zone")
        )
        children = [parse_node(child) for child in node_dict.get("children", [])]
        return ProblemNode(card, children)
    
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            data = json.load(f)
            return parse_node(data)
    return None

# ----------------------------
# Renderer: Pygame Canvas for the GameZones
# ----------------------------

def render_game(deck_zone: DeckZone,
                hand_zone: HandZone,
                stack_zone: StackZone,
                discard_zone: DiscardZone,
                problem_zone: ProblemZone,
                memory_zone: MemoryZone):
    pygame.init()
    screen_width, screen_height = 800, 600
    screen = pygame.display.set_mode((screen_width, screen_height))
    pygame.display.set_caption("Oldschool Card Game Canvas")
    clock = pygame.time.Clock()
    font = pygame.font.SysFont(None, 24)
    
    # For simplicity, define positions for zones:
    zones_positions = {
        "deck": pygame.Rect(20, 50, 100, 150),
        "hand": pygame.Rect(150, 450, 500, 100),
        "stack": pygame.Rect(680, 50, 100, 150),
        "discard": pygame.Rect(680, 220, 100, 150),
        "memory": pygame.Rect(20, 220, 100, 150),
        "problem": pygame.Rect(150, 50, 500, 150)
    }
    
    # Map card color names to pygame colors (if not using CARD_COLORS directly)
    PYGAME_COLORS = {
        "red": (255, 30, 60),
        "blue": (30, 60, 255),
        "green": (60, 255, 30)
    }
    
    selected_index = 0  # Index of currently selected card in hand

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RIGHT:
                    if hand_zone.cards:
                        selected_index = (selected_index + 1) % len(hand_zone.cards)
                elif event.key == pygame.K_LEFT:
                    if hand_zone.cards:
                        selected_index = (selected_index - 1) % len(hand_zone.cards)
                elif event.key == pygame.K_c:
                    # Commit action: move selected card from hand to stack
                    if hand_zone.cards:
                        selected_card = hand_zone.cards[selected_index]
                        hand_zone.play_to_stack(selected_card, stack_zone)
                        # Adjust selected_index if necessary
                        if selected_index >= len(hand_zone.cards):
                            selected_index = max(0, len(hand_zone.cards) - 1)
        
        # Clear screen
        screen.fill((0, 0, 0))
        
        # Function to draw a zone with its cards
        def draw_zone(rect: pygame.Rect, zone_name: str, cards: List[AbstractCard], highlight_index: Optional[int] = None):
            # Draw border and label
            pygame.draw.rect(screen, (255, 255, 255), rect, 2)
            label = font.render(zone_name.upper(), True, (255, 255, 255))
            screen.blit(label, (rect.x + 5, rect.y - 20))
            
            # Draw each card inside the zone (as text inside small boxes)
            if cards:
                card_width = 60
                spacing = 10
                for idx, card in enumerate(cards):
                    card_rect = pygame.Rect(rect.x + spacing + idx*(card_width+spacing), rect.y + spacing, card_width, rect.height - 2*spacing)
                    pygame.draw.rect(screen, (200, 200, 200), card_rect)
                    # Highlight if selected (only applicable for hand zone)
                    if highlight_index is not None and idx == highlight_index:
                        pygame.draw.rect(screen, (255, 255, 0), card_rect, 3)
                    # Render card text (ignoring ANSI escape codes)
                    card_text = f"{card.color} {card.number}"
                    text_surface = font.render(card_text, True, PYGAME_COLORS.get(card.color, (255, 255, 255)))
                    text_rect = text_surface.get_rect(center=card_rect.center)
                    screen.blit(text_surface, text_rect)
        
        # Draw each zone
        draw_zone(zones_positions["deck"], "Deck", deck_zone.cards)
        draw_zone(zones_positions["hand"], "Hand", hand_zone.cards, highlight_index=selected_index if hand_zone.cards else None)
        draw_zone(zones_positions["stack"], "Stack", stack_zone.cards)
        draw_zone(zones_positions["discard"], "Discard", discard_zone.cards)
        draw_zone(zones_positions["memory"], "Memory", memory_zone.cards)
        
        # For ProblemZone, display a simple text representation of the tree.
        def draw_problem_node(node: ProblemNode, pos: (int, int), level: int = 0):
            indent = level * 20
            card_text = f"{node.card.color} {node.card.number}"
            text_surface = font.render(card_text, True, PYGAME_COLORS.get(node.card.color, (255, 255, 255)))
            screen.blit(text_surface, (pos[0] + indent, pos[1]))
            current_y = pos[1] + 25
            for child in node.children:
                current_y = draw_problem_node(child, (pos[0], current_y), level+1)
            return current_y
        
        if problem_zone.root:
            problem_rect = zones_positions["problem"]
            # Draw the zone border for ProblemZone
            pygame.draw.rect(screen, (255, 255, 255), problem_rect, 2)
            label = font.render("PROBLEM", True, (255, 255, 255))
            screen.blit(label, (problem_rect.x + 5, problem_rect.y - 20))
            draw_problem_node(problem_zone.root, (problem_rect.x + 5, problem_rect.y + 5))
        
        pygame.display.flip()
        clock.tick(30)
    
    pygame.quit()

# ----------------------------
# Example Initialization (Placeholder)
# ----------------------------

if __name__ == "__main__":
    # Load deck cards from JSON
    deck_cards = load_deck(os.path.join("data", "deck.json"))
    deck_zone = DeckZone()
    for card in deck_cards:
        deck_zone.add_card(card)
    
    # For demonstration, let's assume the hand zone gets the first few deck cards.
    hand_zone = HandZone()
    if deck_cards:
        for card in deck_cards[:3]:
            hand_zone.add_card(card)
    
    # Initialize other zones as empty.
    stack_zone = StackZone()
    discard_zone = DiscardZone()
    memory_zone = MemoryZone()
    
    # Load the problem tree from JSON if available, else generate a random one.
    problem_root = load_problem_tree(os.path.join("data", "problems.json"))
    problem_zone = ProblemZone()
    if problem_root:
        problem_zone.root = problem_root
    else:
        # Provide a simple card generator for random tree creation.
        problem_zone = ProblemZone.generate_random_tree(
            depth=3,
            max_children=2,
            card_generator=lambda: DefaultCard(color=random.choice(list(PYGAME_COLORS.keys())), number=random.randint(1, 10))
        )
    
    # Start the renderer (which handles input and drawing).
    render_game(deck_zone, hand_zone, stack_zone, discard_zone, problem_zone, memory_zone)
