import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App.tsx'
import { restoreTheme } from './theme/persistence'
import './index.css'

// The inline script in index.html already set `data-theme` on <html>
// before this module ran, so there is no flash of the default theme. This
// call keeps that behaviour correct even if the inline script is ever
// removed or fails, and is a no-op in the common case where the attribute
// already matches the stored (or default) theme.
restoreTheme()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)
