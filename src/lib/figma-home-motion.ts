/** Easing + viewport defaults aligned with Figma marketing prototype feel */
export const figmaEase = [0.22, 1, 0.36, 1] as const;

export const figmaViewport = {
  once: true as const,
  amount: 0.22,
  margin: "-40px 0px",
};

export const figmaFadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: figmaEase },
  },
};

export const figmaStaggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

export const figmaStaggerItem = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: figmaEase },
  },
};
