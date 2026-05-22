import { useTypewriter } from './useTypewriter'

interface TypewriterProps {
  active: boolean
  lines: string[]
  speed?: number
  onDone?: () => void
}

export function Typewriter({ active, lines, speed = 25, onDone }: TypewriterProps) {
  const displayedLines = useTypewriter(active, lines, speed, onDone)

  return (
    <div>
      {displayedLines.map((line, i) => (
        <div key={i} data-typewriter-line>{line}</div>
      ))}
    </div>
  )
}
