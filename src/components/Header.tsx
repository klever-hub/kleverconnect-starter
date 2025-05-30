import { useState, useEffect } from 'react';
import { useKlever } from '../hooks/useKlever';
import { ConnectWallet } from './ConnectWallet';
import { Balance } from './Balance';
import './Header.css';

export const Header = () => {
  const { address } = useKlever();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const [isSpinning, setIsSpinning] = useState(false);
  
  const handleLogoClick = () => {
    setIsSpinning(true);
    toggleMenu();
    
    // Reset spinning state after animation completes
    setTimeout(() => {
      setIsSpinning(false);
    }, 600);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="header-left" onClick={handleLogoClick}>
            <img
              src="/kleverlabs_logo_transparent.png"
              alt="Klever Labs"
              className={`header-logo ${isSpinning ? 'spinning' : ''}`}
            />
            {!isMobile && (
              <span className="header-title">KleverConnect Starter</span>
            )}
          </div>

          <div className="header-right">
            {!isMobile && <Balance />}
            <ConnectWallet />
          </div>
        </div>
      </header>

      <div className={`nav-menu ${isMenuOpen ? 'open' : ''} ${isMobile ? 'mobile' : 'desktop'}`}>
        <div className="nav-menu-content">
          <div className="nav-menu-header">
            <h3>Navigation</h3>
            <button
              className="nav-menu-close"
              onClick={toggleMenu}
              aria-label="Close navigation menu"
            >
              ×
            </button>
          </div>
          
          <div className="nav-menu-items">
            <nav className="nav-links">
              <a href="#" className="nav-link" onClick={toggleMenu}>
                Home
              </a>
              <a href="#features" className="nav-link" onClick={toggleMenu}>
                Features
              </a>
              <a href="#getting-started" className="nav-link" onClick={toggleMenu}>
                Getting Started
              </a>
              <a href="https://docs.klever.org" target="_blank" rel="noopener noreferrer" className="nav-link">
                Documentation
              </a>
              <a href="https://github.com/klever-labs/kleverconnect-starter" target="_blank" rel="noopener noreferrer" className="nav-link">
                GitHub
              </a>
            </nav>
            
            {address && isMobile && (
              <div className="nav-menu-section balance-section">
                <Balance />
              </div>
            )}
          </div>
        </div>
        
        <div 
          className="nav-menu-overlay"
          onClick={toggleMenu}
        />
      </div>
    </>
  );
};

