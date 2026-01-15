# .github/PULL_REQUEST_TEMPLATE.md

## Summary
Describe what this PR changes and why (1–3 sentences).

## Type of change
- [ ] feat (new functionality)
- [ ] fix (bug fix)
- [ ] chore (tooling/refactor/docs)
- [ ] perf (performance improvement)
- [ ] test (add/update tests)

## Screenshots / Demo (optional)
Attach screenshots or a short recording, especially for UI/timing changes.

---

## Key areas touched
- [ ] Upload / Parsing
- [ ] Tokenization
- [ ] Reader scheduler / timing
- [ ] ORP rendering
- [ ] Reading Mode (WPM slider)
- [ ] Challenge Mode (ramp)
- [ ] Audio player
- [ ] Persistence / storage
- [ ] Mobile / accessibility
- [ ] Tests

---

## How to test (required)
Provide exact steps a reviewer can follow.

1.
2.
3.

---

## QA Checklist (match QA.md)
### Build & smoke
- [ ] `npm run dev` starts, `/` loads, no console errors on initial load

### Upload & parsing
- [ ] TXT upload works (preview + token count)
- [ ] DOCX upload works (preview readable)
- [ ] PDF upload works for text-based PDFs
- [ ] Scanned/empty-text PDF shows friendly message (no crash)
- [ ] Unsupported file types show validation error

### Reader (Reading Mode)
- [ ] Play/Pause works reliably (pause stops advancement immediately)
- [ ] Restart resets to token index 0
- [ ] Back/Forward ±10 works (paused and playing)
- [ ] WPM slider 300–900 updates pace (including while playing)
- [ ] Progress indicator stays accurate

### Reader (Challenge Mode)
- [ ] Starts at ~300 WPM
- [ ] Ramps toward 900 WPM (smooth or stepwise) without drift
- [ ] Restart resets the ramp timer
- [ ] Back/Forward and pause/resume do not break the ramp

### ORP highlight
- [ ] ORP emphasized and stable (minimal jitter)
- [ ] Short/long tokens render without errors

### Timing drift & runaway timer detection (critical)
- [ ] After 5+ pause/resume cycles, pace remains correct
- [ ] No sudden acceleration (no multiple timeouts)
- [ ] No unexpected token skipping

### Audio (MVP)
- [ ] Track select + play/pause + volume works
- [ ] Audio doesn’t crash the app if playback fails on first attempt (mobile gesture rules)

### Mobile sanity
- [ ] Word remains centered and readable
- [ ] Controls accessible and not clipped

---

## Tests
- [ ] Added/updated unit tests for pure functions (timing/orp/ramp/tokenize)
- [ ] All tests pass locally (`npm test`)

---

## Notes / Risk
Call out anything that might be risky:
- timer/scheduler refactors
- parsing library changes
- ORP layout changes
- mobile audio behavior changes

## Checklist
- [ ] I ran the QA steps relevant to this change
- [ ] I updated docs if behavior changed (README/QA.md)
- [ ] I avoided introducing multiple timers or interval drift
