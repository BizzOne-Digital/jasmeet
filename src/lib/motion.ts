/** Shared luxury motion tokens — subtle, never flashy. */

export const luxEase = [0.22, 1, 0.36, 1] as const;

export const luxDuration = {
  /** Soft hover / color shifts */
  hover: 0.45,
  /** Fade + slide reveals */
  reveal: 0.9,
  /** Slow editorial image zoom */
  zoom: 1.25,
  /** Page / overlay fades */
  page: 0.55,
} as const;

/** Small vertical travel for fade-up reveals (px). */
export const luxRevealDistance = 18;

/** Stagger between sibling reveals. */
export const luxStagger = 0.07;

export const luxRevealTransition = {
  duration: luxDuration.reveal,
  ease: luxEase,
};

export const luxFadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const luxFadeUpVariants = {
  hidden: { opacity: 0, y: luxRevealDistance },
  visible: { opacity: 1, y: 0 },
};
