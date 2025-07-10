#!/bin/bash

# ASCEP AWS EC2 Deployment Script
echo "🚀 ASCEP AWS EC2 Deployment"
echo "================================"

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install additional tools
echo "🔧 Installing additional tools..."
sudo apt-get install -y curl wget git htop

# Create app directory
echo "📁 Creating application directory..."
mkdir -p /home/ubuntu/ascep
cd /home/ubuntu/ascep

# Clone repository (replace with your repo URL)
echo "📥 Cloning ASCEP repository..."
git clone https://github.com/yourusername/ASCEP.git .

# Set up environment variables
echo "🔐 Setting up environment variables..."
cat > .env << EOF
# ASCEP Environment Variables
SECRET_KEY=$(openssl rand -hex 32)
REDIS_HOST=redis
REDIS_PORT=6379
DEBUG=False
PORT=5000

# Optional: Alpha Vantage API Key (for stock/forex data)
# ALPHA_VANTAGE_API_KEY=your_api_key_here
EOF

# Set proper permissions
echo "🔒 Setting file permissions..."
chmod +x start_railway.sh
chmod +x aws-deployment.sh

# Create SSL directory
echo "🔐 Creating SSL directory..."
mkdir -p ssl

# Generate self-signed certificate (for testing)
echo "🔐 Generating self-signed SSL certificate..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem -out ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Start the application
echo "🚀 Starting ASCEP application..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker-compose ps

# Show access information
echo ""
echo "🎉 ASCEP Deployment Complete!"
echo "================================"
echo "🌐 Access URLs:"
echo "   Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "   Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000"
echo "   Health Check: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api/health"
echo ""
echo "🔧 Management Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Update application: git pull && docker-compose up -d --build"
echo ""
echo "📊 Monitoring:"
echo "   System resources: htop"
echo "   Docker containers: docker ps"
echo "   Application logs: docker-compose logs -f backend"
echo "================================" 