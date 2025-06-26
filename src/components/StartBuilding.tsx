import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { NetworkBadge } from './NetworkBadge';
import { SEO } from './SEO';
import { StructuredData } from './StructuredData';
import { CourseSchema } from './CourseSchema';
import { BreadcrumbSchema } from './BreadcrumbSchema';
import {
  Step1DevTools,
  Step2CreateDapp,
  Step3KleverWallet,
  Step4Customize,
  Step5Deploy,
} from './steps';
import './StartBuilding.css';

interface Section {
  title: string;
  content: React.ReactElement;
}

export const StartBuilding = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll to top when activeSection changes
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    // Close mobile menu when section changes
    setIsMobileMenuOpen(false);
  }, [activeSection]);

  const sections: Section[] = [
    {
      title: 'Install Development Tools',
      content: <Step1DevTools />,
    },
    {
      title: 'Create Your First dApp',
      content: <Step2CreateDapp />,
    },
    {
      title: 'Setup Klever Wallet',
      content: <Step3KleverWallet />,
    },
    {
      title: 'Customize Your dApp',
      content: <Step4Customize />,
    },
    {
      title: 'Build & Deploy',
      content: <Step5Deploy />,
    },
  ];

  return (
    <div className="start-building-page">
      <SEO
        title="Start Building with Klever - Step-by-Step Web3 Development Guide"
        description="Complete tutorial for building Web3 applications with Klever. Learn wallet integration, smart contract deployment, and DApp development with our beginner-friendly guide."
        keywords="Klever tutorial, Web3 development guide, blockchain programming, DApp tutorial, Klever wallet setup, smart contract tutorial, React blockchain tutorial"
        url="https://kleverconnect-starter.kleverlabs.dev/start-building"
      />
      <StructuredData type="howTo" />
      <CourseSchema />
      <BreadcrumbSchema />
      <ThemeToggle />
      <NetworkBadge floating />

      <div className="tutorial-wrapper">
        <div className="tutorial-nav">
          <h1 className="gradient-text">Start Building</h1>

          {isMobile ? (
            <div className="mobile-nav">
              <button
                className="mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="step-number">{activeSection + 1}</span>
                <span className="current-step-title">{sections[activeSection].title}</span>
                <span className="dropdown-arrow">{isMobileMenuOpen ? '▲' : '▼'}</span>
              </button>

              {isMobileMenuOpen && (
                <div className="mobile-menu-dropdown">
                  {sections.map((section, index) => (
                    <button
                      key={index}
                      className={`mobile-menu-item ${activeSection === index ? 'active' : ''}`}
                      onClick={() => setActiveSection(index)}
                    >
                      <span className="step-number">{index + 1}</span>
                      <span className="step-title">{section.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="nav-steps">
              {sections.map((section, index) => (
                <button
                  key={index}
                  className={`nav-step ${activeSection === index ? 'active' : ''}`}
                  onClick={() => setActiveSection(index)}
                >
                  <span className="step-number">{index + 1}</span>
                  <span className="step-title">{section.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="tutorial-content">
          {sections[activeSection].content}

          <div className="content-navigation">
            <button
              className="nav-button prev"
              onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
            >
              {isMobile ? '←' : '← Previous'}
            </button>
            <div className="step-indicator">
              Step {activeSection + 1} of {sections.length}
            </div>
            <button
              className="nav-button next"
              onClick={() => setActiveSection(Math.min(sections.length - 1, activeSection + 1))}
              disabled={activeSection === sections.length - 1}
            >
              {isMobile ? '→' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
