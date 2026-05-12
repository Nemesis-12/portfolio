import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { hoverVariant } from '../animations/variants'
import MobileMenu from './MobileMenu'

const NAV_LINKS = [
  { label: 'HERO', href: '#hero' },
  { label: 'PROJECTS', href: '#projects' },
  { label: 'SKILLS', href: '#skills' },
  { label: 'TIMELINE', href: '#timeline' },
  { label: 'CONTACT', href: '#contact' },
]

export default function Navbar() {
  const [activeSection, setActiveSection] = useState<string>('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { threshold: 0.5 }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <nav className="sticky top-0 z-40 w-full flex items-center justify-between px-6 py-4 bg-mint-cream/90 backdrop-blur-sm">
        <a href="#" className="font-display text-black text-lg no-underline">
          FM_
        </a>

        <ul className="hidden md:flex gap-8 list-none m-0 p-0">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = activeSection === href.slice(1)
            return (
              <li key={label}>
                <motion.a
                  href={href}
                  variants={hoverVariant}
                  initial="idle"
                  whileHover="hover"
                  className={`font-body text-sm text-graphite no-underline pb-0.5${isActive ? ' border-b-2 border-atomic-tangerine' : ''}`}
                >
                  {label}
                </motion.a>
              </li>
            )
          })}
        </ul>

        <motion.button
          className="flex md:hidden text-graphite"
          onClick={() => setMenuOpen(true)}
          variants={hoverVariant}
          initial="idle"
          whileHover="hover"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </motion.button>
      </nav>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={NAV_LINKS}
      />
    </>
  )
}
