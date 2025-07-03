#!/bin/bash

# 🔍 Pulsar Deployment Verification Script
# Quick health check for deployed Pulsar application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

APP_USER="pulsar"
APP_DIR="/opt/pulsar"

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

check_system_services() {
    print_header "System Services Status"
    
    # Check Nginx
    if systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
        nginx_version=$(nginx -v 2>&1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
        echo "  Version: $nginx_version"
    else
        print_error "Nginx is not running"
    fi
    
    # Check PostgreSQL
    if systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL is running"
        pg_version=$(sudo -u postgres psql -t -c "SELECT version();" | head -1 | awk '{print $2}')
        echo "  Version: $pg_version"
    else
        print_error "PostgreSQL is not running"
    fi
    
    # Check PM2
    if sudo -u $APP_USER pm2 list | grep -q "pulsar"; then
        print_success "PM2 application is registered"
        sudo -u $APP_USER pm2 status | grep pulsar
    else
        print_error "PM2 application not found"
    fi
}

check_application() {
    print_header "Application Status"
    
    # Check if application directory exists
    if [[ -d "$APP_DIR" ]]; then
        print_success "Application directory exists: $APP_DIR"
    else
        print_error "Application directory not found: $APP_DIR"
        return 1
    fi
    
    # Check if .env.production exists
    if [[ -f "$APP_DIR/.env.production" ]]; then
        print_success "Environment file exists"
    else
        print_error "Environment file not found"
    fi
    
    # Check if node_modules exists
    if [[ -d "$APP_DIR/node_modules" ]]; then
        print_success "Node modules installed"
    else
        print_warning "Node modules not found"
    fi
    
    # Check if .next build directory exists
    if [[ -d "$APP_DIR/.next" ]]; then
        print_success "Application is built"
    else
        print_warning "Build directory not found - run 'npm run build'"
    fi
}

check_database() {
    print_header "Database Connection"
    
    # Test database connection
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw pulsar_production; then
        print_success "Database 'pulsar_production' exists"
        
        # Count tables
        table_count=$(sudo -u postgres psql -d pulsar_production -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
        echo "  Tables: $table_count"
        
        # Check if user table exists and has data
        if sudo -u postgres psql -d pulsar_production -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User');" | grep -q t; then
            user_count=$(sudo -u postgres psql -d pulsar_production -t -c "SELECT count(*) FROM \"User\";" | tr -d ' ')
            print_success "User table exists with $user_count users"
        else
            print_warning "User table not found - may need migration"
        fi
    else
        print_error "Database 'pulsar_production' not found"
    fi
}

check_network() {
    print_header "Network Connectivity"
    
    # Check if application responds on localhost
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
        print_success "Application responds on localhost:3000"
    else
        print_error "Application not responding on localhost:3000"
    fi
    
    # Check Nginx proxy
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
        print_success "Nginx proxy is working"
    else
        print_error "Nginx proxy not working"
    fi
    
    # Check SSL certificate if domain is configured
    domain=$(grep NEXTAUTH_URL $APP_DIR/.env.production 2>/dev/null | cut -d= -f2 | sed 's/"//g' | sed 's/https:\/\///')
    if [[ -n "$domain" && "$domain" != "localhost:3000" ]]; then
        if openssl s_client -connect $domain:443 -servername $domain </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
            print_success "SSL certificate is valid for $domain"
        else
            print_warning "SSL certificate issue for $domain"
        fi
    fi
}

check_firewall() {
    print_header "Firewall Status"
    
    if ufw status | grep -q "Status: active"; then
        print_success "UFW firewall is active"
        echo "  Open ports:"
        ufw status | grep ALLOW | head -5
    else
        print_warning "UFW firewall is not active"
    fi
}

check_ssl() {
    print_header "SSL Certificate Status"
    
    if command -v certbot &> /dev/null; then
        print_success "Certbot is installed"
        
        # Check certificates
        cert_info=$(certbot certificates 2>/dev/null)
        if echo "$cert_info" | grep -q "Certificate Name:"; then
            print_success "SSL certificates found:"
            echo "$cert_info" | grep -E "(Certificate Name:|Domains:|Expiry Date:)" | head -6
        else
            print_warning "No SSL certificates found"
        fi
    else
        print_warning "Certbot not installed"
    fi
}

check_logs() {
    print_header "Application Logs"
    
    # Check PM2 logs
    if [[ -f "/var/log/pulsar/combined.log" ]]; then
        print_success "Application logs are being written"
        echo "  Last 3 log entries:"
        tail -3 /var/log/pulsar/combined.log 2>/dev/null || echo "  No recent logs"
    else
        print_warning "Application log file not found"
    fi
    
    # Check Nginx logs
    if [[ -f "/var/log/nginx/access.log" ]]; then
        print_success "Nginx access logs available"
        recent_requests=$(tail -10 /var/log/nginx/access.log | wc -l)
        echo "  Recent requests: $recent_requests"
    else
        print_warning "Nginx access log not found"
    fi
}

check_backups() {
    print_header "Backup Configuration"
    
    if [[ -d "/opt/backups" ]]; then
        print_success "Backup directory exists"
        backup_count=$(ls -1 /opt/backups/*.gz 2>/dev/null | wc -l)
        echo "  Backup files: $backup_count"
        
        if [[ -f "/opt/backups/backup.sh" ]]; then
            print_success "Backup script exists"
        else
            print_warning "Backup script not found"
        fi
        
        # Check if backup cron job is configured
        if sudo -u $APP_USER crontab -l 2>/dev/null | grep -q backup.sh; then
            print_success "Backup cron job is configured"
        else
            print_warning "Backup cron job not configured"
        fi
    else
        print_warning "Backup directory not found"
    fi
}

performance_check() {
    print_header "Performance Check"
    
    # Check system resources
    echo "System Resources:"
    echo "  CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')"
    echo "  Memory Usage: $(free | grep Mem | awk '{printf("%.1f%%"), $3/$2 * 100.0}')"
    echo "  Disk Usage: $(df -h / | awk 'NR==2{printf "%s", $5}')"
    
    # Check PM2 process info
    if sudo -u $APP_USER pm2 list | grep -q "pulsar"; then
        echo ""
        echo "Application Process:"
        sudo -u $APP_USER pm2 show pulsar | grep -E "(cpu|memory|uptime)" || echo "  Process info not available"
    fi
}

print_summary() {
    print_header "Health Check Summary"
    
    echo -e "${GREEN}🎯 System Status Summary${NC}"
    echo ""
    
    # Count issues
    error_count=$(grep -c "❌" /tmp/pulsar_check.log 2>/dev/null || echo "0")
    warning_count=$(grep -c "⚠️" /tmp/pulsar_check.log 2>/dev/null || echo "0")
    success_count=$(grep -c "✅" /tmp/pulsar_check.log 2>/dev/null || echo "0")
    
    echo -e "  ${GREEN}Successful checks: $success_count${NC}"
    echo -e "  ${YELLOW}Warnings: $warning_count${NC}"
    echo -e "  ${RED}Errors: $error_count${NC}"
    echo ""
    
    if [[ $error_count -eq 0 ]]; then
        echo -e "${GREEN}🎉 Pulsar is running well!${NC}"
    elif [[ $error_count -lt 3 ]]; then
        echo -e "${YELLOW}⚠️  Pulsar is mostly functional but has some issues${NC}"
    else
        echo -e "${RED}❌ Pulsar has significant issues that need attention${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}💡 Useful Commands:${NC}"
    echo -e "  • Check application: sudo -u $APP_USER pm2 status"
    echo -e "  • View logs: sudo -u $APP_USER pm2 logs pulsar"
    echo -e "  • Restart app: sudo -u $APP_USER pm2 restart pulsar"
    echo -e "  • Check Nginx: sudo systemctl status nginx"
    echo -e "  • Check database: sudo -u postgres psql pulsar_production"
}

# Main execution
main() {
    print_header "🔍 Pulsar Health Check"
    
    # Redirect output to temp file for summary counting
    exec > >(tee /tmp/pulsar_check.log)
    exec 2>&1
    
    check_system_services
    check_application
    check_database
    check_network
    check_firewall
    check_ssl
    check_logs
    check_backups
    performance_check
    print_summary
    
    # Clean up temp file
    rm -f /tmp/pulsar_check.log
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    echo -e "${RED}Please run this script as a regular user with sudo privileges${NC}"
    exit 1
fi

# Run main function
main "$@"
