import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScrollFadeSection } from './ScrollFadeSection'
import type { Project } from '../data/projects'

interface Props {
  projects: Project[]
}

const TAG_COLORS = [
  { bg: '#E0007F', fg: '#EFF1F3' },
  { bg: '#5200E0', fg: '#EFF1F3' },
  { bg: '#FF8547', fg: '#050609' },
  { bg: '#FFCE47', fg: '#050609' },
]

const NOTCH = 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'

function getTagStyle(tagIndex: number) {
  const color = TAG_COLORS[tagIndex % TAG_COLORS.length]
  return { backgroundColor: color.bg, color: color.fg }
}

const ProjectsSection: React.FC<Props> = ({ projects }) => {
  return (
    <ScrollFadeSection id="projects" className="min-h-screen flex flex-col justify-center py-14 px-8 bg-graphite-light">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-8">
          <span className="font-body text-xs text-atomic-tangerine tracking-widest whitespace-nowrap">// 01</span>
          <span className="font-body text-xs text-periwinkle tracking-widest whitespace-nowrap">PROJECTS</span>
          <hr className="flex-1 border-periwinkle/20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </ScrollFadeSection>
  )
}

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ y: isHovered ? -4 : 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      data-testid="project-card"
      className="relative"
      style={{ clipPath: NOTCH }}
    >
      <div className="relative bg-platinum p-5">
        {project.image && (
          <div className="mb-4 overflow-hidden" style={{ backgroundColor: '#3A3B3A' }}>
            <img
              src={project.image}
              alt={`${project.title} screenshot`}
              className="w-full h-40 object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-3 mb-2">
          <span className="font-body text-xs text-graphite/50">
            _{project.id.padStart(2, '0')}
          </span>
          <h3 className={`font-body font-bold text-base transition-colors duration-200 ${isHovered ? 'text-atomic-tangerine' : 'text-graphite'}`}>
            {project.title}
          </h3>
        </div>

        <p className="text-graphite/70 text-sm font-body leading-relaxed mb-4">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
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

        <div className="flex flex-col gap-1">
          {project.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-ultrasonic-blue hover:text-atomic-tangerine transition-colors"
            >
              // {link.label} ↗
            </a>
          ))}
        </div>
      </div>

      {/* Left-edge hover outline — rendered after card so it sits on top */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[3px] bg-atomic-tangerine"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
        style={{ transformOrigin: 'bottom' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
    </motion.div>
  )
}

export default ProjectsSection
