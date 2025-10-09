import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts';
import { KleverProvider } from '@klever/connect-react';
import { ToastProvider } from './contexts/ToastContext';
import { RootLayout } from './components/layout/RootLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <ToastProvider>
            <KleverProvider
              config={{
                network: 'testnet',
                autoConnect: true,
                reconnectOnMount: true,
                debug: true,
              }}
            >
              <Router>
                <RootLayout>
                  <App />
                </RootLayout>
              </Router>
            </KleverProvider>
          </ToastProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);
