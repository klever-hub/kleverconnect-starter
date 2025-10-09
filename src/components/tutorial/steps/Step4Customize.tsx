import { CodeBlock } from './CodeBlock';
import { InfoTooltip } from '../InfoTooltip';

export const Step4Customize = () => (
  <div className="tutorial-section">
    <div className="section-intro">
      <h2>Customize Your dApp</h2>
      <p>Make the starter kit your own with these simple modifications.</p>
    </div>

    <div className="step-card">
      <h3>
        Project Structure
        <InfoTooltip content="Understanding the project structure helps you navigate and modify the code. React apps are organized into folders by function: components for UI pieces, hooks for reusable logic, and contexts for shared state. This organization makes large projects manageable." />
      </h3>
      <div className="project-structure">
        <CodeBlock
          code={`src/
├── components/         # UI components
│   ├── wallet/        # Wallet-related UI
│   │   ├── ConnectWallet.tsx
│   │   ├── Balance.tsx
│   │   └── NetworkBadge.tsx
│   ├── pages/         # Page components
│   │   ├── LandingPage.tsx
│   │   └── TransactionTriggers.tsx
│   ├── layout/        # Layout components
│   │   └── Header.tsx
│   └── ui/            # Reusable UI elements
├── hooks/             # Custom hooks
│   ├── useTheme.ts
│   └── useToast.ts
├── contexts/          # State management
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
├── utils/             # Helper functions
├── App.tsx            # Main app
└── main.tsx           # Entry point`}
          language="bash"
        />
      </div>
    </div>

    <div className="step-card">
      <h3>Key Files</h3>
      <p>These are the main files you'll work with:</p>
      <div className="key-files">
        <div className="file-item">
          <code className="file-path">
            @klever/connect-react
            <InfoTooltip content="The Klever Connect SDK provides React hooks like useKlever() and useTransaction(). These hooks encapsulate all wallet and blockchain logic. When you call useKlever() in any component, you get access to wallet state and functions like connect() and disconnect()." />
          </code>
          <p className="file-desc">
            Official Klever SDK - provides useKlever, useTransaction, and other blockchain hooks
          </p>
        </div>
        <div className="file-item">
          <code className="file-path">src/components/wallet/ConnectWallet.tsx</code>
          <p className="file-desc">
            Wallet connection UI component - the button users click to connect
          </p>
        </div>
        <div className="file-item">
          <code className="file-path">src/components/pages/LandingPage.tsx</code>
          <p className="file-desc">
            Main home page component - customize this to change your app's appearance
          </p>
        </div>
        <div className="file-item">
          <code className="file-path">src/App.tsx</code>
          <p className="file-desc">
            Root application component - controls routing and global layout
          </p>
        </div>
      </div>
    </div>

    <div className="step-card">
      <h3>
        Make Your First Change
        <InfoTooltip content="React components are written in JSX, which looks like HTML but is actually JavaScript. When you save changes, Vite's hot module replacement (HMR) updates your browser instantly without losing application state. This makes development fast and enjoyable." />
      </h3>

      <div className="info-box">
        <strong>🔍 Finding files in VS Code:</strong>
        <ul>
          <li>
            <strong>Ctrl+P (Cmd+P on Mac)</strong> - Quick file search
          </li>
          <li>
            <strong>Explorer panel</strong> - Click the folder icon in the left sidebar
          </li>
          <li>
            <strong>Ctrl+F (Cmd+F)</strong> - Search within current file
          </li>
        </ul>
      </div>
      <p>
        Edit <code>src/components/pages/LandingPage.tsx</code>:
        <InfoTooltip content="Find the hero title in the file. You can use Ctrl+P (or Cmd+P on Mac) to open the file quickly, then Ctrl+F to search for 'hero-title'. The className attribute adds CSS styling to elements." />
      </p>
      <CodeBlock
        code={`<h1 className="hero-title">
  My First <span className="gradient-text">Klever dApp</span>
</h1>`}
        language="tsx"
      />
      <p>
        Save and see your changes instantly!
        <InfoTooltip content="Press Ctrl+S (or Cmd+S on Mac) to save. Your browser will update automatically. If it doesn't, check that your dev server is still running in the terminal. The gradient-text class creates the colorful text effect." />
      </p>

      <div className="success-box">
        <strong>🎆 More customizations to try:</strong>
        <ul>
          <li>
            Change the colors in <code>src/index.css</code> (look for <code>--klever-pink</code>)
          </li>
          <li>
            Update the logo in <code>src/components/layout/Header.tsx</code>
          </li>
          <li>
            Modify button text in <code>src/components/wallet/ConnectWallet.tsx</code>
          </li>
        </ul>
      </div>

      <div className="warning-box">
        <strong>🔧 If something breaks:</strong>
        <p>
          Don't panic! Check the browser console (F12) for error messages. Most errors show exactly
          which file and line has the problem. You can always undo changes with Ctrl+Z.
        </p>
      </div>
    </div>

    <div className="step-card">
      <h3>
        Understanding the SDK Integration
        <InfoTooltip content="The @klever/connect-react SDK provides pre-built React hooks that handle all blockchain interactions. This saves you from writing low-level blockchain code and ensures security best practices are followed." />
      </h3>
      <p>See how easy it is to use Klever in your components:</p>

      <div className="code-example">
        <h4>Reading Wallet Data:</h4>
        <CodeBlock
          code={`import { useKlever } from '@klever/connect-react';

function MyComponent() {
  const {
    address,           // User's wallet address
    isConnected,       // Connection status
    currentNetwork,    // mainnet, testnet, or devnet
    provider          // For advanced queries
  } = useKlever();

  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <p>Please connect wallet</p>
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
      console.log('Transaction hash:', receipt.hash);
    },
    onError: (error) => {
      console.error('Transaction failed:', error);
    }
  });

  const handleSend = async () => {
    const recipient = 'klv1...';
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
            <strong>parseUnits:</strong> Converts human-readable amounts to blockchain units (KLV
            has 6 decimals)
          </li>
          <li>
            <strong>useTransaction:</strong> Provides hooks for sending tokens and monitoring status
          </li>
          <li>
            <strong>Callbacks:</strong> onSuccess/onError handle transaction results
          </li>
          <li>
            <strong>Loading states:</strong> Always disable buttons while transactions are
            processing
          </li>
        </ul>
      </div>
    </div>

    <div className="step-card">
      <h3>Next Steps & Learning Path</h3>
      <div className="success-box">
        <strong>🎯 What to explore next:</strong>
        <ol>
          <li>
            <strong>Transaction Playground:</strong> Click "Transaction Playground" in the header to
            test real transfers
          </li>
          <li>
            <strong>EXAMPLES.md:</strong> Check the EXAMPLES.md file in your project for more code
            samples
          </li>
          <li>
            <strong>Smart Contracts:</strong> Learn to interact with deployed contracts on Klever
          </li>
          <li>
            <strong>Network Switching:</strong> Test your app on Testnet before deploying to Mainnet
          </li>
        </ol>
      </div>

      <div className="info-box">
        <strong>📚 Recommended Learning Resources:</strong>
        <ul>
          <li>
            <a href="https://docs.klever.org" target="_blank" rel="noopener noreferrer">
              Klever Documentation
            </a>{' '}
            - Official guides and API reference
          </li>
          <li>
            <a href="https://forum.klever.org" target="_blank" rel="noopener noreferrer">
              Klever Forum
            </a>{' '}
            - Community support and discussions
          </li>
          <li>
            <a
              href="https://github.com/klever-hub/kleverconnect-starter/blob/main/EXAMPLES.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Code Examples
            </a>{' '}
            - More transaction patterns
          </li>
        </ul>
      </div>
    </div>
  </div>
);
