# 🚀 Pulsar Deployment Scripts

This directory contains automated deployment and maintenance scripts for the Pulsar platform.

## 📋 Available Scripts

### **`deploy.sh`** - Automated Deployment
Complete automated deployment script for Ubuntu servers with Nginx and SSL.

**Usage:**
```bash
# Make script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

**What it does:**
- ✅ Installs Node.js, PostgreSQL, Nginx, Certbot
- ✅ Configures firewall (UFW)
- ✅ Sets up database with secure credentials
- ✅ Deploys application with PM2
- ✅ Configures Nginx reverse proxy
- ✅ Obtains SSL certificate (Let's Encrypt)
- ✅ Sets up automated backups
- ✅ Configures monitoring

**Requirements:**
- Ubuntu 20.04 LTS or newer
- Domain name pointing to server
- Root/sudo access

---

### **`health-check.sh`** - System Health Check
Comprehensive health check for deployed Pulsar applications.

**Usage:**
```bash
# Run health check
./scripts/health-check.sh
```

**What it checks:**
- ✅ System services (Nginx, PostgreSQL, PM2)
- ✅ Application status and configuration
- ✅ Database connectivity and data
- ✅ Network connectivity and SSL
- ✅ Firewall configuration
- ✅ SSL certificate status
- ✅ Log files and backup configuration
- ✅ System performance metrics

---

## 🔧 Manual Deployment

If you prefer manual deployment, follow the comprehensive guide in:
**[`docs/DEPLOYMENT_GUIDE.md`](../docs/DEPLOYMENT_GUIDE.md)**

---

## 🎯 Quick Start

### **1. Automated Deployment**
```bash
# Clone repository
git clone https://github.com/your-username/pulsar.git
cd pulsar

# Run deployment script
./scripts/deploy.sh
```

### **2. Verify Deployment**
```bash
# Run health check
./scripts/health-check.sh
```

### **3. Access Your Application**
```
https://yourdomain.com
```

---

## 🔒 Security Notes

- **Database Password**: Generated automatically and displayed during deployment
- **NextAuth Secret**: Generated automatically and displayed during deployment
- **Environment File**: Located at `/opt/pulsar/.env.production` with restricted permissions
- **Firewall**: UFW configured to allow only necessary ports (22, 80, 443)
- **SSL**: Let's Encrypt certificate with auto-renewal

---

## 📊 Post-Deployment

### **Essential Commands**
```bash
# Check application status
sudo -u pulsar pm2 status

# View application logs
sudo -u pulsar pm2 logs pulsar

# Restart application
sudo -u pulsar pm2 restart pulsar

# Check Nginx status
sudo systemctl status nginx

# Renew SSL certificate
sudo certbot renew

# Run health check
./scripts/health-check.sh
```

### **Configuration Files**
- **Application**: `/opt/pulsar/`
- **Environment**: `/opt/pulsar/.env.production`
- **Nginx**: `/etc/nginx/sites-available/pulsar`
- **PM2**: `/opt/pulsar/ecosystem.config.js`
- **Logs**: `/var/log/pulsar/`
- **Backups**: `/opt/backups/`

---

## 🆘 Troubleshooting

### **Common Issues**

**Application not starting:**
```bash
sudo -u pulsar pm2 logs pulsar
sudo -u pulsar pm2 restart pulsar
```

**Nginx errors:**
```bash
sudo nginx -t
sudo systemctl restart nginx
tail -f /var/log/nginx/error.log
```

**Database connection:**
```bash
sudo -u postgres psql pulsar_production
# Check connection and data
```

**SSL certificate:**
```bash
sudo certbot certificates
sudo certbot renew
```

### **Getting Help**

1. **Run health check**: `./scripts/health-check.sh`
2. **Check logs**: Application, Nginx, and system logs
3. **Verify configuration**: Environment variables and service configs
4. **Test connectivity**: Database, external services, and domain resolution

---

## 📚 Documentation

- **[Complete Deployment Guide](../docs/DEPLOYMENT_GUIDE.md)** - Detailed manual instructions
- **[Developer Guide](../docs/DEVELOPER_GUIDE.md)** - Architecture and development
- **[Project README](../README.md)** - Project overview and setup

---

*These scripts are designed for production deployment on Ubuntu servers. Always test in a staging environment first.*
