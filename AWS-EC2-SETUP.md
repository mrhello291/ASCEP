# ASCEP AWS EC2 Deployment Guide

## 🚀 Quick Start (15 minutes)

### Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance
2. **Choose AMI**: Ubuntu Server 22.04 LTS
3. **Instance Type**: t3.medium (2 vCPU, 4 GB RAM) - **Free tier eligible**
4. **Storage**: 20 GB gp3 (free tier)
5. **Security Group**: Create new with these rules:
   ```
   HTTP (80)     - 0.0.0.0/0
   HTTPS (443)   - 0.0.0.0/0
   SSH (22)      - Your IP only
   Custom (5000) - 0.0.0.0/0 (for backend API)
   ```

### Step 2: Connect to Instance

```bash
# Download your key pair
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### Step 3: Deploy ASCEP

```bash
# Download deployment script
wget https://raw.githubusercontent.com/yourusername/ASCEP/main/aws-deployment.sh

# Make executable and run
chmod +x aws-deployment.sh
./aws-deployment.sh
```

## 💰 Cost Breakdown

### Free Tier (12 months)
- **EC2 t3.micro**: 750 hours/month FREE
- **EBS Storage**: 30 GB FREE
- **Data Transfer**: 15 GB/month FREE
- **Total Cost**: $0/month

### After Free Tier
- **t3.medium**: ~$30/month
- **t3.micro**: ~$8/month (minimal)
- **Data Transfer**: ~$0.09/GB
- **Total**: $8-30/month

## 🔧 Manual Setup (Alternative)

### 1. Install Docker
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clone and Deploy
```bash
# Clone repository
git clone https://github.com/yourusername/ASCEP.git
cd ASCEP

# Set environment variables
cat > .env << EOF
SECRET_KEY=$(openssl rand -hex 32)
REDIS_HOST=redis
REDIS_PORT=6379
DEBUG=False
PORT=5000
EOF

# Deploy
docker-compose up -d
```

## 🌐 Domain Setup (Optional)

### 1. Get a Domain
- **Namecheap**: $10-15/year
- **GoDaddy**: $12-20/year
- **Route 53**: AWS domain service

### 2. Point to EC2
```bash
# Get your EC2 public IP
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Add A record in your DNS:
# Type: A
# Name: @
# Value: your-ec2-public-ip
```

### 3. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt-get install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx.conf with certificate paths
# Restart nginx
docker-compose restart nginx
```

## 📊 Monitoring & Management

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f celery
docker-compose logs -f nginx
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up -d --build
```

### Backup Data
```bash
# Backup Redis data
docker exec ascep_redis_1 redis-cli BGSAVE

# Backup configuration
tar -czf ascep-backup-$(date +%Y%m%d).tar.gz .env docker-compose.yml
```

## 🔒 Security Best Practices

### 1. Update Security Group
```bash
# Only allow your IP for SSH
# Remove 0.0.0.0/0 from SSH rule
```

### 2. Set Up Firewall
```bash
# Install UFW
sudo apt-get install ufw

# Configure rules
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Regular Updates
```bash
# Create update script
cat > update.sh << 'EOF'
#!/bin/bash
sudo apt-get update && sudo apt-get upgrade -y
docker-compose pull
docker-compose up -d --build
EOF

chmod +x update.sh

# Run weekly
# Add to crontab: 0 2 * * 0 /home/ubuntu/ascep/update.sh
```

## 🚨 Troubleshooting

### Common Issues

**Port 80/443 not accessible:**
```bash
# Check security group rules
# Verify nginx is running
docker-compose ps nginx
```

**Docker permission denied:**
```bash
# Logout and login again
exit
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

**Out of memory:**
```bash
# Check memory usage
free -h
htop

# Consider upgrading to t3.medium
```

**SSL certificate issues:**
```bash
# Check certificate validity
sudo certbot certificates

# Renew if needed
sudo certbot renew
```

## 📈 Scaling Options

### Vertical Scaling
- **Upgrade instance type**: t3.micro → t3.medium → t3.large
- **Add more storage**: Increase EBS volume size
- **Optimize Docker**: Adjust container resources

### Horizontal Scaling
- **Load Balancer**: AWS ALB for multiple instances
- **Auto Scaling**: Automatically scale based on load
- **Redis Cluster**: For high-traffic scenarios

## 💡 Pro Tips

1. **Use t3.micro for testing** (free tier)
2. **Set up monitoring** with CloudWatch
3. **Enable backups** with EBS snapshots
4. **Use Route 53** for DNS management
5. **Set up alerts** for high CPU/memory usage

## 🎯 Success Checklist

- [ ] **EC2 instance** running
- [ ] **Security group** configured
- [ ] **Docker** installed
- [ ] **Application** deployed
- [ ] **Domain** configured (optional)
- [ ] **SSL certificate** installed (optional)
- [ ] **Monitoring** set up
- [ ] **Backups** configured

Your ASCEP platform will be live on AWS EC2! 🌐 