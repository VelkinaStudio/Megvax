/**
 * Animation utilities and variants for consistent motion design
 */

export const easings = {
  easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

export const durations = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: durations.normal / 1000, ease: easings.easeOut },
};

export const slideIn = (direction: 'up' | 'down' | 'left' | 'right') => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  return {
    initial: { ...directions[direction], opacity: 0 },
    animate: { x: 0, y: 0, opacity: 1 },
    exit: { ...directions[direction], opacity: 0 },
    transition: { duration: durations.normal / 1000, ease: easings.easeOut },
  };
};

export const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { duration: durations.normal / 1000, ease: easings.spring },
};

export const lift = {
  initial: { y: 0 },
  hover: { y: -2, transition: { duration: durations.fast / 1000 } },
  tap: { y: 0, transition: { duration: durations.fast / 1000 / 2 } },
};

export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear',
  },
};

export const staggerChildren = (delayMs: number = 50) => ({
  animate: {
    transition: {
      staggerChildren: delayMs / 1000,
    },
  },
});

export const rotate = {
  animate: {
    rotate: 360,
  },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
};

export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: easings.easeInOut,
  },
};

/**
 * CSS animation classes
 */
export const animationClasses = {
  // Fade
  fadeIn: 'animate-in fade-in',
  fadeOut: 'animate-out fade-out',

  // Slide
  slideInFromTop: 'animate-in slide-in-from-top',
  slideInFromBottom: 'animate-in slide-in-from-bottom',
  slideInFromLeft: 'animate-in slide-in-from-left',
  slideInFromRight: 'animate-in slide-in-from-right',

  // Zoom
  zoomIn: 'animate-in zoom-in-95',
  zoomOut: 'animate-out zoom-out-95',

  // Spin
  spin: 'animate-spin',

  // Pulse
  pulse: 'animate-pulse',

  // Bounce
  bounce: 'animate-bounce',
} as const;

/**
 * Duration classes
 */
export const durationClasses = {
  fast: 'duration-150',
  normal: 'duration-200',
  slow: 'duration-300',
} as const;

/**
 * GSAP Animation Utilities
 * For advanced motion graphics and smooth professional animations
 */

// Magnetic button effect helper
export const magneticConfig = {
  strength: 0.4,
  duration: 0.3,
  ease: 'power2.out',
  returnEase: 'elastic.out(1, 0.3)',
  returnDuration: 0.5,
};

// Parallax scroll config
export const parallaxConfig = {
  speed: 0.5,
  ease: 'none',
};

// Fade in scroll config
export const fadeInScrollConfig = {
  stagger: 0.1,
  duration: 0.8,
  ease: 'power3.out',
  triggerStart: 'top 80%',
};
