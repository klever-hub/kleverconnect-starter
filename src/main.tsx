import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { KleverProvider } from './contexts/KleverContext';
import { ToastProvider } from './contexts/ToastContext';
import { RootLayout } from './components/RootLayout';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <KleverProvider>
          <Router>
            <RootLayout>
              <App />
            </RootLayout>
          </Router>
        </KleverProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>
);
