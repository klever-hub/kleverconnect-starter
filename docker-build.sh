#!/bin/bash

# Build and run the Docker container for KleverConnect Starter

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Building KleverConnect Starter Docker image...${NC}"

# Build the Docker image
if docker build -f docker/Dockerfile -t kleverconnect-starter:latest .; then
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
else
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Starting the container...${NC}"

# Stop and remove existing container if it exists
docker stop kleverconnect-app 2>/dev/null || true
docker rm kleverconnect-app 2>/dev/null || true

# Run the container
if docker run -d \
    --name kleverconnect-app \
    -p 3000:80 \
    --restart unless-stopped \
    kleverconnect-starter:latest; then
    
    echo -e "${GREEN}✅ Container started successfully!${NC}"
    echo -e "${BLUE}📱 Application is running at: ${GREEN}http://localhost:3000${NC}"
    echo -e "${BLUE}📊 View logs: ${NC}docker logs -f kleverconnect-app"
    echo -e "${BLUE}🛑 Stop container: ${NC}docker stop kleverconnect-app"
else
    echo -e "${RED}❌ Failed to start container!${NC}"
    exit 1
fi