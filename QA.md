# QA.md — Manual QA Checklist (MVP)

This checklist matches the MVP “Definition of Done” and is designed to catch the most common RSVP reader bugs (timer drift, multi-timeout runaway, parsing edge cases).

---

## 1) Build & Smoke
- [ ] `npm install` succeeds without errors
- [ ] `npm run dev` starts and app loads at `/`
- [ ] No console errors on initial load
- [ ] `/reader` route loads without errors (even without an active document)

---

## 2) Upload & Parsing

### 2.1 TXT
- [ ] Upload a `.txt` file (short, ~1 paragraph) → preview shows correct text
- [ ] Upload a `.txt` file (long, several pages) → token count looks reasonable
- [ ] Non-UTF8 / odd characters: preview doesn’t crash the app (may show replacement chars)

### 2.2 DOCX
- [ ] Upload a `.docx` with multiple paragraphs → paragraphs separated sensibly
- [ ] Upload a `.docx` with punctuation-heavy text → punctuation preserved
- [ ] Invalid `.docx` shows a friendly error, app remains usable

### 2.3 PDF (text-based)
- [ ] Upload a text-based `.pdf` → preview contains readable text
- [ ] Multi-page PDF → text includes page breaks/newlines, app remains responsive
- [ ] Very small PDF → no crash, token count correct

### 2.4 PDF (scanned/image-based)
- [ ] Upload a scanned PDF (if available) → shows “No readable text found (scanned PDF?)”
- [ ] App does not crash; user can re-upload

### 2.5 File validation
- [ ] Upload unsupported file type (e.g., `.png`) → clear error message
- [ ] Error state can be dismissed; user canive can continue

---

## 3) Tokenization
- [ ] Token count matches expectations (roughly words in the document)
- [ ] Punctuation remains attached to tokens (e.g., `hello,` and `world.` are tokens)
- [ ] No empty tokens (no blank flashes)
- [ ] Large whitespace/newlines don’t create empty tokens

---

## 4) Reader — Reading Mode

### 4.1 Playback controls
- [ ] Press Play → tokens advance
- [ ] Press Pause → token advancement stops immediately
- [ ] Press Play again → continues from same token
- [ ] Restart → goes back to token index 0
- [ ] Back 10 → index decreases by 10 (floors at 0)
- [ ] Forward 10 → index increases by 10 (caps at end)

### 4.2 WPM behavior (300–900)
- [ ] Set WPM to 300 → pace is slow and consistent
- [ ] Set WPM to 900 → pace is fast and consistent
- [ ] Change WPM while playing → pace changes on subsequent tokens (no freeze, no jump)
- [ ] Change WPM while paused → resume uses the new WPM

### 4.3 Progress
- [ ] Progress indicator updates accurately (index / total)
- [ ] Reaching end of tokens stops playback cleanly (no errors)

---

## 5) Reader — Challenge Mode

### 5.1 Ramp behavior
- [ ] Starts at 300 WPM (or near)
- [ ] WPM increases over time (smooth or stepwise)
- [ ] Reaches 900 WPM by end of ramp/session
- [ ] UI displays current WPM and updates

### 5.2 Controls still behave
- [ ] Pause halts advancement immediately
- [ ] Resume continues correctly
- [ ] Restart resets ramp timer (back to start WPM)
- [ ] Back/Forward works without breaking ramp

---

## 6) ORP Highlight (visual stability)
- [ ] ORP character is visually emphasized
- [ ] ORP alignment appears stable between words (minimal jitter)
- [ ] Very short words (1–2 chars) render without errors
- [ ] Long words (14+ chars) still highlight a sensible ORP position

---

## 7) Timing Rules & Drift Detection (critical)
Run each check for at least 60–120 seconds to catch drift.

### 7.1 Punctuation pauses
- [ ] Tokens ending with `. ! ?` hold noticeably longer than normal tokens
- [ ] Tokens ending with `, ; :` hold moderately longer than normal tokens

### 7.2 Long word behavior
- [ ] Long words (>= 8 chars) display slightly longer than short words

### 7.3 Drift / runaway timer check
- [ ] After multiple pause/resume cycles (5+), pace remains correct
- [ ] No sudden acceleration that suggests multiple timeouts are active
- [ ] No token skipping beyond expected Back/Forward actions

---

## 8) Audio Player (MVP)
> Note: mobile browsers require user gesture to start audio.

- [ ] Select a track → it loads
- [ ] Play audio → audible playback begins
- [ ] Pause audio → audio stops
- [ ] Volume slider changes loudness
- [ ] Audio continues while reader plays
- [ ] Pausing reader does not break audio (MVP acceptable)
- [ ] App does not crash if audio file missing (shows error or fails gracefully)

---

## 9) Persistence (if implemented)
- [ ] Refresh page → mode/WPM/volume/track restore
- [ ] Re-open same document → last token index restores
- [ ] “Reset progress” clears saved state

---

## 10) Mobile Responsiveness (minimum)
Test on iOS Safari and/or Android Chrome.

- [ ] Word stays centered and readable
- [ ] Controls reachable and not clipped
- [ ] Slider is usable
- [ ] Audio controls accessible
- [ ] No continuous layout shift while playing

---

## 11) Accessibility (minimum)
- [ ] Buttons have accessible labels (aria-label where needed)
- [ ] Tab navigation reaches key controls
- [ ] Focus outlines are visible
- [ ] Space/Arrow/R shortcuts work on desktop without breaking inputs

---

## 12) Final Sign-off
- [ ] No major console errors in a full session
- [ ] Reading Mode meets requirements (upload → read at chosen WPM)
- [ ] Challenge Mode meets requirements (ramp → 900 WPM)
- [ ] ORP highlight works and is stable
- [ ] Audio works with at least one MP3
- [ ] User can recover from errors (re-upload, restart, etc.)

