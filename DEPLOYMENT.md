# VPS Deployment Guide

## Quick Start

Your application is already configured to serve both backend API and React frontend from a single server.

## Prerequisites on VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx

# Install Git (if needed)
sudo apt-get install -y git
```

## Initial Setup

### 1. Upload Code to VPS

**Option A: Using Git**

```bash
ssh user@your-vps-ip
cd /home/user
git clone your-repo-url
cd ai-caller-backend
```

**Option B: Using SCP**

```bash
# From your local machine
scp -r ai-caller-backend/ user@your-vps-ip:/home/user/
```

### 2. Build React Frontend

```bash
# On your local machine, in your React project
npm run build

# Copy build output to backend dist folder
cp -r build/* ../ai-caller-backend/dist/
# OR for Vite projects: cp -r dist/* ../ai-caller-backend/dist/
```

### 3. Setup Backend on VPS

```bash
# SSH into VPS
ssh user@your-vps-ip
cd /home/user/ai-caller-backend

# Install dependencies
npm install

# Create environment file
nano .env
```

Add to `.env`:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
PORT=3000
NODE_ENV=production
```

### 4. Start Application with PM2

```bash
# Start the app
pm2 start index.js --name "ai-caller-backend"

# View logs
pm2 logs ai-caller-backend

# Monitor
pm2 monit

# Save PM2 configuration
pm2 save

# Enable startup on boot
pm2 startup
# Follow the command it outputs
```

## Nginx Configuration

### Basic Setup (HTTP)

```bash
sudo nano /etc/nginx/sites-available/ai-caller
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Increase body size for file uploads if needed
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/ai-caller /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Setup (HTTPS)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
# Test renewal: sudo certbot renew --dry-run
```

## Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Useful PM2 Commands

```bash
# View all processes
pm2 list

# Restart app
pm2 restart ai-caller-backend

# Stop app
pm2 stop ai-caller-backend

# View logs
pm2 logs ai-caller-backend

# View real-time logs
pm2 logs ai-caller-backend --lines 100

# Monitor resources
pm2 monit

# Delete process
pm2 delete ai-caller-backend
```

## Update/Redeploy

### Manual Update

```bash
# SSH into VPS
ssh user@your-vps-ip
cd /home/user/ai-caller-backend

# Pull latest code (if using git)
git pull

# Rebuild React frontend locally and upload new dist folder
# OR copy new dist folder via SCP

# Install any new dependencies
npm install

# Restart
pm2 restart ai-caller-backend
```

### Using Deploy Script

```bash
# Make script executable
chmod +x deploy.sh

# Update REACT_PROJECT_PATH in deploy.sh
nano deploy.sh

# Run deployment
./deploy.sh
```

## Monitoring & Maintenance

### Check Application Status

```bash
# PM2 status
pm2 status

# Nginx status
sudo systemctl status nginx

# View application logs
pm2 logs ai-caller-backend --lines 50

# Check disk space
df -h

# Check memory
free -h
```

### MongoDB Connection

Ensure your MongoDB Atlas (or other MongoDB) allows connections from your VPS IP:

1. Go to MongoDB Atlas → Network Access
2. Add your VPS IP address to whitelist
3. Or use `0.0.0.0/0` for testing (not recommended for production)

## Troubleshooting

### App not starting

```bash
# Check logs
pm2 logs ai-caller-backend

# Check if port is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart ai-caller-backend
```

### Nginx errors

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### MongoDB connection issues

- Verify MONGO_URI in `.env`
- Check MongoDB Atlas IP whitelist
- Test connection: `node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('OK'))"`

## Environment Variables

Required in `.env`:

- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Set to "production"

## Security Best Practices

1. **Use environment variables** for sensitive data
2. **Enable firewall** (ufw)
3. **Use SSL/HTTPS** with Let's Encrypt
4. **Keep system updated**: `sudo apt update && sudo apt upgrade`
5. **Use strong passwords** and SSH keys
6. **Restrict MongoDB access** to your VPS IP only
7. **Regular backups** of your database

## Performance Tips

1. **Enable Gzip** in Nginx for static files
2. **Set up caching** for static assets
3. **Monitor with PM2**: `pm2 monit`
4. **Use MongoDB indexes** for better query performance
5. **Consider using a CDN** for static assets

## Cost Optimization

- **VPS Providers**: DigitalOcean ($6/mo), Linode ($5/mo), Vultr ($6/mo)
- **MongoDB**: Atlas free tier (512MB)
- **Domain**: Namecheap, Cloudflare (~$10/year)
- **SSL**: Let's Encrypt (Free)

**Total**: ~$5-10/month for a basic setup
