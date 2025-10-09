import { CodeBlock } from './CodeBlock';
import { InfoTooltip } from '../InfoTooltip';

export const Step5Deploy = () => (
  <div className="tutorial-section">
    <div className="section-intro">
      <h2>Build & Deploy</h2>
      <p>Share your dApp with the world using free hosting services.</p>
    </div>

    <div className="info-box">
      <strong>⏱ Time estimate:</strong> 5-10 minutes for your first deployment
    </div>

    <div className="step-card">
      <h3>
        Build for Production
        <InfoTooltip content="Building for production optimizes your code for speed and size. It removes development tools, minifies code (makes it smaller), and bundles files together. This process transforms your development code into efficient files ready for web hosting." />
      </h3>
      <CodeBlock code={`pnpm build`} language="bash" />
      <p>
        Creates optimized files in <code>dist/</code> folder
        <InfoTooltip content="The 'dist' folder (short for distribution) contains your entire app compressed into static HTML, CSS, and JavaScript files. These files can be uploaded to any web server. The build process typically reduces file sizes by 50-90%." />
      </p>
      <p>
        Preview your build:
        <InfoTooltip content="The preview command runs a local server with your production build. This lets you test the optimized version before deploying. It simulates how your app will behave on a real web server, helping catch any build-related issues." />
      </p>
      <CodeBlock code={`pnpm preview`} language="bash" />
    </div>

    <div className="step-card">
      <h3>
        Deploy to Vercel
        <InfoTooltip content="Vercel is a cloud platform that hosts web applications. It's free for personal projects and provides automatic HTTPS, global CDN (content delivery network), and instant deployments. Vercel created Next.js and specializes in React apps." />
      </h3>
      <ol>
        <li>
          Install Vercel CLI:
          <InfoTooltip content="CLI stands for Command Line Interface. The Vercel CLI lets you deploy from your terminal without using a web browser. The -g flag installs it globally, making the 'vercel' command available everywhere." />
        </li>
      </ol>
      <CodeBlock code={`npm i -g vercel`} language="bash" />
      <ol start={2}>
        <li>
          Deploy with one command:
          <InfoTooltip content="This single command analyzes your project, uploads it to Vercel's servers, and gives you a live URL. First time users will be prompted to login/signup. The CLI automatically detects that this is a Vite project and configures everything correctly." />
        </li>
      </ol>
      <CodeBlock code={`vercel`} language="bash" />
      <p>Follow the prompts and your app will be live in seconds!</p>
    </div>

    <div className="step-card">
      <h3>
        Alternative: Netlify
        <InfoTooltip content="Netlify is another popular hosting service, similar to Vercel. Its drag-and-drop feature is perfect for beginners - no command line needed! Like Vercel, it's free for personal projects and includes HTTPS and CDN." />
      </h3>
      <ol>
        <li>
          Visit{' '}
          <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer">
            app.netlify.com
          </a>
        </li>
        <li>
          Drag your <code>dist</code> folder to the browser
          <InfoTooltip content="After running 'pnpm build', find the 'dist' folder in your project directory. You can drag this entire folder from your file explorer directly onto the Netlify website. This is the simplest deployment method available - no technical knowledge required!" />
        </li>
        <li>Your app is instantly deployed!</li>
      </ol>
    </div>

    <div className="step-card">
      <h3>
        <span
          style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginRight: '0.5rem' }}
        >
          [Advanced]
        </span>
        Production Deployment with Docker
        <InfoTooltip content="Docker packages your app and all its dependencies into a 'container' - like a shipping container for software. This ensures your app runs the same way everywhere: on your computer, your colleague's computer, and in the cloud. It's the professional way to deploy applications." />
      </h3>
      <p>For production environments, Docker provides consistency and scalability.</p>

      <div className="warning-box">
        <strong>📋 Prerequisites:</strong> Install Docker Desktop from{' '}
        <a
          href="https://www.docker.com/products/docker-desktop"
          target="_blank"
          rel="noopener noreferrer"
        >
          docker.com
        </a>
      </div>

      <h4>Build Docker Image:</h4>
      <CodeBlock
        code={`docker build -f docker/Dockerfile -t kleverconnect-app .`}
        language="bash"
      />

      <h4>Run Locally:</h4>
      <CodeBlock code={`docker run -p 80:80 kleverconnect-app`} language="bash" />
      <p>
        Your app will be available at{' '}
        <a href="http://localhost" target="_blank" rel="noopener noreferrer">
          http://localhost
        </a>
      </p>

      <h4>Deploy to Cloud Providers:</h4>
      <div className="cloud-deploy-options">
        <div className="deploy-option">
          <div className="deploy-header">
            <span className="cloud-icon">☁️</span>
            <h5>Google Cloud Run</h5>
          </div>
          <CodeBlock
            code={`# Build and push to Google Container Registry
docker tag kleverconnect-app gcr.io/PROJECT_ID/kleverconnect-app
docker push gcr.io/PROJECT_ID/kleverconnect-app

# Deploy to Cloud Run
gcloud run deploy kleverconnect-app \\
  --image gcr.io/PROJECT_ID/kleverconnect-app \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated`}
            language="bash"
          />
        </div>

        <div className="deploy-option">
          <div className="deploy-header">
            <span className="cloud-icon">🟠</span>
            <h5>AWS ECS / App Runner</h5>
          </div>
          <CodeBlock
            code={`# Login to ECR
aws ecr get-login-password --region us-east-1 | \\
  docker login --username AWS --password-stdin \\
  123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag and push to ECR
docker tag kleverconnect-app:latest \\
  123456789.dkr.ecr.us-east-1.amazonaws.com/kleverconnect-app:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/kleverconnect-app:latest

# Deploy with App Runner (easier) or ECS (more control)`}
            language="bash"
          />
        </div>

        <div className="deploy-option">
          <div className="deploy-header">
            <span className="cloud-icon">🔷</span>
            <h5>Azure Container Instances</h5>
          </div>
          <CodeBlock
            code={`# Login to Azure Container Registry
az acr login --name myregistry

# Tag and push to ACR
docker tag kleverconnect-app \\
  myregistry.azurecr.io/kleverconnect-app:latest
docker push myregistry.azurecr.io/kleverconnect-app:latest

# Create container instance
az container create \\
  --resource-group myResourceGroup \\
  --name kleverconnect-app \\
  --image myregistry.azurecr.io/kleverconnect-app:latest \\
  --dns-name-label myapp \\
  --ports 80`}
            language="bash"
          />
        </div>
      </div>

      <div className="info-box">
        <strong>🐳 Docker Benefits:</strong>
        <ul>
          <li>Consistent environment across development and production</li>
          <li>Easy scaling with orchestration tools (Kubernetes, Swarm)</li>
          <li>Built-in Nginx server with optimized configuration</li>
          <li>Security headers and caching already configured</li>
        </ul>
      </div>
    </div>

    <div className="success-box">
      <strong>🚀 Congratulations!</strong> You've built and deployed your first Klever dApp!
    </div>

    <div className="step-card">
      <h3>🎓 What's Next?</h3>
      <div className="info-box">
        <strong>Ready to learn more? Here are your next steps:</strong>
        <ul>
          <li>
            📖 Learn about <strong>Smart Contracts</strong> - The backend of Web3 apps
          </li>
          <li>
            🎨 Explore <strong>Web3 UI Libraries</strong> - Pre-built components for dApps
          </li>
          <li>
            🔒 Study <strong>Web3 Security</strong> - Best practices for safe dApps
          </li>
          <li>
            👥 Join the <strong>Klever Community</strong> - Get help and share your projects
          </li>
        </ul>
      </div>

      <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <strong>Need help?</strong> Visit the{' '}
        <a href="https://forum.klever.org" target="_blank" rel="noopener noreferrer">
          Klever Forum
        </a>
      </p>
    </div>
  </div>
);
