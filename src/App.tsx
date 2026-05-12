import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import './index.css'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'

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
        <section id="skills" />
        <section id="timeline" />
        <section id="contact" />
      </main>
    </>
  )
}

export default App
