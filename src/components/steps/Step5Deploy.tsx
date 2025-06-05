import { CodeBlock } from './CodeBlock';

export const Step5Deploy = () => (
  <div className="tutorial-section">
    <div className="section-intro">
      <h2>Build & Deploy</h2>
      <p>Share your dApp with the world using free hosting services.</p>
    </div>

    <div className="step-card">
      <h3>Build for Production</h3>
      <CodeBlock code="pnpm build" />
      <p>
        Creates optimized files in <code>dist/</code> folder
      </p>
      <p>Preview your build:</p>
      <CodeBlock code="pnpm preview" />
    </div>

    <div className="step-card">
      <h3>Deploy to Vercel</h3>
      <ol>
        <li>Install Vercel CLI:</li>
      </ol>
      <CodeBlock code="npm i -g vercel" />
      <ol start={2}>
        <li>Deploy with one command:</li>
      </ol>
      <CodeBlock code="vercel" />
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
      <CodeBlock code="docker build -t kleverconnect-app ." />

      <h4>Run Locally:</h4>
      <CodeBlock code="docker run -p 80:80 kleverconnect-app" />
      <p>
        Your app will be available at{' '}
        <a href="http://localhost" target="_blank" rel="noopener noreferrer">
          http://localhost
        </a>
      </p>

      <h4>Deploy to Cloud:</h4>
      <div className="tabs">
        <div className="tab-content">
          <h5>Google Cloud Run</h5>
          <CodeBlock
            code={`# Build and push
docker tag kleverconnect-app gcr.io/PROJECT_ID/kleverconnect-app
docker push gcr.io/PROJECT_ID/kleverconnect-app

# Deploy
gcloud run deploy --image gcr.io/PROJECT_ID/kleverconnect-app`}
          />
        </div>
        <div className="tab-content">
          <h5>AWS</h5>
          <CodeBlock
            code={`# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin
docker tag kleverconnect-app:latest ECR_URI
docker push ECR_URI`}
          />
        </div>
        <div className="tab-content">
          <h5>Azure</h5>
          <CodeBlock
            code={`# Push to ACR
az acr login --name myregistry
docker tag kleverconnect-app myregistry.azurecr.io/kleverconnect-app
docker push myregistry.azurecr.io/kleverconnect-app`}
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
