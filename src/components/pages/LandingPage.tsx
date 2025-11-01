import { useNavigate } from 'react-router-dom';
import { useKlever } from '@klever/connect-react';
import { NetworkBadge } from '@/components/wallet/NetworkBadge';
import { CodeBlock } from '@/components/tutorial/steps/CodeBlock';
import { SEO } from '@/components/seo/SEO';
import { StructuredData } from '@/components/seo/StructuredData';
import { FAQStructuredData } from '@/components/seo/FAQStructuredData';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { OrganizationSchema } from '@/components/seo/OrganizationSchema';
import { VideoSchema } from '@/components/seo/VideoSchema';
import './LandingPage.css';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { currentNetwork } = useKlever();

  return (
    <div className="landing-page">
      <SEO
        title="KleverConnect Starter - Open Source React Web3 Starter Kit"
        description="Build decentralized applications with Klever blockchain. Free React TypeScript starter kit with wallet integration, transaction examples, and smart contract interaction."
        keywords="Klever blockchain, Web3 starter kit, React DApp development, Klever wallet integration, blockchain tutorial, smart contract examples, TypeScript Web3"
        url="https://kleverconnect-starter.kleverhub.io/"
      />
      <StructuredData type="website" />
      <StructuredData type="softwareApplication" />
      <FAQStructuredData />
      <BreadcrumbSchema />
      <OrganizationSchema />
      <VideoSchema />
      <NetworkBadge floating />

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <img src={'/kleverhub_logo_transparent.png'} alt="Klever Hub" className="logo-hero" />
            <h1 className="hero-title">
              Build Web3 Apps with <span className="gradient-text">Klever</span>
            </h1>
            <p className="hero-subtitle">
              A lightweight React starter kit for seamless Klever Wallet integration. Perfect for
              developers who need fast, clean Web3 connectivity.
            </p>
            <div className="network-indicator">
              <span className="network-label">Currently on</span>
              <span className={`network-name network-${currentNetwork}`}>
                {currentNetwork?.charAt(0).toUpperCase() + currentNetwork?.slice(1) || 'Testnet'}
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
                href="https://github.com/klever-hub/kleverconnect-starter"
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
              <div className="feature-icon">💜</div>
              <h3>Klever Extension</h3>
              <p>Seamless integration with Klever browser extension for secure transactions</p>
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
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Real-time Updates</h3>
              <p>Auto-refresh balances and transaction status monitoring</p>
            </div>
            <button
              className="feature-card interactive"
              onClick={() => navigate('/transactions')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/transactions');
                }
              }}
              type="button"
              aria-label="Go to Transaction Playground to test transfers and smart contracts"
            >
              <div className="feature-icon">🎮</div>
              <h3>Transaction Playground</h3>
              <p>Test transfers and smart contracts instantly</p>
              <span className="feature-link" aria-hidden="true">
                Try it now →
              </span>
            </button>
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
              href="https://github.com/klever-hub"
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
                code={`git clone https://github.com/klever-hub/kleverconnect-starter
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
                code={`import { useKlever } from '@klever/connect-react';

const { address, isConnected } = useKlever();`}
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
