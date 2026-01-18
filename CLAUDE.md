# CLAUDE.md — Hayai Speed Reading App

## Overview
Hayai is a modern speed reading web application using RSVP (Rapid Serial Visual Presentation) with ORP (Optimal Recognition Point) highlighting. Users can upload documents, read at customizable speeds, and track their reading progress.

---

## Tech Stack

### Core
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand (4 stores)
- **Styling**: CSS-in-JS with inline styles and CSS variables

### File Parsing (Client-Side)
- **TXT**: FileReader API
- **DOCX**: `mammoth`
- **PDF**: `pdfjs-dist`
- **EPUB**: `epub.js`

### Storage
- **IndexedDB**: via `idb` library (documents, bookmarks, highlights, stats, sessions)
- **localStorage**: Onboarding status, user preferences

### External Services
- **Authentication**: Supabase Auth
- **Payments**: Stripe (currently disabled)
- **Error Tracking**: Sentry

---

## Reading Modes

### 1. Reading Mode
Manual WPM control via slider (300–900 WPM, step 10)

### 2. Challenge Mode
Automatic WPM ramp from 300 to 900 WPM over configurable duration (2m / 3m / 5m)

### 3. Gradual Increase Mode
5-stage progressive speed increase based on reading progress:

| Progress | Stage | WPM |
|----------|-------|-----|
| 0–20%    | 1     | 300 |
| 20–40%   | 2     | 360 |
| 40–60%   | 3     | 450 |
| 60–80%   | 4     | 600 |
| 80–100%  | 5     | 900 |

Toggle with `G` key or gradual toggle button on WPM slider.

---

## Timing Rules

Implemented in `lib/reader/timing.ts`:

```typescript
// Constants
LONG_WORD_LEN = 8
LONG_WORD_MULT = 1.25
LIGHT_PUNCT_MULT = 1.6   // , ; :
HEAVY_PUNCT_MULT = 2.2   // . ! ?

// Base interval
baseIntervalMs(wpm) = 60000 / wpm

// Per-token interval applies multipliers based on:
// - Word length (>= 8 chars)
// - Ending punctuation
```

---

## ORP (Optimal Recognition Point)

Implemented in `lib/reader/orp.ts`:

```typescript
// Index heuristic based on word length
Length 1–2:   index 0
Length 3–5:   index 1
Length 6–9:   index 2
Length 10–13: index 3
Length 14+:   index 4
```

The highlighted character helps the brain process text faster by providing a consistent focal point.

---

## Project Structure

```
hayai/
├── app/
│   ├── page.tsx              # Home/Upload page
│   ├── reader/page.tsx       # Reader page
│   ├── privacy/page.tsx      # Privacy policy
│   ├── terms/page.tsx        # Terms of service
│   └── api/
│       ├── stripe/           # Stripe webhooks
│       └── auth/             # Auth callbacks
├── components/
│   ├── onboarding/
│   │   ├── OnboardingOverlay.tsx    # Main onboarding flow
│   │   ├── OnboardingSpotlight.tsx  # Spotlight effect
│   │   └── OnboardingTooltip.tsx    # Tooltip with keyboard hints
│   ├── library/
│   │   ├── LibraryPanel.tsx         # Document library sidebar
│   │   └── LibraryItem.tsx          # Individual library entry
│   ├── sidepanel/
│   │   └── SidePanel.tsx            # Document overview panel
│   ├── upload/
│   │   ├── UploadDropzone.tsx       # File upload area
│   │   └── PasteTextModal.tsx       # Direct text input
│   ├── RsvpWord.tsx                 # ORP word display
│   ├── ReaderControls.tsx           # Playback controls
│   ├── WpmSlider.tsx                # Speed control + gradual toggle
│   ├── ProgressBar.tsx              # Reading progress
│   ├── AudioPlayer.tsx              # Focus audio player
│   ├── AnalyticsModal.tsx           # Reading statistics
│   ├── FeedbackModal.tsx            # User feedback with speech-to-text
│   ├── KeyboardShortcutsModal.tsx   # Shortcut reference
│   ├── CelebrationOverlay.tsx       # Milestone celebrations
│   └── ThemeToggle.tsx              # Dark/Light theme switch
├── lib/
│   ├── parse/
│   │   ├── parseTxt.ts
│   │   ├── parseDocx.ts
│   │   ├── parsePdf.ts
│   │   ├── parseEpub.ts
│   │   └── index.ts
│   ├── reader/
│   │   ├── timing.ts         # Interval calculation
│   │   ├── orp.ts            # ORP helpers
│   │   ├── ramp.ts           # Challenge mode ramp
│   │   └── gradual.ts        # Gradual increase logic
│   ├── stores/
│   │   ├── readerStore.ts    # Reading state (wpm, index, mode)
│   │   ├── libraryStore.ts   # Document library state
│   │   ├── statsStore.ts     # Analytics and stats
│   │   └── onboardingStore.ts # Onboarding flow state
│   ├── storage/
│   │   ├── indexedDb.ts      # IndexedDB operations
│   │   └── documentStorage.ts # Document CRUD helpers
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useMediaQuery.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── types/
│   ├── reader.ts             # Mode, ReaderState
│   ├── document.ts           # LocalDocument, Bookmark, Highlight
│   └── stats.ts              # ReadingStats, DailyStats
└── public/
    └── audio/                # Focus audio MP3 files
```

---

## Zustand Stores

### readerStore (`lib/stores/readerStore.ts`)
```typescript
interface ReaderState {
  // Playback
  isPlaying: boolean
  index: number
  wpm: number

  // Mode
  mode: 'reading' | 'challenge'
  gradualIncreaseEnabled: boolean

  // Document
  tokens: string[]
  documentId: string | null

  // Actions
  play(), pause(), restart()
  setWpm(), setIndex()
  toggleGradualIncrease()
}
```

### libraryStore (`lib/stores/libraryStore.ts`)
```typescript
interface LibraryState {
  documents: LocalDocument[]
  bookmarks: LocalBookmark[]
  highlights: LocalHighlight[]

  // Actions
  loadLibrary()
  addDocument(), deleteDocument()
  addBookmark(), deleteBookmark()
  addHighlight(), deleteHighlight()
}
```

### statsStore (`lib/stores/statsStore.ts`)
```typescript
interface StatsState {
  totalWordsRead: number
  totalReadingTimeSeconds: number
  totalDocumentsRead: number
  totalPassagesCompleted: number
  dailyStats: LocalDailyStats[]

  // Computed
  averageWpm: number

  // Actions
  recordReading(wordsRead, timeSeconds)
  recordPassageCompletion()
}
```

### onboardingStore (`lib/stores/onboardingStore.ts`)
```typescript
type OnboardingStep =
  | 'welcome' | 'upload' | 'play'
  | 'navigate' | 'speed' | 'shortcuts' | 'complete'

interface OnboardingState {
  isActive: boolean
  currentStep: OnboardingStep
  hasCompletedOnboarding: boolean

  // Actions
  nextStep(), skipOnboarding(), completeOnboarding()
  reportAction(action) // For interactive steps
}
```

---

## Keyboard Shortcuts

### Home Page
| Key | Action |
|-----|--------|
| `Tab` | Switch between Upload / Paste |
| `1` / `2` | Select input method |
| `Shift+U` | Upload file |
| `Shift+P` | Paste text |
| `T` | Cycle theme (System → Light → Dark) |
| `L` | Toggle Library |
| `A` | View Analytics |
| `F` | Send Feedback |
| `Cmd/Ctrl + ,` | Profile settings (when signed in) |
| `?` | Show Keyboard Shortcuts |
| `Esc` | Close Open Panel |

### Mode Selection (after upload)
| Key | Action |
|-----|--------|
| `1` | Reading Mode |
| `2` | Challenge Mode |
| `Enter` | Start Reading |
| `N` | Upload New File |

### Library Navigation
| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate items |
| `Enter` | Open selected document |
| `Esc` | Close library |

### Reader Page
| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` | Back 10 words |
| `→` | Forward 10 words |
| `R` | Restart from beginning |
| `M` | Toggle Reading / Challenge mode |
| `G` | Toggle Gradual Increase |
| `+` / `-` | Increase / Decrease WPM |
| `N` | New file (go to upload) |
| `S` | Toggle Side Panel |
| `L` | Toggle Library |
| `B` | Add Bookmark |
| `H` | Start / End Highlight |
| `A` | View Analytics |
| `F` | Send Feedback |
| `Cmd/Ctrl + ,` | Profile settings (when signed in) |
| `?` | Show Keyboard Shortcuts |
| `,` / `.` | Previous / Next Audio Track |
| `Esc` | Close Open Panel |

---

## Features

### Document Library
- Save uploaded documents to IndexedDB
- Track reading progress per document
- Resume reading from last position
- Delete documents with confirmation

### Bookmarks
- Mark positions with `B` key
- Context snippet (surrounding text) saved
- Jump to bookmarks from library panel

### Highlights
- Start/end selection with `H` key
- Highlight word ranges
- View highlights in side panel

### Analytics
- Total words read
- Total reading time
- Average WPM
- Passages completed counter
- Daily/weekly/monthly breakdown

### Focus Audio
- Built-in ambient MP3 tracks
- Independent volume control
- Track selection (`,` / `.` keys)
- Continues during reading

### Onboarding
- Interactive 7-step tutorial
- Spotlight effects on UI elements
- Keyboard-driven progression
- Celebration animations on completion
- Skippable, stored in localStorage

### Feedback
- Modal with text input
- Speech-to-text via Web Speech API
- Submits to Supabase `feedback` table

---

## Mobile Responsiveness

- Bottom sheet modals (library, settings)
- Touch-friendly controls
- Optimized layouts for small screens
- Swipe gestures support
- Responsive font sizes

---

## Theme System

CSS variables for dark/light themes:
```css
--bg-primary, --bg-secondary
--text-primary, --text-secondary, --text-tertiary
--border, --shadow
--accent, --accent-gradient
```

System-aware detection with manual toggle.

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## Database Schema (IndexedDB)

### documents
- `id`: string (UUID)
- `title`: string
- `content`: string (full text)
- `wordCount`: number
- `fileType`: 'txt' | 'docx' | 'pdf' | 'epub' | 'paste'
- `createdAt`: string (ISO)
- `lastOpenedAt`: string (ISO)
- `lastPosition`: number (word index)

### bookmarks
- `id`: string (UUID)
- `documentId`: string
- `position`: number
- `contextSnippet`: string
- `createdAt`: string (ISO)

### highlights
- `id`: string (UUID)
- `documentId`: string
- `startIndex`: number
- `endIndex`: number
- `text`: string
- `createdAt`: string (ISO)

### stats
- `id`: 'main'
- `totalWordsRead`: number
- `totalReadingTimeSeconds`: number
- `totalDocumentsRead`: number
- `totalPassagesCompleted`: number
- `updatedAt`: string (ISO)

### dailyStats
- `date`: string (YYYY-MM-DD)
- `wordsRead`: number
- `readingTimeSeconds`: number
- `documentsOpened`: number

---

## Error Handling

- Invalid file types: User-friendly error with re-upload option
- Empty PDFs: "No readable text found" message
- Parsing failures: Graceful fallback with error state
- Audio failures: Silent fail, continues without audio
- Network errors: Offline-first with IndexedDB

---

## Testing

### Unit Tests
- `intervalForToken()` - timing calculations
- `orpIndex()` - ORP position
- `getChallengeWpm()` - ramp function
- `getGradualWpm()` - stage calculation

### Integration
- File upload → parse → tokenize → display
- Playback controls and state management
- Library operations (CRUD)
- Stats tracking accuracy

### Manual QA
See `QA.md` for comprehensive checklist.

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (optional, currently disabled)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn
```

---

## Future Considerations

- Spotify/Brain.fm audio integration
- User accounts with cloud sync
- Comprehension testing
- Multi-language support
- OCR for scanned PDFs
- Social sharing features
