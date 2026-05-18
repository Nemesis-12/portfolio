import type { Variants } from 'framer-motion'

export const ROLES = ['CS_STUDENT', 'DEVELOPER', 'BUILDER', 'DEBUGGER', 'PROBLEM_SOLVER']
export const VALUE_PROP = '// I BUILD THINGS THAT ARE FUN TO FIGURE OUT.'

export const FIRST_NAME = 'FARHAN'
export const LAST_NAME = 'MOHAMMED'
export const NAME_SPEED = 40

export const VALUE_PROP_DELAY = 400
export const VALUE_PROP_SPEED = 35

export const CTA_DELAY = 200
export const CTA_FADE_DURATION = 0.4

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
