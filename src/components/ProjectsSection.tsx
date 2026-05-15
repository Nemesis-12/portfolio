import { motion } from 'framer-motion'
import { fadeUp } from '../animations/variants'
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

const PLACEHOLDER_COLORS = [
  '#E0007F',
  '#5200E0',
  '#FF8547',
  '#FFCE47',
]

function getTagStyle(tagIndex: number) {
  const color = TAG_COLORS[tagIndex % 4]
  return { backgroundColor: color.bg, color: color.fg }
}

function getPlaceholderColor(projectIndex: number) {
  return PLACEHOLDER_COLORS[projectIndex % 4]
}

const ProjectsSection: React.FC<Props> = ({ projects }) => {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, projectIndex) => (
          <ProjectCard key={project.id} project={project} projectIndex={projectIndex} />
        ))}
      </div>
    </motion.section>
  )
}

const ProjectCard: React.FC<{ project: Project; projectIndex: number }> = ({ project, projectIndex }) => {
  const placeholderColor = getPlaceholderColor(projectIndex)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative group"
      style={{
        clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)',
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 bg-atomic-tangerine opacity-0 group-hover:opacity-100 transition-all duration-300"
        style={{
          clipPath: 'polygon(0 20px, 4px 20px, 4px calc(100% - 20px), 4px 100%, 0 100%, 0 20px)',
        }}
      />

      <div
        className="relative bg-white border-0 p-5 h-full"
        style={{
          clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)',
          backgroundImage: 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)',
        }}
      >
        {project.image ? (
          <div className="mb-4 rounded overflow-hidden" style={{ backgroundColor: '#3A3B3A' }}>
            <img
              src={project.image}
              alt={`${project.title} screenshot`}
              className="w-full h-32 object-cover"
            />
          </div>
        ) : (
          <div
            className="mb-4 h-32 rounded"
            style={{ backgroundColor: placeholderColor }}
          />
        )}

        <div className="flex items-center gap-3 mb-2">
          <span className="font-body text-xs text-graphite">
            _{project.id.padStart(2, '0')}
          </span>
          <h3 className="font-body font-bold text-base text-black">
            {project.title}
          </h3>
        </div>

        <p className="text-graphite text-sm font-body leading-relaxed mb-4">
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
              className="font-mono text-xs text-graphite hover:text-atomic-tangerine transition-colors"
            >
              // {link.label} ↗
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectsSection