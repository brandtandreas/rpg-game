# Tilelands

A small browser RPG built with [Phaser 3](https://phaser.io/) and TypeScript.
Pure client-side — no backend, no accounts, save state lives in
`localStorage`.

## Vertical slice features

- 2D top-down tilemap with collision (grass, path, water, trees, rocks)
- Arrow-keys / WASD movement, camera follow
- NPC dialogue with branching choices, item gifts, and flags
- Turn-based combat (Attack / Item / Flee)
- Inventory with consumable potions
- HP / XP / leveling
- Save / load via `localStorage`, plus title screen with **Continue**

All sprites are drawn procedurally inside `src/scenes/textures.ts`, so the
project ships with **zero external assets** — easy to swap in real art later.

## Controls

| Action       | Key                         |
| ------------ | --------------------------- |
| Move         | Arrow keys or `WASD`        |
| Talk / Interact | `E`, `Space`, or `Enter` |
| Open inventory | `I`                       |
| Save         | `F5`                        |
| Menu select  | Up/Down + `Enter`           |

## Develop

```bash
npm install
npm run dev      # http://localhost:5173/
npm test         # vitest suite for combat, inventory, save, dialogue
npm run build    # produces dist/
npm run preview  # preview the production build
```

## Deploy to GitHub Pages

The included GitHub Actions workflow (`.github/workflows/deploy.yml`)
builds and publishes to GitHub Pages on every push to `main`.

To enable it:

1. In the repo settings → **Pages**, set the source to **GitHub Actions**.
2. Push to `main`. The workflow runs tests, builds, and deploys.
3. The site will be live at `https://<owner>.github.io/rpg-game/`.

`vite.config.ts` already sets `base: '/rpg-game/'` so asset paths resolve
correctly under the Pages subpath. If the repo is renamed, update that
value to match.

## Project layout

```
src/
├── main.ts                 # Phaser bootstrap
├── config.ts               # game config, scene list
├── types.ts                # shared TS types (SaveData, Item, …)
├── scenes/
│   ├── BootScene.ts        # generates procedural textures
│   ├── TitleScene.ts       # New Game / Continue
│   ├── WorldScene.ts       # tilemap + player + NPCs + enemies
│   ├── DialogueScene.ts    # dialogue overlay
│   ├── BattleScene.ts      # turn-based combat
│   ├── UIScene.ts          # HUD + inventory panel
│   └── textures.ts         # procedural sprite generators
├── entities/
│   ├── Player.ts
│   └── NPC.ts
├── systems/
│   ├── GameState.ts        # mutable runtime state
│   ├── SaveService.ts      # localStorage save/load
│   ├── Inventory.ts
│   ├── Combat.ts
│   └── DialogueRunner.ts
└── data/
    ├── items.ts
    ├── enemies.ts
    ├── zones.ts            # tilemap + spawn data
    └── dialogues/          # dialogue trees
```

## Adding content

- **New zone**: add a `Zone` entry in `src/data/zones.ts` (tile grid +
  spawn points). The world scene renders it automatically when
  `state.zone` is set to its id.
- **New item**: add to `src/data/items.ts`. Consumables with `heal` are
  usable from the inventory and from battle.
- **New enemy**: add to `src/data/enemies.ts` and reference from a zone's
  `enemies` list.
- **New dialogue**: add a tree under `src/data/dialogues/` and register
  it in `src/data/dialogues/index.ts`. Reference its id from an NPC
  spawn.

## Roadmap (post-slice)

- Audio (BGM + SFX)
- Multiple zones with transition triggers
- Quest log
- Mobile / touch input
- Real sprite art (e.g. CC0 Kenney packs)
