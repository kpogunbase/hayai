# CONTRIBUTING.md — Hayai Speed Reading App

Thanks for contributing! This guide covers everything you need to know to contribute effectively to Hayai.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Dev Setup](#dev-setup)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Code Conventions](#code-conventions)
- [Styling Guide](#styling-guide)
- [State Management](#state-management)
- [Component Patterns](#component-patterns)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Pull Requests](#pull-requests)
- [Debugging Guide](#debugging-guide)

---

## Code of Conduct

Be kind, assume good intent, and keep discussions productive. We welcome contributors of all experience levels.

---

## Dev Setup

### Requirements

- Node.js 18+
- npm (or pnpm/yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/kpogunbase/hayai.git
cd hayai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase keys (optional for local dev)

# Start development server
npm run dev
```

### Environment Variables

For local development, Supabase variables are optional. The app works offline with IndexedDB.

```env
# Required for feedback submission and auth
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
STRIPE_SECRET_KEY=your_stripe_secret_key
SENTRY_DSN=your_sentry_dsn
```

### Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Project Structure

```
hayai/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Home/Upload page
│   ├── reader/page.tsx      # Reader page
│   ├── layout.tsx           # Root layout
│   └── api/                 # API routes
├── components/              # React components
│   ├── onboarding/          # Onboarding flow components
│   ├── library/             # Document library components
│   ├── sidepanel/           # Side panel components
│   ├── upload/              # Upload-related components
│   └── *.tsx                # Shared components
├── lib/                     # Business logic
│   ├── parse/               # File parsers
│   ├── reader/              # Reading engine logic
│   ├── stores/              # Zustand stores
│   ├── storage/             # IndexedDB operations
│   ├── hooks/               # Custom React hooks
│   └── supabase/            # Supabase client
├── types/                   # TypeScript definitions
└── public/                  # Static assets
    └── audio/               # Focus audio MP3 files
```

---

## Architecture Overview

### Data Flow

```
User Action → Component → Zustand Store → IndexedDB
                                      ↓
                               UI Update (via subscription)
```

### Key Systems

1. **File Parsing**: Client-side parsing of TXT, DOCX, PDF, EPUB
2. **RSVP Engine**: setTimeout-based scheduler with punctuation timing
3. **State Management**: Zustand stores for reader, library, stats, onboarding
4. **Persistence**: IndexedDB for documents/bookmarks/highlights/stats
5. **Theming**: CSS variables with system preference detection

---

## Code Conventions

### TypeScript

- Use strict TypeScript (`strict: true` in tsconfig)
- Define interfaces for all component props
- Use type inference where obvious, explicit types for function parameters
- Prefer `interface` over `type` for object shapes

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// Avoid
type ButtonProps = {
  label: string;
  // ...
}
```

### Naming

- **Components**: PascalCase (`ReaderControls.tsx`)
- **Hooks**: camelCase with `use` prefix (`useMediaQuery.ts`)
- **Stores**: camelCase with `Store` suffix (`readerStore.ts`)
- **Utils**: camelCase (`timing.ts`, `orp.ts`)

### File Organization

- One component per file
- Co-locate related files (component + styles + tests)
- Keep components focused and single-purpose
- Extract reusable logic into hooks

---

## Styling Guide

We use CSS-in-JS with inline styles and CSS variables.

### CSS Variables (defined in layout.tsx)

```css
/* Backgrounds */
--bg-primary      /* Main background */
--bg-secondary    /* Card/panel background */

/* Text */
--text-primary    /* Main text */
--text-secondary  /* Secondary text */
--text-tertiary   /* Subtle text */

/* Accents */
--accent          /* Primary accent color */
--accent-gradient /* Gradient for buttons */
--border          /* Border color */
--shadow          /* Box shadow color */
```

### Component Styling Pattern

```tsx
export function MyComponent() {
  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "var(--bg-secondary)",
        borderRadius: "12px",
        border: "1px solid var(--border)",
      }}
    >
      <h2 style={{ color: "var(--text-primary)" }}>Title</h2>
    </div>
  );
}
```

### Responsive Design

- Use media queries via `useMediaQuery` hook
- Mobile-first approach
- Bottom sheet modals on mobile
- Touch-friendly tap targets (min 44x44px)

```tsx
const isMobile = useMediaQuery("(max-width: 768px)");

return isMobile ? <BottomSheet /> : <SidePanel />;
```

---

## State Management

We use Zustand for global state. Each store has a specific responsibility.

### Store Structure

```typescript
// lib/stores/exampleStore.ts
import { create } from 'zustand';

interface ExampleState {
  // State
  value: string;

  // Actions
  setValue: (value: string) => void;
  reset: () => void;
}

export const useExampleStore = create<ExampleState>((set, get) => ({
  value: '',

  setValue: (value) => set({ value }),
  reset: () => set({ value: '' }),
}));
```

### Available Stores

| Store | Purpose |
|-------|---------|
| `readerStore` | Reading state (wpm, index, playing) |
| `libraryStore` | Documents, bookmarks, highlights |
| `statsStore` | Reading analytics and statistics |
| `onboardingStore` | Onboarding flow state |

### Using Stores in Components

```tsx
import { useReaderStore } from '@/lib/stores/readerStore';

function MyComponent() {
  // Subscribe to specific state
  const wpm = useReaderStore((state) => state.wpm);
  const setWpm = useReaderStore((state) => state.setWpm);

  // Or get multiple values
  const { isPlaying, play, pause } = useReaderStore();

  return <button onClick={play}>Play</button>;
}
```

---

## Component Patterns

### Modal Pattern

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyModal({ isOpen, onClose }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{ /* backdrop styles */ }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        {/* Modal content */}
      </div>
    </div>
  );
}
```

### Keyboard Shortcut Pattern

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Skip if typing in input
    if (e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        goBack();
        break;
      // ...
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [/* dependencies */]);
```

### Data Attribute Pattern (for onboarding spotlight)

```tsx
// Mark elements for spotlight targeting
<button data-onboarding="play-button">Play</button>

// Query in onboarding
const target = document.querySelector('[data-onboarding="play-button"]');
```

---

## Testing

### Manual QA

See `QA.md` for comprehensive manual testing checklist.

### Unit Tests (if applicable)

Test pure functions in `lib/`:

```typescript
// lib/reader/timing.test.ts
import { intervalForToken } from './timing';

describe('intervalForToken', () => {
  it('returns base interval for normal words', () => {
    expect(intervalForToken('hello', 300)).toBe(200);
  });

  it('applies heavy punctuation multiplier', () => {
    expect(intervalForToken('hello.', 300)).toBe(440); // 200 * 2.2
  });
});
```

### Testing Checklist Before PR

- [ ] App builds without errors (`npm run build`)
- [ ] No console errors in development
- [ ] Feature works on desktop Chrome/Safari
- [ ] Feature works on mobile (if applicable)
- [ ] Keyboard shortcuts don't break existing ones
- [ ] Dark/light theme both work

---

## Git Workflow

### Branch Naming

```
feature/add-bookmark-export
fix/timer-drift-on-pause
refactor/reader-store-cleanup
docs/update-readme
```

### Commit Messages

Use conventional commits:

```
feat: add bookmark export functionality
fix: resolve timer drift after pause/resume
refactor: simplify reader store actions
docs: update installation instructions
style: fix button alignment on mobile
```

### Commit Scope (optional)

```
feat(reader): add gradual increase mode
fix(audio): prevent playback on unmount
```

---

## Pull Requests

### Before Submitting

1. Ensure `npm run build` passes
2. Run `npm run lint` and fix any issues
3. Test your changes manually (see QA.md)
4. Update documentation if needed

### PR Template

```markdown
## Summary
Brief description of changes

## Changes
- List of specific changes made
- Another change

## Testing
- How you tested the changes
- Any edge cases considered

## Screenshots (if UI changes)
[Add screenshots here]
```

### Review Process

1. Submit PR against `main` branch
2. Automated checks must pass
3. Request review from maintainers
4. Address feedback
5. Squash and merge when approved

---

## Debugging Guide

### Common Issues

#### Timer Drift / Multiple Timeouts
- Symptom: Speed accelerates after pause/resume
- Cause: Multiple setTimeout refs active
- Fix: Clear timeout ref on pause, use single ref

#### IndexedDB Errors
- Symptom: Library not loading
- Cause: Schema mismatch or corruption
- Fix: Clear IndexedDB in DevTools > Application > Storage

#### Onboarding Stuck
- Symptom: Can't progress past step
- Cause: Action not being reported to store
- Fix: Check `reportAction()` is called with correct action type

### Debug Tools

```typescript
// Log store state
console.log(useReaderStore.getState());

// Subscribe to changes
useReaderStore.subscribe(console.log);

// Clear onboarding (browser console)
localStorage.removeItem('onboarding_status');

// Clear all IndexedDB data (browser console)
indexedDB.deleteDatabase('hayai-db');
```

### Performance Profiling

1. Open DevTools > Performance
2. Record during playback
3. Look for:
   - Long tasks blocking main thread
   - Memory leaks (growing heap)
   - Layout thrashing

---

## Questions?

- Open an issue for bugs or feature requests
- Use the in-app feedback modal (press `F`)
- Check existing issues before creating new ones

Thank you for contributing to Hayai!
