import pygame

BUTTON_WIDTH = 120
BUTTON_HEIGHT = 40
FONT = pygame.font.Font(None, 28)

class UIButton:
    def __init__(self, x, y, text, callback):
        self.rect = pygame.Rect(x, y, BUTTON_WIDTH, BUTTON_HEIGHT)
        self.text = text
        self.callback = callback

    def draw(self, surface):
        pygame.draw.rect(surface, (200, 200, 200), self.rect, border_radius=6)
        label = FONT.render(self.text, True, (0, 0, 0))
        surface.blit(label, label.get_rect(center=self.rect.center))

    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN and self.rect.collidepoint(event.pos):
            self.callback()


def draw_loot_counter(surface, loot_value, x, y):
    label = FONT.render(f"Loot: {loot_value}", True, (255, 255, 0))
    surface.blit(label, (x, y))


def draw_zone_labels(surface, zones):
    for zone in zones:
        label = FONT.render(zone.__class__.__name__, True, (180, 180, 180))
        surface.blit(label, (zone.x, zone.y - 22))
