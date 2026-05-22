// Processes files dropped into content/schedule-inbox/.
//
// For each file (PDF or image):
//   1. Send to Claude Haiku 4.5 (vision-capable) with a prompt that asks for
//      a structured JSON array of recurring weekly events.
//   2. Merge the events into content/schedule.json (additive — never wipes).
//   3. Move the source file to content/schedule-inbox/processed/<date>-<name>
//      on success, or content/schedule-inbox/failed/ on error.
//
// Requires env: ANTHROPIC_API_KEY (set as a repo secret).
// Designed for Node 22 (built-in fetch).

import {
  readFileSync, writeFileSync, readdirSync, mkdirSync,
  renameSync, statSync, existsSync
} from 'node:fs';
import { dirname, resolve, join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INBOX = join(ROOT, 'content/schedule-inbox');
const PROCESSED = join(INBOX, 'processed');
const FAILED = join(INBOX, 'failed');
const SCHEDULE_PATH = join(ROOT, 'content/schedule.json');

const MODEL = 'claude-haiku-4-5';
const API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. Set it via: gh secret set ANTHROPIC_API_KEY');
  process.exit(1);
}

const EXTRACTION_PROMPT = `You are a schedule-extraction assistant for the Rolli family's "Bearagent" app.

Family context:
- Noa: boy, 7 years old, attends primary school (Primarschule) in Lenzerheide, Kanton Graubünden, Switzerland (German-speaking, may include Romansh).
- Nina: girl, 3 years old, may attend Spielgruppe (playgroup).

Your job: read the attached file (PDF or image) and extract RECURRING WEEKLY events. The output drives a weekly tile UI for the kids.

Return ONLY a valid JSON object (no markdown fences, no prose) with this shape:

{
  "events": [
    {
      "kid": "noa" | "nina" | "both" | "unknown",
      "day": "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
      "time": "HH:MM",
      "icon": "🎒",
      "de": "Schule",
      "en": "School"
    }
  ],
  "meta": {
    "source": "brief description (e.g. 'Stundenplan 2. Klasse Lenzerheide')",
    "confidence": "high" | "medium" | "low",
    "notes": "anything important that didn't fit as an event"
  }
}

Rules:
- For a school timetable (Stundenplan), output ONE event per day named "Schule"/"School" with that day's START time — NOT one event per lesson.
- For a single activity (piano, swimming, football, playgroup), output one event per weekly session.
- Use 24h time (HH:MM). If no specific time, use "".
- Icons: school 🎒, football ⚽, piano 🎹, swimming 🏊, art 🎨, playgroup 🌸, music 🎵, dance 💃, library 📚, gymnastics 🤸, ski ⛷, hike 🥾, doctor 🩺, dentist 🦷. Pick the best fit.
- German days: Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag (map to monday..sunday).
- If you can't tell which kid the file is for, use "kid": "unknown" — the parent will reassign in the override.
- If the file isn't a schedule (random photo, blank page, unrelated), return {"events": [], "meta": {"confidence": "low", "notes": "not a schedule"}}.`;

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

async function callClaude(filePath) {
  const buf = readFileSync(filePath);
  const ext = extname(filePath).toLowerCase();
  const b64 = buf.toString('base64');

  let block;
  if (ext === '.pdf') {
    block = {
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: b64 }
    };
  } else if (IMAGE_EXTS.has(ext)) {
    const media = ext === '.jpg' ? 'image/jpeg' : `image/${ext.slice(1)}`;
    block = {
      type: 'image',
      source: { type: 'base64', media_type: media, data: b64 }
    };
  } else {
    throw new Error(`unsupported file type: ${ext}`);
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [block, { type: 'text', text: EXTRACTION_PROMPT }]
      }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  const text = data.content[0].text;

  // Strip code fences if Claude added them despite the instruction.
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(cleaned);
}

function loadSchedule() {
  return JSON.parse(readFileSync(SCHEDULE_PATH, 'utf8'));
}
function saveSchedule(s) {
  writeFileSync(SCHEDULE_PATH, JSON.stringify(s, null, 2) + '\n');
}

function mergeEvents(schedule, events, sourceName) {
  let added = 0;
  let needReview = 0;
  for (const ev of events) {
    if (!ev.day || !ev.de) continue;
    const dayKey = String(ev.day).toLowerCase();
    let kids;
    if (ev.kid === 'both' || ev.kid === 'unknown') {
      kids = ['noa', 'nina'];
      if (ev.kid === 'unknown') needReview++;
    } else if (ev.kid === 'noa' || ev.kid === 'nina') {
      kids = [ev.kid];
    } else {
      continue;
    }

    for (const k of kids) {
      if (!schedule[k]) schedule[k] = { weekly: {} };
      if (!schedule[k].weekly) schedule[k].weekly = {};
      if (!schedule[k].weekly[dayKey]) schedule[k].weekly[dayKey] = [];
      schedule[k].weekly[dayKey].push({
        time: ev.time || '',
        icon: ev.icon || '📌',
        de: ev.de,
        en: ev.en || ev.de,
        _source: sourceName,
        _addedAt: new Date().toISOString().slice(0, 10)
      });
      added++;
    }
  }
  return { added, needReview };
}

function moveFile(src, destDir) {
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const name = basename(src);
  const dest = join(destDir, `${stamp}-${name}`);
  renameSync(src, dest);
  return dest;
}

async function main() {
  if (!existsSync(INBOX)) {
    console.log('No inbox directory; nothing to do.');
    return;
  }

  const entries = readdirSync(INBOX)
    .filter((n) => !n.startsWith('.') && n !== 'README.md')
    .map((n) => join(INBOX, n))
    .filter((p) => { try { return statSync(p).isFile(); } catch (e) { return false; } });

  if (entries.length === 0) {
    console.log('Inbox is empty; nothing to process.');
    return;
  }

  console.log(`Found ${entries.length} file(s) to process.`);

  const schedule = loadSchedule();
  const summary = [];
  let totalAdded = 0;
  let totalReview = 0;

  for (const file of entries) {
    const name = basename(file);
    console.log(`\n→ ${name}`);
    try {
      const result = await callClaude(file);
      const events = result.events || [];
      const confidence = (result.meta && result.meta.confidence) || '?';
      console.log(`  extracted: ${events.length} event(s), confidence: ${confidence}`);
      const { added, needReview } = mergeEvents(schedule, events, name);
      totalAdded += added;
      totalReview += needReview;
      const dest = moveFile(file, PROCESSED);
      summary.push(`✓ ${name}: ${events.length} events (→ ${basename(dest)})`);
    } catch (err) {
      console.error(`  ✗ failed: ${err.message}`);
      moveFile(file, FAILED);
      summary.push(`✗ ${name}: ${err.message}`);
    }
  }

  saveSchedule(schedule);

  console.log('\n========== Summary ==========');
  summary.forEach((s) => console.log(s));
  console.log(`\nTotal events added: ${totalAdded}`);
  if (totalReview > 0) {
    console.log(`⚠ ${totalReview} unknown-kid event(s) added to BOTH kids; review in parent override.`);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
