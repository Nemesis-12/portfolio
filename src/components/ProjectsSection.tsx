import { useMemo, useRef, useState } from 'react'
import { useHorizontalScroll } from '../hooks/useHorizontalScroll'
import type { Project } from '../data/projects'
import { formatProjectNumber, getProjectsScrollRunwayPx, getScrollRangeVh, getTagVariant } from './projectsGeometry'

interface Props {
  projects: Project[]
}

const INVERTED_TAG_CLASS = 'ptag-inverted'

function clampIndex(index: number, projectCount: number) {
  return Math.max(0, Math.min(projectCount - 1, index))
}

const ProjectsSection: React.FC<Props> = ({ projects }) => {
  const outerRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const scrollRangeVh = getScrollRangeVh(projects.length)
  const scrollOptions = useMemo(() => ({
    getScrollRangePx: ({ viewportHeight }: { viewportHeight: number }) => getProjectsScrollRunwayPx(projects.length, viewportHeight),
  }), [projects.length])
  const { tx, progress } = useHorizontalScroll(
    outerRef as React.RefObject<HTMLElement>,
    innerRef as React.RefObject<HTMLElement>,
    scrollOptions,
  )

  const activeIndex = projects.length > 1
    ? clampIndex(Math.round(progress * (projects.length - 1)), projects.length)
    : 0
  const visibleProjectIndex = projects.length === 0 ? 0 : activeIndex + 1

  return (
    <section
      ref={outerRef}
      id="projects"
      data-sticky-scroll-host="true"
      className="relative hscroll min-h-screen px-8 bg-graphite"
      style={{ height: `${scrollRangeVh * 100}vh`, overflowX: 'clip' }}
    >
      {projects.map((_, index) => (
        <div
          key={`snap-${index}`}
          className="snap-anchor"
          style={{ top: `${index * 100}vh` }}
          aria-hidden="true"
          data-testid="snap-anchor"
        />
      ))}

      <div data-sticky-viewport="true" className="hscroll-sticky flex flex-col">
        <div className="hscroll-head">
          <span className="hscroll-no">// 01</span>
          <span className="hscroll-name">PROJECTS</span>
          <div className="hscroll-rule" />
          <div data-testid="progress-indicator" className="hscroll-progress">
            <span data-testid="progress-count">
              {String(visibleProjectIndex).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
            </span>
            <div className="hscroll-progress-track">
              <div
                data-testid="progress-fill"
                className="hscroll-progress-fill"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div
          ref={innerRef as React.RefObject<HTMLDivElement>}
          data-carousel-track="true"
          className="hscroll-track proj-track pb-4"
          style={{ transform: `translateX(${tx}px)` }}
        >
          <div className="proj-edge" aria-hidden="true" />
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          <div className="proj-edge" aria-hidden="true" />
        </div>

        <div
          data-testid="scroll-hint"
          data-visible={progress < 1}
          aria-hidden="true"
          className="hscroll-hint pointer-events-none"
        >
          SCROLL <span>↓</span>
        </div>
      </div>
    </section>
  )
}

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)
  const isFillActive = isHovered || hasFocus
  const projectNumber = formatProjectNumber(project.id)

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setHasFocus(false)
        }
      }}
      data-testid="project-card"
      data-fill-active={isFillActive}
      className="pcard shrink-0"
    >
      <div className="pcard-clip" aria-hidden="true">
        <div className="pcard-bg" />
        <div
          data-testid="project-card-fill"
          data-active={isFillActive}
          className="pcard-fill"
        />
      </div>

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
              className={`ptag ptag-${getTagVariant(tagIndex)} ${isFillActive ? INVERTED_TAG_CLASS : ''}`}
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
    </article>
  )
}

export default ProjectsSection
