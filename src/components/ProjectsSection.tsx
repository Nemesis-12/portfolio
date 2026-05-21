import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useCardDeckDepth } from '../hooks/useCardDeckDepth'
import { useHorizontalScroll } from '../hooks/useHorizontalScroll'
import type { Project } from '../data/projects'
import { formatProjectNumber, getScrollRangeVh, PROJECT_CARD_WIDTH } from './projectsGeometry'

interface Props {
  projects: Project[]
}

const TAG_VARIANTS = ['fuchsia', 'blue', 'orange', 'yellow'] as const

const INVERTED_TAG_CLASS = 'ptag-inverted'

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
  const { tx, progress } = useHorizontalScroll(outerRef as React.RefObject<HTMLElement>, innerRef as React.RefObject<HTMLElement>, { cardWidth: PROJECT_CARD_WIDTH })
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
      <div data-sticky-viewport="true" className="relative flex flex-col justify-center py-14" style={{ position: 'sticky', top: 0, height: '100vh' }}>
        <div className="w-full">
          <div className="flex items-center gap-3 mb-8">
            <span className="font-body text-xs text-atomic-tangerine tracking-widest whitespace-nowrap">// 01</span>
            <span className="font-body text-xs text-periwinkle tracking-widest whitespace-nowrap">PROJECTS</span>
            <hr className="flex-1 border-periwinkle/20" />
            <div
              data-testid="progress-indicator"
              className="flex items-center gap-[10px] font-body text-periwinkle shrink-0"
              style={{ fontSize: '9px', letterSpacing: '2px' }}
            >
              <span data-testid="progress-count">
                {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
              </span>
              <div
                className="relative"
                style={{ width: '80px', height: '1px', backgroundColor: 'rgba(178,182,210,0.2)' }}
              >
                <div
                  data-testid="progress-fill"
                  className="absolute left-0 top-0 h-full bg-atomic-tangerine"
                  style={{ width: `${progress * 100}%`, transition: 'width 0.1s linear' }}
                />
              </div>
            </div>
          </div>

          <div ref={innerRef as React.RefObject<HTMLDivElement>} data-carousel-track="true" className="relative" style={{ transform: `translateX(${tx}px)` }}>
            <div className="flex gap-6 pb-4">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} activeIndex={activeIndex} />
              ))}
            </div>
          </div>
        </div>

        <motion.div
          data-testid="scroll-hint"
          data-visible={progress === 0}
          aria-hidden="true"
          animate={{ opacity: progress === 0 ? 0.85 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute font-body text-periwinkle flex items-center gap-3 pointer-events-none"
          style={{ fontSize: '14px', letterSpacing: '3px', left: '50%', bottom: '28px', transform: 'translateX(-50%)' }}
        >
          SCROLL{' '}
          <motion.span
            animate={progress === 0 ? { x: [0, 6, 0] } : { x: 0 }}
            transition={
              progress === 0
                ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0 }
            }
            style={{ display: 'inline-block' }}
          >
            →
          </motion.span>
        </motion.div>
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
  const projectNumber = formatProjectNumber(project.id)

  return (
    <motion.article
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
      data-fill-active={isFillActive}
      data-card-state={cardState}
      data-card-scale={scale}
      data-card-opacity={opacity}
      className="pcard shrink-0"
      style={{ transformOrigin: 'center center' }}
    >
      <div className="pcard-bg" aria-hidden="true" />

      <div
        data-testid="project-card-fill"
        aria-hidden="true"
        data-active={isFillActive}
        className="pcard-fill"
      />

      <span className="pcard-notch tl" aria-hidden="true" />
      <span className="pcard-notch br" aria-hidden="true" />

      <div className="pcard-body">
        <div className="pcard-ghost" data-testid="pcard-ghost" aria-hidden="true">
          {projectNumber}
        </div>
        <div className="pcard-num" data-testid="pcard-num">
          {projectNumber}
        </div>
        <h3 className={`pcard-name transition-colors duration-200 ${isFillActive ? 'text-platinum' : ''}`}>
          {project.title}
        </h3>
        <p className={`pcard-desc transition-colors duration-200 ${isFillActive ? 'text-platinum opacity-100' : ''}`}>
          {project.description}
        </p>
        <div className="pcard-tags">
          {project.tags.map((tag, tagIndex) => (
            <span
              key={tag}
              data-inverted={isFillActive}
              className={`ptag ptag-${TAG_VARIANTS[tagIndex % TAG_VARIANTS.length]} ${isFillActive ? INVERTED_TAG_CLASS : ''}`}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="pcard-links">
          {project.links.map((link) => (
            <a
              key={`${link.label}-${link.url}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`// ${link.label} ↗`}
              className={`plink transition-colors ${isFillActive ? 'text-platinum' : ''}`}
            >
              {link.label} <span className="plink-arrow">↗</span>
            </a>
          ))}
        </div>
      </div>

      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[3px] bg-atomic-tangerine"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: isFillActive ? 1 : 0, opacity: isFillActive ? 1 : 0 }}
        style={{ transformOrigin: 'bottom' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
    </motion.article>
  )
}

export default ProjectsSection
