import { useState, useEffect, useRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import { ScrollFadeSection } from './ScrollFadeSection'

export const cursorVariants: Variants = {
  blink: {
    opacity: [1, 1, 0, 0, 1],
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity,
      times: [0, 0.49, 0.5, 0.99, 1],
    },
  },
}

const SUBTITLE = 'CS_STUDENT · DEVELOPER'
const VALUE_PROP = '// I BUILD THINGS THAT ARE FUN TO FIGURE OUT.'

const HeroSection: React.FC = () => {
  const [subtitle, setSubtitle] = useState('')
  const [valueProp, setValueProp] = useState('')
  const [showSubtitleCursor, setShowSubtitleCursor] = useState(false)
  const [showValuePropCursor, setShowValuePropCursor] = useState(false)

  const subtitleRef = useRef(0)
  const valuePropRef = useRef(0)
  const subtitleTimerRef = useRef<number | null>(null)
  const valuePropTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const initialDelay = setTimeout(() => {
      setShowSubtitleCursor(true)
      subtitleTimerRef.current = window.setInterval(() => {
        if (subtitleRef.current < SUBTITLE.length) {
          setSubtitle(SUBTITLE.slice(0, subtitleRef.current + 1))
          subtitleRef.current += 1
        } else {
          if (subtitleTimerRef.current) {
            clearInterval(subtitleTimerRef.current)
          }
          setShowSubtitleCursor(false)

          setTimeout(() => {
            setShowValuePropCursor(true)
            valuePropTimerRef.current = window.setInterval(() => {
              if (valuePropRef.current < VALUE_PROP.length) {
                setValueProp(VALUE_PROP.slice(0, valuePropRef.current + 1))
                valuePropRef.current += 1
              } else {
                if (valuePropTimerRef.current) {
                  clearInterval(valuePropTimerRef.current)
                }
                setShowValuePropCursor(false)
              }
            }, 35)
          }, 400)
        }
      }, 60)
    }, 400)

    return () => {
      clearTimeout(initialDelay)
      if (subtitleTimerRef.current) clearInterval(subtitleTimerRef.current)
      if (valuePropTimerRef.current) clearInterval(valuePropTimerRef.current)
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