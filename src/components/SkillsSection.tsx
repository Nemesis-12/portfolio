import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { hoverEase } from '../animations/variants'
import { StickySection } from './StickySection'

const TILE_REVEAL_STEP = 0.12
const TILE_REVEAL_DURATION = 0.5

const tileStagger = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (order: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: order * TILE_REVEAL_STEP, duration: TILE_REVEAL_DURATION, ease: 'easeOut' as const },
  }),
}

const gridStagger = {
  hidden: {},
  visible: {},
}

const tileVariants = {
  ...tileStagger,
  hover: hoverEase.hover,
}

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

const REVEAL_ORDER = ['py', 'js', 'dk', 're', 'cc', 'nd', 'nx', 'fl', 'gt', 'pg', 'fg', 'mn', 'pal'] as const

const revealOrderByArea = new Map<string, number>(
  REVEAL_ORDER.map((area, index) => [area, index]),
)

const PALETTE = [
  'var(--color-atomic-tangerine)',
  'var(--color-golden-pollen)',
  'var(--color-fuchsia-flame)',
  'var(--color-ultrasonic-blue)',
] as const

function SkillTileCard({ tile }: { tile: SkillTile }) {
  const revealOrder = revealOrderByArea.get(tile.area) ?? 0

  return (
    <motion.div
      variants={tileVariants}
      custom={revealOrder}
      whileHover="hover"
      className={`bi bi-${tile.area} c-${tile.color}${tile.large ? ' bi-lg' : ''}`}
    >
      <div className="bi-cat">{tile.category}</div>
      <div className="bi-name">{tile.name}</div>
    </motion.div>
  )
}

function PaletteTile() {
  const revealOrder = revealOrderByArea.get('pal') ?? 12

  return (
    <motion.div
      variants={tileVariants}
      custom={revealOrder}
      className="bi bi-pal"
      data-testid="skills-palette"
    >
      {PALETTE.map((color, index) => (
        <div key={index} className="pswatch" style={{ background: color }} />
      ))}
    </motion.div>
  )
}

export function SkillsSection() {
  const gridRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(gridRef, { margin: '-10% 0px -10% 0px' })

  return (
    <StickySection id="skills" className="flex flex-col justify-center py-14 px-8 bg-graphite">
      <div className="w-full">
        <div className="hscroll-head">
          <span className="hscroll-no">// 02</span>
          <span className="hscroll-name">SKILLS</span>
          <div className="hscroll-rule" />
        </div>

        <motion.div
          ref={gridRef}
          data-testid="skills-grid"
          variants={gridStagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="bento"
        >
          {tiles.map((tile) => (
            <SkillTileCard key={tile.area} tile={tile} />
          ))}
          <PaletteTile />
        </motion.div>
      </div>
    </StickySection>
  )
}
