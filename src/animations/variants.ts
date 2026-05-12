export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
} as const

export const hoverEase = {
  idle: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.25, ease: 'easeInOut' },
  },
} as const

export const fadeUp = fadeUpVariant
export const hoverEase = hoverVariant
