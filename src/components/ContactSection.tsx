import { motion } from 'framer-motion'
import { hoverEase } from '../animations/variants'
import { ScrollFadeSection } from './ScrollFadeSection'

const EMAIL = 'famohammed@shockers.wichita.edu'

const footerLinks = [
  { prefix: '//', label: 'GITHUB', href: 'https://github.com/Nemesis-12' },
  { prefix: '//', label: 'LINKEDIN', href: 'https://linkedin.com/in/fa-mohammed' },
  { prefix: '//', label: 'EMAIL', href: `mailto:${EMAIL}` },
  { prefix: '//', label: 'RESUME', href: '/resume.pdf', target: '_blank' as const },
]

export default function ContactSection() {
  return (
    <>
      <ScrollFadeSection id="contact" className="min-h-screen flex flex-col justify-center px-8 py-14 bg-graphite">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="font-display text-3xl md:text-5xl text-platinum leading-tight mb-12">
            LET'S CONNECT.
          </h2>

          <motion.a
            href={`mailto:${EMAIL}`}
            variants={hoverEase}
            initial="idle"
            whileHover="hover"
            className="inline-block font-body text-sm border-2 border-platinum text-platinum px-8 py-4 mb-12 hover:bg-platinum hover:text-graphite transition-colors"
          >
            SEND_MESSAGE →
          </motion.a>

          <div className="flex flex-wrap gap-6">
            {footerLinks.map(({ prefix, label, href, target }) => (
              <motion.a
                key={label}
                href={href}
                target={target}
                aria-label={`${prefix} ${label}`}
                rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                variants={hoverEase}
                initial="idle"
                whileHover="hover"
                className="group font-body text-sm"
              >
                <span className="text-atomic-tangerine group-hover:text-white transition-colors">{prefix}{' '}</span>
                <span className="text-periwinkle group-hover:text-white transition-colors">{label}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </ScrollFadeSection>

      <footer className="flex justify-between items-center px-8 py-8 border-t border-periwinkle/20 text-xs font-body text-periwinkle bg-graphite">
        <span>FARHAN_MOHAMMED © 2026</span>
        <span>PORTFOLIO.EXE</span>
      </footer>
    </>
  )
}
