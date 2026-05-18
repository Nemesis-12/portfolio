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
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)

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
      <nav className="fixed top-0 z-40 w-full py-4 bg-graphite/90 backdrop-blur-md border-b border-graphite-light/30">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-8">
          <a href="#" className="font-display text-platinum text-xl no-underline">
            FM_
          </a>

          <ul className="hidden md:flex gap-8 list-none m-0 p-0">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = activeSection === href.slice(1)
              const isHovered = hoveredLink === label
              return (
                <li key={label}>
                  <motion.a
                    href={href}
                    variants={hoverEase}
                    initial="idle"
                    whileHover="hover"
                    onMouseEnter={() => setHoveredLink(label)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="group font-body text-sm no-underline pb-0.5 text-platinum transition-colors duration-150"
                  >
                    {!isActive && (
                      <span
                        data-testid="nav-caret"
                        style={{ opacity: isHovered ? 1 : 0 }}
                        className="transition-opacity duration-200"
                      >
                        &gt;{' '}
                      </span>
                    )}
                    <span className={isActive ? 'text-atomic-tangerine border-b-2 border-atomic-tangerine' : undefined}>
                      {label}
                    </span>
                  </motion.a>
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
        </div>
      </nav>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={NAV_LINKS}
      />
    </>
  )
}
