# 🚀 Pulsar Production Deployment Guide

> **Complete guide for deploying Pulsar on Ubuntu with Nginx, SSL, and domain configuration**

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Server Setup](#-server-setup)
- [Database Setup (PostgreSQL)](#-database-setup-postgresql)
- [Application Deployment](#-application-deployment)
- [Nginx Configuration](#-nginx-configuration)
- [SSL Certificate Setup](#-ssl-certificate-setup)
- [Domain Configuration](#-domain-configuration)
- [Process Management (PM2)](#-process-management-pm2)
- [Environment Configuration](#-environment-configuration)
- [Security Hardening](#-security-hardening)
- [Monitoring & Logs](#-monitoring--logs)
- [Backup Strategy](#-backup-strategy)
- [Troubleshooting](#-troubleshooting)
- [Maintenance](#-maintenance)

---

## 🔧 Prerequisites

### **Server Requirements**
- **Ubuntu 20.04 LTS** or newer
- **2GB RAM** minimum (4GB recommended)
- **20GB disk space** minimum
- **Root or sudo access**
- **Public IP address**
- **Domain name** pointing to your server

### **Local Requirements**
- **Git** for code deployment
- **SSH access** to your server
- **Domain registrar access** for DNS configuration

---

## 🖥️ Server Setup

### **1. Initial Server Setup**

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Create application user (optional but recommended)
sudo useradd -m -s /bin/bash pulsar
sudo usermod -aG sudo pulsar

# Switch to application user
sudo su - pulsar
```

### **2. Install Node.js (using NodeSource)**

```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher

# Install global packages
sudo npm install -g pm2
```

### **3. Install Nginx**

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx

# Allow through firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow 'OpenSSH'
sudo ufw enable
```

---

## 🗄️ Database Setup (PostgreSQL)

### **1. Install PostgreSQL**

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

### **2. Configure PostgreSQL**

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE pulsar_production;
CREATE USER pulsar_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE pulsar_production TO pulsar_user;
ALTER USER pulsar_user CREATEDB;
\q

# Edit PostgreSQL configuration for remote connections (if needed)
sudo nano /etc/postgresql/14/main/postgresql.conf
# Uncomment and set: listen_addresses = 'localhost'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: local   pulsar_production   pulsar_user   md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### **3. Test Database Connection**

```bash
# Test connection
psql -h localhost -U pulsar_user -d pulsar_production
# Enter password when prompted
\q
```

---

## 📦 Application Deployment

### **1. Clone Repository**

```bash
# Navigate to web directory
cd /opt
sudo mkdir pulsar
sudo chown pulsar:pulsar pulsar
cd pulsar

# Clone the repository
git clone https://github.com/your-username/pulsar.git .

# Set correct permissions
sudo chown -R pulsar:pulsar /opt/pulsar
```

### **2. Install Dependencies**

```bash
# Install Node.js dependencies
npm ci --production

# Install development dependencies for build
npm install
```

### **3. Environment Configuration**

```bash
# Create production environment file
nano .env.production

# Add the following content (customize values):
```

```env
# Database Configuration
DATABASE_URL="postgresql://pulsar_user:your_secure_password_here@localhost:5432/pulsar_production"

# NextAuth Configuration
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-a-secure-random-string-here-32-characters-minimum"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"

# Email Configuration (Optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# File Upload Configuration
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# AI Services (Optional)
OPENAI_API_KEY="your-openai-api-key"
REPLICATE_API_TOKEN="your-replicate-token"

# Production Environment
NODE_ENV="production"
PORT=3000
```

### **4. Database Migration**

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database (optional)
npx prisma db seed
```

### **5. Build Application**

```bash
# Build for production
npm run build

# Test production build locally
npm start
# Should start on http://localhost:3000
# Stop with Ctrl+C
```

---

## 🌐 Nginx Configuration

### **1. Create Nginx Configuration**

```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/pulsar
```

Add the following configuration:

```nginx
# /etc/nginx/sites-available/pulsar
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (will be added later)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate no_last_modified no_etag auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # File Upload Size
    client_max_body_size 50M;
    
    # Static Files
    location /_next/static/ {
        alias /opt/pulsar/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /public/ {
        alias /opt/pulsar/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API Rate Limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Auth Rate Limiting
    location ~ ^/api/auth/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Main Application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Error Pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

### **2. Enable Site Configuration**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/pulsar /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 SSL Certificate Setup

### **1. Install Certbot**

```bash
# Install Certbot
sudo apt install -y snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Create symlink
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### **2. Obtain SSL Certificate**

```bash
# Stop Nginx temporarily
sudo systemctl stop nginx

# Obtain certificate (replace yourdomain.com with your actual domain)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Start Nginx
sudo systemctl start nginx

# Test automatic renewal
sudo certbot renew --dry-run
```

### **3. Setup Auto-renewal**

```bash
# Create renewal script
sudo nano /etc/cron.d/certbot
```

Add the following content:

```bash
# /etc/cron.d/certbot
0 12 * * * root test -x /usr/bin/certbot -a \! -d /run/systemd/system && perl -e 'sleep int(rand(43200))' && certbot -q renew --nginx
```

---

## 🌍 Domain Configuration

### **1. DNS Configuration**

Configure your domain's DNS records with your domain registrar:

```dns
# A Records
yourdomain.com     A     YOUR_SERVER_IP
www.yourdomain.com A     YOUR_SERVER_IP

# Optional: CNAME for subdomains
api.yourdomain.com CNAME yourdomain.com
```

### **2. Test Domain Resolution**

```bash
# Test DNS resolution
nslookup yourdomain.com
dig yourdomain.com

# Test from external site
# Visit: https://www.whatsmydns.net/#A/yourdomain.com
```

---

## 🔄 Process Management (PM2)

### **1. Create PM2 Configuration**

```bash
# Create PM2 ecosystem file
nano /opt/pulsar/ecosystem.config.js
```

Add the following configuration:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'pulsar',
    script: 'npm',
    args: 'start',
    cwd: '/opt/pulsar',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    error_file: '/var/log/pulsar/error.log',
    out_file: '/var/log/pulsar/out.log',
    log_file: '/var/log/pulsar/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
```

### **2. Setup Log Directory**

```bash
# Create log directory
sudo mkdir -p /var/log/pulsar
sudo chown pulsar:pulsar /var/log/pulsar

# Setup log rotation
sudo nano /etc/logrotate.d/pulsar
```

Add the following content:

```bash
# /etc/logrotate.d/pulsar
/var/log/pulsar/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 pulsar pulsar
    postrotate
        pm2 reload ecosystem.config.js
    endscript
}
```

### **3. Start Application with PM2**

```bash
# Start application
cd /opt/pulsar
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command

# Check application status
pm2 status
pm2 logs pulsar
```

---

## ⚙️ Environment Configuration

### **1. Production Environment Variables**

Create a comprehensive `.env.production` file:

```bash
nano /opt/pulsar/.env.production
```

```env
# Database
DATABASE_URL="postgresql://pulsar_user:your_secure_password@localhost:5432/pulsar_production"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-32-character-minimum-secret-key-here"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (Optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# File Storage
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# AI Services (Optional)
OPENAI_API_KEY="your-openai-api-key"

# Production Settings
NODE_ENV="production"
PORT=3000
```

### **2. Secure Environment File**

```bash
# Set proper permissions
chmod 600 /opt/pulsar/.env.production
chown pulsar:pulsar /opt/pulsar/.env.production
```

---

## 🛡️ Security Hardening

### **1. Firewall Configuration**

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5432/tcp  # PostgreSQL (local only)
sudo ufw enable

# Check status
sudo ufw status verbose
```

### **2. SSH Security**

```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Recommended settings:
# Port 22 (or change to non-standard port)
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
# AllowUsers pulsar

# Restart SSH
sudo systemctl restart ssh
```

### **3. Fail2Ban Installation**

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure Fail2Ban
sudo nano /etc/fail2ban/jail.local
```

Add the following configuration:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
ignoreip = 127.0.0.1/8

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
```

Start Fail2Ban:

```bash
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

---

## 📊 Monitoring & Logs

### **1. Application Monitoring**

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs pulsar
pm2 logs pulsar --lines 100

# Application status
pm2 status
pm2 info pulsar
```

### **2. System Monitoring**

```bash
# System resource usage
htop
free -h
df -h

# Database status
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"

# Nginx status
sudo systemctl status nginx
sudo nginx -t
```

### **3. Log Files Location**

```bash
# Application logs
/var/log/pulsar/

# Nginx logs
/var/log/nginx/access.log
/var/log/nginx/error.log

# System logs
/var/log/syslog
/var/log/auth.log

# PostgreSQL logs
/var/log/postgresql/
```

---

## 💾 Backup Strategy

### **1. Database Backup Script**

```bash
# Create backup directory
sudo mkdir -p /opt/backups
sudo chown pulsar:pulsar /opt/backups

# Create backup script
nano /opt/backups/backup.sh
```

Add the following script:

```bash
#!/bin/bash
# Database backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
DB_NAME="pulsar_production"
DB_USER="pulsar_user"

# Create database backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Create application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /opt pulsar --exclude=node_modules --exclude=.next

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and schedule:

```bash
chmod +x /opt/backups/backup.sh

# Add to crontab
crontab -e
# Add line: 0 2 * * * /opt/backups/backup.sh >> /var/log/backup.log 2>&1
```

### **2. Application Files Backup**

```bash
# Manual backup
tar -czf /opt/backups/manual_backup_$(date +%Y%m%d).tar.gz -C /opt pulsar --exclude=node_modules --exclude=.next
```

---

## 🔧 Troubleshooting

### **Common Issues and Solutions**

#### **Application Won't Start**

```bash
# Check PM2 logs
pm2 logs pulsar

# Check environment variables
pm2 env 0

# Restart application
pm2 restart pulsar

# Check database connection
cd /opt/pulsar
npx prisma db pull
```

#### **Nginx Issues**

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### **SSL Certificate Issues**

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Test certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

#### **Database Connection Issues**

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U pulsar_user -d pulsar_production

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### **Performance Issues**

```bash
# Check system resources
htop
free -h
df -h

# Check PM2 resource usage
pm2 monit

# Optimize database
sudo -u postgres psql pulsar_production -c "VACUUM ANALYZE;"
```

---

## 🔄 Maintenance

### **Regular Maintenance Tasks**

#### **Weekly Tasks**

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Check application logs
pm2 logs pulsar --lines 100

# Check disk space
df -h

# Verify backups
ls -la /opt/backups/
```

#### **Monthly Tasks**

```bash
# Update Node.js packages (test in staging first)
cd /opt/pulsar
npm audit
npm update

# Database maintenance
sudo -u postgres psql pulsar_production -c "VACUUM ANALYZE;"

# Log rotation check
sudo logrotate -d /etc/logrotate.d/pulsar
```

### **Application Updates**

```bash
# 1. Backup current version
tar -czf /opt/backups/pre_update_$(date +%Y%m%d).tar.gz -C /opt pulsar

# 2. Pull latest code
cd /opt/pulsar
git fetch origin
git checkout main
git pull origin main

# 3. Install dependencies
npm ci

# 4. Run migrations
npx prisma migrate deploy

# 5. Build application
npm run build

# 6. Restart with PM2
pm2 restart pulsar

# 7. Verify deployment
pm2 status
curl -I https://yourdomain.com
```

---

## ✅ Deployment Checklist

### **Pre-deployment**
- [ ] Domain DNS configured
- [ ] Server provisioned and secured
- [ ] SSL certificate ready
- [ ] Environment variables configured
- [ ] Database credentials secured

### **Deployment**
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Database migrated and seeded
- [ ] Application built successfully
- [ ] PM2 configured and running
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Firewall configured

### **Post-deployment**
- [ ] Application accessible via HTTPS
- [ ] Authentication working
- [ ] Database operations working
- [ ] File uploads working (if configured)
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Performance optimized

---

## 📞 Support

If you encounter issues during deployment:

1. **Check logs**: Application, Nginx, and system logs
2. **Verify configuration**: Environment variables and service configurations
3. **Test connectivity**: Database, external services, and domain resolution
4. **Review security**: Firewall rules and SSL certificates

---

*This deployment guide provides comprehensive instructions for production deployment of the Pulsar platform. Follow each step carefully and test thoroughly before going live.*

**Last Updated**: June 27, 2025 | **Version**: 1.0 | **Status**: Production Ready 🚀
