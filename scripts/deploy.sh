#!/bin/bash

# 🚀 Pulsar Production Deployment Script
# Automated setup for Ubuntu with Nginx and SSL

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
DB_PASSWORD=""
NEXTAUTH_SECRET=""
APP_USER="pulsar"
APP_DIR="/opt/pulsar"
REPO_URL=""

# Functions
print_header() {
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_requirements() {
    print_header "Checking Requirements"
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root for security reasons"
        print_warning "Please run as a regular user with sudo privileges"
        exit 1
    fi
    
    # Check Ubuntu version
    if ! grep -q "Ubuntu" /etc/os-release; then
        print_error "This script is designed for Ubuntu"
        exit 1
    fi
    
    # Check internet connectivity
    if ! ping -c 1 google.com &> /dev/null; then
        print_error "No internet connection detected"
        exit 1
    fi
    
    print_success "Requirements check passed"
}

get_configuration() {
    print_header "Configuration Setup"
    
    # Get domain name
    if [[ -z "$DOMAIN" ]]; then
        read -p "Enter your domain name (e.g., example.com): " DOMAIN
        if [[ -z "$DOMAIN" ]]; then
            print_error "Domain name is required"
            exit 1
        fi
    fi
    
    # Get repository URL
    if [[ -z "$REPO_URL" ]]; then
        read -p "Enter repository URL (e.g., https://github.com/user/pulsar.git): " REPO_URL
        if [[ -z "$REPO_URL" ]]; then
            print_error "Repository URL is required"
            exit 1
        fi
    fi
    
    # Generate secure passwords if not provided
    if [[ -z "$DB_PASSWORD" ]]; then
        DB_PASSWORD=$(openssl rand -base64 32)
        print_warning "Generated database password: $DB_PASSWORD"
        print_warning "Please save this password securely!"
    fi
    
    if [[ -z "$NEXTAUTH_SECRET" ]]; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        print_warning "Generated NextAuth secret: $NEXTAUTH_SECRET"
        print_warning "Please save this secret securely!"
    fi
    
    print_success "Configuration completed"
}

install_system_packages() {
    print_header "Installing System Packages"
    
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install essential packages
    sudo apt install -y curl wget git unzip software-properties-common
    
    # Install Node.js
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Install PM2 globally
    sudo npm install -g pm2
    
    # Install Nginx
    sudo apt install -y nginx
    
    # Install PostgreSQL
    sudo apt install -y postgresql postgresql-contrib
    
    # Install Certbot
    sudo apt install -y snapd
    sudo snap install core && sudo snap refresh core
    sudo snap install --classic certbot
    sudo ln -sf /snap/bin/certbot /usr/bin/certbot
    
    print_success "System packages installed"
}

setup_firewall() {
    print_header "Configuring Firewall"
    
    # Configure UFW
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    
    print_success "Firewall configured"
}

setup_database() {
    print_header "Setting up PostgreSQL Database"
    
    # Start PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Create database and user
    sudo -u postgres psql <<EOF
CREATE DATABASE pulsar_production;
CREATE USER pulsar_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE pulsar_production TO pulsar_user;
ALTER USER pulsar_user CREATEDB;
\q
EOF
    
    print_success "Database setup completed"
}

create_app_user() {
    print_header "Creating Application User"
    
    # Create application user if it doesn't exist
    if ! id "$APP_USER" &>/dev/null; then
        sudo useradd -m -s /bin/bash $APP_USER
        sudo usermod -aG sudo $APP_USER
        print_success "User $APP_USER created"
    else
        print_warning "User $APP_USER already exists"
    fi
}

deploy_application() {
    print_header "Deploying Application"
    
    # Create application directory
    sudo mkdir -p $APP_DIR
    sudo chown $APP_USER:$APP_USER $APP_DIR
    
    # Clone repository
    sudo -u $APP_USER git clone $REPO_URL $APP_DIR
    
    # Set permissions
    sudo chown -R $APP_USER:$APP_USER $APP_DIR
    
    # Install dependencies
    cd $APP_DIR
    sudo -u $APP_USER npm ci
    
    # Create environment file
    sudo -u $APP_USER tee .env.production > /dev/null <<EOF
DATABASE_URL="postgresql://pulsar_user:$DB_PASSWORD@localhost:5432/pulsar_production"
NEXTAUTH_URL="https://$DOMAIN"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NODE_ENV="production"
PORT=3000
EOF
    
    # Set secure permissions on env file
    chmod 600 .env.production
    
    # Generate Prisma client and run migrations
    sudo -u $APP_USER npx prisma generate
    sudo -u $APP_USER npx prisma migrate deploy
    sudo -u $APP_USER npx prisma db seed
    
    # Build application
    sudo -u $APP_USER npm run build
    
    print_success "Application deployed"
}

setup_pm2() {
    print_header "Setting up PM2 Process Manager"
    
    # Create PM2 ecosystem file
    sudo -u $APP_USER tee $APP_DIR/ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [{
    name: 'pulsar',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
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
    max_memory_restart: '1G'
  }]
}
EOF
    
    # Create log directory
    sudo mkdir -p /var/log/pulsar
    sudo chown $APP_USER:$APP_USER /var/log/pulsar
    
    # Start application with PM2
    cd $APP_DIR
    sudo -u $APP_USER pm2 start ecosystem.config.js
    sudo -u $APP_USER pm2 save
    
    # Setup PM2 startup
    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $APP_USER --hp /home/$APP_USER
    
    print_success "PM2 setup completed"
}

setup_nginx() {
    print_header "Configuring Nginx"
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/pulsar > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL certificates (will be generated by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # File upload size
    client_max_body_size 50M;
    
    # Static files
    location /_next/static/ {
        alias $APP_DIR/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /public/ {
        alias $APP_DIR/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/pulsar /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    if sudo nginx -t; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration is invalid"
        exit 1
    fi
    
    # Start Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    print_success "Nginx configured"
}

setup_ssl() {
    print_header "Setting up SSL Certificate"
    
    # Stop Nginx temporarily for standalone certificate
    sudo systemctl stop nginx
    
    # Obtain SSL certificate
    if sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN; then
        print_success "SSL certificate obtained"
    else
        print_error "Failed to obtain SSL certificate"
        print_warning "You may need to manually configure SSL"
    fi
    
    # Start Nginx
    sudo systemctl start nginx
    
    # Setup automatic renewal
    sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -
    
    print_success "SSL setup completed"
}

setup_monitoring() {
    print_header "Setting up Monitoring and Backups"
    
    # Create backup directory
    sudo mkdir -p /opt/backups
    sudo chown $APP_USER:$APP_USER /opt/backups
    
    # Create backup script
    sudo tee /opt/backups/backup.sh > /dev/null <<EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
DB_NAME="pulsar_production"
DB_USER="pulsar_user"

# Database backup
pg_dump -h localhost -U \$DB_USER -d \$DB_NAME | gzip > \$BACKUP_DIR/db_backup_\$DATE.sql.gz

# Application backup
tar -czf \$BACKUP_DIR/app_backup_\$DATE.tar.gz -C /opt pulsar --exclude=node_modules --exclude=.next

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF
    
    sudo chmod +x /opt/backups/backup.sh
    
    # Setup daily backup cron job
    sudo -u $APP_USER crontab -l | { cat; echo "0 2 * * * /opt/backups/backup.sh >> /var/log/backup.log 2>&1"; } | sudo -u $APP_USER crontab -
    
    print_success "Monitoring and backups configured"
}

verify_deployment() {
    print_header "Verifying Deployment"
    
    # Check services
    if sudo systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
    else
        print_error "Nginx is not running"
    fi
    
    if sudo systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL is running"
    else
        print_error "PostgreSQL is not running"
    fi
    
    if sudo -u $APP_USER pm2 list | grep -q "online"; then
        print_success "Application is running"
    else
        print_error "Application is not running"
    fi
    
    # Test HTTP response
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
        print_success "Application responds to HTTP requests"
    else
        print_error "Application not responding to HTTP requests"
    fi
    
    print_success "Deployment verification completed"
}

print_summary() {
    print_header "Deployment Summary"
    
    echo -e "${GREEN}🎉 Pulsar has been successfully deployed!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Summary:${NC}"
    echo -e "  • Domain: https://$DOMAIN"
    echo -e "  • Application: Running on PM2"
    echo -e "  • Database: PostgreSQL with user 'pulsar_user'"
    echo -e "  • SSL: Let's Encrypt certificate"
    echo -e "  • Firewall: UFW enabled"
    echo -e "  • Backups: Daily automated backups"
    echo ""
    echo -e "${YELLOW}🔧 Next Steps:${NC}"
    echo -e "  1. Configure OAuth providers in .env.production"
    echo -e "  2. Setup email service (optional)"
    echo -e "  3. Configure file upload service (optional)"
    echo -e "  4. Test all functionality"
    echo -e "  5. Setup monitoring alerts"
    echo ""
    echo -e "${YELLOW}💡 Useful Commands:${NC}"
    echo -e "  • Check application: sudo -u $APP_USER pm2 status"
    echo -e "  • View logs: sudo -u $APP_USER pm2 logs pulsar"
    echo -e "  • Restart app: sudo -u $APP_USER pm2 restart pulsar"
    echo -e "  • Check Nginx: sudo systemctl status nginx"
    echo -e "  • Renew SSL: sudo certbot renew"
    echo ""
    echo -e "${RED}🔒 Security Note:${NC}"
    echo -e "  Database password: $DB_PASSWORD"
    echo -e "  NextAuth secret: $NEXTAUTH_SECRET"
    echo -e "  Please save these credentials securely!"
}

# Main execution
main() {
    print_header "🚀 Pulsar Production Deployment"
    echo "This script will deploy Pulsar on Ubuntu with Nginx and SSL"
    echo ""
    
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 1
    fi
    
    check_requirements
    get_configuration
    install_system_packages
    setup_firewall
    create_app_user
    setup_database
    deploy_application
    setup_pm2
    setup_nginx
    setup_ssl
    setup_monitoring
    verify_deployment
    print_summary
}

# Run main function
main "$@"
