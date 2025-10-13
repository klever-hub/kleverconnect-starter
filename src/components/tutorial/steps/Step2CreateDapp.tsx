import { CodeBlock } from './CodeBlock';
import { InfoTooltip } from '../InfoTooltip';

export const Step2CreateDapp = () => (
  <div className="tutorial-section">
    <div className="section-intro">
      <h2>Create Your First dApp</h2>
      <p>Clone the starter kit and get your Klever dApp running.</p>
    </div>

    <div className="step-card">
      <h3>
        Clone the Project
        <InfoTooltip content="'Cloning' means copying a project from GitHub to your computer. This starter kit contains all the code you need to build a Web3 app with Klever. It's pre-configured with best practices and ready to use." />
      </h3>
      <p>Get the starter kit from GitHub:</p>

      <div className="clone-options">
        <div className="clone-method">
          <h4>
            Option 1: Git Clone
            <InfoTooltip content="This command creates a complete copy of the project on your computer. 'git clone' downloads all files and preserves the project's history. This is the preferred method if you have Git installed." />
          </h4>
          <CodeBlock
            code={`git clone https://github.com/klever-hub/kleverconnect-starter.git`}
            language="bash"
          />
        </div>

        <div className="clone-method">
          <h4>
            Option 2: Download ZIP
            <InfoTooltip content="If you don't have Git installed, you can download the project as a ZIP file. This gets you all the files but without version history. After downloading, extract the ZIP to your desired location." />
          </h4>
          <p>
            Visit{' '}
            <a
              href="https://github.com/klever-hub/kleverconnect-starter"
              target="_blank"
              rel="noopener noreferrer"
            >
              the repository
            </a>{' '}
            and click "Code → Download ZIP"
          </p>
        </div>
      </div>

      <div className="step-instruction">
        Navigate to the project:
        <InfoTooltip content="The 'cd' command means 'change directory'. This moves your terminal into the project folder so you can run commands that affect the project files. Think of it like double-clicking a folder to open it." />
      </div>
      <CodeBlock code={`cd kleverconnect-starter`} language="bash" />

      <div className="step-instruction">
        Open in VS Code:
        <InfoTooltip content="The period (.) means 'current directory'. This command opens VS Code with the project loaded. If 'code' doesn't work, you may need to add VS Code to your PATH (see Step 1) or open VS Code manually and use File → Open Folder." />
      </div>
      <CodeBlock code={`code .`} language="bash" />
    </div>

    <div className="step-card">
      <h3>
        Install Dependencies
        <InfoTooltip content="Dependencies are pre-built code libraries that your project needs to run. Like building blocks, they provide functionality so you don't have to write everything from scratch. This project uses React for the UI, Vite for fast development, and Klever SDK for blockchain integration." />
      </h3>
      <CodeBlock code={`pnpm install`} language="bash" />
      <div className="step-instruction">
        This installs all required packages including React, Vite, and Klever SDK.
        <InfoTooltip content="The 'pnpm install' command reads the package.json file to see what libraries are needed, then downloads them into a node_modules folder. This might take 1-2 minutes depending on your internet speed. You'll see a progress bar as packages download." />
      </div>

      <div className="warning-box">
        <strong>⚠️ Common issues:</strong>
        <ul>
          <li>
            <strong>"pnpm: command not found"</strong> - Go back to Step 1 and install pnpm, or
            restart your terminal
          </li>
          <li>
            <strong>Permission errors</strong> - Try running with <code>sudo</code> on Mac/Linux, or
            run terminal as administrator on Windows
          </li>
          <li>
            <strong>Network timeout</strong> - Check your internet connection and try again
          </li>
          <li>
            <strong>Slow installation</strong> - First install is slower as packages are downloaded
            and cached. Subsequent installs will be much faster!
          </li>
        </ul>
      </div>
    </div>

    <div className="step-card">
      <h3>
        Start Development Server
        <InfoTooltip content="The development server runs your app locally on your computer. It watches for changes to your code and automatically refreshes the browser - this is called 'hot module replacement' (HMR). The server only runs while your terminal is open, so keep it running while you work." />
      </h3>
      <CodeBlock code={`pnpm dev`} language="bash" />
      <div className="step-instruction">
        Your app will be available at{' '}
        <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer">
          http://localhost:5173
        </a>
        <InfoTooltip content="'localhost' means your own computer, and '5173' is the port number (like a door number for network connections). Vite chose 5173 as its default port. If that port is busy, it will use 5174, 5175, etc. The terminal will show you the actual URL." />
      </div>
      <div className="success-box">
        <strong>🎉 Success!</strong> Your Klever dApp is now running!
      </div>

      <div className="info-box">
        <strong>🐛 Troubleshooting the dev server:</strong>
        <ul>
          <li>
            <strong>Port 5173 already in use:</strong> Vite will automatically try 5174, 5175, etc.
            Check your terminal for the actual URL
          </li>
          <li>
            <strong>Page shows blank screen:</strong> Check browser console (F12) for errors. Try
            clearing cache and hard refresh (Ctrl+Shift+R)
          </li>
          <li>
            <strong>Module not found errors:</strong> Delete <code>node_modules</code> folder and
            run <code>pnpm install</code> again
          </li>
          <li>
            <strong>Changes not reflecting:</strong> Make sure you saved the file (Ctrl+S) and the
            dev server is still running
          </li>
        </ul>
      </div>
    </div>

    <div className="step-card">
      <h3>Next: Wallet Setup</h3>
      <p>
        Great! Your dApp is running locally. In the next step, we'll set up the Klever Wallet
        Extension so you can interact with your dApp.
      </p>
      <div className="code-block">
        <code>💡 Tip: Keep your dev server running while setting up the wallet</code>
      </div>
    </div>
  </div>
);
