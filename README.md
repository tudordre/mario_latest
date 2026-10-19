# Mario Custom — PixiJS 2D Edition

A Mario-inspired platform game built with **PixiJS v8**, **Vite**, and **Electron**. Play it in a web browser or as a desktop application.

---

## 🚀 Graphics and effects

The game uses hardware-accelerated 2D rendering with **WebGL**:

1. **PixiJS rendering**: The scene is drawn on the GPU with WebGL, using graphics primitives and pixel-art sprites.
2. **Dynamic particle effects**:
   - Dust clouds while running and landing after high jumps.
   - Four rotating, gravity-driven brick fragments when bricks are broken.
   - Smoke and flames trailing rockets.
   - Sparks trailing fireballs.
   - Impact stars when enemies are stomped.
   - Golden sparkles when collecting coins.
   - A burst of ten spinning, sparkling coins when falling into a pit.
3. **Screen shake**: Dynamic screen shake on impacts, including bricks, rockets, pits, and stomped enemies.
4. **Crisp pixel art**: Pixel-rounded rendering and sharp, non-blurred scaling.
5. **Motion and animation effects**:
   - **Squash and stretch**: Elastic vertical stretch on takeoff and a smooth horizontal squash on landing.
   - **Run lean**: Mario leans in proportion to movement speed.
   - **Motion trails / ghost afterimages**: Translucent silhouettes at high speed, while flying with wings, or riding the bird.
   - **Dynamic ground shadows**: Elliptical shadows under Mario, animals, and the bird that adapt to their height.
   - **Natural blinking**: Mario, the bird, and animals blink at varying intervals.
6. **Two ways to play**: Run in a browser with Vite (`npm run dev`) or as a desktop application with Electron (`npm start`).

---

## 🎮 Game features and mechanics

The game includes eight worlds, power-ups, enemies, procedurally generated levels, and an underground area.

### 1. Eight worlds and four levels each (32 levels)

Each world has a distinct visual theme, with its own sky, hills, grass, and ground colors:

- **World 1**: Serene Plains — classic blue sky and green grass
- **World 2**: Golden Desert — warm sunset and terracotta tones
- **World 3**: Violet Dusk — purple sky and dusky hills
- **World 4**: Crystal Valley — aquamarine and emerald tones
- **World 5**: Crimson Mountains — red sunset and volcanic tones
- **World 6**: Starry Night — deep blue and nighttime scenery
- **World 7**: Enchanted Forest — fresh spring greens
- **World 8**: Dark Castle — obsidian and deep magenta

### 2. Procedural level generation

- **Safe starting area**: 48 tiles of starting ground with coins, breakable bricks, and a rideable bird.
- **Pit crossings**: Platforms and floating islands are generated to help provide jump routes.
- **Brick stairways and green pipes**: Pipes are two or three tiles tall, with brick steps.
- **Automatic pruning** removes objects behind the camera to help maintain performance.

### 3. Mario forms and power-ups

- **Small Mario**: 20×30 pixels.
- **Big Mario**: Reached after collecting the first orange animal (24×48 pixels).
- **Fire Mario**: Reached after collecting the second orange animal. Shoots fireballs with <kbd>Shift</kbd>.
- **Rocket power**: Collecting **three orange animals** enables fast rockets that break bricks and defeat nearby enemies.
- **Power-ups persist** between levels when passing the flag and entering the castle.

### 4. Rideable giant bird and wings

- **Blue bird**: Appears near the start of each level (56×72 px). Jump onto it to ride; it provides **15% extra speed** and **higher jumps** (vertical velocity -780 instead of the normal -520).
- If Mario is hit while riding, the bird gets scared and flies away. Mario is dismounted and receives temporary invulnerability.
- **Wings**: Appear in the air after 5–20 seconds. Collect them to gain wings; each jump-key press in the air gives Mario another flap, allowing continued flight.

### 5. Secret underground area

- Enter a pipe by standing on it and pressing <kbd>↓</kbd> or <kbd>S</kbd>.
- Explore a cave with stalactites and **72 gold coins** arranged in three rows of 24.
- Reach the far end of the cave to return to the surface above the next pipe.

### 6. Pit fall and ten-coin reward

- Falling into a pit triggers a special **+10 coin** bonus (`PIT_REWARD = 10`).
- Ten spinning golden coins burst from the pit with sparkling effects.
- A descending chiptune melody with synthesized bass plays.

### 7. Level finish: flag and castle

- A flagpole with a golden ball and red flag, followed by a castle, appears near the end of each level.
- Mario slides down the flagpole and automatically enters the castle to advance to the next level.
- Completing level 8-4 displays the **Victory** screen.

### 8. Web Audio API sound synthesizer

All sound effects are synthesized procedurally with the Web Audio API; no external audio files are required:

- Coin pickup (square-wave arpeggio, B5 to E6)
- Growth and power-up (four-note ascending arpeggio)
- Damage and shrinking (descending sawtooth glissando)
- Enemy stomp (triangle-wave impact)
- Brick break (crunch noise)
- Fireball and rocket launch
- Pit-fall melody (nine descending chiptune notes with a bass drone)

---

## ⌨️ Controls

| Key | Action |
|---|---|
| <kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd> | Move left / right |
| <kbd>↑</kbd> / <kbd>W</kbd> | Jump (with wings, each press flaps to keep flying) |
| <kbd>↓</kbd> / <kbd>S</kbd> while on a pipe | Enter the underground area |
| <kbd>Space</kbd> / <kbd>Shift</kbd> | Fire (fireballs or, after three orange animals, rockets) |
| <kbd>R</kbd> | Restart the game |
| <kbd>Enter</kbd> | Start / play again |

---

## 🛠️ Running the game

### Requirements

- Node.js compatible with Vite 8 and npm.
- A modern browser with WebGL support for the web version.
- macOS, Windows, or Linux to run the desktop version with Electron.

### Development / browser

```bash
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

### Desktop application (Electron)

```bash
npm start
```

Alternatively:

```bash
npm run desktop
```

### Production build

```bash
npm run build
```

The optimized files are generated in the `dist/` directory.

---

## 📁 Project structure

```
.
├── electron/
│   ├── main.cjs         # Electron main process
│   └── preload.cjs      # Electron preload script
├── src/
│   ├── css/
│   │   └── style.css    # Pixel-art styling, retro HUD, and modal screens
│   └── js/
│       ├── constants.js # Dimensions, speeds, physics, and eight world themes
│       ├── sfx.js        # Web Audio API sound synthesizer
│       ├── input.js      # Keyboard input manager
│       ├── particles.js  # 2D particle effects
│       ├── player.js     # Mario physics, collisions, power-ups, bird, and wings
│       ├── world.js      # Procedural generation, underground area, enemies, and finish
│       ├── renderer.js   # PixiJS v8 renderer, screen shake, and scene graph
│       └── main.js       # Game loop, HUD updates, and game state
├── index.html            # Vite / web entry point
├── vite.config.js        # Vite configuration
└── package.json          # Project scripts and dependencies
```
