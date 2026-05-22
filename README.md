# 🐻 Bearagent

The Rolli family operating system. **v1 Kids Hub shipped.**

## What this is

A private, family-only OS for the Rolli household — kids' multimedia + family planner + finance hub. Full product brief in [PRD.md](PRD.md).

## Status

| Pillar | Phase |
|---|---|
| Kids Hub (v1) | ✅ Live — installable PWA, daily content auto-refreshes |
| Family Planner (v2) | Not started |
| Finance Hub (v3) | Not started |

## Live

**https://jaelrolli-coder.github.io/bearagent/**

(GitHub Pages, deployed from `main`. Service worker caches the shell for offline use.)

## What's in v1

| Feature | Where | Notes |
|---|---|---|
| Profile picker | `/` | Big avatars for Noa + Nina; remembers last user |
| Bilingual UI (DE + EN) | every page | Per-profile toggle, persists |
| YouTube videos + timer | `/kid/videos.html` | Whitelist-only, daily budget per kid (Noa 30 / Nina 20), lockout overlay at 0 |
| Daily sudoku | `/kid/sudoku.html` | Easy/medium, date-seeded so all devices see the same puzzle |
| Word of the day | `/kid/word.html` | DE + EN side-by-side with 🔊 read-aloud |
| Fun fact | `/kid/fact.html` | One per day, read-aloud |
| Kids' news | `/kid/news.html` | Auto-pulled from ZDF logo! (DE) + BBC Newsround (EN) |
| Schedule | `/kid/schedule.html` | Today's events from `content/schedule.json` |
| Emergency screen | `/kid/emergency.html` | Doctor, insurance, allergies, Swiss numbers (112/144/117/118/145) |
| Parent override | 🐾 corner, long-press | PIN-gated admin: reset timers, change PIN, edit-on-GitHub links |
| Nightly content refresh | GitHub Action | 04:00 UTC; word + fact + headlines |

## Install on the family tablet / phones

**Android (Chrome):**
1. Open the live URL.
2. Menu (⋮) → **"Install app"** or **"Add to Home screen"**.
3. Bear icon appears on the home screen. Tap → launches full-screen.

**iOS / iPadOS (Safari):**
1. Open the live URL.
2. Share → **"Add to Home Screen"**.
3. Bear icon appears. Tap → full-screen.

## What you still need to fill in

- **`config.json`** — `emergency` block (doctor, insurance, allergies, contacts).
- **`content/schedule.json`** — currently only Noa's school Mon-Fri 08:00. Add Nina's playgroup, piano, swimming, etc.
- **`content/whitelist-{noa,nina}.json`** — seed a few age-appropriate YouTube videos for each kid.

All editable via the parent override → "Cross-device (GitHub)" links, or directly in the repo.

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
├── index.html              # Profile picker
├── kid/                    # 9 feature pages
├── assets/css/style.css
├── assets/img/             # Bear icon (SVG + 192/512 PNG)
├── js/                     # All feature scripts (vanilla, no framework)
├── content/                # words, facts, schedule, whitelists, today.json
├── scripts/                # generate-today.mjs (used by the Action)
├── .github/workflows/      # daily-content.yml
├── manifest.webmanifest    # PWA
├── sw.js                   # Service worker
├── config.json             # Profiles, budgets, region, emergency data
└── PRD.md
```

See [PRD.md §8](PRD.md#8-technical-architecture-v1) for the target architecture.
