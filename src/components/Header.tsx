import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKlever } from '../hooks/useKlever';
import { ConnectWallet } from './ConnectWallet';
import { Balance } from './Balance';
import { Faucet } from './Faucet';
import './Header.css';

export const Header = () => {
  const { address } = useKlever();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: '1rem' });
  const [activeSection, setActiveSection] = useState<string>('home');
  const headerLeftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track active section on home page
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const handleScroll = () => {
      const sections = ['features', 'resources', 'getting-started'];
      const scrollPosition = window.scrollY + 100; // Add offset for header

      // Check if we're at the top of the page
      if (scrollPosition < 200) {
        setActiveSection('home');
        return;
      }

      // Check which section is currently in view
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const bottom = top + rect.height;

          if (scrollPosition >= top && scrollPosition < bottom) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
    };

    // Check initial position
    handleScroll();

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMenuOpen) return;

      const target = event.target as HTMLElement;
      const menuElement = document.querySelector('.nav-menu');
      const logoElement = document.querySelector('.header-left');

      // Don't close if clicking on the menu itself or the logo
      if (menuElement?.contains(target) || logoElement?.contains(target)) {
        return;
      }

      setIsMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

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

    // Just toggle the menu, don't navigate
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
            {!isMobile && <Faucet />}
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
                href="/"
                className={`nav-link ${location.pathname === '/' && activeSection === 'home' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    toggleMenu();
                  } else {
                    navigate('/');
                    toggleMenu();
                  }
                }}
              >
                Home
              </a>
              <a
                href="#features"
                className={`nav-link ${location.pathname === '/' && activeSection === 'features' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'features')}
              >
                Features
              </a>
              <a
                href="#resources"
                className={`nav-link ${location.pathname === '/' && activeSection === 'resources' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'resources')}
              >
                Resources
              </a>
              <a
                href="#getting-started"
                className={`nav-link ${location.pathname === '/' && activeSection === 'getting-started' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'getting-started')}
              >
                Getting Started
              </a>
              <a
                href="/start-building"
                className={`nav-link ${location.pathname === '/start-building' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/start-building');
                  toggleMenu();
                }}
              >
                Start Building
              </a>
              <a
                href="/transactions"
                className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/transactions');
                  toggleMenu();
                }}
              >
                Transactions
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
                <Faucet />
              </div>
            )}
          </div>
        </div>

        <div className="nav-menu-overlay" onClick={toggleMenu} />
      </div>
    </>
  );
};
