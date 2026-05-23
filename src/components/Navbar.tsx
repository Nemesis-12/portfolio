import { useState } from 'react'
import { motion } from 'framer-motion'
import { hoverEase } from '../animations/variants'
import { useActiveMajorSection } from '../hooks/useActiveMajorSection'
import { handleSectionLinkClick, smoothScrollToSection } from '../utils/smoothScrollTo'
import MobileMenu from './MobileMenu'

const NAV_LINKS = [
  { label: 'HOME', href: '#home' },
  { label: 'PROJECTS', href: '#projects' },
  { label: 'SKILLS', href: '#skills' },
  { label: 'TIMELINE', href: '#timeline' },
  { label: 'CONTACT', href: '#contact' },
]

export default function Navbar() {
  const activeSection = useActiveMajorSection()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="nav">
        <a
          href="#"
          className="nav-logo"
          onClick={(event) => {
            event.preventDefault()
            smoothScrollToSection('home')
          }}
        >
          FM_
        </a>

        <ul className="nav-list hidden md:flex">
          {NAV_LINKS.map(({ label, href }) => {
            const sectionId = href.slice(1)
            const isActive = activeSection === sectionId
            return (
              <li key={label}>
                <a
                  href={href}
                  className={`nav-link${isActive ? ' active' : ''}`}
                  onClick={(event) => handleSectionLinkClick(event, sectionId)}
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
