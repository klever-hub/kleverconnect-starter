import { useState } from 'react';
import { CodeBlock } from './CodeBlock';
import { InfoTooltip } from '../InfoTooltip';

export const Step1DevTools = () => {
  const [activeOS, setActiveOS] = useState<'windows' | 'macos' | 'linux'>('windows');

  return (
    <div className="tutorial-section">
      <div className="section-intro">
        <h2>Install Development Tools</h2>
        <p>Let's set up your development environment with the essential tools.</p>
      </div>

      <div className="warning-box">
        <strong>⚡ Before you start:</strong>
        <ul>
          <li>Make sure you have at least 2GB of free disk space</li>
          <li>You'll need admin/sudo permissions for some installations</li>
          <li>This process takes about 15-20 minutes</li>
        </ul>
      </div>

      <div className="step-card">
        <h3>
          Visual Studio Code
          <InfoTooltip content="VS Code is the most popular code editor for Web3 development. It provides syntax highlighting, debugging tools, and extensions specifically for blockchain development. While you can use any text editor, VS Code offers the best experience for beginners." />
        </h3>
        <p>A lightweight but powerful source code editor.</p>
        <ol>
          <li>
            Download VS Code from{' '}
            <a href="https://code.visualstudio.com" target="_blank" rel="noopener noreferrer">
              code.visualstudio.com
            </a>
          </li>
          <li>
            Run the installer for your operating system
            <InfoTooltip content="The installer will guide you through the process. Accept the default options unless you have specific preferences. The installation typically takes 1-2 minutes." />
          </li>
          <li>
            Launch VS Code after installation
            <InfoTooltip content="VS Code will open with a welcome screen. You can close it and start using the editor. The left sidebar shows your files, and the main area is where you'll write code." />
          </li>
        </ol>
        <div className="code-block">
          <code>
            💡 Pro tip: Enable "Add to PATH" during installation
            <InfoTooltip content="Adding to PATH allows you to open VS Code from any terminal by typing 'code'. This makes it easy to open projects: just navigate to a folder and type 'code .' to open it in VS Code." />
          </code>
        </div>
      </div>

      <div className="step-card">
        <h3>
          Node.js & pnpm
          <InfoTooltip content="Node.js lets you run JavaScript outside the browser, which is essential for modern web development. It comes with npm (Node Package Manager) for installing libraries. We'll use pnpm as a faster alternative to npm for managing project dependencies." />
        </h3>
        <p>JavaScript runtime and fast package manager.</p>
        <ol>
          <li>
            Download Node.js LTS from{' '}
            <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">
              nodejs.org
            </a>
            <InfoTooltip content="LTS stands for 'Long Term Support' - these are stable versions that get security updates for years. Always choose LTS over 'Current' for development. The LTS version is like choosing a reliable car model that's been tested by millions of drivers." />
          </li>
          <li>
            Install Node.js (includes npm)
            <InfoTooltip content="The Node.js installer automatically includes npm. During installation, make sure to check the box that says 'Automatically install the necessary tools' if prompted. This ensures everything is set up correctly." />
          </li>
          <li>
            Open your terminal to verify installation:
            <InfoTooltip content="The terminal is where you'll run commands to manage your project. After installing Node.js, you need to verify it's working correctly by checking the version numbers." />
          </li>
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
              <strong>macOS:</strong> Press <code>Cmd + Space</code>, type "Terminal" and press
              Enter. Or find it in Applications → Utilities.
            </li>
            <li>
              <strong>Linux:</strong> Press <code>Ctrl + Alt + T</code> or search for "Terminal" in
              your apps.
            </li>
          </ul>
        </div>

        <p>
          In the terminal, type these commands and press Enter after each:
          <InfoTooltip content="These commands check if Node.js and npm were installed correctly. The --version flag asks the program to display its version number. If you see an error like 'command not found', the installation didn't work properly." />
        </p>
        <CodeBlock
          code={`node --version
npm --version`}
          language="bash"
        />
        <p>
          You should see version numbers like <code>v20.x.x</code> and <code>10.x.x</code>
        </p>

        <p>
          Install pnpm globally:
          <InfoTooltip content="The -g flag means 'global', installing pnpm system-wide so you can use it in any project. Without -g, packages are only installed in the current folder. pnpm is faster than npm and saves disk space by sharing packages between projects." />
        </p>
        <CodeBlock code={`npm install -g pnpm`} language="bash" />
        <p>This may take a minute. When done, verify pnpm:</p>
        <CodeBlock code={`pnpm --version`} language="bash" />
      </div>

      <div className="step-card">
        <h3>
          Git Version Control
          <InfoTooltip content="Git tracks changes to your code over time, like a detailed history of every edit. It's essential for Web3 development because you'll often need to clone (copy) projects from GitHub, track your changes, and collaborate with others. Think of it as 'version control' for your code." />
        </h3>
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
                  </a>{' '}
                  and run the installer.
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
                <CodeBlock
                  code={`sudo apt install git  # Debian/Ubuntu
sudo dnf install git  # Fedora
sudo pacman -S git    # Arch`}
                  language="bash"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="step-card">
        <h3>Verify Git Installation</h3>
        <p>
          After installing Git, verify it's working correctly:
          <InfoTooltip content="This command checks if Git was installed successfully. You should see a version number like 'git version 2.40.0'. If you get an error, you may need to restart your terminal or computer after installation." />
        </p>
        <CodeBlock code={`git --version`} language="bash" />

        <p>
          You should see output like: <code>git version 2.40.0</code>
        </p>

        <div className="info-box">
          <strong>🔧 First-time Git setup (optional but recommended):</strong>
          <p>Configure your identity for commits:</p>
          <CodeBlock
            code={`git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"`}
            language="bash"
          />
          <p>
            This sets your name and email for all Git commits. You only need to do this once per
            computer.
          </p>
        </div>
      </div>

      <div className="step-card">
        <h3>Verification Checklist</h3>
        <div className="success-box">
          <strong>✅ Before moving to Step 2, verify you have:</strong>
          <ul>
            <li>VS Code installed and can be opened</li>
            <li>Node.js installed (node --version shows v18 or higher)</li>
            <li>pnpm installed (pnpm --version shows a version number)</li>
            <li>Git installed (git --version shows a version number)</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>
            If any command shows an error, go back and reinstall that tool.
          </p>
        </div>
      </div>
    </div>
  );
};
