import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { hoverEase } from '../animations/variants'
import MobileMenu from './MobileMenu'

const NAV_LINKS = [
  { label: 'HOME', href: '#home' },
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
      <nav className="nav">
        <a href="#" className="nav-logo">
          FM_
        </a>

        <ul className="nav-list hidden md:flex">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = activeSection === href.slice(1)
            return (
              <li key={label}>
                <a
                  href={href}
                  className={`nav-link${isActive ? ' active' : ''}`}
                >
                  <span className="nav-caret" data-testid="nav-caret">
                    &gt;
                  </span>
                  <span className="nav-label">{label}</span>
                </a>
              </li>
            )
          })}
        </ul>

        <motion.button
          className="flex md:hidden text-periwinkle"
          onClick={() => setMenuOpen(true)}
          variants={hoverEase}
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
