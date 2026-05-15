import { motion } from 'framer-motion'
import { fadeUp, hoverEase } from '../animations/variants'

type Category = 'LANGUAGE' | 'FRAMEWORK' | 'TOOL' | 'ML / DL' | 'DATA'

interface SkillTile {
  category: Category
  name: string
  colSpan: string
  bg: string
  fg: string
}

// Order matters for CSS grid auto-placement (4-col desktop, 2-col mobile).
// Python (col-span-2 row-span-2) anchors rows 1–2.
// The decorative element is spliced between tile index 12 and 13 (row 5 left).
const tiles: SkillTile[] = [
  // row 1 + row 2 (Python anchors left half)
  { category: 'LANGUAGE', name: 'Python',       colSpan: 'col-span-2 row-span-2', bg: '#FF8547', fg: '#050609' },
  { category: 'LANGUAGE', name: 'TypeScript',   colSpan: 'col-span-1',            bg: '#5200E0', fg: '#EAF2EF' },
  { category: 'TOOL',     name: 'Docker',       colSpan: 'col-span-1',            bg: '#050609', fg: '#EAF2EF' },
  { category: 'ML / DL',  name: 'PyTorch',      colSpan: 'col-span-1',            bg: '#FFCE47', fg: '#050609' },
  { category: 'LANGUAGE', name: 'C / C++',      colSpan: 'col-span-1',            bg: '#E0007F', fg: '#EAF2EF' },
  // row 3
  { category: 'LANGUAGE', name: 'JavaScript',   colSpan: 'col-span-1',            bg: '#050609', fg: '#EAF2EF' },
  { category: 'FRAMEWORK',name: 'FastAPI',      colSpan: 'col-span-1',            bg: '#5200E0', fg: '#EAF2EF' },
  { category: 'ML / DL',  name: 'Hugging Face', colSpan: 'col-span-1',            bg: '#EAF2EF', fg: '#050609' },
  { category: 'TOOL',     name: 'Git',          colSpan: 'col-span-1',            bg: '#FF8547', fg: '#050609' },
  // row 4
  { category: 'DATA',     name: 'NumPy',        colSpan: 'col-span-1',            bg: '#5200E0', fg: '#EAF2EF' },
  { category: 'DATA',     name: 'Pandas',       colSpan: 'col-span-1',            bg: '#E0007F', fg: '#EAF2EF' },
  { category: 'TOOL',     name: 'Ansible',      colSpan: 'col-span-1',            bg: '#FF8547', fg: '#050609' },
  { category: 'TOOL',     name: 'Linux',        colSpan: 'col-span-1',            bg: '#050609', fg: '#EAF2EF' },
  // row 5 — decor (col-span-2) is injected between index 12 and 13
  { category: 'ML / DL',  name: 'Scikit-learn', colSpan: 'col-span-1',            bg: '#FFCE47', fg: '#050609' },
  { category: 'LANGUAGE', name: 'SQL',          colSpan: 'col-span-1',            bg: '#5200E0', fg: '#EAF2EF' },
]

function SkillTileCard({ tile }: { tile: SkillTile }) {
  return (
    <motion.div
      variants={hoverEase}
      initial="idle"
      whileHover="hover"
      className={`${tile.colSpan} min-h-24 p-5 rounded-lg flex flex-col justify-between cursor-default`}
      style={{ backgroundColor: tile.bg, color: tile.fg }}
    >
      <span className="text-xs uppercase tracking-widest opacity-60 font-body">
        {tile.category}
      </span>
      <span className="font-body font-bold text-lg leading-tight mt-4">
        {tile.name}
      </span>
    </motion.div>
  )
}

export function SkillsSection() {
  return (
    <motion.section
      id="skills"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="py-24 px-6 max-w-5xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-12">
        <span className="font-body text-xs text-atomic-tangerine tracking-widest whitespace-nowrap">// 02</span>
        <span className="font-body text-xs text-graphite tracking-widest whitespace-nowrap">SKILLS</span>
        <hr className="flex-1 border-graphite/20" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.slice(0, 13).map((tile) => (
          <SkillTileCard key={tile.name} tile={tile} />
        ))}

        {/* Decorative 4-line element — bottom-left of row 5 */}
        <div className="col-span-2 min-h-24 rounded-lg flex items-stretch justify-evenly px-5 border border-graphite/10">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-px bg-graphite/20" />
          ))}
        </div>

        {tiles.slice(13).map((tile) => (
          <SkillTileCard key={tile.name} tile={tile} />
        ))}
      </div>
    </motion.section>
  )
}
