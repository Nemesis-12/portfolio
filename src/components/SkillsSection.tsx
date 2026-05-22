import { useEffect, useRef, useState } from 'react'
import { StickySection } from './StickySection'

const TILE_REVEAL_STEP_S = 0.12

type Category = 'LANGUAGE' | 'FRAMEWORK' | 'TOOL' | 'ML / DL' | 'DATA'
type TileColor = 'orange' | 'blue' | 'fuchsia' | 'peri' | 'dark' | 'platinum' | 'yellow'

interface SkillTile {
  area: string
  category: Category
  name: string
  color: TileColor
  large?: boolean
}

const tiles: SkillTile[] = [
  { area: 'py', category: 'LANGUAGE', name: 'Python', color: 'orange', large: true },
  { area: 'js', category: 'LANGUAGE', name: 'TypeScript', color: 'blue' },
  { area: 'dk', category: 'TOOL', name: 'Docker', color: 'platinum' },
  { area: 're', category: 'LANGUAGE', name: 'JavaScript', color: 'peri' },
  { area: 'cc', category: 'LANGUAGE', name: 'C / C++', color: 'fuchsia' },
  { area: 'nd', category: 'DATA', name: 'NumPy', color: 'blue' },
  { area: 'nx', category: 'FRAMEWORK', name: 'FastAPI', color: 'orange' },
  { area: 'fl', category: 'ML / DL', name: 'PyTorch', color: 'yellow' },
  { area: 'gt', category: 'ML / DL', name: 'Hugging Face', color: 'yellow' },
  { area: 'pg', category: 'ML / DL', name: 'Scikit-learn', color: 'yellow' },
  { area: 'fg', category: 'DATA', name: 'Pandas', color: 'fuchsia' },
  { area: 'mn', category: 'TOOL', name: 'Git', color: 'dark' },
]

export const REVEAL_ORDER = ['py', 'js', 'dk', 're', 'cc', 'nd', 'nx', 'fl', 'gt', 'pg', 'fg', 'mn', 'pal'] as const

const revealOrderByArea = new Map<string, number>(
  REVEAL_ORDER.map((area, index) => [area, index]),
)

export function revealTransitionDelay(area: string): string {
  const index = revealOrderByArea.get(area) ?? 0
  return `${index * TILE_REVEAL_STEP_S}s`
}

const PALETTE = [
  'var(--color-atomic-tangerine)',
  'var(--color-golden-pollen)',
  'var(--color-fuchsia-flame)',
  'var(--color-ultrasonic-blue)',
] as const

function SkillTileCard({ tile, visible }: { tile: SkillTile; visible: boolean }) {
  return (
    <div
      className={`bi bi-${tile.area} c-${tile.color}${tile.large ? ' bi-lg' : ''}${visible ? ' in' : ''}`}
      style={{ transitionDelay: revealTransitionDelay(tile.area) }}
    >
      <div className="bi-cat">{tile.category}</div>
      <div className="bi-name">{tile.name}</div>
    </div>
  )
}

function PaletteTile({ visible }: { visible: boolean }) {
  return (
    <div
      className={`bi bi-pal${visible ? ' in' : ''}`}
      style={{ transitionDelay: revealTransitionDelay('pal') }}
      data-testid="skills-palette"
    >
      {PALETTE.map((color, index) => (
        <div key={index} className="pswatch" style={{ background: color }} />
      ))}
    </div>
  )
}

export function SkillsSection() {
  const gridRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { rootMargin: '-10% 0px -10% 0px' },
    )

    observer.observe(grid)
    return () => observer.disconnect()
  }, [])

  return (
    <StickySection id="skills" className="flex flex-col justify-center py-14 px-8 bg-graphite">
      <div className="w-full">
        <div className="hscroll-head">
          <span className="hscroll-no">// 02</span>
          <span className="hscroll-name">SKILLS</span>
          <div className="hscroll-rule" />
        </div>

        <div ref={gridRef} data-testid="skills-grid" className="bento">
          {tiles.map((tile) => (
            <SkillTileCard key={tile.area} tile={tile} visible={isInView} />
          ))}
          <PaletteTile visible={isInView} />
        </div>
      </div>
    </StickySection>
  )
}
