# Devlog

## 2025-03-27

I am struggling with **the fun** of the game. I still don't know if this is a puzzle or a real-time management game.

I like this idea:

* The game is incremental in the sense that you need parts (problems) to be solved in order to solve a bigger problem.

But outside of that, I have no idea what makes it fun.

To get this idea of "exploration" in math in the sense that you don't know where to go in order to solve a problem until you actually give it a try. Sometimes you get closer to the solution and [use lattice-based cryptography](https://en.wikipedia.org/wiki/Lattice-based_cryptography) in some way in the UI could be the "compass" to see if you're heading into the right direction or not.

I really like the idea of constraining myself to either a puzzle-based resource management game **OR** a real-time puzzler game.

### The real-time puzzler

In this version of the game, I see the compass as being a "close enough" solution where you can opt to get great solutions for more points or not-that-good solutions for a faster time (and not as many points).

### The puzzle resource management game

In this version of the game, I see the puzzles as being more interesting and each decision being more important.

### As I write this...

I just thought about doing **both.** We could have a puzzle-based "turn-based" strategy phase, and then a real-time component with a small gameplay loop that keeps it interesting. This is giving me a "tower defense" vibe and honestly looks like a very interesting place to explore.

Some themes to attack this:
* Math student trying to graduate.
* Math researcher trying to discover something big.
* Something way more abstract like you're an alien and you're discovering math
* "Through the ages" style non-descript.

I like option 1 or 3 more. 1 is more constrained, 3 is more abstract and thus could be really explored and have this "appeal" of being goofy and thus easier to invent things that "make sense".

### The short gameplay loop

The loop still has the actual fun missing, but the basic flow of

    Make small thing > see compass change
    > try another thing > see compass change
    > hone in that thing > ship the solution

Looks fun. Now I need to know what is the actual small thing that is fun to do.

### Random thoughts

* I just thought about problems as being **cards.** A card has multiple colors (branches of math it gives) and you're presented with the boss as being a bigger problem (a tree with many branches and different colors) and you have to use your cards to get to the root of it.
* I thought about playing cards in a specific sequence and it "attacking" the leafs once it all resolves. I imagine a bar of liquid that fills up the more cards you play and eventually resolves itself, draining the liquid and attacking the leafs. You can resolve, for instance, an "infinity geometry points" node at the end to, after you're unlocked every other requirement from a node (say that has 3 colors), the geometry blue attacks all nodes and unlocks a deeper node all at once with a single card.

I have some ideas in mind and will make the first prototype based on this:

### First prototype

It's a card game where you "attack" a problem which is a tree that requires seals, colors, numbers and editions (hello Balatro). When you're facing a problem, you have a hand of cards which are numbers cards without colors, colors and seals. You play them out in a given order and the operations "happen".

For example, playing a 7 and a blue makes a blue 7. Playing a seal will then stamp that card. The tree has specific requirements like "stamped blue 4", in which case you will use that whole card to unlock that branch. You win when you get to the root of the problem.

You have a "memory" or "arsenal" which is the history of cards you've played. Problems you solved go into this history and cards you make go there too. You can also play cards from memory.

When you finish a problem, you can commit it to memory so it becomes a card to be later used in harder problems.

**Random idea:** every tree can be solved "from first principles". That is, without using memory.

The fun of it, hopefully, is that fusing those cards, playing from memory and strategically commiting a node into the deck would be a set of fun decisions to make.