import { useState } from 'react'
import { StickySection } from './StickySection'
import { TypeIn } from '../animations/TypeIn'
import { RotatingRole } from '../animations/RotatingRole'
import {
  FIRST_NAME,
  LAST_NAME,
  NAME_SPEED,
  ROLES,
  VALUE_PROP,
  VALUE_PROP_SPEED,
} from './HeroSection.constants'
import { handleSectionLinkClick } from '../utils/smoothScrollTo'

interface HeroSectionProps {
  introReady?: boolean
}

const HeroSection: React.FC<HeroSectionProps> = ({ introReady = true }) => {
  const [firstNameDone, setFirstNameDone] = useState(false)
  const [nameDone, setNameDone] = useState(false)
  const [showNameCursor, setShowNameCursor] = useState(false)
  const [startValueProp, setStartValueProp] = useState(false)
  const [valuePropDone, setValuePropDone] = useState(false)
  const [showCTAs, setShowCTAs] = useState(false)

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
        <p className="hero-init">// PORTFOLIO_INIT</p>
        <div className="hero-bar" />

        <h1 data-testid="hero-name" className="hero-name">
          <span className="hero-name-line">
            <TypeIn
              start={introReady}
              text={FIRST_NAME}
              speed={NAME_SPEED}
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

        <RotatingRole
          roles={ROLES}
          active={nameDone}
          className="hero-role"
          onFirstCycleComplete={() => {
            setStartValueProp(true)
          }}
        />

        <p className="hero-tag" data-testid="value-prop">
          <TypeIn
            start={startValueProp}
            text={VALUE_PROP}
            speed={VALUE_PROP_SPEED}
            onDone={() => {
              setValuePropDone(true)
              setShowCTAs(true)
            }}
          />
          {startValueProp && !valuePropDone && (
            <span data-testid="value-prop-cursor" aria-hidden="true" className="cursor" />
          )}
        </p>

        {showCTAs && (
          <div className="hero-cta hero-fade">
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
        )}
      </div>
    </StickySection>
  )
}

export default HeroSection
