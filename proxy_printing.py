#!/usr/bin/env python3
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors

def draw_card(c, x, y, card_width, card_height, card):
    """
    Draws a single card at (x, y) with given dimensions.
    Each card is defined by a dictionary with keys:
        'text': the text to display (number, number+color, or color letter)
        'color': one of "red", "blue", "green", "yellow", or None for no color.
    """
    card_color = card.get('color')
    text = card.get('text')
    
    # Define a small margin for the text within the card
    margin = 5
    font_name = "Helvetica-Bold"
    font_size = 20
    
    # Determine text color: white on colored background, black otherwise.
    text_color = colors.white if card_color else colors.black
    c.setFont(font_name, font_size)
    
    # Draw the colored triangle if the card includes a color.
    if card_color:
        # Triangle vertices in the top left corner:
        #  - Top left of the card: (x, y + card_height)
        #  - Point on top edge at 30% of card width: (x + 0.3*card_width, y + card_height)
        #  - Point on left edge at 30% of card height: (x, y + card_height - 0.3*card_height)
        triangle = [
            (x, y + card_height),
            (x + 0.3 * card_width, y + card_height),
            (x, y + card_height - 0.3 * card_height)
        ]
        # Set the fill color based on the card's color.
        if card_color == "red":
            fill_color = colors.red
        elif card_color == "blue":
            fill_color = colors.blue
        elif card_color == "green":
            fill_color = colors.green
        elif card_color == "yellow":
            fill_color = colors.yellow
        else:
            fill_color = colors.black
        
        c.setFillColor(fill_color)
        c.setStrokeColor(fill_color)
        p = c.beginPath()
        p.moveTo(triangle[0][0], triangle[0][1])
        p.lineTo(triangle[1][0], triangle[1][1])
        p.lineTo(triangle[2][0], triangle[2][1])
        p.close()
        c.drawPath(p, fill=1, stroke=0)
    
    # Draw the text in the top left of the card.
    # Calculate the position with a small offset from the top left corner.
    text_x = x + margin
    text_y = y + card_height - margin - font_size
    c.setFillColor(text_color)
    c.drawString(text_x, text_y, text)

def main():
    # Card dimensions in points (1 inch = 72 points)
    card_width = 2.4 * 72   # ≈ 172.8 points
    card_height = 3.3 * 72  # ≈ 237.6 points
    
    # A4 page dimensions (width x height in points)
    page_width, page_height = A4  # (595, 842)
    
    # Grid configuration: 3 columns, 3 rows per page (9 cards per page)
    cols = 3
    rows = 3
    cards_per_page = cols * rows

    # Build the list of card definitions.
    cards = []
    color_letters = {"red": "r", "blue": "b", "green": "g", "yellow": "y"}
    
    # For each number 1-5:
    for number in range(1, 6):
        # Card with number only (no color)
        for _ in range(4):
            cards.append({"text": str(number), "color": None})
        # Cards with a number and a color (number+color)
        for col in ["red", "blue", "green", "yellow"]:
            for _ in range(4):
                cards.append({"text": f"{number}{color_letters[col]}", "color": col})
    
    # Color-only cards (just the color letter)
    for col in ["red", "blue", "green", "yellow"]:
        for _ in range(4):
            cards.append({"text": color_letters[col], "color": col})
    
    total_cards = len(cards)
    
    # Create the PDF canvas.
    c = canvas.Canvas("cards.pdf", pagesize=A4)
    
    for i, card in enumerate(cards):
        # Determine the card's position on the current page.
        pos_in_page = i % cards_per_page
        col = pos_in_page % cols
        row = pos_in_page // cols  # row 0 will be the top row
        
        # x coordinate: left aligned in the grid.
        x = col * card_width
        # y coordinate: top row starts at the top of the page.
        y = page_height - (row + 1) * card_height
        
        # Uncomment the following line to draw a border around each card (for debugging)
        # c.rect(x, y, card_width, card_height)
        
        draw_card(c, x, y, card_width, card_height, card)
        
        # Start a new page after filling the current page, unless it's the last card.
        if (i + 1) % cards_per_page == 0 and (i + 1) < total_cards:
            c.showPage()
    
    c.save()
    print("PDF generated as 'cards.pdf'.")

if __name__ == "__main__":
    main()
