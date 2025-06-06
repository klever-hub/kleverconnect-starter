import { useNavigate } from 'react-router-dom';
import { useKlever } from '../hooks/useKlever';
import { ThemeToggle } from './ThemeToggle';
import { NetworkBadge } from './NetworkBadge';
import { CodeBlock } from './steps/CodeBlock';
import './LandingPage.css';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { network } = useKlever();

  return (
    <div className="landing-page">
      <ThemeToggle />
      <NetworkBadge floating />

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <img src={'/kleverlabs_logo_transparent.png'} alt="Klever Labs" className="logo-hero" />
            <h1 className="hero-title">
              Build Web3 Apps with <span className="gradient-text">Klever</span>
            </h1>
            <p className="hero-subtitle">
              A lightweight React starter kit for seamless Klever Wallet integration. Perfect for
              developers who need fast, clean Web3 connectivity.
            </p>
            <div className="network-indicator">
              <span className="network-label">Currently on</span>
              <span className={`network-name network-${network}`}>
                {network.charAt(0).toUpperCase() + network.slice(1)}
              </span>
            </div>
            <div className="hero-buttons">
              <button
                className="btn-primary"
                onClick={() => {
                  const element = document.getElementById('getting-started');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Get Started
              </button>
              <a
                href="https://github.com/klever-labs/kleverconnect-starter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="btn-secondary">View on GitHub</button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="text-center mb-8">Why KleverConnect?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Built with Vite for instant HMR and optimized production builds</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Easy Integration</h3>
              <p>Simple hooks and components for quick Klever wallet connection</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Theme Support</h3>
              <p>Beautiful dark and light themes with smooth transitions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Zero Backend</h3>
              <p>Pure client-side architecture - no server setup required</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>TypeScript</h3>
              <p>Full type safety for all your Klever blockchain interactions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Production Ready</h3>
              <p>ESLint, strict mode, and best practices configured</p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="resources">
        <div className="container">
          <h2 className="text-center mb-6">Resources & Community</h2>
          <div className="resources-grid">
            <a
              href="https://docs.klever.org"
              target="_blank"
              rel="noopener noreferrer"
              className="resource-card"
            >
              <div className="resource-icon">📚</div>
              <h3>Documentation</h3>
              <p>Comprehensive guides and API references</p>
            </a>
            <a
              href="https://forum.klever.org"
              target="_blank"
              rel="noopener noreferrer"
              className="resource-card"
            >
              <div className="resource-icon">💬</div>
              <h3>Klever Forum</h3>
              <p>Join discussions and get community support</p>
            </a>
            <a
              href="https://github.com/klever-labs"
              target="_blank"
              rel="noopener noreferrer"
              className="resource-card"
            >
              <div className="resource-icon">🔧</div>
              <h3>GitHub</h3>
              <p>Explore open-source projects and contribute</p>
            </a>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="getting-started" className="getting-started">
        <div className="container">
          <h2 className="text-center mb-6">Get Started in Minutes</h2>
          <div className="code-examples">
            <div className="code-example">
              <h3>1. Clone & Install</h3>
              <CodeBlock
                language="bash"
                code={`git clone https://github.com/klever-labs/kleverconnect-starter
cd kleverconnect-starter
pnpm install`}
              />
            </div>
            <div className="code-example">
              <h3>2. Start Development</h3>
              <CodeBlock language="bash" code={`pnpm dev`} />
            </div>
            <div className="code-example">
              <h3>3. Connect Wallet</h3>
              <CodeBlock
                language="typescript"
                code={`import { useKlever } from './hooks/useKlever';

const { connect, address } = useKlever();`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container text-center">
          <h2 className="mb-4">Ready to Build?</h2>
          <p className="mb-6">
            Join the Klever ecosystem and start building Web3 applications today
          </p>
          <div className="cta-buttons">
            <button className="btn-primary" onClick={() => navigate('/start-building')}>
              Start Building
            </button>
            <a href="https://docs.klever.org" target="_blank" rel="noopener noreferrer">
              <button className="btn-secondary">Read Docs</button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
