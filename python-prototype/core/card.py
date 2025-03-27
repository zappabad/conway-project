import pygame
from abc import ABC, abstractmethod

def rgb_escape(r, g, b):
    return f"\x1b[38;2;{r};{g};{b}m"

def print_colored(text, rgb):
    r, g, b = rgb
    escape = rgb_escape(r, g, b)
    reset = "\x1b[0m"
    return f"{escape}{text}{reset}"

colors = {
    "red": {"rgb": (255, 30, 60), "shortname": "r"},
    "blue": {"rgb": (30, 60, 255), "shortname": "b"},
    "green": {"rgb": (60, 255, 30), "shortname": "g"},
    "yellow": {"rgb": (255, 255, 30), "shortname": "y"},
    "none": {"rgb": (255, 255, 255), "shortname": "n"},
}

class AbstractCard(ABC):
    def __init__(self, color: str=None, number: int=None, edition: str=None, stamp: str=None, zone: str=None):        
        self.color = color
        self.number = number
        self.edition = edition
        self.stamp = stamp        
        self.zone = zone

class DefaultCard(AbstractCard):
    def __str__(self):
        return f"{print_colored(f'{self.number}', colors[self.color]['rgb'])}"
    
    
if __name__ == "__main__":
    # Example usage
    card = DefaultCard(color="yellow", number=5)
    print(card)