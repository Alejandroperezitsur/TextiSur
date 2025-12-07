# 🚀 TextiSur - Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 📋 Environment Configuration

- [ ] All environment variables set in `.env.production`
  - [ ] `DATABASE_URL` - MySQL connection string
  - [ ] `JWT_SECRET` - Strong random secret (min 32 characters)
  - [ ] `NEXTAUTH_SECRET` - Strong random secret
  - [ ] `STRIPE_SECRET_KEY` - Live Stripe secret key
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Live Stripe publishable key
  - [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
  - [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Web Push VAPID public key
  - [ ] `VAPID_PRIVATE_KEY` - Web Push VAPID private key
  - [ ] `NEXT_PUBLIC_BASE_URL` - Production domain (https://...)
  - [ ] `GOOGLE_GENAI_API_KEY` - (Optional) Google AI key

- [ ] Environment variables are NOT in version control
- [ ] `.env.production` file permissions are restrictive (600)
- [ ] Secrets are stored securely (e.g., AWS Secrets Manager, Vault)

### 🗄️ Database Setup

- [ ] MySQL 8.0+ installed and running
- [ ] Production database created
- [ ] Database user created with appropriate privileges
- [ ] Database backup strategy in place
- [ ] Database migrations executed successfully
  ```bash
  node run-migration-manual.js
  ```
- [ ] `latitude` and `longitude` columns exist in `stores` table
- [ ] All foreign key constraints verified
- [ ] Database connection pooling configured (if needed)

### 🔧 Application Build

- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No linting errors (`npm run lint`)
- [ ] `.next` build directory exists
- [ ] Static assets optimized
- [ ] Source maps configured for production debugging

### 🔐 Security

- [ ] HTTPS configured (SSL certificate installed)
- [ ] Automatic HTTP to HTTPS redirect
- [ ] Security headers configured in Nginx
  - [ ] `Strict-Transport-Security`
  - [ ] `X-Frame-Options`
  - [ ] `X-Content-Type-Options`
  - [ ] `Content-Security-Policy`
- [ ] CORS properly configured
- [ ] Rate limiting enabled for API routes
- [ ] SQL injection protection verified (using Sequelize)
- [ ] XSS protection in place
- [ ] CSRF protection for forms
- [ ] Sensitive data not logged

### 🌐 Infrastructure

- [ ] Server provisioned (VPS, cloud, container)
- [ ] Node.js 20+ installed
- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] PM2 configured to start on boot (`pm2 startup`)
- [ ] Nginx installed and configured
- [ ] Firewall configured (UFW or equivalent)
  - [ ] Port 22 (SSH) allowed
  - [ ] Port 80 (HTTP) allowed
  - [ ] Port 443 (HTTPS) allowed
  - [ ] Port 3306 (MySQL) blocked from external access
- [ ] Automatic updates configured
- [ ] System monitoring in place

### 📦 Deployment

- [ ] Application deployed to production server
- [ ] PM2 process running (`pm2 list`)
- [ ] PM2 process saved (`pm2 save`)
- [ ] Application accessible at production URL
- [ ] Nginx reverse proxy working
- [ ] WebSocket connections functioning (Socket.io)
- [ ] Static files serving correctly

---

## 🧪 Staging Environment Testing

### 1. 🔐 Authentication & Authorization

- [ ] **User Registration**
  - [ ] Register as comprador (buyer)
  - [ ] Register as vendedor (seller)
  - [ ] Email validation (if implemented)
  - [ ] Password strength requirements enforced
  - [ ] Receives JWT token after registration

- [ ] **User Login**
  - [ ] Login with correct credentials
  - [ ] Login fails with incorrect credentials
  - [ ] JWT token stored correctly
  - [ ] Token refresh works (if implemented)
  - [ ] Session persists after page reload

- [ ] **Role-Based Access**
  - [ ] Seller can access `/dashboard/seller`
  - [ ] Buyer cannot access seller dashboard
  - [ ] Protected routes redirect to login

### 2. 🛍️ Product Catalog & Shopping

- [ ] **Product Listing**
  - [ ] Products load on homepage
  - [ ] Infinite scroll works
  - [ ] Filters work (category, price range)
  - [ ] Search functionality works
  - [ ] Images load correctly

- [ ] **Product Details**
  - [ ] Individual product page loads
  - [ ] All product info displays correctly
  - [ ] Related products shown
  - [ ] "Contact Seller" button works

- [ ] **Shopping Cart**
  - [ ] Add product to cart
  - [ ] Cart persists in localStorage
  - [ ] Update quantity
  - [ ] Remove item
  - [ ] Cart total calculates correctly
  - [ ] Multiple stores in one cart handled

### 3. 🏪 Stores & Geolocation

- [ ] **Store Listing**
  - [ ] `/stores` page loads
  - [ ] Store cards display correctly
  - [ ] Search by name works
  - [ ] Filter by category works

- [ ] **Nearby Stores**
  - [ ] `/stores/nearby` loads
  - [ ] Browser prompts for location permission
  - [ ] Map renders with Leaflet
  - [ ] Stores plotted on map
  - [ ] Distance calculation accurate
  - [ ] Fallback works if permission denied
  - [ ] Manual location input works

- [ ] **Individual Store**
  - [ ] `/stores/[slug]` page loads
  - [ ] Store info displays
  - [ ] Store products list correctly
  - [ ] Contact store button works

### 4. 💬 Real-Time Messaging

- [ ] **Conversations**
  - [ ] Create conversation from product page
  - [ ] Conversation list loads (`/messages`)
  - [ ] Select conversation displays chat
  - [ ] Product info shown in chat sidebar

- [ ] **Messaging**
  - [ ] Send text message
  - [ ] Message appears immediately (Socket.io)
  - [ ] Typing indicator shows when other user types
  - [ ] Message read receipts work
  - [ ] Messages persist on reload

- [ ] **Push Notifications**
  - [ ] Browser prompts for notification permission
  - [ ] New message triggers notification
  - [ ] Clicking notification opens conversation
  - [ ] Notification includes message preview

- [ ] **Block/Unblock**
  - [ ] Block user functionality works
  - [ ] Cannot send messages when blocked
  - [ ] Unblock user restores messaging

### 5. 💳 Stripe Payment Integration

- [ ] **Checkout**
  - [ ] Click "Proceder al Pago" redirects to checkout
  - [ ] Checkout session created
  - [ ] Order created with status "pendiente"

- [ ] **Stripe Checkout**
  - [ ] Redirects to Stripe Checkout page
  - [ ] Can enter test card: `4242 4242 4242 4242`
  - [ ] Expiry: any future date, CVC: any 3 digits
  - [ ] Payment succeeds

- [ ] **Post-Payment**
  - [ ] Redirected to success page
  - [ ] Order status updated to "enviado" (webhook)
  - [ ] Order visible in `/orders/history`
  - [ ] Payment visible in Stripe Dashboard

- [ ] **Webhook**
  - [ ] Stripe webhook endpoint accessible
  - [ ] Webhook signature verified
  - [ ] `checkout.session.completed` event handled
  - [ ] Order updated correctly

### 6. 📊 Seller Dashboard

- [ ] **Dashboard Access**
  - [ ] Only sellers can access `/dashboard/seller`
  - [ ] Dashboard loads without errors

- [ ] **Analytics**
  - [ ] Total revenue displays
  - [ ] Total sales count displays
  - [ ] Sales by day chart renders
  - [ ] Sales by hour heatmap renders
  - [ ] Top products list shows

- [ ] **Export**
  - [ ] CSV export button works
  - [ ] Downloaded CSV has correct data format

### 7. 🔔 Push Notifications

- [ ] **Setup**
  - [ ] VAPID keys configured correctly
  - [ ] Service worker registered (`/sw.js`)
  - [ ] User can subscribe to push

- [ ] **Delivery**
  - [ ] Test notification sent via `/api/notifications/send`
  - [ ] Notification received on device
  - [ ] Notification click opens correct URL
  - [ ] Expired subscriptions cleaned up

### 8. 🎨 UI/UX & Responsiveness

- [ ] **Desktop (1920px)**
  - [ ] All pages render correctly
  - [ ] No horizontal scroll
  - [ ] Navigation works

- [ ] **Tablet (768px)**
  - [ ] Responsive layout adjusts
  - [ ] Sidebar collapses appropriately
  - [ ] Touch interactions work

- [ ] **Mobile (375px)**
  - [ ] Mobile navigation visible
  - [ ] Bottom nav bar accessible
  - [ ] All features usable
  - [ ] No elements cut off

- [ ] **Dark Mode**
  - [ ] Toggle between light/dark
  - [ ] System preference detected
  - [ ] Theme persists on reload
  - [ ] All components styled correctly

- [ ] **Images**
  - [ ] All images have `alt` text
  - [ ] Images use Next.js `<Image>` component
  - [ ] `sizes` prop set for responsive images
  - [ ] No "missing sizes prop" warnings

### 9. ⚡ Performance

- [ ] **Lighthouse Score** (Production build)
  - [ ] Performance > 90
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 90

- [ ] **Core Web Vitals**
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1

- [ ] **Load Times**
  - [ ] Homepage loads < 3s
  - [ ] Product pages load < 3s
  - [ ] No excessive API calls

### 10. 🐛 Error Handling

- [ ] **404 Pages**
  - [ ] Custom 404 page displays
  - [ ] Navigation back to home works

- [ ] **API Errors**
  - [ ] Network errors show user-friendly messages
  - [ ] 500 errors don't expose stack traces
  - [ ] Retry logic for failed requests (if applicable)

- [ ] **Form Validation**
  - [ ] Client-side validation works
  - [ ] Server-side validation works
  - [ ] Error messages display clearly

---

## 🔍 Final Production Checks

### Pre-Launch

- [ ] All staging tests passed
- [ ] Stakeholders approved
- [ ] Backup of current production (if replacing existing)
- [ ] Rollback plan documented
- [ ] Team notified of deployment time
- [ ] Maintenance page ready (if needed)

### Deployment

- [ ] DNS records updated (if applicable)
- [ ] SSL certificate valid and auto-renewal configured
- [ ] Application deployed
- [ ] Database migrations run
- [ ] PM2 processes running (`pm2 list`)
- [ ] Nginx/reverse proxy configured
- [ ] Health check endpoint responding (`/api/health`)

### Post-Launch

- [ ] All critical features tested on production
- [ ] Error monitoring active (Sentry, etc.)
- [ ] Analytics tracking confirmed (Google Analytics)
- [ ] Performance monitoring active
- [ ] Backup verification (test restore)
- [ ] Load testing passed (if applicable)
- [ ] Security scan passed (Snyk, npm audit)

### Monitoring (First 24 Hours)

- [ ] Monitor error rates
- [ ] Monitor response times
- [ ] Monitor database performance
- [ ] Monitor server resources (CPU, RAM, disk)
- [ ] Monitor user traffic
- [ ] Check logs for anomalies
- [ ] Stripe webhook delivery confirmed

---

## 📞 Emergency Contacts

**In case of critical issues:**

- **DevOps Lead:** [Name] - [Email/Phone]
- **Backend Lead:** [Name] - [Email/Phone]
- **Database Admin:** [Name] - [Email/Phone]
- **Stripe Support:** https://support.stripe.com

---

## 🔄 Rollback Procedure

If critical issues arise after deployment:

```bash
# 1. Stop current application
pm2 stop textisur

# 2. Revert to previous Git commit
git reset --hard <previous-commit-hash>

# 3. Rebuild
npm run build

# 4. Restore database backup (if migrations were run)
mysql -u user -p database < backup_YYYYMMDD.sql

# 5. Restart application
pm2 restart textisur

# 6. Verify rollback successful
curl https://your-domain.com/api/health
```

---

**✅ Once all items are checked, you're ready for production! 🚀**
