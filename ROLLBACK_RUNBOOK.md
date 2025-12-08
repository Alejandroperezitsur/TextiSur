# 🔄 TextiSur - Production Rollback Runbook

## 📋 Overview

This runbook provides step-by-step instructions for rolling back a failed production deployment of TextiSur.

**Time to Complete:** ~5-10 minutes  
**Required Access:** SSH access to production server, database credentials  
**Team Contacts:**
- On-call Engineer: [Name] - [Phone]
- Database Admin: [Name] - [Phone]
- DevOps Lead: [Name] - [Phone]

---

## 🚨 When to Execute Rollback

Execute this runbook when:
- ✅ Critical functionality is broken (login, checkout, messaging)
- ✅ Error rate exceeds 5% for >5 minutes
- ✅ Database migration caused data corruption
- ✅ Server resources exhausted (CPU >90%, RAM >95%)
- ✅ Stripe webhook failures
- ✅ Deployment verification failed

**Do NOT rollback for:**
- ❌ Minor UI issues that don't affect functionality
- ❌ Non-critical bugs with workarounds
- ❌ Performance degradation <20%

---

## ⚡ Quick Rollback (5 minutes)

### Step 1: Stop Current Application
```bash
# SSH into production server
ssh user@your-production-server

# Navigate to app directory
cd /var/www/textisur

# Stop PM2 process
pm2 stop textisur

# Verify stopped
pm2 list
```

### Step 2: Revert Code to Previous Version
```bash
# Check current commit
git log -1 --oneline

# Find previous stable commit
git log --oneline -10

# Revert to previous commit (replace COMMIT_HASH)
git reset --hard <PREVIOUS_COMMIT_HASH>

# Alternative: Revert specific commit
# git revert <BAD_COMMIT_HASH> --no-edit
```

### Step 3: Restore Database (if migrations were run)
```bash
# List available backups
ls -lh /backups/mysql/ | tail -5

# Identify backup before deployment (format: textisur_YYYYMMDD_HHMM.sql)
BACKUP_FILE="/backups/mysql/textisur_20241207_1800.sql"

# Stop application if not already stopped
pm2 stop textisur

# Restore database
mysql -u textisur_user -p textisur_prod < $BACKUP_FILE

# Verify restoration
mysql -u textisur_user -p textisur_prod -e "SELECT COUNT(*) FROM users;"
```

### Step 4: Rebuild Application
```bash
# Clear build cache
rm -rf .next

# Install dependencies (matching package-lock.json)
npm ci --production

# Build application
npm run build

# Verify build completed
ls -lh .next
```

### Step 5: Restart Application
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Monitor logs for errors
pm2 logs textisur --lines 50

# Check process status
pm2 status

# Verify health endpoint
curl -fsS http://localhost:3000/api/health || echo "Health check failed"
```

### Step 6: Verify External Access
```bash
# Test from external location
curl -fsS https://your-domain.com/api/health

# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -50 /var/log/nginx/textisur-error.log
```

---

## 🔍 Detailed Rollback Procedures

### Scenario A: Code Deployment Failed

**Symptoms:** App won't start, build errors, import errors

**Rollback Steps:**
```bash
# 1. Stop application
pm2 stop textisur

# 2. Check recent commits
git log --oneline -5

# 3. Revert to last known good commit
git reset --hard <GOOD_COMMIT_HASH>

# 4. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm ci --production

# 5. Rebuild
npm run build

# 6. Restart
pm2 start ecosystem.config.js --env production
pm2 save
```

---

### Scenario B: Database Migration Failed

**Symptoms:** Database errors, missing columns, foreign key violations

**Rollback Steps:**
```bash
# 1. IMMEDIATELY stop application
pm2 stop textisur

# 2. Create emergency backup of current state
mysqldump -u textisur_user -p textisur_prod > /tmp/emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Restore from pre-deployment backup
mysql -u textisur_user -p textisur_prod < /backups/mysql/textisur_YYYYMMDD_HHMM.sql

# 4. Verify critical tables
mysql -u textisur_user -p textisur_prod -e "SHOW TABLES;"
mysql -u textisur_user -p textisur_prod -e "DESCRIBE users;"
mysql -u textisur_user -p textisur_prod -e "DESCRIBE orders;"

# 5. Test database connection
mysql -u textisur_user -p textisur_prod -e "SELECT COUNT(*) as user_count FROM users;"

# 6. Revert code to match database schema
git reset --hard <COMMIT_BEFORE_MIGRATION>

# 7. Rebuild and restart
npm run build
pm2 restart textisur
```

---

### Scenario C: Environment Variable Issues

**Symptoms:** 500 errors, authentication failures, Stripe/API errors

**Rollback Steps:**
```bash
# 1. Check current environment file
cat /var/www/textisur/.env.production | grep -v "SECRET\|KEY\|PASSWORD"

# 2. Restore from backup
cp /var/www/textisur/.env.production.backup /var/www/textisur/.env.production

# 3. Verify critical variables
grep -E "DATABASE_URL|JWT_SECRET|STRIPE" /var/www/textisur/.env.production

# 4. Restart application
pm2 restart textisur

# 5. Monitor for errors
pm2 logs textisur --lines 100
```

---

### Scenario D: Nginx Configuration Issues

**Symptoms:** 502 Bad Gateway, SSL errors, WebSocket failures

**Rollback Steps:**
```bash
# 1. Check Nginx status
sudo systemctl status nginx

# 2. Test current config
sudo nginx -t

# 3. Restore previous config
sudo cp /etc/nginx/sites-available/textisur.backup /etc/nginx/sites-available/textisur

# 4. Test restored config
sudo nginx -t

# 5. Reload Nginx
sudo systemctl reload nginx

# 6. Verify
curl -I https://your-domain.com
```

---

### Scenario E: PM2 Process Issues

**Symptoms:** App crashes, memory leaks, zombie processes

**Rollback Steps:**
```bash
# 1. Stop all PM2 processes
pm2 stop all

# 2. Delete PM2 save file
pm2 delete textisur
rm -f ~/.pm2/dump.pm2

# 3. Kill any zombie processes
ps aux | grep node
# kill -9 <PID> if needed

# 4. Clear PM2 logs
pm2 flush

# 5. Start fresh
pm2 start ecosystem.config.js --env production
pm2 save

# 6. Monitor
pm2 monit
```

---

## ✅ Post-Rollback Verification

### Critical Checks (Required)
- [ ] Health endpoint responds: `curl https://your-domain.com/api/health`
- [ ] User can login (test with known user)
- [ ] Homepage loads without errors
- [ ] Database queries working (check PM2 logs for errors)
- [ ] No 500 errors in Nginx logs: `tail -50 /var/log/nginx/textisur-error.log`

### Feature Checks (Recommended)
- [ ] Products page loads
- [ ] Shopping cart works
- [ ] Messaging opens (no WebSocket errors)
- [ ] Stripe checkout redirects correctly
- [ ] Seller dashboard loads

### Monitoring (Next 30 minutes)
- [ ] Monitor error rates in logs
- [ ] Watch PM2 memory usage: `pm2 monit`
- [ ] Check database connection count
- [ ] Monitor response times

---

## 📊 Metrics to Monitor

```bash
# Error rate
pm2 logs textisur | grep -i error | wc -l

# Memory usage
pm2 list | grep textisur

# Response time (via Nginx logs)
tail -100 /var/log/nginx/textisur-access.log | awk '{print $NF}' | sort -n

# Database connections
mysql -u textisur_user -p -e "SHOW PROCESSLIST;"

# Active PM2 restarts
pm2 info textisur | grep restart
```

---

## 🔔 Communication Template

**Slack/Email Notification:**

```
🚨 PRODUCTION ROLLBACK EXECUTED

Status: ✅ Completed / ⏳ In Progress / ❌ Failed
Time: [HH:MM UTC]
Duration: [X minutes]
Affected Services: TextiSur Production

Reason: 
[Brief description of why rollback was necessary]

Actions Taken:
✅ Application stopped
✅ Code reverted to commit: [HASH]
✅ Database restored from backup: [TIMESTAMP]
✅ Application restarted
✅ Verification tests passed

Current Status:
- Health Check: ✅ Passing
- User Login: ✅ Working
- Checkout: ✅ Working

Impact:
- Downtime: [X minutes]
- Affected Users: [Estimate if known]

Next Steps:
- Root cause analysis scheduled for [DATE/TIME]
- Fix will be prepared in staging environment
- Revised deployment planned for [DATE/TIME]

Point of Contact: [Your Name] - [Contact]
```

---

## 🛠️ Troubleshooting Common Issues

### "PM2 won't start application"
```bash
# Check PM2 logs
pm2 logs textisur --err --lines 100

# Try starting directly with Node
NODE_ENV=production node server.ts

# If port conflict
lsof -i :3000
kill -9 <PID>
```

### "Database restore fails"
```bash
# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Drop and recreate
mysql -u root -p -e "DROP DATABASE textisur_prod;"
mysql -u root -p -e "CREATE DATABASE textisur_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Restore again
mysql -u textisur_user -p textisur_prod < backup.sql
```

### "Nginx won't reload"
```bash
# Check for syntax errors
sudo nginx -t

# View error details
sudo journalctl -u nginx -n 50

# Force restart if needed
sudo systemctl restart nginx
```

---

## 📝 Post-Rollback Actions

### Immediate (Within 1 hour)
- [ ] Notify team of successful rollback
- [ ] Document incident in incident log
- [ ] Create post-mortem ticket
- [ ] Update status page (if applicable)

### Short-term (Within 24 hours)
- [ ] Conduct root cause analysis
- [ ] Fix issue in development environment
- [ ] Test fix in staging environment
- [ ] Prepare deployment plan with rollback strategy

### Long-term (Within 1 week)
- [ ] Review deployment process
- [ ] Update runbook based on lessons learned
- [ ] Improve monitoring/alerting
- [ ] Schedule post-mortem meeting

---

## 📚 Resources

- **Production Server:** ssh user@your-domain.com
- **Database Backups:** /backups/mysql/
- **Nginx Config:** /etc/nginx/sites-available/textisur
- **PM2 Logs:** `pm2 logs textisur`
- **Application Logs:** /var/www/textisur/logs/
- **Health Check:** https://your-domain.com/api/health

---

**Last Updated:** 2024-12-08  
**Version:** 1.0  
**Owner:** DevOps Team
