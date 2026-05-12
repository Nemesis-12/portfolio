import { motion } from 'framer-motion'
import { fadeUp, hoverEase } from '../animations/variants'

type Category = 'LANGUAGE' | 'FRAMEWORK' | 'TOOL' | 'RUNTIME' | 'DATABASE' | 'DESIGN'

interface SkillTile {
  category: Category
  name: string
  colSpan: string
  bg: string
  fg: string
}

const tiles: SkillTile[] = [
  { category: 'LANGUAGE',  name: 'Python',     colSpan: 'col-span-2',              bg: '#FF8547', fg: '#050609' },
  { category: 'LANGUAGE',  name: 'JavaScript', colSpan: 'col-span-1',              bg: '#5200E0', fg: '#EAF2EF' },
  { category: 'LANGUAGE',  name: 'C/C++',      colSpan: 'col-span-1',              bg: '#E0007F', fg: '#EAF2EF' },
  { category: 'FRAMEWORK', name: 'React',      colSpan: 'col-span-1',              bg: '#FFCE47', fg: '#050609' },
  { category: 'FRAMEWORK', name: 'Next.js',    colSpan: 'col-span-1 md:col-span-2', bg: '#050609', fg: '#EAF2EF' },
  { category: 'FRAMEWORK', name: 'Flask',      colSpan: 'col-span-1',              bg: '#FF8547', fg: '#050609' },
  { category: 'RUNTIME',   name: 'Node.js',    colSpan: 'col-span-1',              bg: '#5200E0', fg: '#EAF2EF' },
  { category: 'TOOL',      name: 'Git/GitHub', colSpan: 'col-span-1',              bg: '#E0007F', fg: '#EAF2EF' },
  { category: 'TOOL',      name: 'Docker',     colSpan: 'col-span-1',              bg: '#FFCE47', fg: '#050609' },
  { category: 'DATABASE',  name: 'PostgreSQL', colSpan: 'col-span-1',              bg: '#050609', fg: '#EAF2EF' },
  { category: 'DATABASE',  name: 'MongoDB',    colSpan: 'col-span-1 md:col-span-2', bg: '#FF8547', fg: '#050609' },
  { category: 'DESIGN',    name: 'Figma',      colSpan: 'col-span-2',              bg: '#5200E0', fg: '#EAF2EF' },
]

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
      <p className="text-atomic-tangerine font-body text-sm mb-4 tracking-widest">
        // 02 SKILLS
      </p>
      <h2 className="font-display text-2xl text-black mb-12">SKILLS_</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((tile) => (
          <motion.div
            key={tile.name}
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
        ))}
      </div>
    </motion.section>
  )
}
