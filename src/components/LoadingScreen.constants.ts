export const STATUS_MESSAGES = [
  'LOADING_ASSETS',
  'COMPILING_MODULES',
  'ESTABLISHING_SIGNAL',
  'DECRYPTING_DATA',
  'SYSTEM_READY',
] as const

/** Reference: ideas/Portfolio.html — message rotation interval (ms) */
export const MESSAGE_INTERVAL = 560

/** Reference: ideas/Portfolio.html — total boot duration before fade-out (ms) */
export const BOOT_DURATION = 2800

/** Reference: ideas/Portfolio.html — fade-out duration after `.out` class (ms) */
export const FADE_OUT_DURATION = 600
