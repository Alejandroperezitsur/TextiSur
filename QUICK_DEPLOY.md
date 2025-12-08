# 🚀 TextiSur - Quick Deploy Guide

## Prerequisites
- Ubuntu 20.04+ VPS with root access
- Domain name pointing to your VPS IP
- SSH key configured

---

## 📦 Option 1: Automated VPS Setup (Recommended)

### Step 1: Prepare Local Repository
```bash
# Clone your repository
git clone https://github.com/yourusername/textisur.git
cd textisur

# Edit setup script with your details
nano scripts/setup-vps.sh

# Change these variables:
# - DOMAIN="your-domain.com"
# - EMAIL="admin@your-domain.com"
# - GIT_REPO="https://github.com/yourusername/textisur.git"
```

### Step 2: Upload to VPS
```bash
# Copy setup script to server
scp scripts/setup-vps.sh user@your-vps-ip:/home/user/

# SSH into server
ssh user@your-vps-ip
```

### Step 3: Run Automated Setup
```bash
# Make script executable
chmod +x /home/user/setup-vps.sh

# Run as root
sudo bash /home/user/setup-vps.sh

# Script will:
# ✅ Install Node.js 20, PM2, Nginx, MySQL
# ✅ Create database and user
# ✅ Configure SSL with Let's Encrypt
# ✅ Clone your repository
# ✅ Build application
# ✅ Start PM2 process
```

### Step 4: Configure Environment
```bash
# Edit .env.production with your API keys
sudo nano /var/www/textisur/.env.production

# Required variables (the script generates JWT_SECRET for you):
STRIPE_SECRET_KEY=sk_live_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key

# Save and exit (Ctrl+X, Y, Enter)

# Restart application
pm2 restart textisur
```

### Step 5: Verify Deployment
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs textisur --lines 50

# Test health endpoint
curl https://your-domain.com/api/health

# Check SSL
curl -I https://your-domain.com
```

**Your app is now live at https://your-domain.com! 🎉**

---

## 🐳 Option 2: Docker Deploy

### Step 1: Install Docker on VPS
```bash
# SSH into your VPS
ssh user@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 2: Clone and Configure
```bash
# Clone repository
git clone https://github.com/yourusername/textisur.git
cd textisur

# Create .env.production
cp .env.production.example .env.production
nano .env.production
# Fill in all your values
```

### Step 3: Deploy with Docker
```bash
# Build and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Run database migrations
docker-compose exec app node run-migration-manual.js

# Check status
docker-compose ps
```

### Step 4: Setup Nginx Reverse Proxy (on host)
```bash
# Install Nginx on host
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/textisur

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/textisur /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

**Your app is now live at https://your-domain.com! 🎉**

---

## 🔧 Option 3: Manual PM2 Setup

### Step 1: Install Node.js and PM2
```bash
# SSH into VPS
ssh user@your-vps-ip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup script
pm2 startup systemd
# Follow the command it gives you
```

### Step 2: Setup MySQL
```bash
# Install MySQL
sudo apt-get install -y mysql-server

# Secure installation
sudo mysql_secure_installation

# Create database
sudo mysql -u root -p
```

In MySQL console:
```sql
CREATE DATABASE textisur_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'textisur_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON textisur_prod.* TO 'textisur_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Deploy Application
```bash
# Create app directory
sudo mkdir -p /var/www/textisur
sudo chown -R $USER:$USER /var/www/textisur
cd /var/www/textisur

# Clone repository
git clone https://github.com/yourusername/textisur.git .

# Install dependencies
npm ci --production

# Create .env.production
cp .env.production.example .env.production
nano .env.production
# Fill in DATABASE_URL with your MySQL credentials
# DATABASE_URL=mysql://textisur_user:YOUR_SECURE_PASSWORD@localhost:3306/textisur_prod

# Run migrations
node run-migration-manual.js

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
```

### Step 4: Install and Configure Nginx
```bash
# Install Nginx
sudo apt-get install -y nginx

# Create site config
sudo nano /etc/nginx/sites-available/textisur
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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

Enable and start:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/textisur /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 5: Setup SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 6: Configure Firewall
```bash
# Setup UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

**Your app is now live at https://your-domain.com! 🎉**

---

## 🧪 Post-Deployment Testing

### 1. Health Check
```bash
curl https://your-domain.com/api/health
# Should return: {"status":"ok",...}
```

### 2. Test Login
- Navigate to https://your-domain.com/login
- Create a test account
- Verify you can login

### 3. Test Stripe (using Stripe CLI)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe
# or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your server
stripe listen --forward-to https://your-domain.com/api/webhooks/stripe

# In another terminal, trigger a test event
stripe trigger checkout.session.completed
```

### 4. Test Push Notifications
```bash
# Use the test script
cd /var/www/textisur
node scripts/test-webhooks.js push
```

### 5. Monitor Logs
```bash
# PM2 logs
pm2 logs textisur

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MySQL slow query log (if enabled)
sudo tail -f /var/log/mysql/mysql-slow.log
```

---

## 🔄 Update Deployment

```bash
# SSH into server
ssh user@your-vps-ip
cd /var/www/textisur

# Pull latest code
git pull origin main

# Install new dependencies (if any)
npm ci --production

# Run new migrations (if any)
node run-migration-manual.js

# Rebuild
npm run build

# Reload PM2 (zero-downtime)
pm2 reload textisur

# Or restart PM2 (small downtime)
pm2 restart textisur

# Check logs
pm2 logs textisur --lines 50
```

---

## 🆘 Quick Troubleshooting

### App won't start
```bash
pm2 logs textisur --err
# Check for port conflicts: lsof -i :3000
```

### Database connection failed
```bash
# Test MySQL connection
mysql -u textisur_user -p textisur_prod

# Check DATABASE_URL in .env.production
cat /var/www/textisur/.env.production | grep DATABASE_URL
```

### 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log
```

### SSL certificate issues
```bash
# Check certificate expiration
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal
```

---

## 📞 Support

- **Documentation:** See README.md
- **Rollback Guide:** See ROLLBACK_RUNBOOK.md
- **Full Checklist:** See DEPLOYMENT_CHECKLIST.md

**Happy Deploying! 🚀**
