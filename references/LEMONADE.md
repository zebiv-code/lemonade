# Lemonade Stand — History

## Origins

**Lemonade Stand** was created in 1973 by **Bob Jamison** for the UNIVAC 1110 mainframe at the **Minnesota Educational Computing Consortium (MECC)**. It was later ported to the Apple II in 1979 by **Charlie Kellner**, becoming one of the most iconic educational games of the early personal computer era.

The Apple II version featured the machine's distinctive low-resolution color graphics (40×48 blocks in 16 colors) and simple speaker-driven sound effects via POKE commands to the speaker toggle address ($C030).

## Gameplay

Players run a lemonade stand over multiple days, making three key decisions each day:

1. **How many glasses to make** — determines production cost and maximum sales
2. **How many advertising signs** — increases customer awareness (15¢ each)
3. **What price to charge** — higher prices mean more profit per glass but fewer customers

### Weather System
The daily weather forecast affects demand:
- **Sunny** — moderate demand
- **Hot and Dry** — high demand (people are thirsty)
- **Cloudy** — reduced demand
- **Chance of Thunderstorms** — may rain (killing sales) or stay dry

### Economics
- Lemonade cost increases as the game progresses (inflation)
- Optimal pricing balances profit margin vs. customer demand
- Advertising has diminishing returns
- Weather surprises can wipe out an investment

## Apple II Technical Details

### Low-Resolution Graphics
- 40×48 pixel grid, each "pixel" is a colored block
- 16 colors from the Apple II palette
- Mixed mode: graphics on top, 4 lines of text at bottom
- GR command activates lo-res mode

### Sound
- No dedicated sound chip — single-bit speaker at memory address $C030
- POKE 49200,0 toggles speaker cone
- Tones created by rapid toggling in loops
- Delay between toggles determines pitch
- Common patterns:
  - Cash register "cha-ching": ascending tone sweep
  - Thunder: noise burst (random delays)
  - Rain: rapid random clicks

### Apple II Color Palette (Lo-Res)
```
 0 = Black        8 = Brown
 1 = Magenta       9 = Orange
 2 = Dark Blue    10 = Grey (dark)
 3 = Purple       11 = Pink
 4 = Dark Green   12 = Green (medium)
 5 = Grey         13 = Yellow
 6 = Medium Blue  14 = Aqua
 7 = Light Blue   15 = White
```

## Cultural Impact

Lemonade Stand introduced an entire generation to basic business concepts: supply and demand, pricing strategy, risk management, and the impact of external factors (weather) on business outcomes. It remains one of the most-cloned educational games, with hundreds of versions across every platform.

## References

- Jamison, Bob. "Lemonade Stand." MECC, 1973 (mainframe), 1979 (Apple II).
- Original Applesoft BASIC source: see `lemonade.bas` in this directory.
