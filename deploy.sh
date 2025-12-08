#!/bin/bash

# Deployment script for VPS
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Build React frontend (adjust path to your React project)
echo "📦 Building React frontend..."
REACT_PROJECT_PATH="../your-react-project"  # UPDATE THIS PATH
if [ -d "$REACT_PROJECT_PATH" ]; then
    cd $REACT_PROJECT_PATH
    npm run build
    
    # Copy build to backend dist folder
    cd -
    rm -rf dist/*
    cp -r $REACT_PROJECT_PATH/build/* dist/ || cp -r $REACT_PROJECT_PATH/dist/* dist/
    echo "✅ Frontend built and copied to dist/"
else
    echo "⚠️  React project not found at $REACT_PROJECT_PATH"
    echo "Please update REACT_PROJECT_PATH in this script"
fi

# Install backend dependencies
echo "📥 Installing backend dependencies..."
npm install

# Restart PM2 process
echo "🔄 Restarting backend with PM2..."
pm2 restart ai-caller-backend 2>/dev/null || pm2 start index.js --name "ai-caller-backend"

echo "✅ Deployment complete!"
echo "🌐 Application running on port ${PORT:-3000}"
