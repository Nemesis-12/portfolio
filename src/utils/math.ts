export function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1)
}
