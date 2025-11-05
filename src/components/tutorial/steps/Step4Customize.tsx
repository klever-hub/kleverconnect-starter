import { CodeBlock } from './CodeBlock';

export const Step4Customize = () => (
  <div className="tutorial-section">
    <div className="section-intro">
      <h2>Customize Your dApp</h2>
      <p>
        Understand our architecture and learn how to build your own features using the existing
        patterns.
      </p>
    </div>

    <div className="step-card">
      <h3>Project Architecture</h3>
      <p>
        This starter is built with production-ready patterns. Each folder has a specific purpose,
        making it easy to add new features or customize existing ones.
      </p>
      <CodeBlock
        code={`src/
├── components/
│   ├── wallet/         # Wallet interactions
│   │   ├── ConnectWallet.tsx    # Connection UI with QR code
│   │   ├── Balance.tsx          # Token balance display
│   │   └── NetworkBadge.tsx     # Network indicator (Mainnet/Testnet)
│   ├── transactions/   # Transaction components
│   │   ├── TokenTransfer.tsx    # KLV/KDA transfers
│   │   ├── SmartContractInteraction.tsx
│   │   └── TransactionHistory.tsx
│   ├── pages/          # Page components (routed)
│   │   ├── LandingPage.tsx      # Home page with features
│   │   ├── StartBuilding.tsx    # Interactive tutorial
│   │   └── TransactionTriggers.tsx  # Transaction playground
│   ├── ui/             # Reusable UI components
│   │   ├── Button.tsx, Toast.tsx, PageLoader.tsx
│   │   ├── ThemeControl.tsx     # Theme variants
│   │   └── EmptyState.tsx, DeveloperTip.tsx
│   ├── layout/         # Layout structure
│   │   ├── Header.tsx           # Navigation & wallet UI
│   │   └── ScrollToTop.tsx      # Route scroll behavior
│   └── seo/            # SEO optimization
│       └── BreadcrumbSchema.tsx, StructuredData.tsx, etc.
├── contexts/           # Global state
│   ├── ThemeContext.tsx  # Theme system with variants
│   └── ToastContext.tsx  # Toast notifications
├── hooks/              # Custom React hooks
│   ├── useTheme.ts      # Theme management
│   ├── useToast.ts      # Toast notifications
│   └── useLongPress.ts  # Long press detection
├── utils/              # Helper functions
│   ├── formatters.ts    # Address, balance formatting
│   └── validation.ts    # Input validation
└── assets/             # Static files (ABIs, images)`}
        language="bash"
      />
    </div>

    <div className="step-card">
      <h3>How Our Components Connect</h3>
      <p>
        Understanding the component hierarchy helps you add new features. Here's how everything
        works together:
      </p>

      <div className="info-box">
        <strong>🔗 Component Flow:</strong>
        <ol>
          <li>
            <code>main.tsx</code> → Wraps app with ThemeProvider & ToastProvider
          </li>
          <li>
            <code>App.tsx</code> → Defines routes (/, /start-building, /transactions)
          </li>
          <li>
            <code>RootLayout</code> → Wraps pages with Header & ScrollToTop
          </li>
          <li>
            <code>Header</code> → Contains ConnectWallet, Balance, NetworkBadge, ThemeControl
          </li>
          <li>
            <strong>Pages</strong> → Use hooks (useKlever, useToast) and contexts (ThemeContext)
          </li>
        </ol>
      </div>

      <h4>Example: How LandingPage Works</h4>
      <CodeBlock
        code={`// src/components/pages/LandingPage.tsx
import { useNavigate } from 'react-router-dom';
import { useKlever } from '@klever/connect-react';
import { NetworkBadge } from '@/components/wallet/NetworkBadge';
import { SEO } from '@/components/seo/SEO';
import './LandingPage.css';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { currentNetwork } = useKlever();  // Gets current network

  return (
    <div className="landing-page">
      <SEO title="..." description="..." />  {/* SEO meta tags */}
      <NetworkBadge floating />  {/* Shows network indicator */}

      {/* Hero section with dynamic network display */}
      <section className="hero">
        <h1>Build Web3 Apps with <span className="gradient-text">Klever</span></h1>
        <div className="network-indicator">
          <span>Currently on {currentNetwork}</span>
        </div>
      </section>
    </div>
  );
};`}
        language="tsx"
      />
    </div>

    <div className="step-card">
      <h3>Make Your First Change</h3>
      <p>
        Let's customize the landing page hero title. Press <strong>Ctrl+P</strong> (or{' '}
        <strong>Cmd+P</strong> on Mac) to quickly open files in VS Code.
      </p>
      <p>
        Edit <code>src/components/pages/LandingPage.tsx</code> - find the <code>hero-title</code>{' '}
        section:
      </p>
      <CodeBlock
        code={`<h1 className="hero-title">
  My First <span className="gradient-text">Klever dApp</span>
</h1>`}
        language="tsx"
      />
      <p>
        Save (<strong>Ctrl+S</strong> / <strong>Cmd+S</strong>) and watch your browser update
        instantly thanks to Vite's hot module replacement!
      </p>

      <div className="success-box">
        <strong>🎨 More customizations to try:</strong>
        <ul>
          <li>
            <strong>Change colors:</strong> Edit CSS variables in <code>src/index.css</code> (look
            for <code>--klever-purple</code>, <code>--klever-cyan</code>)
          </li>
          <li>
            <strong>Update logo:</strong> Modify <code>src/components/layout/Header.tsx</code>
          </li>
          <li>
            <strong>Switch themes:</strong> Use the theme control in the header (6 variants
            available)
          </li>
          <li>
            <strong>Modify button text:</strong> Edit{' '}
            <code>src/components/wallet/ConnectWallet.tsx</code>
          </li>
        </ul>
      </div>

      <div className="warning-box">
        <strong>🔧 If something breaks:</strong>
        <p>
          Don't panic! Press <strong>F12</strong> to open the browser console and check for error
          messages. Most errors show exactly which file and line has the problem. You can always
          undo with <strong>Ctrl+Z</strong>.
        </p>
      </div>
    </div>

    <div className="step-card">
      <h3>Essential Files & Concepts</h3>
      <p>
        These are the most important files and SDK concepts you'll work with when building your
        dApp. Understanding these helps you build faster.
      </p>
      <div className="key-files">
        <div className="file-item">
          <code className="file-path">@klever/connect-react</code>
          <p className="file-desc">
            Official Klever SDK - provides React hooks like <code>useKlever()</code> and{' '}
            <code>useTransaction()</code> for wallet and blockchain interactions. This is your main
            tool for everything blockchain-related.
          </p>
        </div>
        <div className="file-item">
          <code className="file-path">src/components/wallet/ConnectWallet.tsx</code>
          <p className="file-desc">
            Wallet connection UI - the button users click to connect their Klever Wallet. Includes
            QR code modal, connection states, and error handling. Study this to understand wallet
            integration patterns.
          </p>
        </div>
        <div className="file-item">
          <code className="file-path">src/components/pages/*</code>
          <p className="file-desc">
            Your main page components - each page is a route. Start here when adding new features.
            Pages use hooks (useKlever, useToast) to interact with wallet and show notifications.
          </p>
        </div>
        <div className="file-item">
          <code className="file-path">src/App.tsx</code>
          <p className="file-desc">
            Route configuration - add new pages here using React Router. Each route maps a URL to a
            page component. Use lazy loading for better performance.
          </p>
        </div>
        <div className="file-item">
          <code className="file-path">src/components/layout/Header.tsx</code>
          <p className="file-desc">
            Navigation header - contains ConnectWallet, Balance, NetworkBadge, and theme switcher.
            Customize branding and navigation links here.
          </p>
        </div>
        <div className="file-item">
          <code className="file-path">src/index.css</code>
          <p className="file-desc">
            Global styles and CSS variables - customize colors, fonts, spacing for all themes here.
            Use variables like <code>--bg-primary</code> to support theme switching.
          </p>
        </div>
        <div className="file-item">
          <code className="file-path">src/contexts/ThemeContext.tsx</code>
          <p className="file-desc">
            Theme system logic - manages theme state and switching between light/dark variants.
            Modify if you want to add new theme variants.
          </p>
        </div>
        <div className="file-item">
          <code className="file-path">src/utils/formatters.ts</code>
          <p className="file-desc">
            Helper functions - address shortening (<code>formatAddress</code>), balance formatting (
            <code>formatKLV</code>), and more. Reuse these in your components for consistency.
          </p>
        </div>
      </div>
    </div>

    <div className="step-card">
      <h3>Building Your Own Features</h3>
      <p>
        Let's create a new page following our established patterns. This teaches you how to extend
        the starter kit with your own ideas.
      </p>

      <h4>Step 1: Create Your Page Component</h4>
      <CodeBlock
        code={`// src/components/pages/MyFeature.tsx
import { useKlever } from '@klever/connect-react';
import { useToast } from '@/hooks/useToast';
import { SEO } from '@/components/seo/SEO';
import { Balance } from '@/components/wallet/Balance';
import './MyFeature.css';  // Create this file for styles

export const MyFeature = () => {
  const { address, isConnected } = useKlever();
  const { showToast } = useToast();

  const handleAction = () => {
    if (!isConnected) {
      showToast('Please connect your wallet first', 'warning');
      return;
    }
    // Your feature logic here
    showToast('Action completed!', 'success');
  };

  return (
    <div className="my-feature">
      <SEO
        title="My Feature"
        description="Description of my feature"
      />

      <h1>My Custom Feature</h1>
      {isConnected ? (
        <>
          <Balance />
          <button onClick={handleAction}>Do Something</button>
        </>
      ) : (
        <p>Connect wallet to use this feature</p>
      )}
    </div>
  );
};`}
        language="tsx"
      />

      <h4>Step 2: Add Route in App.tsx</h4>
      <CodeBlock
        code={`// src/App.tsx
import { lazy } from 'react';
const MyFeature = lazy(() =>
  import('./components/pages/MyFeature').then(m => ({ default: m.MyFeature }))
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/my-feature" element={<MyFeature />} />  {/* Add this */}
    </Routes>
  );
}`}
        language="tsx"
      />

      <h4>Step 3: Add Navigation Link in Header</h4>
      <CodeBlock
        code={`// src/components/layout/Header.tsx
<nav className="header-nav">
  <Link to="/" className="nav-link">Home</Link>
  <Link to="/my-feature" className="nav-link">My Feature</Link>
  <Link to="/transactions" className="nav-link">Transactions</Link>
</nav>`}
        language="tsx"
      />

      <div className="success-box">
        <strong>✨ Patterns to Follow:</strong>
        <ul>
          <li>
            <strong>Always use hooks:</strong> useKlever(), useToast(), useTheme() for consistency
          </li>
          <li>
            <strong>Check wallet connection:</strong> Before any blockchain interaction
          </li>
          <li>
            <strong>Add SEO:</strong> Every page should have SEO component
          </li>
          <li>
            <strong>Use Toast notifications:</strong> For user feedback
          </li>
          <li>
            <strong>Lazy load pages:</strong> Import with React.lazy() for better performance
          </li>
          <li>
            <strong>CSS co-location:</strong> Each component has its .css file in same folder
          </li>
        </ul>
      </div>
    </div>

    <div className="step-card">
      <h3>Using Our Theme System</h3>
      <p>
        The starter includes multiple theme variants (light and dark modes). Your components
        automatically support all themes by using CSS variables.
      </p>

      <CodeBlock
        code={`/* In your component's CSS file */
.my-component {
  background: var(--bg-primary);      /* Adapts to theme */
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.my-button {
  background: var(--klever-purple);   /* Brand colors */
  color: var(--text-on-dark);
}

/* Available theme variables */
--bg-primary, --bg-secondary, --bg-tertiary
--text-primary, --text-secondary, --text-muted
--border-color, --hover-bg
--klever-purple, --klever-cyan, --electric-blue`}
        language="typescript"
      />

      <div className="info-box">
        <strong>💡 Theme Best Practices:</strong>
        <ul>
          <li>
            Never use hard-coded colors like <code>#fff</code> or <code>rgb(255,255,255)</code>
          </li>
          <li>Always use CSS variables so your component works across all theme variants</li>
          <li>Test your component in both light and dark modes</li>
          <li>
            Use <code>useTheme()</code> hook if you need theme-aware JavaScript logic
          </li>
        </ul>
      </div>
    </div>

    <div className="step-card">
      <h3>Working with Klever SDK</h3>
      <p>
        The SDK provides everything you need for blockchain interactions. Here are the most common
        patterns:
      </p>

      <div className="code-example">
        <h4>Reading Wallet Data:</h4>
        <CodeBlock
          code={`import { useKlever } from '@klever/connect-react';

function MyComponent() {
  const {
    address,           // User's wallet address
    isConnected,       // Connection status (true/false)
    currentNetwork,    // 'mainnet', 'testnet', or 'devnet'
    provider          // Provider for advanced blockchain queries
  } = useKlever();

  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <p>Please connect your wallet</p>
      )}
    </div>
  );
}`}
          language="tsx"
        />
      </div>

      <div className="code-example">
        <h4>Sending Transactions:</h4>
        <CodeBlock
          code={`import { useTransaction } from '@klever/connect-react';
import { parseUnits } from '@klever/connect-core';

function SendTokens() {
  const { sendKLV, isLoading } = useTransaction({
    onSuccess: (receipt) => {
      console.log('Transaction successful:', receipt.hash);
    },
    onError: (error) => {
      console.error('Transaction failed:', error);
    }
  });

  const handleSend = async () => {
    const recipient = 'klv1...'; // Recipient address
    const amount = Number(parseUnits('10', 6)); // 10 KLV
    await sendKLV(recipient, amount);
  };

  return (
    <button onClick={handleSend} disabled={isLoading}>
      {isLoading ? 'Sending...' : 'Send 10 KLV'}
    </button>
  );
}`}
          language="tsx"
        />
      </div>

      <div className="info-box">
        <strong>💡 Key Concepts:</strong>
        <ul>
          <li>
            <strong>parseUnits:</strong> Converts human-readable amounts (like "10") to blockchain
            units. KLV has 6 decimals, so "10 KLV" becomes "10000000".
          </li>
          <li>
            <strong>useTransaction:</strong> Provides hooks for sending tokens and monitoring
            transaction status.
          </li>
          <li>
            <strong>Callbacks:</strong> <code>onSuccess</code> and <code>onError</code> handle
            transaction results.
          </li>
          <li>
            <strong>Loading states:</strong> Always disable buttons with <code>isLoading</code>{' '}
            while transactions are processing to prevent double-sends.
          </li>
        </ul>
      </div>
    </div>

    <div className="step-card">
      <h3>Next Steps & Learning Resources</h3>
      <div className="success-box">
        <strong>🎯 What to explore next:</strong>
        <ol>
          <li>
            <strong>Transaction Playground:</strong> Click "Transaction Playground" in the header to
            test real token transfers and smart contract interactions.
          </li>
          <li>
            <strong>EXAMPLES.md:</strong> Check this file in your project root for comprehensive
            code examples and patterns.
          </li>
          <li>
            <strong>Smart Contracts:</strong> Explore the pre-configured contract examples (Adder,
            Dice, Factorial) in the Transaction Playground.
          </li>
          <li>
            <strong>Network Switching:</strong> Always test your app on Testnet before deploying to
            Mainnet. Use the network badge in the header.
          </li>
        </ol>
      </div>

      <div className="info-box">
        <strong>📚 Helpful Resources:</strong>
        <ul>
          <li>
            <a href="https://docs.klever.org" target="_blank" rel="noopener noreferrer">
              Klever Documentation
            </a>{' '}
            - Official guides, API reference, and tutorials
          </li>
          <li>
            <a href="https://forum.klever.org" target="_blank" rel="noopener noreferrer">
              Klever Forum
            </a>{' '}
            - Community support, ask questions, share projects
          </li>
          <li>
            <a
              href="https://github.com/klever-hub/kleverconnect-starter/blob/main/EXAMPLES.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Code Examples
            </a>{' '}
            - More transaction patterns and best practices
          </li>
        </ul>
      </div>
    </div>
  </div>
);
