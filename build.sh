#!/bin/bash

# ASCEP Build Script for Railway
set -e

echo "🔨 Building ASCEP for Railway deployment..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r backend/requirements.txt

# Install Node.js dependencies and build frontend
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install -g pnpm
pnpm install --frozen-lockfile

echo "🏗️ Building frontend..."
pnpm run build
cd ..

# Make scripts executable
chmod +x start_microservices.sh
chmod +x start_microservices_railway.sh

echo "✅ Build completed successfully!" 