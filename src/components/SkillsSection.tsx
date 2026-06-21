import { useEffect, useRef, useState } from 'react'
import { StickySection } from './StickySection'

const TILE_REVEAL_STEP_S = 0.08

type Category = 'FRAMEWORK' | 'LIBRARY' | 'PLATFORM' | 'LANGUAGE' | 'TOOL' | 'SYSTEM'
type TileColor = 'orange' | 'blue' | 'fuchsia' | 'peri' | 'dark' | 'platinum' | 'yellow'

interface SkillTile {
  area: string
  category: Category
  name: string
  color: TileColor
  large?: boolean
}

const tiles: SkillTile[] = [
  // ML / DL
  { area: 'fl', category: 'FRAMEWORK', name: 'PYTORCH', color: 'yellow', large: true },
  { area: 'tr', category: 'LIBRARY', name: 'TRANSFORMERS', color: 'yellow' },
  { area: 'gt', category: 'PLATFORM', name: 'HUGGING FACE', color: 'yellow' },
  // Data & Computation
  { area: 'nd', category: 'LIBRARY', name: 'NUMPY', color: 'blue' },
  { area: 'pd', category: 'LIBRARY', name: 'PANDAS', color: 'fuchsia' },
  { area: 'sk', category: 'LIBRARY', name: 'SCIKIT-LEARN', color: 'blue' },
  { area: 'mp', category: 'LIBRARY', name: 'MATPLOTLIB', color: 'fuchsia' },
  // Languages
  { area: 'py', category: 'LANGUAGE', name: 'PYTHON', color: 'orange', large: true },
  { area: 'cc', category: 'LANGUAGE', name: 'C++', color: 'peri' },
  { area: 'ci', category: 'LANGUAGE', name: 'C', color: 'peri' },
  { area: 'sq', category: 'LANGUAGE', name: 'SQL', color: 'fuchsia' },
  { area: 're', category: 'LANGUAGE', name: 'JAVASCRIPT', color: 'peri' },
  { area: 'js', category: 'LANGUAGE', name: 'TYPESCRIPT', color: 'blue' },
  // Tools & Systems
  { area: 'mn', category: 'TOOL', name: 'GIT', color: 'dark' },
  { area: 'dk', category: 'TOOL', name: 'DOCKER', color: 'platinum' },
  { area: 'lx', category: 'SYSTEM', name: 'LINUX', color: 'dark' },
  { area: 'an', category: 'TOOL', name: 'ANSIBLE', color: 'platinum' },
  { area: 'jp', category: 'TOOL', name: 'JUPYTER', color: 'orange' },
  { area: 'nx', category: 'FRAMEWORK', name: 'FASTAPI', color: 'orange' },
]

export const REVEAL_AREAS = [
  'fl', 'tr', 'gt',
  'nd', 'pd', 'sk', 'mp',
  'py', 'cc', 'ci', 'sq', 're', 'js',
  'mn', 'dk', 'lx', 'an', 'jp', 'nx',
  'pal',
] as const

export function createShuffledRevealOrder(
  random: () => number = Math.random,
): Map<string, number> {
  const areas = [...REVEAL_AREAS]
  for (let i = areas.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[areas[i], areas[j]] = [areas[j], areas[i]]
  }
  return new Map(areas.map((area, index) => [area, index]))
}

export function revealTransitionDelay(area: string, revealOrder: Map<string, number>): string {
  const index = revealOrder.get(area) ?? 0
  return `${index * TILE_REVEAL_STEP_S}s`
}

const PALETTE = [
  'var(--color-atomic-tangerine)',
  'var(--color-golden-pollen)',
  'var(--color-fuchsia-flame)',
  'var(--color-ultrasonic-blue)',
] as const

function SkillTileCard({
  tile,
  visible,
  revealOrder,
}: {
  tile: SkillTile
  visible: boolean
  revealOrder: Map<string, number> | null
}) {
  return (
    <div
      className={`bi bi-${tile.area} c-${tile.color}${tile.large ? ' bi-lg' : ''}${visible ? ' in' : ''}`}
      style={{
        transitionDelay: revealOrder ? revealTransitionDelay(tile.area, revealOrder) : '0s',
      }}
    >
      <div className="bi-cat">{tile.category}</div>
      <div className="bi-name">{tile.name}</div>
    </div>
  )
}

function PaletteTile({
  visible,
  revealOrder,
}: {
  visible: boolean
  revealOrder: Map<string, number> | null
}) {
  return (
    <div
      className={`bi bi-pal${visible ? ' in' : ''}`}
      style={{
        transitionDelay: revealOrder ? revealTransitionDelay('pal', revealOrder) : '0s',
      }}
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
  const [revealOrder, setRevealOrder] = useState<Map<string, number> | null>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealOrder((current) => current ?? createShuffledRevealOrder())
          setIsInView(true)
          return
        }

        setIsInView(false)
        setRevealOrder(null)
      },
      { rootMargin: '-10% 0px -10% 0px' },
    )

    observer.observe(grid)
    return () => observer.disconnect()
  }, [])

  return (
    <StickySection id="skills" className="flex flex-col justify-start bg-graphite">
      <div className="w-full">
        <div className="hscroll-head">
          <span className="hscroll-no">// 02</span>
          <span className="hscroll-name">SKILLS</span>
          <div className="hscroll-rule" />
        </div>

        <div ref={gridRef} data-testid="skills-grid" className="bento">
          {tiles.map((tile) => (
            <SkillTileCard key={tile.area} tile={tile} visible={isInView} revealOrder={revealOrder} />
          ))}
          <PaletteTile visible={isInView} revealOrder={revealOrder} />
        </div>
      </div>
    </StickySection>
  )
}
