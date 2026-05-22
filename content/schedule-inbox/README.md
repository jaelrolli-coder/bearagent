# Schedule inbox

Drop schedule PDFs and screenshots into **this folder**. The
**Process schedule inbox** GitHub Action picks them up automatically and
adds the events to `content/schedule.json` via Claude Haiku 4.5 (vision).

## Local workflow (recommended)

1. Drop the file into `content/schedule-inbox/` in Finder.
2. From the repo root, run:
   ```sh
   ./bin/sync-inbox
   ```
   That stages, commits, and pushes everything in this folder.
3. The Action processes within ~30 seconds. Watch it at
   <https://github.com/jaelrolli-coder/bearagent/actions/workflows/process-inbox.yml>.

The wrapper is just `git add` + commit + push — feel free to inline that into
a `bearagent-sync` shell alias if you prefer.

## Web workflow (no terminal)

Go to this folder on github.com → **Add file → Upload files** → drag → commit.
Same Action runs.

## What you'll see after processing

- Successful files move to `processed/` with a date prefix.
- Failed files move to `failed/` — open them, see what went wrong, fix and
  re-drop.
- Every event added to `schedule.json` has `_source` (the original filename)
  and `_addedAt` (date), so the audit trail is right there.

## Supported file types

- `.pdf` — multi-page OK (a Stundenplan PDF is the canonical case)
- `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` — screenshots from WhatsApp, the
  school portal, your camera roll

## What the extractor does

For a **school timetable** (Stundenplan) it adds **one event per day** with
the start time, not one per lesson. For a **single activity** (piano,
swimming, playgroup) it adds one event per weekly session.

If it can't tell which kid the file is for, it adds the event to BOTH and
flags it in the workflow log — reassign in the parent override.

## Cost & privacy

- Cost: ~$0.005 per file (Claude Haiku 4.5). 100 drops/month ≈ $0.50.
  Anthropic's free tier covers low-volume use.
- The file contents are sent to Anthropic's API. Per their terms, API inputs
  are not used to train models. If you'd rather keep this fully local,
  switch to a tesseract-based extractor (a regression in accuracy).
