// Shared premium motion language — extracted from the landing page (IntroAnimation).
// Signature easing is ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1).
import type { Variants, Transition } from "framer-motion";

/** The product's signature easing curve. Use everywhere for a consistent feel. */
export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

/** Hover micro-interaction shared by all interactive cards. */
export const HOVER_LIFT = {
  y: -12,
  scale: 1.025,
  transition: { duration: 0.45, ease: EASE_PREMIUM } as Transition,
};

/** A gentler lift for large container panels (charts, tables) — alive, not jittery. */
export const HOVER_LIFT_SUBTLE = {
  y: -4,
  transition: { duration: 0.45, ease: EASE_PREMIUM } as Transition,
};

/**
 * Card entrance: fade up + settle from a slight scale-down.
 * Pass an index to stagger items in a list/grid without a parent container.
 */
export const cardEntrance = (index = 0): Variants => ({
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: EASE_PREMIUM,
      delay: Math.min(index * 0.06, 0.5),
    },
  },
});

/** Parent container that staggers its direct motion children. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** Child to use inside `staggerContainer`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: EASE_PREMIUM },
  },
};

/** Simple fade-up for headings / page intros. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_PREMIUM } },
};
