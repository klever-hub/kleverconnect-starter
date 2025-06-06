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
          <code className="file-path">
            src/hooks/useKlever.ts
            <InfoTooltip content="A React hook is a function that lets you use React features. This custom hook encapsulates all the Klever wallet logic in one place. When you call useKlever() in any component, you get access to wallet state and functions like connect() and disconnect()." />
          </code>
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
        Edit <code>src/components/LandingPage.tsx</code>:
        <InfoTooltip content="Find line 31 in the file. You can use Ctrl+G (or Cmd+G on Mac) in VS Code to jump to a specific line number. The className attribute adds CSS styling to elements." />
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
            Update the logo in <code>src/components/Header.tsx</code>
          </li>
          <li>
            Modify button text in <code>src/components/ConnectWallet.tsx</code>
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
  </div>
);
