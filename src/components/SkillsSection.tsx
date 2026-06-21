import { useEffect, useRef, useState } from 'react'
import { StickySection } from './StickySection'

const TILE_REVEAL_STEP_S = 0.08

type Category = 'ML / DL' | 'DATA & COMPUTATION' | 'LANGUAGES' | 'TOOLS & SYSTEMS'
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
  { area: 'fl', category: 'ML / DL', name: 'PyTorch', color: 'yellow', large: true },
  { area: 'tr', category: 'ML / DL', name: 'Transformers', color: 'yellow' },
  { area: 'gt', category: 'ML / DL', name: 'Hugging Face', color: 'yellow' },
  // Data & Computation
  { area: 'nd', category: 'DATA & COMPUTATION', name: 'NumPy', color: 'blue' },
  { area: 'pd', category: 'DATA & COMPUTATION', name: 'Pandas', color: 'fuchsia' },
  { area: 'sk', category: 'DATA & COMPUTATION', name: 'Scikit-learn', color: 'blue' },
  { area: 'mp', category: 'DATA & COMPUTATION', name: 'Matplotlib', color: 'fuchsia' },
  // Languages
  { area: 'py', category: 'LANGUAGES', name: 'Python', color: 'orange', large: true },
  { area: 'cc', category: 'LANGUAGES', name: 'C++', color: 'peri' },
  { area: 'ci', category: 'LANGUAGES', name: 'C', color: 'peri' },
  { area: 'sq', category: 'LANGUAGES', name: 'SQL', color: 'fuchsia' },
  { area: 're', category: 'LANGUAGES', name: 'JavaScript', color: 'peri' },
  { area: 'js', category: 'LANGUAGES', name: 'TypeScript', color: 'blue' },
  // Tools & Systems
  { area: 'mn', category: 'TOOLS & SYSTEMS', name: 'Git', color: 'dark' },
  { area: 'dk', category: 'TOOLS & SYSTEMS', name: 'Docker', color: 'platinum' },
  { area: 'lx', category: 'TOOLS & SYSTEMS', name: 'Linux', color: 'dark' },
  { area: 'an', category: 'TOOLS & SYSTEMS', name: 'Ansible', color: 'platinum' },
  { area: 'jp', category: 'TOOLS & SYSTEMS', name: 'Jupyter', color: 'orange' },
  { area: 'nx', category: 'TOOLS & SYSTEMS', name: 'FastAPI', color: 'orange' },
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
