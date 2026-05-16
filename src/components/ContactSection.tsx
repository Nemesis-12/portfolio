import { motion } from 'framer-motion'
import { hoverEase } from '../animations/variants'
import { ScrollFadeSection } from './ScrollFadeSection'

const EMAIL = 'mfa200312@gmail.com'

const footerLinks = [
  { label: '// GITHUB', href: 'https://github.com/Nemesis-12' },
  { label: '// LINKEDIN', href: 'https://linkedin.com/in/fa-mohammed' },
  { label: '// EMAIL', href: `mailto:${EMAIL}` },
  { label: '// RESUME', href: '/resume.pdf', target: '_blank' as const },
]

export default function ContactSection() {
  return (
    <ScrollFadeSection id="contact" className="min-h-screen flex flex-col justify-center px-8 py-14 bg-graphite">
      <div className="max-w-7xl mx-auto w-full">
        <p className="font-body text-sm text-atomic-tangerine mb-8">// 04 CONTACT</p>

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

        <div className="flex flex-wrap gap-6 mb-16">
          {footerLinks.map(({ label, href, target }) => (
            <motion.a
              key={label}
              href={href}
              target={target}
              rel={target === '_blank' ? 'noopener noreferrer' : undefined}
              variants={hoverEase}
              initial="idle"
              whileHover="hover"
              className="font-body text-sm text-periwinkle hover:text-atomic-tangerine transition-colors"
            >
              {label}
            </motion.a>
          ))}
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-periwinkle/20 text-xs font-body text-periwinkle">
          <span>FARHAN_MOHAMMED © 2026</span>
          <span>PORTFOLIO.EXE</span>
        </div>
      </div>
    </ScrollFadeSection>
  )
}
