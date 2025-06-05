import { CodeBlock } from './CodeBlock';

export const Step2CreateDapp = () => (
  <div className="tutorial-section">
    <div className="section-intro">
      <h2>Create Your First dApp</h2>
      <p>Clone the starter kit and get your Klever dApp running.</p>
    </div>

    <div className="step-card">
      <h3>Clone the Project</h3>
      <p>Get the starter kit from GitHub:</p>
      
      <div className="clone-options">
        <div className="clone-method">
          <h4>Option 1: Git Clone</h4>
          <CodeBlock code="git clone https://github.com/klever-labs/kleverconnect-starter.git" />
        </div>
        
        <div className="clone-method">
          <h4>Option 2: Download ZIP</h4>
          <p>Visit <a href="https://github.com/klever-labs/kleverconnect-starter" target="_blank" rel="noopener noreferrer">the repository</a> and click "Code → Download ZIP"</p>
        </div>
      </div>
      
      <p>Navigate to the project:</p>
      <CodeBlock code="cd kleverconnect-starter" />
      
      <p>Open in VS Code:</p>
      <CodeBlock code="code ." />
    </div>

    <div className="step-card">
      <h3>Install Dependencies</h3>
      <CodeBlock code="pnpm install" />
      <p>This installs all required packages including React, Vite, and Klever SDK.</p>
    </div>

    <div className="step-card">
      <h3>Start Development Server</h3>
      <CodeBlock code="pnpm dev" />
      <p>Your app will be available at <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer">http://localhost:5173</a></p>
      <div className="success-box">
        <strong>🎉 Success!</strong> Your Klever dApp is now running!
      </div>
    </div>

    <div className="step-card">
      <h3>Next: Wallet Setup</h3>
      <p>Great! Your dApp is running locally. In the next step, we'll set up the Klever Wallet Extension so you can interact with your dApp.</p>
      <div className="code-block">
        <code>💡 Tip: Keep your dev server running while setting up the wallet</code>
      </div>
    </div>
  </div>
);