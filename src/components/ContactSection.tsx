import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { TypeIn } from '../animations/TypeIn'
import { hoverEase } from '../animations/variants'
import { StickySection } from './StickySection'

const EMAIL = 'famohammed@shockers.wichita.edu'
const CONTACT_SPEED = 50

const footerLinks = [
  { label: 'GITHUB', href: 'https://github.com/Nemesis-12' },
  { label: 'LINKEDIN', href: 'https://linkedin.com/in/fa-mohammed' },
  { label: 'EMAIL', href: `mailto:${EMAIL}` },
  { label: 'RESUME', href: '/resume.pdf', target: '_blank' as const },
]

export default function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isInView) {
      setStep(0)
    }
  }, [isInView])

  return (
    <StickySection as="footer" id="contact" className="bg-graphite">
      <div ref={ref} className="footer-cta">
        <div className="footer-big">
          <span className="footer-big-line">
            <TypeIn
              start={isInView}
              text="LET'S"
              speed={CONTACT_SPEED}
              onDone={() => setStep((s) => Math.max(s, 1))}
            />
          </span>
          <span className="footer-big-line">
            <TypeIn
              start={isInView && step >= 1}
              text="CONNECT"
              speed={CONTACT_SPEED}
              onDone={() => setStep((s) => Math.max(s, 2))}
            />
            {isInView && step >= 2 && <span className="period">.</span>}
            {isInView && step >= 2 && (
              <span className="cursor" data-testid="contact-cursor" aria-hidden="true" />
            )}
          </span>
        </div>

        <motion.a
          href={`mailto:${EMAIL}`}
          variants={hoverEase}
          initial="idle"
          whileHover="hover"
          className="btn btn-fill"
        >
          SEND_MESSAGE <span>→</span>
        </motion.a>

        <div className="footer-socials">
          {footerLinks.map(({ label, href, target }) => (
            <motion.a
              key={label}
              href={href}
              target={target}
              aria-label={`// ${label}`}
              rel={target === '_blank' ? 'noopener noreferrer' : undefined}
              variants={hoverEase}
              initial="idle"
              whileHover="hover"
              className="slink"
            >
              {label}
            </motion.a>
          ))}
        </div>
      </div>

      <div className="footer-copy">
        <span data-parallax data-parallax-factor="0.5">
          FARHAN_MOHAMMED © 2026
        </span>
        <span data-parallax data-parallax-factor="0.5">
          PORTFOLIO.EXE
        </span>
      </div>
    </StickySection>
  )
}
