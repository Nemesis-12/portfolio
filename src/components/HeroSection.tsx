import { motion } from 'framer-motion'
import { fadeUp } from '../animations/variants'

const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center bg-mint-cream">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#E0E0E0_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 px-6 max-w-5xl mx-auto space-y-6"
      >
        <div className="space-y-2">
          <p className="font-body text-xs text-atomic-tangerine tracking-widest">
            // PORTFOLIO_INIT
          </p>
          <div className="w-8 h-0.5 bg-atomic-tangerine" />
        </div>

        <h1 className="font-display text-5xl text-black leading-tight">
          FARHAN MOHAMMED
        </h1>

        <p className="font-body text-xl text-graphite">
          CS_STUDENT · DEVELOPER
        </p>

        <a
          href="#projects"
          className="inline-block px-6 py-2 border border-atomic-tangerine text-sm font-body text-atomic-tangerine hover:bg-atomic-tangerine/10 transition-colors duration-200"
        >
          VIEW_WORK →
        </a>
      </motion.div>
    </section>
  )
}

export default HeroSection
