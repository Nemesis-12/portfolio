import { motion } from 'framer-motion'
import { fadeUp, hoverEase } from '../animations/variants'

const EMAIL = 'mfa200312@gmail.com'

const footerLinks = [
  { label: '// GITHUB', href: 'https://github.com/Nemesis-12' },
  { label: '// LINKEDIN', href: 'https://linkedin.com/in/fa-mohammed' },
  { label: '// EMAIL', href: `mailto:${EMAIL}` },
  { label: '// RESUME', href: '/resume.pdf', target: '_blank' as const },
]

export default function ContactSection() {
  return (
    <section id="contact" className="px-6 py-14 md:px-16 lg:px-32">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <p className="font-body text-sm text-atomic-tangerine mb-8">// 04 CONTACT</p>

        <h2 className="font-display text-3xl md:text-5xl text-black leading-tight mb-12">
          LET'S CONNECT.
        </h2>

        <motion.a
          href={`mailto:${EMAIL}`}
          variants={hoverEase}
          initial="idle"
          whileHover="hover"
          className="inline-block font-body text-sm border-2 border-black text-black px-8 py-4 mb-12 hover:bg-black hover:text-mint-cream transition-colors"
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
              className="font-body text-sm text-graphite hover:text-atomic-tangerine transition-colors"
            >
              {label}
            </motion.a>
          ))}
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-graphite/20 text-xs font-body text-graphite">
          <span>FARHAN_MOHAMMED © 2026</span>
          <span>PORTFOLIO.EXE</span>
        </div>
      </motion.div>
    </section>
  )
}
