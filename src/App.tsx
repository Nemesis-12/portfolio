import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import './index.css'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import { SkillsSection } from './components/SkillsSection'
import ContactSection from './components/ContactSection'

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      <Navbar />
      <main>
        <section id="hero" />
        <section id="projects" />
        <SkillsSection />
        <section id="timeline" />
        <ContactSection />
      </main>
    </>
  )
}

export default App
