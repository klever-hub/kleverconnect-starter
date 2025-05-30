import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './contexts/ThemeContext'
import { KleverProvider } from './contexts/KleverContext'
import { ToastProvider } from './contexts/ToastContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <KleverProvider>
          <App />
        </KleverProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
