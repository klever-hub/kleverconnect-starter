import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKlever } from '../hooks/useKlever';
import { ConnectWallet } from './ConnectWallet';
import { Balance } from './Balance';
import './Header.css';

export const Header = () => {
  const { address } = useKlever();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: '1rem' });
  const headerLeftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Calculate menu position based on logo position
    if (headerLeftRef.current && !isMobile) {
      const rect = headerLeftRef.current.getBoundingClientRect();
      setMenuPosition({ left: `${rect.left}px` });
    }
  }, [isMenuOpen, isMobile]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    // If we're on the home page, scroll to section
    if (location.pathname === '/') {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home and then scroll
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    toggleMenu();
  };

  const [isSpinning, setIsSpinning] = useState(false);

  const handleLogoClick = () => {
    setIsSpinning(true);
    
    // Navigate to home if not already there
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      // If on home page, just toggle menu
      toggleMenu();
    }

    // Reset spinning state after animation completes
    setTimeout(() => {
      setIsSpinning(false);
    }, 600);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="header-left" ref={headerLeftRef} onClick={handleLogoClick}>
            <img
              src="/kleverlabs_logo_transparent.png"
              alt="Klever Labs"
              className={`header-logo ${isSpinning ? 'spinning' : ''}`}
            />
            {!isMobile && <span className="header-title">KleverConnect Starter</span>}
          </div>

          <div className="header-right">
            {!isMobile && <Balance />}
            <ConnectWallet />
          </div>
        </div>
      </header>

      <div 
        className={`nav-menu ${isMenuOpen ? 'open' : ''} ${isMobile ? 'mobile' : 'desktop'}`}
        style={!isMobile ? menuPosition : undefined}
      >
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
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  toggleMenu();
                }}
              >
                Home
              </a>
              <a
                href="#features"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'features')}
              >
                Features
              </a>
              <a
                href="#getting-started"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'getting-started')}
              >
                Getting Started
              </a>
              <a
                href="/start-building"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/start-building');
                  toggleMenu();
                }}
              >
                Start Building
              </a>
              <a
                href="https://docs.klever.org"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                Documentation
              </a>
              <a
                href="https://github.com/klever-labs/kleverconnect-starter"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
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

        <div className="nav-menu-overlay" onClick={toggleMenu} />
      </div>
    </>
  );
};
