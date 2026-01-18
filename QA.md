# QA.md — Manual QA Checklist

This checklist covers all features of Hayai, including the core RSVP reader, library management, analytics, onboarding, and mobile responsiveness.

---

## 1) Build & Smoke

- [ ] `npm install` succeeds without errors
- [ ] `npm run dev` starts and app loads at `/`
- [ ] `npm run build` completes without errors
- [ ] No console errors on initial load
- [ ] `/reader` route loads without errors (even without an active document)

---

## 2) Upload & Parsing

### 2.1 TXT
- [ ] Upload a `.txt` file (short, ~1 paragraph) → preview shows correct text
- [ ] Upload a `.txt` file (long, several pages) → token count looks reasonable
- [ ] Non-UTF8 / odd characters: preview doesn't crash the app

### 2.2 DOCX
- [ ] Upload a `.docx` with multiple paragraphs → paragraphs separated sensibly
- [ ] Upload a `.docx` with punctuation-heavy text → punctuation preserved
- [ ] Invalid `.docx` shows a friendly error, app remains usable

### 2.3 PDF (text-based)
- [ ] Upload a text-based `.pdf` → preview contains readable text
- [ ] Multi-page PDF → text includes page breaks/newlines, app remains responsive
- [ ] Very small PDF → no crash, token count correct

### 2.4 PDF (scanned/image-based)
- [ ] Upload a scanned PDF → shows "No readable text found (scanned PDF?)"
- [ ] App does not crash; user can re-upload

### 2.5 EPUB
- [ ] Upload an `.epub` file → text extracted correctly
- [ ] Chapter breaks preserved where applicable
- [ ] Large EPUB files don't freeze the app

### 2.6 Paste Text
- [ ] Click "Paste Text" button → modal opens
- [ ] Paste text and submit → reader loads with pasted content
- [ ] Empty paste shows validation error
- [ ] Modal closes on successful submit

### 2.7 File Validation
- [ ] Upload unsupported file type (e.g., `.png`) → clear error message
- [ ] Error state can be dismissed; user can continue

---

## 3) Tokenization

- [ ] Token count matches expectations (roughly words in the document)
- [ ] Punctuation remains attached to tokens (e.g., `hello,` and `world.`)
- [ ] No empty tokens (no blank flashes)
- [ ] Large whitespace/newlines don't create empty tokens

---

## 4) Reader — Reading Mode

### 4.1 Playback Controls
- [ ] Press Play → tokens advance
- [ ] Press Pause → token advancement stops immediately
- [ ] Press Play again → continues from same token
- [ ] Restart → goes back to token index 0
- [ ] Back 10 → index decreases by 10 (floors at 0)
- [ ] Forward 10 → index increases by 10 (caps at end)

### 4.2 WPM Behavior (300–900)
- [ ] Set WPM to 300 → pace is slow and consistent
- [ ] Set WPM to 900 → pace is fast and consistent
- [ ] Change WPM while playing → pace changes on subsequent tokens
- [ ] Change WPM while paused → resume uses the new WPM

### 4.3 Progress
- [ ] Progress indicator updates accurately (index / total)
- [ ] Reaching end of tokens stops playback cleanly (no errors)

---

## 5) Reader — Challenge Mode

### 5.1 Ramp Behavior
- [ ] Starts at 300 WPM (or near)
- [ ] WPM increases over time (smooth or stepwise)
- [ ] Reaches 900 WPM by end of ramp/session
- [ ] UI displays current WPM and updates
- [ ] Session duration selector works (2m / 3m / 5m)

### 5.2 Controls Still Behave
- [ ] Pause halts advancement immediately
- [ ] Resume continues correctly
- [ ] Restart resets ramp timer (back to start WPM)
- [ ] Back/Forward works without breaking ramp

---

## 6) Reader — Gradual Increase Mode

### 6.1 Stage Progression
- [ ] Toggle Gradual Increase with `G` key → mode activates
- [ ] Toggle button shows active state (green/highlighted)
- [ ] 0–20% progress → WPM is 300
- [ ] 20–40% progress → WPM is 360
- [ ] 40–60% progress → WPM is 450
- [ ] 60–80% progress → WPM is 600
- [ ] 80–100% progress → WPM is 900

### 6.2 UI Feedback
- [ ] Current stage/WPM displayed in UI
- [ ] Stage transitions are smooth (no jumps in display)
- [ ] Disabling gradual increase returns to manual WPM slider

---

## 7) ORP Highlight (Visual Stability)

- [ ] ORP character is visually emphasized (different color)
- [ ] ORP alignment appears stable between words (minimal jitter)
- [ ] Very short words (1–2 chars) render without errors
- [ ] Long words (14+ chars) still highlight a sensible ORP position

---

## 8) Timing Rules & Drift Detection (Critical)

Run each check for at least 60–120 seconds to catch drift.

### 8.1 Punctuation Pauses
- [ ] Tokens ending with `. ! ?` hold noticeably longer than normal
- [ ] Tokens ending with `, ; :` hold moderately longer than normal

### 8.2 Long Word Behavior
- [ ] Long words (>= 8 chars) display slightly longer than short words

### 8.3 Drift / Runaway Timer Check
- [ ] After multiple pause/resume cycles (5+), pace remains correct
- [ ] No sudden acceleration that suggests multiple timeouts are active
- [ ] No token skipping beyond expected Back/Forward actions

---

## 9) Audio Player

> Note: Mobile browsers require user gesture to start audio.

- [ ] Select a track → it loads
- [ ] Play audio → audible playback begins
- [ ] Pause audio → audio stops
- [ ] Volume slider changes loudness
- [ ] Audio continues while reader plays
- [ ] Pausing reader does not break audio
- [ ] `,` key → previous track
- [ ] `.` key → next track
- [ ] App does not crash if audio file missing

---

## 10) Document Library

### 10.1 Saving Documents
- [ ] Upload a document → automatically saved to library
- [ ] Document appears in library panel (`L` key)
- [ ] Document title, word count, and date shown

### 10.2 Opening Documents
- [ ] Click document in library → loads in reader
- [ ] Reading position restored from last session
- [ ] `lastOpenedAt` timestamp updates

### 10.3 Deleting Documents
- [ ] Delete button shows confirmation
- [ ] Confirm delete → document removed from library
- [ ] Associated bookmarks and highlights also deleted

### 10.4 Library Panel UI
- [ ] `L` key toggles library panel
- [ ] Panel slides in/out smoothly
- [ ] `Esc` closes the panel
- [ ] Empty state shows helpful message

---

## 11) Bookmarks

- [ ] `B` key adds bookmark at current position
- [ ] Bookmark appears in side panel
- [ ] Bookmark shows context snippet (surrounding text)
- [ ] Click bookmark → jumps to that position
- [ ] Delete bookmark → removed from list
- [ ] Multiple bookmarks per document work correctly

---

## 12) Highlights

- [ ] `H` key starts highlight selection
- [ ] `H` key again ends highlight and saves it
- [ ] Highlighted range shown in side panel
- [ ] Click highlight → jumps to start position
- [ ] Delete highlight → removed from list
- [ ] Overlapping highlights handled gracefully

---

## 13) Analytics Modal

### 13.1 Display
- [ ] `A` key opens analytics modal
- [ ] Total words read displayed correctly
- [ ] Total reading time displayed (formatted)
- [ ] Average WPM calculated and shown
- [ ] Passages completed counter shows accurate count

### 13.2 Time Periods
- [ ] Today's stats shown
- [ ] This week's stats shown
- [ ] This month's stats shown

### 13.3 Interaction
- [ ] `Esc` or close button closes modal
- [ ] Analytics button in header opens modal

---

## 14) Feedback Modal

### 14.1 Opening
- [ ] `F` key opens feedback modal
- [ ] Feedback button (if present) opens modal

### 14.2 Text Input
- [ ] Type feedback in textarea
- [ ] Character count updates
- [ ] Submit button enabled when text present

### 14.3 Speech-to-Text
- [ ] Microphone button visible
- [ ] Click mic → browser prompts for permission
- [ ] Speaking → text appears in textarea
- [ ] Mic button shows recording state (pulsing/red)
- [ ] Click mic again → stops recording
- [ ] Graceful fallback if speech API not supported

### 14.4 Submission
- [ ] `Cmd/Ctrl + Enter` submits feedback
- [ ] Submit button shows loading state
- [ ] Success message shown after submit
- [ ] Modal closes after successful submit
- [ ] Feedback saved to Supabase (if configured)

---

## 15) Onboarding Flow

### 15.1 First-Time User
- [ ] New user (cleared localStorage) sees onboarding
- [ ] Welcome screen displays with "Get Started" button
- [ ] Skip button available throughout

### 15.2 Interactive Steps
- [ ] Upload step: highlights upload area, completes on file upload
- [ ] Play step: highlights play button, completes on `Space` key
- [ ] Navigate step: highlights controls, completes on arrow key
- [ ] Speed step: highlights WPM slider, allows slider interaction
- [ ] Shortcuts step: highlights shortcuts modal, completes on `?` key

### 15.3 Step Transitions
- [ ] Success message shows with gradient background
- [ ] Auto-advance after ~2.2 seconds
- [ ] Progress indicator updates
- [ ] Spotlight moves smoothly between targets

### 15.4 Completion
- [ ] "You're all set!" screen shows celebration animation
- [ ] Confetti/particle effects visible
- [ ] Onboarding completion stored in localStorage
- [ ] Refreshing page does not restart onboarding

### 15.5 Replay
- [ ] Can replay onboarding from settings (if option exists)
- [ ] Reset clears localStorage and restarts flow

---

## 16) Keyboard Shortcuts

### 16.1 Home Page Shortcuts

| Key | Expected Action | Works? |
|-----|-----------------|--------|
| `Tab` | Switch Upload / Paste tabs | [ ] |
| `1` | Select Upload tab | [ ] |
| `2` | Select Paste tab | [ ] |
| `Shift+U` | Trigger file upload dialog | [ ] |
| `Shift+P` | Open paste text modal | [ ] |
| `L` | Toggle Library | [ ] |
| `A` | View Analytics | [ ] |
| `F` | Send Feedback | [ ] |

### 16.2 Mode Selection Shortcuts (after upload)

| Key | Expected Action | Works? |
|-----|-----------------|--------|
| `1` | Select Reading Mode | [ ] |
| `2` | Select Challenge Mode | [ ] |
| `Enter` | Start Reading | [ ] |
| `N` | Upload New File (reset) | [ ] |
| `Esc` | Cancel and upload new | [ ] |

### 16.3 Reader Page Shortcuts

| Key | Expected Action | Works? |
|-----|-----------------|--------|
| `Space` | Play / Pause | [ ] |
| `←` | Back 10 words | [ ] |
| `→` | Forward 10 words | [ ] |
| `R` | Restart | [ ] |
| `G` | Toggle Gradual Increase | [ ] |
| `+` / `=` | Increase WPM | [ ] |
| `-` | Decrease WPM | [ ] |
| `S` | Toggle Side Panel | [ ] |
| `L` | Toggle Library | [ ] |
| `B` | Add Bookmark | [ ] |
| `H` | Start/End Highlight | [ ] |
| `A` | View Analytics | [ ] |
| `F` | Send Feedback | [ ] |
| `?` | Show Keyboard Shortcuts | [ ] |
| `,` | Previous Audio Track | [ ] |
| `.` | Next Audio Track | [ ] |
| `Esc` | Close Open Panel | [ ] |

### 16.4 Shortcut Edge Cases
- [ ] Shortcuts don't trigger when typing in input/textarea
- [ ] Multiple panels don't open simultaneously
- [ ] `Esc` closes most recently opened panel first
- [ ] Mode selection shortcuts only work after file is parsed
- [ ] Home page tab shortcuts don't interfere with mode selection

---

## 17) Persistence

### 17.1 Settings
- [ ] Refresh page → mode/WPM/volume/track restore
- [ ] Theme preference persists across sessions
- [ ] Gradual Increase toggle state persists

### 17.2 Document State
- [ ] Re-open same document → last token index restores
- [ ] Bookmarks persist after refresh
- [ ] Highlights persist after refresh

### 17.3 Statistics
- [ ] Stats accumulate across sessions
- [ ] Daily stats track correctly across midnight

---

## 18) Mobile Responsiveness

Test on iOS Safari and Android Chrome.

### 18.1 Layout
- [ ] Word stays centered and readable
- [ ] Controls reachable and not clipped
- [ ] Slider is usable (touch-friendly)
- [ ] No continuous layout shift while playing

### 18.2 Modals
- [ ] Library opens as bottom sheet
- [ ] Modals don't overflow screen
- [ ] Close buttons easily tappable
- [ ] Backdrop tap closes modal

### 18.3 Touch Gestures
- [ ] Tap play button works
- [ ] Slider drag works smoothly
- [ ] No accidental triggers while reading

---

## 19) Theme Switching

- [ ] Theme toggle visible in UI
- [ ] Click toggle → theme changes immediately
- [ ] Dark theme: dark backgrounds, light text
- [ ] Light theme: light backgrounds, dark text
- [ ] All components respect theme (no white flashes)
- [ ] System preference detected on first load
- [ ] Preference persists across sessions

---

## 20) Accessibility

- [ ] Buttons have accessible labels (aria-label)
- [ ] Tab navigation reaches key controls
- [ ] Focus outlines are visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader can announce current word (if implemented)

---

## 21) Error States

- [ ] Network offline: app continues with local data
- [ ] Supabase unavailable: feedback shows error, app continues
- [ ] IndexedDB full: graceful error message
- [ ] Corrupted document: error shown, can re-upload

---

## 22) Celebration Overlay

- [ ] Completing a passage shows celebration
- [ ] Celebration includes visual feedback (confetti, animation)
- [ ] Celebration auto-dismisses or can be clicked away
- [ ] Stats updated after celebration
- [ ] Doesn't interfere with continued reading

---

## 23) Final Sign-off

- [ ] No major console errors in a full session
- [ ] Reading Mode meets requirements
- [ ] Challenge Mode meets requirements
- [ ] Gradual Increase Mode meets requirements
- [ ] ORP highlight works and is stable
- [ ] Audio works with at least one MP3
- [ ] Library saves and loads documents
- [ ] Bookmarks and highlights work
- [ ] Analytics tracks accurately
- [ ] Feedback submission works
- [ ] Onboarding completes smoothly
- [ ] All keyboard shortcuts functional
- [ ] Mobile layout works
- [ ] User can recover from errors

---

## Bug Report Template

When reporting bugs, include:

```
**Summary**: [Brief description]
**Steps to Reproduce**:
1. ...
2. ...
3. ...
**Expected Result**: [What should happen]
**Actual Result**: [What actually happens]
**Browser/Device**: [e.g., Chrome 120 / macOS]
**Console Errors**: [Any error messages]
**Screenshots**: [If applicable]
```
