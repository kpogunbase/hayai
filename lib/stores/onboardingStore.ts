import { create } from 'zustand';

export type OnboardingStep =
  | 'welcome'
  | 'upload'
  | 'play'
  | 'navigate'
  | 'speed'
  | 'shortcuts'
  | 'complete';

const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'upload',
  'play',
  'navigate',
  'speed',
  'shortcuts',
  'complete',
];

// Actions that can complete interactive steps
type OnboardingAction = 'space' | 'arrow' | 'wpm' | 'help' | 'upload';

// Map of which action completes which step
const STEP_ACTIONS: Record<OnboardingStep, OnboardingAction | null> = {
  welcome: null, // Manual advance
  upload: 'upload',
  play: 'space',
  navigate: 'arrow',
  speed: null, // Manual advance only (button click or Enter key)
  shortcuts: 'help',
  complete: null, // Final step
};

interface OnboardingState {
  // State
  isActive: boolean;
  currentStep: OnboardingStep;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;

  // Celebration state for step completion
  showStepCelebration: boolean;
  celebrationMessage: string;

  // Target element refs for spotlight
  targetRef: HTMLElement | null;

  // Actions
  initialize: () => Promise<void>;
  startOnboarding: () => void;
  nextStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setTargetRef: (ref: HTMLElement | null) => void;

  // For interactive steps - reports user actions
  reportAction: (action: OnboardingAction) => void;

  // Helpers
  getCurrentStepIndex: () => number;
  getTotalSteps: () => number;
}

// Storage key for IndexedDB
const ONBOARDING_KEY = 'onboarding_status';

// Helper to get onboarding status from localStorage (simpler than IndexedDB for this)
const getStoredStatus = (): { completed: boolean; skipped: boolean } | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setStoredStatus = (status: { completed: boolean; skipped: boolean; completedAt?: string }) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(status));
  } catch {
    // Ignore storage errors
  }
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  // Initial state
  isActive: false,
  currentStep: 'welcome',
  hasCompletedOnboarding: false,
  isLoading: true,
  showStepCelebration: false,
  celebrationMessage: '',
  targetRef: null,

  // Initialize from storage
  initialize: async () => {
    const stored = getStoredStatus();
    if (stored?.completed || stored?.skipped) {
      set({ hasCompletedOnboarding: true, isLoading: false });
    } else {
      // New user - start onboarding
      set({ isActive: true, isLoading: false });
    }
  },

  // Start onboarding (for replay)
  startOnboarding: () => {
    set({
      isActive: true,
      currentStep: 'welcome',
      showStepCelebration: false,
    });
  },

  // Advance to next step
  nextStep: () => {
    const { currentStep } = get();
    const currentIndex = STEP_ORDER.indexOf(currentStep);

    if (currentIndex < STEP_ORDER.length - 1) {
      set({
        currentStep: STEP_ORDER[currentIndex + 1],
        showStepCelebration: false,
      });
    } else {
      // Completed all steps
      get().completeOnboarding();
    }
  },

  // Skip onboarding
  skipOnboarding: () => {
    setStoredStatus({ completed: false, skipped: true });
    set({
      isActive: false,
      hasCompletedOnboarding: true,
    });
  },

  // Complete onboarding
  completeOnboarding: () => {
    setStoredStatus({
      completed: true,
      skipped: false,
      completedAt: new Date().toISOString(),
    });
    set({
      isActive: false,
      hasCompletedOnboarding: true,
    });
  },

  // Reset onboarding (for testing/replay)
  resetOnboarding: () => {
    localStorage.removeItem(ONBOARDING_KEY);
    set({
      isActive: false,
      currentStep: 'welcome',
      hasCompletedOnboarding: false,
      showStepCelebration: false,
    });
  },

  // Set target element for spotlight
  setTargetRef: (ref) => set({ targetRef: ref }),

  // Report user action (for interactive steps)
  reportAction: (action) => {
    const { currentStep, isActive, showStepCelebration } = get();
    if (!isActive) return;

    // Prevent multiple triggers - if already celebrating, ignore new actions
    if (showStepCelebration) return;

    const requiredAction = STEP_ACTIONS[currentStep];

    if (requiredAction === action) {
      // Show celebration briefly, then advance
      const messages: Record<OnboardingAction, string> = {
        space: 'Perfect! Space plays and pauses',
        arrow: 'Nice! Use arrows to navigate',
        wpm: 'Great! Adjust speed anytime',
        help: 'You found all shortcuts!',
        upload: 'Text loaded!',
      };

      set({
        showStepCelebration: true,
        celebrationMessage: messages[action],
      });

      // Auto-advance after celebration (longer delay for better readability)
      setTimeout(() => {
        get().nextStep();
      }, 2200);
    }
  },

  // Helpers
  getCurrentStepIndex: () => {
    const { currentStep } = get();
    return STEP_ORDER.indexOf(currentStep);
  },

  getTotalSteps: () => STEP_ORDER.length,
}));
