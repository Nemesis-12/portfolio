import { useEffect, useState } from 'react'
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

  useEffect(() => {
    let frameId: number | null = null

    const updateParallax = () => {
      const parallaxLayers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
      const layerUpdates = parallaxLayers.map((layer) => {
        const factor = Number(layer.dataset.parallaxFactor ?? 0)
        const stackSurface = layer.closest('[data-sticky-section="true"]')
        const surfaceRect = stackSurface?.getBoundingClientRect()
        const scrollOffset = surfaceRect ? -surfaceRect.top : -layer.getBoundingClientRect().top

        return {
          layer,
          offset: scrollOffset * (Number.isFinite(factor) ? factor : 0),
        }
      })

      layerUpdates.forEach(({ layer, offset }) => {
        layer.style.transform = `translate3d(0, ${offset}px, 0)`
      })
    }

    const requestParallaxUpdate = () => {
      if (frameId !== null) {
        return
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null
        updateParallax()
      })
    }

    window.addEventListener('scroll', requestParallaxUpdate, { passive: true })
    window.addEventListener('resize', requestParallaxUpdate, { passive: true })
    requestParallaxUpdate()

    return () => {
      window.removeEventListener('scroll', requestParallaxUpdate)
      window.removeEventListener('resize', requestParallaxUpdate)

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

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
