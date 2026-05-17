import type { Variants } from 'framer-motion'

export const cursorVariants: Variants = {
  blink: {
    opacity: [1, 1, 0, 0, 1],
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity,
      times: [0, 0.49, 0.5, 0.99, 1],
    },
  },
}
