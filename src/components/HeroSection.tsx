import { useState } from 'react'
import { motion } from 'framer-motion'
import { StickySection } from './StickySection'
import { TypeIn } from '../animations/TypeIn'
import { RotatingRole } from '../animations/RotatingRole'
import {
  CTA_FADE_DURATION,
  FIRST_NAME,
  LAST_NAME,
  NAME_SPEED,
  ROLES,
  VALUE_PROP,
  VALUE_PROP_SPEED,
  cursorVariants,
} from './HeroSection.constants'
import { handleSectionLinkClick } from '../utils/smoothScrollTo'

const ctaVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

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
              <motion.span
                data-testid="hero-name-cursor"
                aria-hidden="true"
                className="inline-block w-[3px] h-[1.2em] bg-atomic-tangerine align-middle ml-1"
                variants={cursorVariants}
                animate="blink"
              />
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
            <motion.span
              data-testid="value-prop-cursor"
              aria-hidden="true"
              className="inline-block w-[3px] h-[1em] bg-atomic-tangerine align-middle ml-0.5"
              variants={cursorVariants}
              animate="blink"
            />
          )}
        </p>

        {showCTAs && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={ctaVariants}
            transition={{ duration: CTA_FADE_DURATION }}
            className="hero-cta"
          >
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
          </motion.div>
        )}
      </div>
    </StickySection>
  )
}

export default HeroSection
