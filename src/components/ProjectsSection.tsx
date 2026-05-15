import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp } from '../animations/variants'

interface Project {
  id: string
  title: string
  description: string
  tags: string[]
}

interface Props {
  projects: Project[]
}

const STRIPE_STYLE = {
  background: 'repeating-linear-gradient(45deg, #3A3B3A, #3A3B3A 2px, #4A4B4A 2px, #4A4B4A 14px)',
}

const TAG_COLORS = [
  { bg: '#E0007F', fg: '#EFF1F3' }, // fuchsia-flame - light text
  { bg: '#5200E0', fg: '#EFF1F3' }, // ultrasonic-blue - light text
  { bg: '#FF8547', fg: '#050609' }, // atomic-tangerine - dark text
  { bg: '#FFCE47', fg: '#050609' }, // golden-pollen - dark text
]

function getTagStyle(tagIndex: number) {
  const color = TAG_COLORS[tagIndex % 4]
  return { backgroundColor: color.bg, color: color.fg }
}

const ProjectsSection: React.FC<Props> = ({ projects }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <motion.section
      id="projects"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="py-14 px-6 max-w-5xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <span className="font-body text-xs text-atomic-tangerine tracking-widest whitespace-nowrap">// 01</span>
        <span className="font-body text-xs text-graphite tracking-widest whitespace-nowrap">PROJECTS</span>
        <hr className="flex-1 border-graphite/20" />
      </div>

      <div className="space-y-0">
        {projects.map((project) => {
          const isExpanded = expandedId === project.id
          return (
            <div key={project.id}>
              <div
                className={`overflow-hidden border border-graphite/20 ${isExpanded ? 'bg-white/5' : ''}`}
                style={isExpanded ? { borderLeft: '3px solid #FF8547' } : {}}
              >
                <div
                  onClick={() => toggleExpand(project.id)}
                  className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-white/5"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-graphite font-body">
                      _{project.id.padStart(2, '0')}
                    </span>
                    <h3 className="font-body font-bold text-base text-black">
                      {project.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {project.tags.map((tag, tagIndex) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 font-body rounded"
                          style={getTagStyle(tagIndex)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-atomic-tangerine text-xs font-body">
                      {isExpanded ? '↑' : '↓'}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      key={project.id}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-[40%_60%] gap-6 p-6">
                        <div
                          className="flex items-center justify-center h-40 rounded"
                          style={STRIPE_STYLE}
                        >
                          <span className="text-graphite/60 text-xs font-body">
                            // PROJECT IMAGE
                          </span>
                        </div>
                        <p className="text-graphite text-sm font-body leading-relaxed self-center">
                          {project.description}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <hr className="border-graphite/10" />
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}

export default ProjectsSection
