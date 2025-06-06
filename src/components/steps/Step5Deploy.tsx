import { CodeBlock } from './CodeBlock';

export const Step5Deploy = () => (
  <div className="tutorial-section">
    <div className="section-intro">
      <h2>Build & Deploy</h2>
      <p>Share your dApp with the world using free hosting services.</p>
    </div>

    <div className="step-card">
      <h3>Build for Production</h3>
      <CodeBlock code={`pnpm build`} language="bash" />
      <p>
        Creates optimized files in <code>dist/</code> folder
      </p>
      <p>Preview your build:</p>
      <CodeBlock code={`pnpm preview`} language="bash" />
    </div>

    <div className="step-card">
      <h3>Deploy to Vercel</h3>
      <ol>
        <li>Install Vercel CLI:</li>
      </ol>
      <CodeBlock code={`npm i -g vercel`} language="bash" />
      <ol start={2}>
        <li>Deploy with one command:</li>
      </ol>
      <CodeBlock code={`vercel`} language="bash" />
      <p>Follow the prompts and your app will be live in seconds!</p>
    </div>

    <div className="step-card">
      <h3>Alternative: Netlify</h3>
      <ol>
        <li>
          Visit{' '}
          <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer">
            app.netlify.com
          </a>
        </li>
        <li>
          Drag your <code>dist</code> folder to the browser
        </li>
        <li>Your app is instantly deployed!</li>
      </ol>
    </div>

    <div className="step-card">
      <h3>Production Deployment with Docker</h3>
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
      <CodeBlock code={`docker build -t kleverconnect-app .`} language="bash" />

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
  </div>
);
