# Hayai — High-Speed Reading with Focus Audio

Hayai is a modern speed reading web application that uses RSVP (Rapid Serial Visual Presentation) to help users read faster while maintaining comprehension. Built with Next.js 14, TypeScript, and Zustand for state management.

## Features

### Core Reading Experience
- **RSVP Display** — One word at a time with ORP (Optimal Recognition Point) highlighting
- **Reading Mode** — Manual WPM control via slider (300–900 WPM)
- **Challenge Mode** — Automatic WPM ramp from 300 to 900 WPM over configurable duration
- **Gradual Increase** — 5-stage progressive speed (300→360→450→600→900 WPM based on reading progress)

### File Support
- **TXT** — Plain text files
- **DOCX** — Microsoft Word documents (via mammoth)
- **PDF** — Text-based PDFs (via pdfjs-dist)
- **EPUB** — E-book format support
- **Paste Text** — Direct text input option

### Focus Audio
- Built-in ambient audio tracks for concentration
- Volume control and track selection
- Independent audio playback (continues while reading)

### Library & Persistence
- **Document Library** — Save and organize uploaded documents
- **Reading Progress** — Automatic position saving per document
- **Bookmarks** — Mark important positions with context snippets
- **Highlights** — Select and save text ranges

### Analytics & Stats
- **Reading Analytics** — Track words read, time spent, average WPM
- **Passages Completed** — Counter for finished documents
- **Daily/Weekly/Monthly** — Time-based reading statistics

### User Experience
- **Interactive Onboarding** — Guided tutorial with spotlight effects and celebration animations
- **Keyboard Shortcuts** — Full keyboard navigation support
- **Mobile Responsive** — Bottom sheet modals, touch gestures, optimized layouts
- **Dark/Light Theme** — System-aware with manual toggle
- **Celebration Overlays** — Visual feedback for milestones (chapter/passage completion)

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

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: CSS-in-JS (inline styles with CSS variables)
- **File Parsing**: mammoth (DOCX), pdfjs-dist (PDF), epub.js (EPUB)
- **Storage**: IndexedDB (via idb), localStorage
- **Authentication**: Supabase Auth
- **Payments**: Stripe (disabled in current build)
- **Error Tracking**: Sentry

## Project Structure

```
hayai/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home/Upload page
│   ├── reader/page.tsx    # Reader page
│   ├── privacy/           # Privacy policy
│   ├── terms/             # Terms of service
│   └── api/               # API routes (Stripe, Auth)
├── components/
│   ├── onboarding/        # Onboarding overlay, spotlight, tooltip
│   ├── library/           # Library panel components
│   ├── sidepanel/         # Side panel for document overview
│   ├── upload/            # Upload and paste text modals
│   ├── RsvpWord.tsx       # ORP word display
│   ├── ReaderControls.tsx # Playback controls
│   ├── WpmSlider.tsx      # Speed control with gradual toggle
│   ├── AudioPlayer.tsx    # Focus audio player
│   ├── AnalyticsModal.tsx # Reading statistics
│   ├── FeedbackModal.tsx  # User feedback with speech-to-text
│   ├── KeyboardShortcutsModal.tsx
│   ├── CelebrationOverlay.tsx
│   └── ...
├── lib/
│   ├── parse/             # File parsers (TXT, DOCX, PDF, EPUB)
│   ├── reader/            # Timing, ORP, challenge ramp logic
│   ├── stores/            # Zustand stores
│   │   ├── readerStore.ts
│   │   ├── libraryStore.ts
│   │   ├── statsStore.ts
│   │   └── onboardingStore.ts
│   ├── storage/           # IndexedDB and document storage
│   ├── hooks/             # Custom React hooks
│   └── supabase/          # Supabase client
├── types/                 # TypeScript type definitions
├── public/
│   └── audio/             # Focus audio MP3 files
└── ...
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/kpogunbase/hayai.git
cd hayai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Stripe keys

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Key Implementation Details

### ORP (Optimal Recognition Point)
The highlighted character in each word helps the brain process text faster:
- Length 1–2: index 0
- Length 3–5: index 1
- Length 6–9: index 2
- Length 10–13: index 3
- Length 14+: index 4

### Timing Rules
- Base interval: `60000 / wpm` ms per token
- Long words (≥8 chars): 1.25x multiplier
- Light punctuation (`, ; :`): 1.6x multiplier
- Heavy punctuation (`. ! ?`): 2.2x multiplier

### Gradual Increase Stages
Progress-based speed ramping:
| Progress | Stage | WPM |
|----------|-------|-----|
| 0–20% | 1 | 300 |
| 20–40% | 2 | 360 |
| 40–60% | 3 | 450 |
| 60–80% | 4 | 600 |
| 80–100% | 5 | 900 |

## License

MIT License — see LICENSE file for details.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Support

- **Issues**: [GitHub Issues](https://github.com/kpogunbase/hayai/issues)
- **Feedback**: Use the in-app feedback modal (press `F`)
