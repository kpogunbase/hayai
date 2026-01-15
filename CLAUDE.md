# CLAUDE.md — Speed Reading App (RSVP “Reading Mode” + “Challenge Mode” + Focus Audio)

## 0) What you are building
Build a web app that lets users upload text (TXT, DOCX, PDF), then read it in an RSVP “one word at a time” view with a fixed focal point (ORP highlight). Users can:
- **Reading Mode:** manually set WPM via slider (300–900).
- **Challenge Mode:** automatically ramps difficulty up to 900 WPM (smooth or stepwise).
- **Focus Audio (MVP):** play bundled MP3 tracks in the background (Spotify/Brain.fm later).

The MVP must be shippable quickly, performant, and stable on desktop + mobile.

---

## 1) Target stack & constraints
### Required
- **Next.js (App Router)** + **TypeScript**
- Client-side parsing for MVP (privacy-friendly, no backend needed).
- Use lightweight, well-supported libraries:
  - **TXT**: FileReader
  - **DOCX**: `mammoth`
  - **PDF**: `pdfjs-dist`

### Optional (nice-to-have)
- TailwindCSS for fast UI styling (ok to use).
- Local persistence: LocalStorage/IndexedDB (store settings + last position per doc).

### Constraints
- Parsing happens in the browser for MVP.
- The reader must avoid drift/timer bugs; use `setTimeout` scheduling (not `setInterval`) to handle variable delays (punctuation/long words).
- Avoid heavy frameworks or premature backend work.

---

## 2) Product requirements (MVP scope)

### 2.1 Upload & parsing
- Accept **.txt, .docx, .pdf** uploads.
- Extract **plain text** reliably:
  - DOCX: preserve paragraphs/line breaks reasonably.
  - PDF: extract text with page separation; do not OCR for MVP.
- After parsing:
  - show a short preview (first 500–1000 chars) and word count.
  - allow user to start reader in Reading or Challenge mode.

### 2.2 Tokenization
- Convert extracted text into tokens:
  - Default tokenization: split on whitespace.
  - Preserve punctuation attached to words (e.g., `hello,` stays one token).
- Track:
  - `tokens: string[]`
  - `index: number`
  - `total: number`

### 2.3 Reader UI
- Display **one token at a time** centered.
- Highlight ORP (optimal recognition point) character within the token.
- Provide controls:
  - Play/Pause
  - Restart
  - Back 10 tokens
  - Forward 10 tokens
  - Progress bar (index / total)
  - Keyboard shortcuts: Space (play/pause), ←/→ (back/forward), R (restart)
- Provide WPM:
  - Reading Mode: slider **300–900** (step 10 or 25).
  - Challenge Mode: show current WPM (computed), no manual slider (or disable it).

### 2.4 Timing rules (important)
- Base interval: `60000 / wpm` ms per token
- Apply multipliers:
  - Long word: if stripped length ≥ 8, multiply by ~1.25 (tunable)
  - Light punctuation (`, ; :`): multiply by ~1.6
  - Heavy punctuation (`. ! ?`): multiply by ~2.2
- Must be easily adjustable via constants.

### 2.5 Challenge Mode behavior
- Starts at **300 WPM** and ramps to **900 WPM**.
- Two acceptable ramp options (pick one and implement cleanly):
  1) Smooth ramp using ease-in-out over session duration (e.g., 2–5 minutes)
  2) Stepwise ramp: +25 WPM every 10 seconds until 900
- Provide a simple “session duration” selector (e.g., 2m / 3m / 5m) OR a fixed default.

### 2.6 Focus audio (MVP)
- Bundle 3–6 MP3 tracks in `/public/audio/`.
- Minimal audio player:
  - play/pause
  - track select
  - volume slider
- Audio can be independent from reader play/pause (MVP ok), but auto-duck on pause is a plus.

### 2.7 Persistence (MVP+)
- Save settings: last mode, last WPM (Reading Mode), audio volume, selected track.
- Save last reading position per document (by hash of content or file name + size + lastModified).

---

## 3) Non-goals (explicitly out of scope for MVP)
- User accounts, cloud sync, payments.
- OCR for scanned PDFs.
- Full Spotify/Brain.fm integration.
- Complex comprehension testing or analytics dashboards.

---

## 4) Engineering plan (what to build first)
Implement in this order:

1) **Project scaffold**
   - Next.js + TS + (Tailwind optional)
   - Basic layout and routing: `/` upload, `/reader` view.

2) **Parsing pipeline**
   - Upload component
   - Parse TXT/DOCX/PDF into plain text
   - Store parsed result in memory + optional local storage

3) **Tokenizer**
   - Produce `tokens[]`
   - Display counts and preview

4) **Reader engine**
   - State machine: `isPlaying`, `index`, `mode`, `wpm`, `startTime`
   - Scheduler with `setTimeout` using computed per-token interval

5) **ORP rendering**
   - ORP index heuristic + split into left/orp/right spans
   - Fixed ORP alignment using CSS

6) **Challenge mode ramp**
   - Implement ramp function and integrate into scheduler

7) **Audio player**
   - Play MP3 from `/public/audio`
   - Volume slider + track select

8) **Persistence**
   - Save/restore settings and last index

9) **Polish**
   - Keyboard shortcuts
   - Mobile responsive / fullscreen
   - Error handling (bad PDFs, empty docs)

---

## 5) File/folder structure (suggested)
Use this as the starting structure.

- `app/`
  - `page.tsx` (Upload screen)
  - `reader/page.tsx` (Reader screen)
  - `layout.tsx`
- `components/`
  - `UploadDropzone.tsx`
  - `ModeSelector.tsx`
  - `WpmSlider.tsx`
  - `ReaderControls.tsx`
  - `RsvpWord.tsx` (ORP highlight rendering)
  - `ProgressBar.tsx`
  - `AudioPlayer.tsx`
- `lib/`
  - `parse/`
    - `parseTxt.ts`
    - `parseDocx.ts`
    - `parsePdf.ts`
    - `index.ts`
  - `tokenize.ts`
  - `reader/`
    - `timing.ts` (interval calc + punctuation rules)
    - `orp.ts` (orpIndex + render helpers)
    - `ramp.ts` (challenge ramp functions)
  - `storage.ts` (local persistence)
  - `hash.ts` (doc identity hash)
- `public/audio/`
  - `focus-1.mp3`, `focus-2.mp3`, ...
- `types/`
  - `reader.ts` (Mode, ReaderState, etc.)

---

## 6) Implementation details & reference logic

### 6.1 Interval calculation
Implement in `lib/reader/timing.ts`:

- `baseIntervalMs(wpm) = 60000 / wpm`
- `intervalForToken(token, wpm)` applies multipliers:
  - `strip(token)` removes non-letter/number apostrophes for length measurement
  - punctuation multipliers for endings
  - long word multiplier

Keep constants at top:
- `LONG_WORD_LEN = 8`
- `LONG_WORD_MULT = 1.25`
- `LIGHT_PUNCT_MULT = 1.6`
- `HEAVY_PUNCT_MULT = 2.2`

### 6.2 ORP (optimal recognition point)
Implement in `lib/reader/orp.ts`:

Heuristic:
- length 1–2 → index 0
- 3–5 → index 1
- 6–9 → index 2
- 10–13 → index 3
- 14+ → index 4

Rendering:
- split token into `left`, `orpChar`, `right`
- keep ORP aligned by using monospace-ish layout OR CSS grid:
  - Use a container with fixed width and center alignment.
  - Option: render left padded with `ch` units based on ORP position.

### 6.3 Scheduler pattern (avoid interval drift)
Use a single `setTimeout` “tick” loop:
- On start, set `isPlaying = true` and schedule next tick.
- Each tick:
  - compute `effectiveWpm` (Reading: slider; Challenge: ramp)
  - compute interval for current token
  - advance `index++`
  - schedule next tick
- On pause:
  - clear timeout ref
  - keep index stable

### 6.4 Challenge ramp functions
Implement in `lib/reader/ramp.ts`:

Option A (smooth):
- `wpm(t) = start + (end-start) * easeInOut(t/duration)`
- `easeInOut(x) = 0.5 * (1 - cos(pi * clamp01(x)))`

Option B (step):
- every `STEP_SECONDS`, increase by `STEP_WPM` until end.

Expose:
- `getChallengeWpm(elapsedMs, config)`

---

## 7) Accessibility & UX requirements
- Provide visible focus states on controls.
- Ensure keyboard shortcuts work and do not conflict with sliders.
- On mobile, ensure:
  - the word stays centered
  - controls are reachable
  - audio controls don’t block play/pause

---

## 8) Error handling
- If parsing fails:
  - show a user-friendly error message
  - allow re-upload
- If extracted text is empty:
  - show “No readable text found” and guidance (PDF may be scanned)

---

## 9) Testing (minimum)
- Unit test pure functions:
  - `intervalForToken()`
  - `orpIndex()`
  - `getChallengeWpm()`
- Basic integration sanity:
  - Upload TXT → tokens → reader starts and progresses
- Manual QA checklist:
  - pause/resume doesn’t skip/jump
  - back/forward works while paused
  - WPM changes take effect immediately in Reading Mode
  - Challenge Mode reaches 900 WPM by end of ramp

---

## 10) Definition of Done (MVP)
MVP is “done” when:
- Upload TXT/DOCX/PDF → parses to tokens.
- Reading Mode: slider 300–900 WPM works; reader plays smoothly; controls work.
- Challenge Mode: ramp to 900 WPM works; UI shows current WPM.
- ORP highlight is visible and consistent.
- Background MP3 audio plays with volume control.
- No major timer drift or runaway timeouts; pausing reliably stops progression.
- Mobile layout works.

---

## 11) Development commands (fill in as you scaffold)
After scaffolding, update this section to reflect your setup.

- Install deps:
  - `npm install mammoth pdfjs-dist`
- Run:
  - `npm run dev`
- Build:
  - `npm run build`
- Lint:
  - `npm run lint`

---

## 12) Task list for Claude Code (execute sequentially)
When working in Claude Code, implement tasks in this order:

1. Scaffold Next.js + TS + App Router routes: `/` and `/reader`
2. Build upload UI + file type validation
3. Implement parsers:
   - `parseTxt`
   - `parseDocx` (mammoth)
   - `parsePdf` (pdfjs-dist)
4. Implement `tokenize(text) -> tokens[]`
5. Implement Reader engine:
   - state + scheduler + controls
6. Implement ORP rendering component
7. Implement Reading Mode WPM slider
8. Implement Challenge Mode ramp
9. Implement AudioPlayer with bundled MP3
10. Add persistence of settings + last position
11. Add keyboard shortcuts + mobile polish
12. Add unit tests for pure functions

---

## 13) Notes for future iterations (not now)
- Spotify integration: OAuth + Web Playback SDK (Premium)
- Brain.fm: partner/player integration if available
- Accounts + progress history + streaks
- Comprehension checks
- Multi-document library
- “Pause on paragraph break” and smarter tokenization

