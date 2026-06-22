import { useEffect } from 'react'

/**
 * Drives scroll-linked parallax for every `[data-parallax]` element, offsetting
 * each by its `data-parallax-factor` times the scroll distance of its nearest
 * `section`/`footer` ancestor. Throttled to one update per animation frame.
 */
export function useParallax() {
  useEffect(() => {
    let frameId: number | null = null
    let framePending = false

    const updateParallax = () => {
      const parallaxLayers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
      const layerUpdates = parallaxLayers.map((layer) => {
        const factor = Number(layer.dataset.parallaxFactor ?? 0)
        const sectionSurface = layer.closest('section, footer')
        const surfaceRect = sectionSurface?.getBoundingClientRect()
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
      if (framePending) {
        return
      }

      framePending = true
      frameId = window.requestAnimationFrame(() => {
        framePending = false
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
}
