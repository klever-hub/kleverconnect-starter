import { useState } from 'react';
import { CodeBlock } from './CodeBlock';

export const Step1DevTools = () => {
  const [activeOS, setActiveOS] = useState<'windows' | 'macos' | 'linux'>('windows');

  return (
  <div className="tutorial-section">
    <div className="section-intro">
      <h2>Install Development Tools</h2>
      <p>Let's set up your development environment with the essential tools.</p>
    </div>

    <div className="step-card">
      <h3>Visual Studio Code</h3>
      <p>A lightweight but powerful source code editor.</p>
      <ol>
        <li>
          Download VS Code from{' '}
          <a href="https://code.visualstudio.com" target="_blank" rel="noopener noreferrer">
            code.visualstudio.com
          </a>
        </li>
        <li>Run the installer for your operating system</li>
        <li>Launch VS Code after installation</li>
      </ol>
      <div className="code-block">
        <code>💡 Pro tip: Enable "Add to PATH" during installation</code>
      </div>
    </div>

    <div className="step-card">
      <h3>Node.js & pnpm</h3>
      <p>JavaScript runtime and fast package manager.</p>
      <ol>
        <li>
          Download Node.js LTS from{' '}
          <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">
            nodejs.org
          </a>
        </li>
        <li>Install Node.js (includes npm)</li>
        <li>Open your terminal to verify installation:</li>
      </ol>

      <div className="info-box">
        <strong>🖥️ What's a Terminal?</strong>
        <p>
          The terminal (also called command line or console) is where you type commands to control
          your computer.
        </p>
        <p>
          <strong>How to open it:</strong>
        </p>
        <ul>
          <li>
            <strong>Windows:</strong> Press <code>Win + R</code>, type <code>cmd</code> and press
            Enter. Or search for "Command Prompt" in Start menu.
          </li>
          <li>
            <strong>macOS:</strong> Press <code>Cmd + Space</code>, type "Terminal" and press Enter.
            Or find it in Applications → Utilities.
          </li>
          <li>
            <strong>Linux:</strong> Press <code>Ctrl + Alt + T</code> or search for "Terminal" in
            your apps.
          </li>
        </ul>
      </div>

      <p>In the terminal, type these commands and press Enter after each:</p>
      <CodeBlock
        code={`node --version
npm --version`}
        language="bash"
      />
      <p>
        You should see version numbers like <code>v20.x.x</code> and <code>10.x.x</code>
      </p>

      <p>Install pnpm globally:</p>
      <CodeBlock code={`npm install -g pnpm`} language="bash" />
      <p>This may take a minute. When done, verify pnpm:</p>
      <CodeBlock code={`pnpm --version`} language="bash" />
    </div>

    <div className="step-card">
      <h3>Git Version Control</h3>
      <p>Essential for code management and collaboration.</p>
      <div className="git-install-tabs">
        <div className="git-tab-nav">
          <button 
            className={`git-tab-button ${activeOS === 'windows' ? 'active' : ''}`}
            onClick={() => setActiveOS('windows')}
          >
            Windows
          </button>
          <button 
            className={`git-tab-button ${activeOS === 'macos' ? 'active' : ''}`}
            onClick={() => setActiveOS('macos')}
          >
            macOS
          </button>
          <button 
            className={`git-tab-button ${activeOS === 'linux' ? 'active' : ''}`}
            onClick={() => setActiveOS('linux')}
          >
            Linux
          </button>
        </div>
        <div className="git-tab-panels">
          {activeOS === 'windows' && (
            <div className="git-tab-panel active">
              <p>
                Download Git from{' '}
                <a href="https://git-scm.com" target="_blank" rel="noopener noreferrer">
                  git-scm.com
                </a>
                {' '}and run the installer.
              </p>
            </div>
          )}
          {activeOS === 'macos' && (
            <div className="git-tab-panel active">
              <p>Install using Homebrew:</p>
              <CodeBlock code={`brew install git`} language="bash" />
            </div>
          )}
          {activeOS === 'linux' && (
            <div className="git-tab-panel active">
              <p>Install using your package manager:</p>
              <CodeBlock code={`sudo apt install git  # Debian/Ubuntu
sudo dnf install git  # Fedora
sudo pacman -S git    # Arch`} language="bash" />
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};
