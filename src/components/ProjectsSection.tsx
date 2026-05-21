import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useCardDeckDepth } from '../hooks/useCardDeckDepth'
import { useHorizontalScroll } from '../hooks/useHorizontalScroll'
import type { Project } from '../data/projects'
import { getScrollRangeVh } from './projectsGeometry'

interface Props {
  projects: Project[]
}

const TAG_COLORS = [
  { bg: '#E0007F', fg: '#EFF1F3' },
  { bg: '#5200E0', fg: '#EFF1F3' },
  { bg: '#FF8547', fg: '#050609' },
  { bg: '#FFC857', fg: '#050609' },
]

const NOTCH = 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
const FILL_CLOSED = 'polygon(0 0, 0 0, 0 0, 0 0)'
const FILL_OPEN = 'polygon(0 0, 220% 0, 100% 220%, 0 100%)'
const FILL_TRANSITION = { duration: 0.32, ease: 'easeOut' } as const
const INVERTED_TAG_STYLE = {
  backgroundColor: 'rgba(42, 43, 42, 0.14)',
  color: '#2A2B2A',
  borderColor: 'rgba(42, 43, 42, 0.38)',
} as const

function getTagStyle(tagIndex: number) {
  const color = TAG_COLORS[tagIndex % TAG_COLORS.length]
  return { backgroundColor: color.bg, color: color.fg }
}

const CARD_WIDTH = 480
const NEIGHBOR_SCALE = 0.92
const NEIGHBOR_OPACITY = 0.6
const FAR_SCALE = 0.85
const FAR_OPACITY = 0.25
const CARD_STATE_TRANSITION = {
  y: { duration: 0.2, ease: 'easeOut' },
  scale: { duration: 0.3, ease: 'easeOut' },
  opacity: { duration: 0.3, ease: 'easeOut' },
} as const

function clampIndex(index: number, projectCount: number) {
  return Math.max(0, Math.min(projectCount - 1, index))
}

const ProjectsSection: React.FC<Props> = ({ projects }) => {
  const outerRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const { tx, progress } = useHorizontalScroll(outerRef as React.RefObject<HTMLElement>, innerRef as React.RefObject<HTMLElement>, { cardWidth: CARD_WIDTH })
  const scrollRangeVh = getScrollRangeVh(projects.length)
  useCardDeckDepth(outerRef as React.RefObject<HTMLElement>)

  const activeIndex = projects.length > 1
    ? clampIndex(Math.round(progress * (projects.length - 1)), projects.length)
    : 0

  return (
    <section
      ref={outerRef}
      id="projects"
      data-sticky-section="true"
      className="relative min-h-screen px-8 bg-graphite-light origin-center transform-gpu"
      style={{ height: `${scrollRangeVh * 100}vh`, overflowX: 'hidden', willChange: 'transform, opacity' }}
    >
      <div data-sticky-viewport="true" className="flex flex-col justify-center py-14" style={{ position: 'sticky', top: 0, height: '100vh' }}>
        <div className="w-full">
          <div className="flex items-center gap-3 mb-8">
            <span className="font-body text-xs text-atomic-tangerine tracking-widest whitespace-nowrap">// 01</span>
            <span className="font-body text-xs text-periwinkle tracking-widest whitespace-nowrap">PROJECTS</span>
            <hr className="flex-1 border-periwinkle/20" />
          </div>

          <div ref={innerRef as React.RefObject<HTMLDivElement>} data-carousel-track="true" className="relative" style={{ transform: `translateX(${tx}px)` }}>
            <div className="flex gap-6 pb-4">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} activeIndex={activeIndex} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const ProjectCard: React.FC<{ project: Project; index: number; activeIndex: number }> = ({ project, index, activeIndex }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)
  const isFillActive = isHovered || hasFocus

  const distance = Math.abs(index - activeIndex)
  const isActive = distance === 0
  const isNeighbor = distance === 1
  const cardState = isActive ? 'active' : isNeighbor ? 'neighbor' : 'far'

  const scale = isActive ? 1 : isNeighbor ? NEIGHBOR_SCALE : FAR_SCALE
  const opacity = isActive ? 1 : isNeighbor ? NEIGHBOR_OPACITY : FAR_OPACITY

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setHasFocus(false)
        }
      }}
      animate={{ y: isFillActive ? -4 : 0, scale, opacity }}
      transition={CARD_STATE_TRANSITION}
      data-testid="project-card"
      data-card-state={cardState}
      data-card-scale={scale}
      data-card-opacity={opacity}
      className="relative shrink-0 bg-platinum"
      style={{
        clipPath: NOTCH,
        maxWidth: '480px',
        width: '480px',
        transformOrigin: 'center center',
      }}
    >
      <motion.div
        data-testid="project-card-fill"
        aria-hidden="true"
        data-active={isFillActive}
        className="absolute inset-0 bg-atomic-tangerine"
        initial={false}
        animate={{ clipPath: isFillActive ? FILL_OPEN : FILL_CLOSED }}
        transition={FILL_TRANSITION}
      />

      <div className="relative z-10 p-5">
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
          <span className={`font-body text-xs transition-colors duration-200 ${isFillActive ? 'text-graphite' : 'text-graphite/50'}`}>
            _{project.id.padStart(2, '0')}
          </span>
          <h3 className="font-body font-bold text-base text-graphite transition-colors duration-200">
            {project.title}
          </h3>
        </div>

        <p className={`text-sm font-body leading-relaxed mb-4 transition-colors duration-200 ${isFillActive ? 'text-graphite' : 'text-graphite/70'}`}>
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag, tagIndex) => (
            <span
              key={tag}
              data-inverted={isFillActive}
              className="text-xs px-2 py-0.5 font-body rounded border border-transparent transition-colors duration-200"
              style={isFillActive ? INVERTED_TAG_STYLE : getTagStyle(tagIndex)}
            >
              {tag}
            </span>
          ))}
        </div>

        {project.bullets && project.bullets.length > 0 && (
          <ul className={`list-disc list-inside text-sm font-body leading-relaxed mb-4 space-y-1 transition-colors duration-200 ${isFillActive ? 'text-graphite' : 'text-graphite/70'}`}>
            {project.bullets.map((bullet, index) => (
              <li key={index}>{bullet}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-1">
          {project.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-mono text-xs transition-colors ${isFillActive ? 'text-graphite hover:text-graphite' : 'text-ultrasonic-blue hover:text-atomic-tangerine'}`}
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
        animate={{ scaleY: isFillActive ? 1 : 0, opacity: isFillActive ? 1 : 0 }}
        style={{ transformOrigin: 'bottom' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
    </motion.div>
  )
}

export default ProjectsSection
