import { ThemeToggle } from './ThemeToggle';
import './LandingPage.css';

export const LandingPage = () => {
  
  return (
    <div className="landing-page">
      <ThemeToggle />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <img 
              src={'/kleverlabs_logo_transparent.png'} 
              alt="Klever Labs" 
              className="logo-hero"
            />
            <h1 className="hero-title">
              Build Web3 Apps with <span className="gradient-text">Klever</span>
            </h1>
            <p className="hero-subtitle">
              A lightweight React starter kit for seamless Klever Wallet integration.
              Perfect for developers who need fast, clean Web3 connectivity.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">
                Connect Wallet
              </button>
              <a href="https://github.com/klever-labs/kleverconnect-starter" target="_blank" rel="noopener noreferrer">
                <button className="btn-secondary">
                  View on GitHub
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
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

      {/* Getting Started Section */}
      <section className="getting-started">
        <div className="container">
          <h2 className="text-center mb-6">Get Started in Minutes</h2>
          <div className="code-blocks">
            <div className="code-block">
              <h3>1. Clone & Install</h3>
              <pre>
                <code>{`git clone https://github.com/klever-labs/kleverconnect-starter
cd kleverconnect-starter
pnpm install`}</code>
              </pre>
            </div>
            <div className="code-block">
              <h3>2. Start Development</h3>
              <pre>
                <code>{`pnpm dev`}</code>
              </pre>
            </div>
            <div className="code-block">
              <h3>3. Connect Wallet</h3>
              <pre>
                <code>{`import { useKlever } from './hooks/useKlever';

const { connect, address } = useKlever();`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container text-center">
          <h2 className="mb-4">Ready to Build?</h2>
          <p className="mb-6">Join the Klever ecosystem and start building Web3 applications today</p>
          <div className="cta-buttons">
            <button className="btn-primary">Start Building</button>
            <a href="https://docs.klever.io" target="_blank" rel="noopener noreferrer">
              <button className="btn-secondary">Read Docs</button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};