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

interface SkillTile {
  category: Category
  name: string
  colSpan: string
  rowSpan: string
  bg: string
  fg: string
}

// Desktop (6-col, 11 rows — no two adjacent rows share the same span pattern):
//   R1: Python(2) TypeScript(2)                    [2,2]
//   R2: Python(2) Docker(1) C/C++(1)               [2,1,1]
//   R3: Python(2) JavaScript(2)                    [2,2]
//   R4: FastAPI(1) PyTorch(3)                      [1,3]
//   R5: NumPy(2) Pandas(1) Ansible(1)              [2,1,1]
//   R6: NumPy(2) HuggingFace(2)                    [2,2]
//   R7: Scikit-learn(3) Linux(1)                   [3,1]
//   R8: Git(1) SQL(3)                               [1,3]
//   R9: Transformers(2) Attention Mechanisms(1) Gradient Opt(1) [2,1,1]
//   R10: Model Training(3) Gradient Opt(1)        [3,1]
//   R11: Matplotlib(1) Mixed-Precision(2) Jupyter(1) [1,2,1]
//
// Mobile (2-col):
//   R1: Python(2)
//   R2: Python(2)
//   R3: TypeScript(1) Docker(1)
//   R4: TypeScript(1) C/C++(1)
//   R5: JavaScript(1) FastAPI(1)
//   R6: PyTorch(2)
//   R7: NumPy(1) Pandas(1)
//   R8: NumPy(1) Ansible(1)
//   R9: HuggingFace(1) Scikit-learn(1)
//   R10: Linux(1) Git(1)
//   R11: SQL(2)
//   R12: Transformers(1) Attention Mechanisms(1)
//   R13: Gradient Opt(1) Model Training(1)
//   R14: Matplotlib(1) Mixed-Precision(1)
//   R15: Jupyter(2)
const tiles: SkillTile[] = [
  { category: 'LANGUAGE',  name: 'Python',       colSpan: 'col-span-2 md:col-span-3',          rowSpan: 'row-span-2 md:row-span-3', bg: '#FF8547', fg: '#050609' },
  { category: 'LANGUAGE',  name: 'TypeScript',   colSpan: 'col-span-1 md:col-span-2',          rowSpan: 'row-span-2 md:row-span-2', bg: '#5200E0', fg: '#EFF1F3' },
  { category: 'TOOL',      name: 'Docker',       colSpan: 'col-span-1',                        rowSpan: 'row-span-1',               bg: '#EFF1F3', fg: '#2A2B2A' },
  { category: 'LANGUAGE',  name: 'C / C++',      colSpan: 'col-span-1',                        rowSpan: 'row-span-1',               bg: '#E0007F', fg: '#EFF1F3' },
  { category: 'LANGUAGE',  name: 'JavaScript',   colSpan: 'col-span-1 md:col-span-2',          rowSpan: 'row-span-1',               bg: '#EFF1F3', fg: '#2A2B2A' },
  { category: 'FRAMEWORK', name: 'FastAPI',      colSpan: 'col-span-1',                        rowSpan: 'row-span-1',               bg: '#5200E0', fg: '#EFF1F3' },
  { category: 'ML / DL',   name: 'PyTorch',      colSpan: 'col-span-2 md:col-span-3',          rowSpan: 'row-span-1 md:row-span-2', bg: '#FFCE47', fg: '#050609' },
  { category: 'DATA',      name: 'NumPy',        colSpan: 'col-span-1 md:col-span-2',          rowSpan: 'row-span-1',               bg: '#5200E0', fg: '#EFF1F3' },
  { category: 'DATA',      name: 'Pandas',       colSpan: 'col-span-1',                        rowSpan: 'row-span-1',               bg: '#E0007F', fg: '#EFF1F3' },
  { category: 'TOOL',      name: 'Ansible',      colSpan: 'col-span-1',                        rowSpan: 'row-span-1',               bg: '#FF8547', fg: '#050609' },
  { category: 'ML / DL',   name: 'Hugging Face', colSpan: 'col-span-1 md:col-span-2',          rowSpan: 'row-span-1',               bg: '#FFCE47', fg: '#050609' },
  { category: 'ML / DL',   name: 'Scikit-learn', colSpan: 'col-span-1 md:col-span-3',          rowSpan: 'row-span-1',               bg: '#FFCE47', fg: '#050609' },
  { category: 'TOOL',      name: 'Linux',        colSpan: 'col-span-1',                        rowSpan: 'row-span-1',               bg: '#EFF1F3', fg: '#2A2B2A' },
  { category: 'TOOL',      name: 'Git',          colSpan: 'col-span-1',                        rowSpan: 'row-span-1',               bg: '#FF8547', fg: '#050609' },
  { category: 'LANGUAGE',  name: 'SQL',          colSpan: 'col-span-1 md:col-span-2',          rowSpan: 'row-span-1',               bg: '#5200E0', fg: '#EFF1F3' },
  { category: 'ML / DL',   name: 'Transformers', colSpan: 'col-span-1 md:col-span-2',          rowSpan: 'row-span-1',               bg: '#FFCE47', fg: '#050609' },
  { category: 'ML / DL',   name: 'Attention Mechanisms', colSpan: 'col-span-1 md:col-span-2',  rowSpan: 'row-span-1',               bg: '#FFCE47', fg: '#050609' },
  { category: 'ML / DL',   name: 'Gradient Optimization', colSpan: 'col-span-1 md:col-span-2', rowSpan: 'row-span-1',               bg: '#FFCE47', fg: '#050609' },
  { category: 'ML / DL',   name: 'Model Training / Fine-tuning', colSpan: 'col-span-1 md:col-span-3', rowSpan: 'row-span-1',        bg: '#FFCE47', fg: '#050609' },
  { category: 'DATA',      name: 'Matplotlib',   colSpan: 'col-span-1',                        rowSpan: 'row-span-1',               bg: '#E0007F', fg: '#EFF1F3' },
  { category: 'DATA',      name: 'Mixed-Precision Training', colSpan: 'col-span-1 md:col-span-2', rowSpan: 'row-span-1',            bg: '#E0007F', fg: '#EFF1F3' },
  { category: 'TOOL',      name: 'Jupyter',      colSpan: 'col-span-2',                        rowSpan: 'row-span-1',               bg: '#EFF1F3', fg: '#2A2B2A' },
]

function getResponsiveSpan(span: string, axis: 'col' | 'row') {
  const mdMatch = span.match(new RegExp(`md:${axis}-span-(\\d+)`))
  if (mdMatch) return Number(mdMatch[1])

  const baseMatch = span.match(new RegExp(`${axis}-span-(\\d+)`))
  return baseMatch ? Number(baseMatch[1]) : 1
}

function getTileArea(tile: SkillTile) {
  return getResponsiveSpan(tile.colSpan, 'col') * getResponsiveSpan(tile.rowSpan, 'row')
}

const revealOrderByName = new Map(
  [...tiles]
    .sort((a, b) => getTileArea(b) - getTileArea(a) || tiles.indexOf(a) - tiles.indexOf(b))
    .map((tile, index) => [tile.name, index]),
)

function SkillTileCard({ tile }: { tile: SkillTile }) {
  const revealOrder = revealOrderByName.get(tile.name) ?? 0

  return (
    <motion.div
      variants={tileVariants}
      custom={revealOrder}
      whileHover="hover"
      className={`${tile.colSpan} ${tile.rowSpan} min-h-24 md:min-h-0 p-5 rounded-lg flex flex-col justify-between cursor-default`}
      style={{ backgroundColor: tile.bg, color: tile.fg }}
    >
      <span className="text-xs uppercase tracking-widest font-body">
        {tile.category}
      </span>
      <span className="font-body font-bold text-lg leading-tight mt-4">
        {tile.name}
      </span>
    </motion.div>
  )
}

export function SkillsSection() {
  const gridRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(gridRef, { margin: '-10% 0px -10% 0px' })

  return (
    <StickySection id="skills" className="flex flex-col justify-center py-14 px-8 bg-graphite">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-12">
          <span className="font-body text-xs text-atomic-tangerine tracking-widest whitespace-nowrap">// 02</span>
          <span className="font-body text-xs text-periwinkle tracking-widest whitespace-nowrap">SKILLS</span>
          <hr className="flex-1 border-periwinkle/20" />
        </div>

        <motion.div
          ref={gridRef}
          data-testid="skills-grid"
          variants={gridStagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-6 gap-3 min-h-screen md:grid-rows-[1fr_1.1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
        >
          {tiles.map((tile) => (
            <SkillTileCard key={tile.name} tile={tile} />
          ))}
        </motion.div>
      </div>
    </StickySection>
  )
}
