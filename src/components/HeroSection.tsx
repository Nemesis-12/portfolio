import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ScrollFadeSection } from './ScrollFadeSection'
import { cursorVariants } from './HeroSection.constants'

const SUBTITLE = 'CS_STUDENT · DEVELOPER'
const VALUE_PROP = '// I BUILD THINGS THAT ARE FUN TO FIGURE OUT.'
const INITIAL_DELAY = 400
const SUBTITLE_SPEED = 60
const VALUE_PROP_DELAY = 400
const VALUE_PROP_SPEED = 35

const HeroSection: React.FC = () => {
  const [subtitle, setSubtitle] = useState('')
  const [valueProp, setValueProp] = useState('')
  const [showSubtitleCursor, setShowSubtitleCursor] = useState(false)
  const [showValuePropCursor, setShowValuePropCursor] = useState(false)

  const subtitleRef = useRef(0)
  const valuePropRef = useRef(0)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay)
      timersRef.current.push(timer)
    }

    const typeValueProp = () => {
      setShowValuePropCursor(true)

      schedule(() => {
        valuePropRef.current += 1
        setValueProp(VALUE_PROP.slice(0, valuePropRef.current))

        if (valuePropRef.current === VALUE_PROP.length) {
          setShowValuePropCursor(false)
          return
        }

        typeValueProp()
      }, VALUE_PROP_SPEED)
    }

    const typeSubtitle = () => {
      schedule(() => {
        subtitleRef.current += 1
        setSubtitle(SUBTITLE.slice(0, subtitleRef.current))

        if (subtitleRef.current === SUBTITLE.length) {
          setShowSubtitleCursor(false)
          schedule(typeValueProp, VALUE_PROP_DELAY)
          return
        }

        typeSubtitle()
      }, SUBTITLE_SPEED)
    }

    schedule(() => {
      setShowSubtitleCursor(true)
      typeSubtitle()
    }, INITIAL_DELAY)

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
    }
  }, [])

  return (
    <ScrollFadeSection id="home" className="relative min-h-screen flex flex-col justify-center bg-graphite">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#3A3B3A_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      <div className="relative z-10 px-8 max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <p className="font-body text-xs text-atomic-tangerine tracking-widest">
            // PORTFOLIO_INIT
          </p>
          <div className="w-8 h-0.5 bg-atomic-tangerine" />
        </div>

        <h1 className="font-display text-5xl text-platinum leading-tight">
          FARHAN MOHAMMED
          <motion.span
            data-testid="cursor"
            aria-hidden="true"
            className="inline-block w-[3px] h-[1.2em] bg-atomic-tangerine align-middle ml-1"
            variants={cursorVariants}
            animate="blink"
          />
        </h1>

        <p className="font-body text-xl text-periwinkle" data-testid="subtitle">
          {subtitle}
          {showSubtitleCursor && (
            <motion.span
              data-testid="subtitle-cursor"
              aria-hidden="true"
              className="inline-block w-[3px] h-[1em] bg-atomic-tangerine align-middle ml-0.5"
              variants={cursorVariants}
              animate="blink"
            />
          )}
        </p>

        <p className="font-body text-lg text-periwinkle/80" data-testid="value-prop">
          {valueProp}
          {showValuePropCursor && (
            <motion.span
              data-testid="value-prop-cursor"
              aria-hidden="true"
              className="inline-block w-[3px] h-[1em] bg-atomic-tangerine align-middle ml-0.5"
              variants={cursorVariants}
              animate="blink"
            />
          )}
        </p>

        <a
          href="#projects"
          className="inline-block px-6 py-2 border border-atomic-tangerine text-sm font-body text-atomic-tangerine hover:bg-atomic-tangerine/10 transition-colors duration-200"
        >
          VIEW_WORK →
        </a>
      </div>
    </ScrollFadeSection>
  )
}

export default HeroSection
