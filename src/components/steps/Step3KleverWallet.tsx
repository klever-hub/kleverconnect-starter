export const Step3KleverWallet = () => (
  <div className="tutorial-section">
    <div className="section-intro">
      <h2>Setup Klever Wallet</h2>
      <p>Connect to the Klever blockchain with the official wallet extension.</p>
    </div>

    <div className="step-card">
      <h3>Install Klever Extension</h3>
      <p>
        The Klever Extension is your gateway to the Klever blockchain, available for Chrome-based
        browsers.
      </p>

      <div className="info-box">
        <strong>📌 Supported Browsers:</strong>
        <ul>
          <li>Arc Browser</li>
          <li>Google Chrome</li>
          <li>Brave Browser</li>
          <li>Microsoft Edge</li>
          <li>Opera</li>
        </ul>
      </div>

      <ol>
        <li>Open your Chrome-based browser</li>
        <li>
          Visit the official{' '}
          <a
            href="https://chromewebstore.google.com/detail/klever-wallet/ifclboecfhkjbpmhgehodcjpciihhmif"
            target="_blank"
            rel="noopener noreferrer"
          >
            Klever Wallet on Chrome Web Store
          </a>
        </li>
        <li>Click the blue "Add to Chrome" button</li>
        <li>Click "Add extension" in the popup</li>
        <li>The Klever icon will appear in your browser toolbar</li>
        <li>
          <strong>Pin the extension:</strong> Click the puzzle piece icon in toolbar → Click the pin
          next to Klever Wallet
        </li>
      </ol>

      <div className="code-block">
        <code>
          💡 Tip: Visit{' '}
          <a href="https://klever.io/extension/" target="_blank" rel="noopener noreferrer">
            klever.io/extension
          </a>{' '}
          for direct download links
        </code>
      </div>

      <div className="warning-box">
        <strong>⚠️ Security Alert:</strong> Only install from official sources. Beware of fake
        extensions! Always verify the developer is "Klever.io"
      </div>
    </div>

    <div className="step-card">
      <h3>Create Your Wallet</h3>
      <p>
        Now let's set up your Klever wallet. You can either create a new one or import an existing
        wallet.
      </p>

      <h4>Option 1: Create New Wallet</h4>
      <ol>
        <li>Click the Klever Extension icon in your toolbar</li>
        <li>Select "Create new wallet"</li>
        <li>Read and accept the Terms of Use</li>
        <li>
          Create a <strong>strong password</strong> (minimum 8 characters)
        </li>
        <li>Confirm your password</li>
        <li>
          <strong>CRITICAL:</strong> Write down your 12-word mnemonic phrase on paper
        </li>
        <li>Verify your mnemonic by selecting words in the correct order</li>
        <li>Click "Confirm" to complete wallet creation</li>
      </ol>

      <h4>Option 2: Import Existing Wallet</h4>
      <ol>
        <li>Click "Import wallet" on the welcome screen</li>
        <li>Enter your 12 or 24-word mnemonic phrase</li>
        <li>Set a password for this device</li>
        <li>Click "Import" to restore your wallet</li>
      </ol>

      <div className="warning-box">
        <strong>🔐 Security Best Practices:</strong>
        <ul>
          <li>NEVER share your mnemonic phrase with anyone</li>
          <li>NEVER type it on suspicious websites</li>
          <li>Store it offline in multiple secure locations</li>
          <li>Consider using a hardware wallet for large amounts</li>
        </ul>
      </div>
    </div>

    <div className="step-card">
      <h3>Switch to Testnet & Get Test Tokens</h3>
      <p>For development, we'll use the Testnet to avoid using real tokens.</p>

      <h4>Switch Networks:</h4>
      <ol>
        <li>Click the Klever Extension icon</li>
        <li>Click the network dropdown (shows "Mainnet" by default)</li>
        <li>
          Select <strong>"Testnet"</strong>
        </li>
        <li>The extension header will turn orange to indicate Testnet</li>
      </ol>

      <h4>Get Free Test Tokens:</h4>
      <p>
        KleverConnect Starter has a built-in faucet feature! Since you're already running the app locally
        from Step 2, you can use it right away:
      </p>

      <h5>Using the Faucet (Current Site):</h5>
      <ol>
        <li>
          You should already have your app running at{' '}
          <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer">
            http://localhost:5173
          </a>{' '}
          from Step 2
        </li>
        <li>Connect your wallet (if not already connected)</li>
        <li>Make sure you're on <strong>Testnet</strong> (check the network badge)</li>
        <li>The <strong>💧 Faucet</strong> button will appear in the header automatically</li>
        <li>Click the Faucet button to open the request modal</li>
        <li>Click "Request Test Funds" to receive test KLV</li>
        <li>Wait for the success notification - funds arrive in seconds!</li>
      </ol>

      <div className="info-box">
        <strong>💡 Alternative:</strong> If you prefer, you can also use the public version at{' '}
        <a href="https://kleverconnect-starter.kleverlabs.dev/" target="_blank" rel="noopener noreferrer">
          https://kleverconnect-starter.kleverlabs.dev/
        </a>{' '}
        - it works exactly the same way!
      </div>

      <div className="info-box">
        <strong>💡 Faucet Features:</strong>
        <ul>
          <li>Automatically appears when on Testnet/Devnet</li>
          <li>Shows only when your balance is low</li>
          <li>24-hour cooldown between requests</li>
          <li>Displays next available request time</li>
          <li>Real-time status checking</li>
        </ul>
      </div>

      <div className="info-box">
        <strong>📊 Network Indicators:</strong>
        <ul>
          <li>
            <strong>Purple header</strong> = Mainnet (real tokens)
          </li>
          <li>
            <strong>Orange header</strong> = Testnet (test tokens)
          </li>
          <li>
            <strong>Green header</strong> = Devnet (development)
          </li>
        </ul>
      </div>
    </div>

    <div className="step-card">
      <h3>Connect to Your dApp</h3>
      <p>Now let's connect your wallet to the running dApp:</p>
      <ol>
        <li>
          Go back to your dApp at{' '}
          <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer">
            http://localhost:5173
          </a>
        </li>
        <li>Click "Connect Wallet" button</li>
        <li>Approve the connection in the Klever Extension popup</li>
        <li>You should now see your wallet address and balance!</li>
      </ol>
      <div className="success-box">
        <strong>✨ Awesome!</strong> You're now connected to the Klever blockchain!
      </div>
    </div>
  </div>
);
