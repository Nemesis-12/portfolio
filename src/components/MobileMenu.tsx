import { AnimatePresence, motion } from 'framer-motion'
import { hoverEase } from '../animations/variants'
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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-graphite"
        >
          <motion.button
            onClick={onClose}
            aria-label="Close menu"
            variants={hoverEase}
            initial="idle"
            whileHover="hover"
            className="absolute top-5 right-6 text-periwinkle"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </motion.button>

          <ul className="flex flex-col gap-8 list-none items-center p-0 m-0">
            {links.map(({ label, href }) => (
              <li key={label}>
                <motion.a
                  href={href}
                  onClick={(event) => {
                    handleSectionLinkClick(event, href.slice(1))
                    onClose()
                  }}
                  variants={hoverEase}
                  initial="idle"
                  whileHover="hover"
                  className="font-body text-2xl text-periwinkle no-underline"
                >
                  {label}
                </motion.a>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
