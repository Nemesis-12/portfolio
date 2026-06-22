import { useEffect, useState } from 'react'
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
import { useParallax } from './hooks/useParallax'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const blinkPeriod = 1050
    const syncOffset = -(performance.now() % blinkPeriod)
    document.documentElement.style.setProperty('--blink-offset', `${syncOffset}ms`)
  }, [])

  useParallax()

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <Navbar />
      <main>
        <HeroSection introReady={!loading} />
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
