#!/bin/bash

# One-time server setup script
# Run this ONCE on your VPS after initial setup
# Usage: ./setup-server.sh

set -e

echo "🔧 Setting up server for ai-caller-backend..."

# Check if running on server
if [ ! -f "/etc/os-release" ]; then
    echo "⚠️  This script should be run on your VPS server"
    exit 1
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node -v)"
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
else
    echo "✅ PM2 already installed"
fi

# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
else
    echo "✅ Nginx already installed"
fi

# Setup Nginx configuration
echo "⚙️  Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/ai-caller

# Enable site if not already enabled
if [ ! -L "/etc/nginx/sites-enabled/ai-caller" ]; then
    sudo ln -s /etc/nginx/sites-available/ai-caller /etc/nginx/sites-enabled/
    echo "✅ Nginx site enabled"
else
    echo "✅ Nginx site already enabled"
fi

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Install dependencies
echo "📥 Installing application dependencies..."
npm install

# Setup PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | bash

echo ""
echo "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with production values"
echo "2. Ensure your MongoDB allows connections from this server IP"
echo "3. Setup SSL: sudo certbot --nginx -d summit.cleargrid.ae -d www.summit.cleargrid.ae"
echo "4. Check status: pm2 status"
echo ""
