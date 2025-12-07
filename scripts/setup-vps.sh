#!/bin/bash

###############################################################################
# TextiSur - Automated VPS Setup Script
# 
# This script automates the deployment of TextiSur on a fresh Ubuntu VPS
# 
# Usage:
#   chmod +x setup-vps.sh
#   sudo ./setup-vps.sh
#
# What this script does:
#   1. Installs Node.js 20, PM2, Nginx, MySQL
#   2. Configures firewall (UFW)
#   3. Sets up SSL with Certbot (Let's Encrypt)
#   4. Clones and deploys the application
#   5. Configures PM2 to run on startup
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# -----------------------------------------
# Configuration Variables
# -----------------------------------------
APP_NAME="textisur"
APP_DIR="/var/www/${APP_NAME}"
DOMAIN="your-domain.com"  # CHANGE THIS
EMAIL="admin@your-domain.com"  # CHANGE THIS
DB_NAME="textisur_prod"
DB_USER="textisur_user"
DB_PASSWORD=""  # Will be generated if empty
GIT_REPO="https://github.com/yourusername/textisur.git"  # CHANGE THIS
NODE_VERSION="20"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# -----------------------------------------
# Helper Functions
# -----------------------------------------
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

# -----------------------------------------
# Main Installation Steps
# -----------------------------------------

log_info "Starting TextiSur VPS setup..."
check_root

# 1. Update system
log_info "Updating system packages..."
apt-get update
apt-get upgrade -y

# 2. Install essential tools
log_info "Installing essential tools..."
apt-get install -y curl git wget build-essential ufw

# 3. Install Node.js
log_info "Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version

# 4. Install PM2
log_info "Installing PM2..."
npm install -g pm2
pm2 startup systemd -u $(logname) --hp /home/$(logname)

# 5. Install MySQL
log_info "Installing MySQL..."
apt-get install -y mysql-server

# Generate database password if not set
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 32)
    log_info "Generated database password: ${DB_PASSWORD}"
    echo "DB_PASSWORD=${DB_PASSWORD}" >> /root/.textisur-credentials
fi

# Secure MySQL and create database
log_info "Configuring MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# 6. Install Nginx
log_info "Installing Nginx..."
apt-get install -y nginx

# Create Nginx configuration
log_info "Configuring Nginx..."
cat > /etc/nginx/sites-available/${APP_NAME} <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# 7. Configure Firewall
log_info "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# 8. Install Certbot for SSL
log_info "Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
log_info "Obtaining SSL certificate..."
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m ${EMAIL}

# Setup auto-renewal
systemctl enable certbot.timer

# 9. Clone and setup application
log_info "Setting up application..."
mkdir -p ${APP_DIR}
cd ${APP_DIR}

if [ -d ".git" ]; then
    log_info "Repository already exists, pulling latest changes..."
    git pull
else
    log_info "Cloning repository..."
    git clone ${GIT_REPO} .
fi

# 10. Install dependencies
log_info "Installing application dependencies..."
npm ci --production

# 11. Create .env file
log_info "Creating environment file..."
cat > ${APP_DIR}/.env.production <<EOF
# Database
DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}

# Application
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_BASE_URL=https://${DOMAIN}

# Security (CHANGE THESE!)
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Add your other environment variables here
# STRIPE_SECRET_KEY=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# STRIPE_WEBHOOK_SECRET=
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=
# VAPID_PRIVATE_KEY=
# GOOGLE_GENAI_API_KEY=
EOF

log_warn "Please edit ${APP_DIR}/.env.production and add your API keys!"

# 12. Build application
log_info "Building application..."
npm run build

# 13. Run migrations
log_info "Running database migrations..."
if [ -f "${APP_DIR}/run-migration-manual.js" ]; then
    node ${APP_DIR}/run-migration-manual.js
else
    log_warn "Migration script not found, skipping..."
fi

# 14. Start application with PM2
log_info "Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save

# 15. Set correct permissions
log_info "Setting permissions..."
chown -R www-data:www-data ${APP_DIR}

# -----------------------------------------
# Final Steps
# -----------------------------------------

log_info "========================================="
log_info "TextiSur VPS Setup Complete! ✅"
log_info "========================================="
log_info ""
log_info "Application URL: https://${DOMAIN}"
log_info "Application Directory: ${APP_DIR}"
log_info "Database: ${DB_NAME}"
log_info "Database User: ${DB_USER}"
log_info ""
log_warn "IMPORTANT: Database credentials saved to /root/.textisur-credentials"
log_warn "IMPORTANT: Edit ${APP_DIR}/.env.production with your API keys"
log_info ""
log_info "Useful commands:"
log_info "  - View logs: pm2 logs ${APP_NAME}"
log_info "  - Restart app: pm2 restart ${APP_NAME}"
log_info "  - Check status: pm2 status"
log_info "  - Nginx logs: tail -f /var/log/nginx/error.log"
log_info ""
log_info "SSL Certificate auto-renewal is configured"
log_info "Firewall (UFW) is enabled"
log_info ""
