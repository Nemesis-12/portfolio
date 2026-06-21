import { useState } from 'react'
import { StickySection } from './StickySection'
import { TypeIn } from '../animations/TypeIn'
import { RotatingRole } from '../animations/RotatingRole'
import { FIRST_NAME, LAST_NAME, NAME_SPEED, ROLES, VALUE_PROP } from './HeroSection.constants'
import { handleSectionLinkClick } from '../utils/smoothScrollTo'

interface HeroSectionProps {
  introReady?: boolean
}

const HeroSection: React.FC<HeroSectionProps> = ({ introReady = true }) => {
  const [initDone, setInitDone] = useState(false)
  const [firstNameDone, setFirstNameDone] = useState(false)
  const [nameDone, setNameDone] = useState(false)
  const [showNameCursor, setShowNameCursor] = useState(false)

  return (
    <StickySection id="home" className="relative flex flex-col justify-center bg-graphite">
      <div className="absolute inset-0 pointer-events-none">
        <div
          data-testid="hero-grid"
          data-parallax
          data-parallax-factor="0.3"
          className="hero-grid"
        ></div>
      </div>

      <div data-testid="hero-content" className="hero-inner pt-16 w-full">
        <p className="hero-init">
          <TypeIn
            start={introReady}
            text="// PORTFOLIO_INIT"
            speed={28}
            onDone={() => {
              setInitDone(true)
            }}
          />
        </p>
        <div className="hero-bar" />

        <h1
          data-testid="hero-name"
          className="hero-name"
          data-parallax
          data-parallax-factor="0.15"
        >
          <span className="hero-name-line">
            <TypeIn
              start={initDone}
              text={FIRST_NAME}
              speed={NAME_SPEED}
              delay={200}
              onDone={() => {
                setFirstNameDone(true)
              }}
            />
          </span>
          <span className="hero-name-line">
            <TypeIn
              start={firstNameDone}
              text={LAST_NAME}
              speed={NAME_SPEED}
              delay={150}
              onDone={() => {
                setNameDone(true)
                setShowNameCursor(true)
              }}
            />
            {showNameCursor && (
              <span data-testid="hero-name-cursor" aria-hidden="true" className="cursor" />
            )}
          </span>
        </h1>

        {nameDone && (
          <>
            <div className="hero-fade" style={{ animationDelay: '120ms' }}>
              <RotatingRole
                roles={ROLES}
                active={nameDone}
                className="hero-role"
                startDelay={400}
              />
            </div>

            <p
              className="hero-tag hero-fade"
              style={{ animationDelay: '380ms' }}
              data-testid="value-prop"
            >
              {VALUE_PROP}
            </p>

            <div className="hero-cta hero-fade" style={{ animationDelay: '620ms' }}>
              <a
                href="#projects"
                className="btn btn-fill"
                onClick={(event) => handleSectionLinkClick(event, 'projects')}
              >
                VIEW_WORK <span>→</span>
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                VIEW_RESUME <span>→</span>
              </a>
            </div>
          </>
        )}
      </div>
    </StickySection>
  )
}

export default HeroSection
