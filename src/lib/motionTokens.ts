/**
 * Motion Tokens - Standardized animation values for premium, consistent feel
 * Mobile-first approach with subtle, professional animations
 */

// Easing curves
export const easing = {
  // Premium smooth easing for most interactions
  smooth: [0.22, 1, 0.36, 1] as const,
  // Quick snap for press/tap feedback
  snap: [0.4, 0, 0.2, 1] as const,
  // Gentle for reveals
  gentle: [0.25, 0.1, 0.25, 1] as const,
  // Bounce for playful elements (use sparingly)
  bounce: [0.34, 1.56, 0.64, 1] as const,
};

// Duration presets in seconds
export const duration = {
  // Ultra fast - for press/tap feedback
  micro: 0.12,
  // Fast - for hover states
  fast: 0.18,
  // Standard - for most UI transitions
  normal: 0.25,
  // Slow - for page transitions and reveals
  slow: 0.35,
  // Very slow - for dramatic effects
  reveal: 0.5,
};

// Transform presets for hover/press states
export const transforms = {
  // Press state (tap feedback on mobile)
  press: {
    scale: 0.985,
    y: 1,
  },
  // Light press for smaller elements
  pressLight: {
    scale: 0.99,
  },
  // Hover lift effect (desktop)
  hoverLift: {
    scale: 1.02,
    y: -2,
  },
  // Subtle hover (for cards)
  hoverSubtle: {
    scale: 1.01,
    y: -1,
  },
  // No transform (for reduced motion)
  none: {
    scale: 1,
    y: 0,
  },
};

// Framer Motion transition presets
export const transitions = {
  // For micro-interactions (press/tap)
  micro: {
    duration: duration.micro,
    ease: easing.snap,
  },
  // For hover states
  hover: {
    duration: duration.fast,
    ease: easing.smooth,
  },
  // For UI elements
  ui: {
    duration: duration.normal,
    ease: easing.smooth,
  },
  // For page transitions
  page: {
    duration: duration.slow,
    ease: easing.smooth,
  },
  // For reveal animations
  reveal: {
    duration: duration.reveal,
    ease: easing.gentle,
  },
  // Spring for natural feel
  spring: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
  },
  // Gentle spring
  springGentle: {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
  },
};

// Page transition variants
export const pageTransition = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.page,
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: duration.normal,
      ease: easing.smooth,
    },
  },
};

// Parallax settings
export const parallax = {
  // Subtle hero parallax (mobile-safe)
  hero: {
    yRange: [0, 15] as const,
    scrollRange: [0, 1] as const,
  },
  // Very subtle for decorative elements
  decorative: {
    yRange: [0, 8] as const,
    scrollRange: [0, 1] as const,
  },
};

// Helper to get reduced motion safe values
export const getReducedMotionProps = (shouldReduceMotion: boolean) => {
  if (shouldReduceMotion) {
    return {
      whileHover: undefined,
      whileTap: undefined,
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0 },
    };
  }
  return {};
};
