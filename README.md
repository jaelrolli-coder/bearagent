# 🐻 Bearagent

The Rolli family operating system. **v1 Kids Hub in progress.**

## What this is

A private, family-only OS for the Rolli household — kids' multimedia + family planner + finance hub. Full product brief in [PRD.md](PRD.md).

## Status

| Pillar | Phase |
|---|---|
| Kids Hub (v1) | 🚧 Shell live; feature work in progress |
| Family Planner (v2) | Not started |
| Finance Hub (v3) | Not started |

## Live

**https://jaelrolli-coder.github.io/bearagent/**

(GitHub Pages, deployed from `main`.)

## Run locally

No build step.

```sh
cd bearagent
python3 -m http.server 8080
open http://localhost:8080
```

## Layout

```
bearagent/
├── index.html              # Profile picker (entry point)
├── kid/
│   ├── noa.html            # Noa's home screen (7 tiles)
│   └── nina.html           # Nina's home screen (4 tiles)
├── assets/css/style.css    # Calm UI baseline
├── js/
│   ├── picker.js
│   ├── i18n.js             # DE/EN toggle
│   └── tiles.js            # Placeholder tile handlers
├── content/
│   ├── today.json          # Daily word/fact/news (regen nightly later)
│   ├── schedule.json       # Hand-edited per-kid schedule
│   ├── whitelist-noa.json  # YouTube allowlist
│   └── whitelist-nina.json
└── config.json             # Profiles, budgets, region, emergency data
```

See [PRD.md §8](PRD.md#8-technical-architecture-v1) for the target architecture.
