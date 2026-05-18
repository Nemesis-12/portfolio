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

const ctaVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

const HeroSection: React.FC = () => {
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
          data-testid="hero-dot-grid"
          data-parallax
          data-parallax-factor="0.3"
          className="absolute inset-0 bg-[radial-gradient(#3A3B3A_1px,transparent_1px)] bg-[size:20px_20px]"
        ></div>
      </div>

      <div data-testid="hero-content" className="relative z-10 px-8 pt-16 w-full space-y-6">
        <div data-testid="hero-init-label-unit" className="space-y-2 w-fit">
          <p className="font-body text-xs text-atomic-tangerine tracking-widest">
            // PORTFOLIO_INIT
          </p>
          <div data-testid="hero-init-label-underline" className="ml-0 w-8 h-0.5 bg-atomic-tangerine" />
        </div>

        <h1 data-testid="hero-name" className="font-display text-5xl text-platinum leading-tight">
          <TypeIn
            start={true}
            text={FIRST_NAME}
            speed={NAME_SPEED}
            onDone={() => {
              setFirstNameDone(true)
            }}
          />
          <TypeIn
            start={firstNameDone}
            text={` ${LAST_NAME}`}
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
        </h1>

        <RotatingRole
          roles={ROLES}
          active={nameDone}
          onFirstCycleComplete={() => {
            setStartValueProp(true)
          }}
        />

        <p className="font-body text-lg text-periwinkle/80" data-testid="value-prop">
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
            className="flex gap-4"
          >
            <a
              href="#projects"
              className="inline-block px-6 py-2 bg-atomic-tangerine text-graphite text-sm font-body hover:bg-atomic-tangerine/90 transition-colors duration-200"
            >
              VIEW_WORK →
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 border border-atomic-tangerine text-atomic-tangerine text-sm font-body hover:bg-atomic-tangerine/10 transition-colors duration-200"
            >
              VIEW_RESUME →
            </a>
          </motion.div>
        )}
      </div>
    </StickySection>
  )
}

export default HeroSection
