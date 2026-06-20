import { useState } from 'react'
import { handleSectionLinkClick } from '../utils/smoothScrollTo'

interface NavLink {
  label: string
  href: string
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  links: NavLink[]
}

export default function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  // Mount lazily on first open, then keep mounted so the CSS opacity/transform
  // transition can play on close instead of the overlay disappearing instantly.
  const [hasOpened, setHasOpened] = useState(isOpen)
  if (isOpen && !hasOpened) {
    setHasOpened(true)
  }

  if (!hasOpened) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={`mobile-menu${isOpen ? ' mobile-menu-open' : ''}`}
    >
      <button onClick={onClose} aria-label="Close menu" className="mobile-menu-close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <ul className="mobile-menu-list">
        {links.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              onClick={(event) => {
                handleSectionLinkClick(event, href.slice(1))
                onClose()
              }}
              className="mobile-menu-link"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
