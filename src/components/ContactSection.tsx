import { useState, useRef, useEffect } from 'react'
import { TypeIn } from '../animations/TypeIn'
import { StickySection } from './StickySection'

const EMAIL = 'famohammed@shockers.wichita.edu'
const CONTACT_SPEED = 95

const footerLinks = [
  { label: 'GITHUB', href: 'https://github.com/Nemesis-12' },
  { label: 'LINKEDIN', href: 'https://linkedin.com/in/fa-mohammed' },
  { label: 'EMAIL', href: `mailto:${EMAIL}` },
  { label: 'RESUME', href: '/resume.pdf', target: '_blank' as const },
]

export default function ContactSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

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
              delay={200}
              onDone={() => setStep((s) => Math.max(s, 1))}
            />
          </span>
          <span className="footer-big-line">
            <TypeIn
              start={isInView && step >= 1}
              text="CONNECT"
              speed={CONTACT_SPEED}
              delay={150}
              onDone={() => setStep((s) => Math.max(s, 2))}
            />
            {isInView && step >= 2 && <span className="period">.</span>}
            {isInView && step >= 2 && (
              <span className="cursor" data-testid="contact-cursor" aria-hidden="true" />
            )}
          </span>
        </div>

        <a href={`mailto:${EMAIL}`} className="btn btn-fill">
          SEND_MESSAGE <span>→</span>
        </a>

        <div className="footer-socials">
          {footerLinks.map(({ label, href, target }) => (
            <a
              key={label}
              href={href}
              target={target}
              aria-label={`// ${label}`}
              rel={target === '_blank' ? 'noopener noreferrer' : undefined}
              className="slink"
            >
              {label}
            </a>
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
