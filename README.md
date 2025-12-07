# 🛍️ TextiSur - Marketplace de Textiles Production Deployment Guide

<div align="center">

![TextiSur Logo](public/logo.png)

**Plataforma completa de marketplace con geolocalización, mensajería en tiempo real, pagos con Stripe y notificaciones push**

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)](https://www.mysql.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-green)](https://socket.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Latest-purple)](https://stripe.com/)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Production Deployment](#-production-deployment)
  - [Option 1: Docker](#option-1-docker-recommended)
  - [Option 2: VPS with PM2](#option-2-vps-with-pm2)
  - [Option 3: Manual Setup](#option-3-manual-setup)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Testing](#-testing)
- [Monitoring & Maintenance](#-monitoring--maintenance)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## ✨ Features

### 🛒 E-commerce Core
- **Product Catalog** with infinite scroll and advanced filtering
- **Multi-vendor** support with individual store management  
- **Shopping Cart** with multi-store checkout
- **Stripe Integration** for secure payments
- **Order Management** with real-time status updates

### 💬 Real-time Communication
- **Socket.io Chat** with typing indicators
- **Product-based Conversations** between buyers and sellers
- **Message Read Receipts** and reactions
- **Block/Unblock Users** functionality
- **Push Notifications** for new messages

### 📍 Geolocation Features
- **Interactive Map** with Leaflet/React-Leaflet
- **Nearby Stores** based on user location
- **Distance Calculation** and sorting
- **Store Search** by city and address

### 📊 Analytics Dashboard
- **Sales Overview** with charts (Recharts)
- **Revenue Tracking** by day and hour
- **Top Products** analytics
- **Heatmap Visualization** for sales patterns
- **CSV Export** functionality

### 🔐 Authentication & Security
- **JWT-based Auth** with HttpOnly cookies
- **Role-based Access Control** (Buyer/Seller/Admin)
- **Protected Routes** on client and server
- **Secure Password Hashing** with bcrypt

### 🎨 UI/UX
- **Responsive Design** mobile-first approach
- **Dark Mode** with system preference detection
- **Modern UI Components** with shadcn/ui
- **Optimized Images** with Next.js Image component
- **Progressive Web App** ready

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** Radix UI + shadcn/ui
- **Charts:** Recharts
- **Maps:** Leaflet + React-Leaflet

### Backend
- **Runtime:** Node.js 20
- **Server:** Custom Express + Socket.io
- **ORM:** Sequelize
- **Database:** MySQL 8.0
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer (if applicable)

### Integrations
- **Payments:** Stripe
- **Push Notifications:** Web Push (VAPID)
- **AI (Optional):** Google Generative AI

### Infrastructure
- **Container:** Docker + Docker Compose
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt (Certbot)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- MySQL 8.0+
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/textisur.git
cd textisur

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
node run-migration-manual.js

# Start development server
npm run dev

# Server will start on http://localhost:3000
# Socket.io server on the same port
```

---

## 🌐 Production Deployment

### Option 1: Docker (Recommended)

**Fastest and most reliable deployment method.**

```bash
# 1. Clone repository
git clone https://github.com/yourusername/textisur.git
cd textisur

# 2. Copy and configure environment
cp .env.production.example .env.production
nano .env.production  # Fill in your values

# 3. Build and start containers
docker-compose up -d --build

# 4. Run migrations
docker-compose exec app node run-migration-manual.js

# 5. Check logs
docker-compose logs -f app

# Your app is now running on http://localhost:3000
```

**With Nginx reverse proxy:**
```bash
docker-compose --profile with-nginx up -d --build
```

---

### Option 2: VPS with PM2

**Automated setup script for Ubuntu VPS.**

```bash
# 1. SSH into your VPS
ssh user@your-server-ip

# 2. Download and run setup script
wget https://raw.githubusercontent.com/yourusername/textisur/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
sudo ./setup-vps.sh

# The script will:
#   ✅ Install Node.js, PM2, Nginx, MySQL
#   ✅ Configure SSL with Let's Encrypt
#   ✅ Clone and build your app
#   ✅ Set up PM2 to run on startup
#   ✅ Configure firewall

# 3. Edit environment variables
sudo nano /var/www/textisur/.env.production

# 4. Restart application
pm2 restart textisur

# Your app is now live at https://your-domain.com
```

**PM2 Commands:**
```bash
pm2 status                 # Check app status
pm2 logs textisur         # View logs
pm2 restart textisur      # Restart app
pm2 stop textisur         # Stop app
pm2 save                  # Save PM2 process list
pm2 monit                 # Monitor CPU and memory
```

---

### Option 3: Manual Setup

**For custom server configurations.**

```bash
# 1. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2
sudo npm install -g pm2

# 3. Clone repository
git clone https://github.com/yourusername/textisur.git
cd textisur

# 4. Install dependencies
npm ci --production

# 5. Configure environment
cp .env.production.example .env.production
nano .env.production

# 6. Build application
npm run build

# 7. Run migrations
node run-migration-manual.js

# 8. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# 9. Install and configure Nginx (see nginx/nginx.conf)
sudo apt-get install nginx
sudo cp nginx/nginx.conf /etc/nginx/sites-available/textisur
sudo ln -s /etc/nginx/sites-available/textisur /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 10. Setup SSL with Certbot
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔐 Environment Variables

### Required Variables

Create `.env.production` with these variables:

```env
# ===============================
# DATABASE
# ===============================
DATABASE_URL=mysql://user:password@host:3306/database

# ===============================
# AUTHENTICATION
# ===============================
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# ===============================
# STRIPE
# ===============================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ===============================
# PUSH NOTIFICATIONS
# ===============================
# Generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key

# ===============================
# APPLICATION
# ===============================
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production
PORT=3000
```

### Optional Variables

```env
# Google Generative AI
GOOGLE_GENAI_API_KEY=your-api-key

# Email (if implementing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Analytics
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
SENTRY_DSN=your-sentry-dsn
```

**Security Note:** Never commit `.env.production` to version control!

---

## 🗄️ Database Setup

### MySQL Installation

```bash
# Ubuntu/Debian
sudo apt-get install mysql-server

# macOS
brew install mysql

# Windows
# Download from https://dev.mysql.com/downloads/installer/
```

### Create Database

```sql
CREATE DATABASE textisur_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'textisur_user'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON textisur_prod.* TO 'textisur_user'@'localhost';
FLUSH PRIVILEGES;
```

### Run Migrations

```bash
# Using the provided migration script
node run-migration-manual.js

# Or with Sequelize CLI (if configured)
npx sequelize-cli db:migrate
```

### Database Backup

```bash
# Create backup
mysqldump -u textisur_user -p textisur_prod > backup_$(date +%Y%m%d).sql

# Restore backup
mysql -u textisur_user -p textisur_prod < backup_20241207.sql
```

---

## 🧪 Testing

### API Testing

Import the Postman collection:

```bash
# Located at: tests/api-tests.postman_collection.json
```

**Tests included:**
- ✅ Health check
- ✅ Authentication (register/login)
- ✅ Stores (list, nearby)
- ✅ Products (list, detail)
- ✅ Conversations & messaging
- ✅ Stripe checkout
- ✅ Analytics

### Manual Testing Checklist

Before going live, test these features on staging:

#### 🔐 Authentication
- [ ] User registration (buyer & seller)
- [ ] User login
- [ ] Protected routes redirect correctly
- [ ] JWT token refresh works

#### 🛍️ Shopping
- [ ] Browse products with filters
- [ ] Add products to cart from multiple stores
- [ ] Checkout flow completes
- [ ] Stripe payment processes
- [ ] Order confirmation received

#### 📍 Geolocation
- [ ] Nearby stores loads with permission
- [ ] Map displays correctly
- [ ] Distance calculation accurate
- [ ] Fallback for denied permissions

#### 💬 Messaging
- [ ] Start conversation from product
- [ ] Send/receive messages in real-time
- [ ] Typing indicators work
- [ ] Push notifications arrive
- [ ] Block/unblock functionality

#### 📊 Dashboard
- [ ] Analytics data loads
- [ ] Charts render correctly
- [ ] CSV export works
- [ ] Only sellers can access

#### 🎨 UI/UX
- [ ] Dark mode toggle works
- [ ] Mobile responsive (320px - 1920px)
- [ ] Images load properly
- [ ] No console errors

---

## 📊 Monitoring & Maintenance

### Health Checks

The app includes a health check endpoint:

```bash
curl https://your-domain.com/api/health
# Response: {"status":"ok","timestamp":"..."}
```

### Logs

**PM2 Logs:**
```bash
pm2 logs textisur          # Live logs
pm2 logs textisur --lines 100  # Last 100 lines
pm2 flush textisur         # Clear logs
```

**Nginx Logs:**
```bash
tail -f /var/log/nginx/textisur-access.log
tail -f /var/log/nginx/textisur-error.log
```

**Docker Logs:**
```bash
docker-compose logs -f app
docker-compose logs -f mysql
```

### Performance Monitoring

**Recommended Tools:**
- **PM2 Plus:** Real-time monitoring dashboard
- **Sentry:** Error tracking
- **Google Analytics:** User analytics
- **Vercel Analytics:** (if deployed on Vercel)

### Automated Backups

**Database Backup Cron:**

```bash
# Add to crontab: crontab -e
0 2 * * * mysqldump -u textisur_user -p'password' textisur_prod > /backups/db_$(date +\%Y\%m\%d).sql
```

### SSL Certificate Renewal

**Automatic with Certbot:**
```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Check certificate expiration
sudo certbot certificates
```

### Updates & Maintenance

```bash
# Pull latest code
cd /var/www/textisur
git pull origin main

# Install dependencies
npm ci --production

# Run migrations (if any)
node run-migration-manual.js

# Rebuild
npm run build

# Restart
pm2 restart textisur

# Or with zero-downtime reload
pm2 reload textisur
```

---

## 🐛 Troubleshooting

### App Won't Start

**Check logs:**
```bash
pm2 logs textisur --lines 50
```

**Common issues:**
- Missing environment variables → Check `.env.production`
- Database connection failed → Verify `DATABASE_URL`
- Port already in use → Change `PORT` or kill process

### Database Errors

**"Unknown column 'latitude'"**
```bash
# Run migrations
node run-migration-manual.js
```

**Connection timeout**
```sql
-- Increase MySQL timeout
SET GLOBAL connect_timeout=60;
SET GLOBAL wait_timeout=28800;
```

### 401 Unauthorized Errors

**Check JWT_SECRET consistency:**
```bash
# Ensure same JWT_SECRET in .env.production as used for token generation
# Clear browser localStorage and re-login
```

### Stripe Webhook Not Working

**Verify webhook secret:**
```bash
# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

### Push Notifications Failing

**Generate new VAPID keys:**
```bash
npx web-push generate-vapid-keys
# Update .env.production with new keys
```

### Build Errors

**Clear Next.js cache:**
```bash
rm -rf .next
npm run build
```

**TypeScript errors:**
```bash
npm run typecheck
# Fix errors and rebuild
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Support

For issues and questions:
- 📧 Email: support@textisur.com
- 💬 GitHub Issues: [Create an issue](https://github.com/yourusername/textisur/issues)
- 📚 Documentation: [Wiki](https://github.com/yourusername/textisur/wiki)

---

## 🙏 Acknowledgments

Built with ❤️ using:
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Stripe](https://stripe.com/)
- [Socket.io](https://socket.io/)
- [Sequelize](https://sequelize.org/)

---

<div align="center">

**[⬆ Back to Top](#-textisur---marketplace-de-textiles-production-deployment-guide)**

Made with 💙 by the TextiSur Team

</div>
