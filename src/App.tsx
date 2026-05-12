import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import './index.css'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      <main>
        <section id="hero" />
        <section id="projects" />
        <section id="skills" />
        <section id="timeline" />
        <section id="contact" />
      </main>
    </>
  )
}

export default App
