import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import { SkillsSection } from './components/SkillsSection'
import ContactSection from './components/ContactSection'
import ProjectsSection from './components/ProjectsSection'
import HeroSection from './components/HeroSection'
import TimelineSection from './components/TimelineSection'
import { projects } from './data/projects'

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      <Navbar />
      <main>
        <HeroSection />
        <ProjectsSection projects={projects} />
        <SkillsSection />
        <TimelineSection />
        <ContactSection />
      </main>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

export default App
