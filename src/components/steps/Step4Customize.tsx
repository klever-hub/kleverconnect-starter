import { CodeBlock } from './CodeBlock';

export const Step4Customize = () => (
  <div className="tutorial-section">
    <div className="section-intro">
      <h2>Customize Your dApp</h2>
      <p>Make the starter kit your own with these simple modifications.</p>
    </div>

    <div className="step-card">
      <h3>Project Structure</h3>
      <div className="project-structure">
        <CodeBlock
          code={`src/
├── components/     # UI components
│   ├── ConnectWallet.tsx
│   ├── LandingPage.tsx
│   └── Header.tsx
├── hooks/          # React hooks
│   └── useKlever.ts
├── contexts/       # State management
│   └── KleverContext.tsx
├── App.tsx         # Main app
└── main.tsx        # Entry point`}
          language="bash"
        />
      </div>
    </div>

    <div className="step-card">
      <h3>Key Files</h3>
      <p>These are the main files you'll work with:</p>
      <div className="key-files">
        <div className="file-item">
          <code className="file-path">src/hooks/useKlever.ts</code>
          <p className="file-desc">
            Core wallet integration logic - handles connection, disconnection, and blockchain
            interactions
          </p>
        </div>
        <div className="file-item">
          <code className="file-path">src/components/ConnectWallet.tsx</code>
          <p className="file-desc">
            Wallet connection UI component - the button users click to connect
          </p>
        </div>
        <div className="file-item">
          <code className="file-path">src/components/LandingPage.tsx</code>
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
      <h3>Make Your First Change</h3>
      <p>
        Edit <code>src/components/LandingPage.tsx</code>:
      </p>
      <CodeBlock
        code={`<h1 className="hero-title">
  My First <span className="gradient-text">Klever dApp</span>
</h1>`}
        language="tsx"
      />
      <p>Save and see your changes instantly!</p>
    </div>
  </div>
);
