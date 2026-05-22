# Bearagent — Family Operating System

**Status:** Draft v0.1
**Owner:** Jael Rolli
**Last updated:** 2026-05-20

---

## 1. Vision

Bearagent is a private, family-only "operating system" for the Rolli family of 4. It consolidates the daily routines, entertainment, organisation and finances of a household into one calm interface — primarily on a fridge/wall tablet and on each family member's personal device.

Its three founding pillars:
1. A safe, curated **Kids Hub** with media, learning and routines.
2. A **Family Planner** that unifies calendars, school and bank holidays, and shared events.
3. A **Finance Hub** that integrates with the family's bank accounts to review spending, set goals and follow a budget.

A fourth, cross-cutting pillar of **Supporting Features** (meals, chores, documents, health, memories) ties the three together so the app feels like one family system, not three separate tools.

## 2. Users

| Name | Role | Age | Profile notes |
|---|---|---|---|
| Adam | Father | 39 | Co-admin. Curates content, manages finances jointly with Jael. |
| Jael | Mother | 34 | Co-admin and project owner. Primary content curator. |
| Noa  | Son | 7 | Reading age. Uses Kids Hub on shared tablet and own device. Earns screen time. |
| Nina | Daughter | 3 | Pre-reader. Picture- and audio-first UI. Shorter sessions. |

There are no other users. The system runs on family-owned devices and assumes physical trust.

## 3. Goals and non-goals

**Goals**
- Reduce the number of disparate apps the family uses for daily organisation.
- Make screen time for the kids deliberate, time-boxed and content-safe.
- Make the household's money and calendar legible at a glance.
- Be cheap to run (target: **€0/month hosting** for v1), low-maintenance, and resilient to one parent being unavailable.

**Non-goals**
- Not a product for other families. No multi-tenant features, no signup flow, no marketing.
- Not a social network. No friends, no sharing outside the household.
- Not a replacement for school, doctor or bank apps. It aggregates and surfaces; the source systems remain authoritative.
- Not a substitute for parental judgement on screen time or finance.

## 4. Guiding principles

1. **Static-first.** Default to pre-generated JSON, client-side rendering, free hosting (GitHub Pages). Only introduce a backend when a feature genuinely cannot work without one.
2. **Curation over algorithm.** Especially for kids' content, prefer human-curated whitelists to algorithmic recommendations.
3. **Kid-safe by construction.** It must not be possible for a child using the app to reach unfiltered YouTube, an unmoderated chat, or an open browser, even by trying.
4. **One source of truth per concept.** A calendar event lives in one calendar; Bearagent reads it. A bank transaction lives at the bank; Bearagent reads it. We do not maintain parallel records.
5. **Calm UI.** Big targets, generous whitespace, low cognitive load. The app is glanceable from across the kitchen.
6. **Reversible decisions.** No vendor lock-in for content (everything is JSON in git), no destructive sync (we never overwrite the source calendar/bank).
7. **Parent override is sacred.** Any limit (timer, content filter, budget cap) can be unlocked by a parent with a PIN.

## 5. Three pillars + supporting features

The PRD below lists every feature being considered. Each is tagged with its origin so you can see what's original to your brief vs. additional suggestions:

- 🟦 **Core** — explicitly in your original brief.
- 🟩 **Suggested** — added by Claude as a recommendation; up to you whether to keep.

### 5.1 Pillar A — Kids Hub

| # | Feature | Tag | Description |
|---|---|---|---|
| A1 | Per-kid profile picker | 🟦 | "Who's using this?" on launch. Avatars for Noa and Nina. No password. |
| A2 | Curated YouTube videos with timer | 🟦 | Whitelisted videos per kid via `youtube-nocookie.com` embed. Daily time budget per kid (configurable, default e.g. 20 min Nina / 30 min Noa). After budget: "tomorrow again". |
| A3 | Daily Sudoku (Noa) | 🟦 | Client-generated from today's date as seed. Difficulty easy/medium per age. |
| A4 | Word of the day — DE + EN | 🟦 | Pre-generated daily. Picture + audio (browser `speechSynthesis`). For Nina: picture-led; for Noa: word + meaning + example sentence. |
| A5 | Fun fact of the day | 🟦 | One-line, age-appropriate, with optional read-aloud. |
| A6 | Kids' schedule | 🟦 | Today's events for that kid, rendered as icons (Nina) or a simple list (Noa). Read from shared `schedule.json` v1, from the Planner pillar later. |
| A7 | Kid-friendly news | 🟦 | Two headlines per day: one in German from **ZDF *logo!*** and one in English from **BBC *Newsround***. Both have RSS feeds; both are public-broadcaster, age 6–12 editorial. Read-aloud option in the matching language. Exact feed URLs to be confirmed when the daily-content Action is wired. |
| A8 | Morning + bedtime routine checklists | 🟩 | Visual swipeable steps (brush teeth, get dressed, pack bag…). Picture-based for Nina, words+pictures for Noa. Tick → animation + small reward. |
| A9 | Reading log for Noa | 🟩 | "I read for X minutes today" + book title. Streaks and weekly minutes badge. |
| A10 | "What we did today" memory tile | 🟩 | One photo per day uploaded by a parent, surfaces a "this day last year" card on the kid's home screen. |
| A11 | Parent override mode | 🟦 | Hidden long-press in a corner; PIN entry; lets parents add to YouTube whitelist, reset today's timer, edit the kid's schedule. |

### 5.2 Pillar B — Family Planner

| # | Feature | Tag | Description |
|---|---|---|---|
| B1 | Unified calendar view | 🟦 | Read-only aggregation of all family calendars (Google/iCloud). Per-person colour. Day, week, month views. |
| B2 | School holidays | 🟦 | Auto-imported for the relevant Kanton / Bundesland once we know the family's location. |
| B3 | Bank holidays | 🟦 | Auto-imported for the relevant country. |
| B4 | Shared family events | 🟦 | One Bearagent-owned calendar (writeable) where parents add events visible to everyone. |
| B5 | Birthdays + anniversaries | 🟩 | Extended family contacts file → calendar overlay. Gentle reminders 7 / 1 days before. |
| B6 | Travel & holiday prep | 🟩 | When a trip is on the calendar, auto-generate a packing list per family member that the kids can tick off. |

### 5.3 Pillar C — Finance Hub

| # | Feature | Tag | Description |
|---|---|---|---|
| C1 | Bank account integration | 🟦 | Via an EU PSD2/open-banking provider — see §8 *Open questions*. Read-only by default. |
| C2 | Spending review | 🟦 | Monthly and category views. Pie + trend lines. Manual re-categorisation. |
| C3 | Budgets | 🟦 | Per-category monthly caps with progress and end-of-month rollover. |
| C4 | Savings & goals | 🟦 | "House", "Family trip", "Kids' education" — track contributions + projected completion date. |
| C5 | Subscriptions tracker | 🟩 | Auto-detect recurring debits; let parents categorise + cancel-flag. Usually the biggest "found money" win. |
| C6 | Shared wishlist + gift budget | 🟩 | Birthdays + Christmas for extended family, with a running total against a gift budget envelope. |
| C7 | Kid allowance / virtual piggy bank | 🟩 | Noa (and later Nina) sees a balance that grows from chores/rewards; convertible to real spending with parent sign-off. |

### 5.4 Cross-pillar supporting features

| # | Feature | Tag | Spans | Description |
|---|---|---|---|---|
| X1 | Meal planner + grocery list | 🟩 | Planner + Finance | Weekly menu, auto-generated grocery list, optional spend estimate against the food budget. |
| X2 | Chores & reward system | 🟩 | Kids Hub + Finance | Parents define chores → kids tick off → earn points convertible to screen-time minutes (Kids Hub) or piggy-bank money (Finance). |
| X3 | Document vault | 🟩 | All | Encrypted-at-rest store for passports, vaccination booklets, insurance, school papers. PDF + photo. Searchable. |
| X4 | Health / medical tracker | 🟩 | Planner | Vaccination due-dates, pediatrician visits, growth chart, allergies. Reminders flow into the Planner. |
| X5 | Memory wall | 🟩 | Kids Hub | One photo per day; "this day last year" surfaced on the kids' screen + parents' home screen. |
| X6 | Emergency screen | 🟩 | All | One tap from any screen: allergies, doctor, insurance numbers, in-case-of contacts, blood types. |
| X7 | Profiles & permissions | 🟩 | All | Adult profiles see finance; kid profiles cannot. Kid profiles cannot exit Kids Hub without PIN. |

## 6. Phased roadmap

The roadmap follows your decision (2026-05-20) to ship the Kids Hub first.

### v1 — Kids Hub on tablet (target: 2–4 weeks of evenings)

In scope:
- A1 Profile picker
- A2 YouTube whitelist + timer (Noa + Nina)
- A3 Daily Sudoku (Noa)
- A4 Word of the day DE+EN
- A5 Fun fact of the day
- A6 Kids' schedule (read from a hand-edited `schedule.json`; Planner integration deferred)
- A7 Kids' news (one curated source)
- A11 Parent override mode (PIN)
- X6 Emergency screen (low cost, high value)

Deliberately out of v1: A8 routines, A9 reading log, A10 memory tile — added once the family is actually using the v1 daily.

### v2 — Routines, rewards, planner stub
- A8 Routines, A9 Reading log, X2 Chores (manual, no finance link yet).
- B1 Unified calendar (read-only Google/iCloud).
- B2/B3 School + bank holidays.

### v3 — Finance Hub minimum
- C1 Bank integration with one provider, one account.
- C2 Spending review, C5 Subscriptions tracker.
- C3 Budgets.

### v4 — Depth + cross-pillar glue
- C4 Goals, C6 Gift budget, C7 Piggy bank.
- X1 Meal planner, X3 Document vault, X4 Health tracker.
- A10 Memory wall (needs a small backend for photo storage — first time we leave "purely static").

## 7. v1 detailed requirements

### 7.1 User stories

- *As Noa,* when I tap my photo on the fridge tablet, I see today's three videos, my sudoku, today's word and my schedule, and I can start watching with one tap.
- *As Nina,* when I tap my photo, I see big picture-tiles with three videos, today's word with a sound, and a list of icons showing what we're doing today.
- *As a parent,* when I long-press the bear in the bottom corner and enter my PIN, I can add a YouTube video to a kid's whitelist, reset today's timer, or edit today's schedule.
- *As a parent,* I never have to open the laptop to add a video — I can do it from my phone on the same site.

### 7.2 Functional requirements

| ID | Requirement |
|---|---|
| F1 | The app loads in <2s on a mid-range Android tablet over home WiFi. |
| F2 | Profile selection persists in `localStorage` so the tablet remembers who used it last (5 min idle timeout → back to picker). |
| F3 | YouTube embeds use `youtube-nocookie.com` with `controls=0`, `modestbranding=1`, `rel=0`, `iv_load_policy=3`. No recommendations sidebar reachable. |
| F4 | Each kid has a daily time budget (configurable in `config.json`). The budget decrements while a video plays. At 0, an overlay shows "Bis morgen / See you tomorrow" and no new videos can start until local midnight. |
| F5 | Sudoku puzzle is deterministic per UTC date so all devices show the same one. |
| F6 | Daily content (word, fact, news) is regenerated nightly via a GitHub Action that commits `content/today.json`. If the action fails, the site falls back to the most recent successful generation. |
| F7 | The YouTube whitelist is two committed files: `whitelist-noa.json`, `whitelist-nina.json`. Adding a video creates a PR; merging takes effect within a minute (GitHub Pages rebuild). |
| F8 | Parent override PIN is stored hashed in `config.json` and never logged. |
| F9 | The app is fully usable offline once loaded (PWA with service worker caching today's content + the whitelist). YouTube playback obviously requires the network. |

### 7.3 Non-functional requirements

- **Privacy:** No analytics, no third-party trackers. Browser network tab should show only YouTube embed traffic and our own GitHub Pages host.
- **Cost:** €0/month for v1.
- **Maintenance:** Adding a video must take <30 seconds for a parent on their phone.
- **Accessibility:** Minimum tap target 44×44 px; high contrast theme; audio for Nina's screen.
- **Languages:** UI is bilingual **German + English** from day one. A per-profile language toggle (top-right) switches all labels, voice-overs, and the active news headline. Word of the day always shows both languages side-by-side regardless of toggle. Default language per profile is configurable in `config.json`.

## 8. Technical architecture (v1)

```
bearagent/
├── index.html                # Profile picker
├── kid/
│   ├── noa.html              # Noa's home screen
│   └── nina.html             # Nina's home screen
├── parent/
│   └── override.html         # PIN-gated admin
├── assets/                   # CSS, fonts, avatars, icons
├── js/
│   ├── timer.js              # Per-profile localStorage timer
│   ├── sudoku.js             # Daily puzzle generator
│   ├── tts.js                # speechSynthesis wrapper
│   └── youtube.js            # Safe embed wrapper
├── content/
│   ├── today.json            # Generated nightly
│   ├── whitelist-noa.json    # Hand-curated
│   ├── whitelist-nina.json   # Hand-curated
│   └── schedule.json         # Hand-edited
├── config.json               # Time budgets, PIN hash, language
├── manifest.webmanifest      # PWA install on the tablet
├── sw.js                     # Service worker for offline
└── .github/workflows/
    └── daily-content.yml     # Cron: regenerate content/today.json
```

- **No framework.** Vanilla JS modules. We can introduce a tiny library (e.g. preact, htm) only if rendering complexity demands it.
- **No build step** for v1. If we add TypeScript later, esbuild is the lightest option.
- **Hosting:** GitHub Pages from `main`.
- **Daily content job:** GitHub Action running on cron `0 4 * * *` UTC (early morning EU). Pulls word lists, news headline, fact-of-day from sources tbd, writes `content/today.json`, commits, pushes.
- **PWA:** Tablet installs Bearagent as a home-screen app and runs full-screen.

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| YouTube recommendation sidebar leaks unsafe content | Use `youtube-nocookie.com` + `controls=0` + `rel=0`. Cover end-of-video screen with our own overlay rather than letting YouTube show suggestions. |
| Kids learn to bypass the timer by reloading | Timer state in `localStorage` keyed by date + profile; reload doesn't reset. |
| Daily content job fails silently | Workflow opens a GitHub issue on failure; site falls back to last good `today.json`. |
| Scope creep across all three pillars | This PRD: ship Kids Hub v1 first, no exceptions. |
| Adam and Jael disagree on what's age-appropriate | Whitelist via PR → both can review before merge. |

## 10. Success metrics

Family-app metrics, not SaaS metrics:

- **Daily use:** Noa and Nina each open Bearagent ≥3 days/week unprompted within a month of launch.
- **Curation tempo:** Parents add ≥2 videos/week to the whitelist in the first month (sign that the whitelist model isn't friction).
- **Calm:** Reduction in "can I watch something?" negotiations (subjective, parent-reported).
- **Stability:** No more than 1 site outage per month attributable to our code.

## 11. Decisions made

| Date | Decision | Notes |
|---|---|---|
| 2026-05-20 | MVP pillar = **Kids Hub** | Planner and Finance follow in later versions. |
| 2026-05-20 | Primary devices = **wall tablet + each kid's own device** | Profile-switching is v1; auth is not (family-only). |
| 2026-05-20 | Stack philosophy = **static-first** | GitHub Pages + nightly Action; backends require justification. |
| 2026-05-20 | UI languages = **DE + EN day one** | Per-profile toggle; word of the day always bilingual. |
| 2026-05-20 | Kids' news source = **ZDF *logo!* (DE) + BBC *Newsround* (EN)** | Both public-broadcaster, both RSS-available. |
| 2026-05-20 | Schedule source for v1 = **hand-edited `schedule.json`** | Calendar integration deferred to v2. |

## 12. Open questions (still need a call before v1 ships)

1. **PIN:** One shared parent PIN or one per parent?
2. **Avatars:** Photos of the kids, or illustrated bear avatars? (Privacy + cuteness tradeoff.)
3. **Domain:** Custom domain (e.g. `bearagent.family`) or stay on `jaelrolli-coder.github.io/bearagent`?
4. **Country/region:** For B2/B3 in v2 we need to know which Kanton / Bundesland to import school holidays from.

## 13. Out of scope (forever, or until reconsidered)

- Public signups, billing, marketing site.
- Real-time chat between family members (use WhatsApp / Signal).
- Cloud sync of arbitrary documents (use iCloud / Drive).
- AI chatbot for the kids (revisit only with very clear safety story).
- Smart-home integration (lights, thermostats) — interesting but a different product.

---

*This PRD is a living document. Suggested editing flow: branch → edit → PR → merge. Major changes (new pillar, change of stack) deserve a short ADR in `docs/adr/`.*
