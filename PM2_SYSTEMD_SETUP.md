# PM2 + Systemd Startup Configuration

## Quick Setup

Run these commands on your production server to ensure PM2 starts on system boot:

```bash
# 1. Start PM2 as your user (not root)
pm2 start ecosystem.config.js --env production

# 2. Save the PM2 process list
pm2 save

# 3. Generate and configure systemd startup script
pm2 startup systemd -u $USER --hp $HOME

# This will output a command like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u yourusername --hp /home/yourusername
# COPY AND RUN THAT COMMAND!

# 4. Verify PM2 startup is enabled
systemctl status pm2-$USER
```

---

## Manual systemd Configuration

If you prefer to create the systemd service manually:

### 1. Create Service File

```bash
sudo nano /etc/systemd/system/textisur.service
```

### 2. Add Service Configuration

```ini
[Unit]
Description=TextiSur - E-commerce Platform
Documentation=https://github.com/yourusername/textisur
After=network.target mysql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/textisur

# Environment
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=/var/www/textisur/.env.production

# PM2 runtime
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production --no-daemon
ExecReload=/usr/bin/pm2 reload ecosystem.config.js --env production
ExecStop=/usr/bin/pm2 stop ecosystem.config.js

# Restart policy
Restart=on-failure
RestartSec=10s
KillMode=process

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

### 3. Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable textisur.service

# Start service now
sudo systemctl start textisur.service

# Check status
sudo systemctl status textisur.service
```

---

## Service Management Commands

```bash
# Start service
sudo systemctl start textisur

# Stop service
sudo systemctl stop textisur

# Restart service
sudo systemctl restart textisur

# Reload configuration
sudo systemctl reload textisur

# Check status
sudo systemctl status textisur

# View logs
sudo journalctl -u textisur -f

# View last 100 lines
sudo journalctl -u textisur -n 100

# Disable service (won't start on boot)
sudo systemctl disable textisur

# Re-enable service
sudo systemctl enable textisur
```

---

## Testing Boot Behavior

```bash
# 1. Reboot the server
sudo reboot

# 2. After reboot, SSH back in and check
systemctl status textisur
pm2 list

# 3. Check if app is responding
curl http://localhost:3000/api/health
```

---

## Monitoring with PM2

Even with systemd, PM2 provides better process management. Use both:

```bash
# View all PM2 processes
pm2 list

# Monitor in real-time
pm2 monit

# View logs
pm2 logs textisur

# View logs for specific process
pm2 logs textisur --lines 100

# Flush logs
pm2 flush

# Restart specific process
pm2 restart textisur

# Reload with zero-downtime
pm2 reload textisur

# Get detailed info
pm2 info textisur
```

---

## Advanced: PM2 with systemd (Recommended)

This is the best approach - systemd starts PM2, PM2 manages Node.js:

### 1. Setup PM2 Startup
```bash
# As your deployment user (not root)
pm2 startup systemd

# Follow the command it outputs (run with sudo)
# Example: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
```

### 2. Configure PM2 Processes
```bash
# Start your app
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Verify saved
cat ~/.pm2/dump.pm2
```

### 3. Test Automatic Recovery
```bash
# Kill PM2 daemon
pm2 kill

# Wait a few seconds, systemd should restart it
sleep 5

# Check if PM2 and apps are back
pm2 list
```

---

## Troubleshooting

### PM2 doesn't start on boot

```bash
# Check if systemd service exists
systemctl status pm2-$USER

# If not, run startup command again
pm2 startup systemd

# Verify service file
cat /etc/systemd/system/pm2-$USER.service

# Manually enable
sudo systemctl enable pm2-$USER
```

### App starts but crashes immediately

```bash
# Check PM2 logs
pm2 logs textisur --err --lines 50

# Check if .env.production exists
ls -la /var/www/textisur/.env.production

# Verify permissions
ls -la /var/www/textisur/

# Check if port is available
lsof -i :3000
```

### High memory usage after restart

```bash
# Check PM2 memory usage
pm2 list

# Restart PM2 daemon
pm2 kill
pm2 resurrect

# Monitor memory
pm2 monit
```

---

## Environment-Specific Startup

If you have multiple environments on the same server:

```bash
# Production
pm2 start ecosystem.config.js --env production --name textisur-prod
pm2 save

# Staging
pm2 start ecosystem.config.js --env staging --name textisur-staging
pm2 save

# Development
pm2 start ecosystem.config.js --env development --name textisur-dev --watch
pm2 save
```

---

## Log Rotation

PM2 logs can grow large. Configure rotation:

```bash
# Install PM2 log rotation
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:compress true
```

---

## Quick Reference Card

```bash
# STARTUP
pm2 startup systemd           # Generate startup script
pm2 save                       # Save process list
systemctl enable pm2-$USER     # Enable systemd service

# MANAGEMENT
pm2 start ecosystem.config.js  # Start app
pm2 stop textisur              # Stop app
pm2 restart textisur           # Restart app
pm2 reload textisur            # Zero-downtime reload
pm2 delete textisur            # Remove from PM2

# MONITORING
pm2 list                       # List processes
pm2 monit                      # Monitor real-time
pm2 logs textisur              # Stream logs
pm2 info textisur              # Process details

# SYSTEMD
systemctl status pm2-$USER     # Check PM2 service
journalctl -u pm2-$USER -f     # Stream systemd logs
systemctl restart pm2-$USER    # Restart PM2 daemon
```

---

**Note:** Replace `$USER` with your actual username or the user running the application (e.g., `www-data`, `deploy`, etc.)
