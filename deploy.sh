#!/bin/bash

# Deployment Script for Restaurant POS System
# This script updates, builds, and deploys the application

set -e  # Exit on error

echo "🚀 Starting deployment process..."
echo ""

# Step 1: Update repository
echo "📥 Step 1/4: Updating repository..."
git fetch origin
git pull origin main

# Step 2: Install/update dependencies
echo "📦 Step 2/4: Installing dependencies..."
npm install

# Step 3: Build the application
echo "🏗️  Step 3/4: Building application..."
npm run build

# Step 4: Check if PM2 is installed (for process management)
if command -v pm2 &> /dev/null; then
    echo "⚙️  Step 4/4: Deploying with PM2..."
    
    # Stop existing process if running
    pm2 stop restaurant-pos 2>/dev/null || true
    pm2 delete restaurant-pos 2>/dev/null || true
    
    # Start with PM2
    pm2 start server/index.js --name restaurant-pos
    pm2 save
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
    echo ""
    echo "📝 View logs: pm2 logs restaurant-pos"
    echo "🔄 Restart: pm2 restart restaurant-pos"
    echo "🛑 Stop: pm2 stop restaurant-pos"
else
    echo "⚙️  Step 4/4: Starting production server..."
    echo ""
    echo "⚠️  PM2 not found. Starting server directly."
    echo "💡 Install PM2 for better process management: npm install -g pm2"
    echo ""
    echo "✅ Build complete! Starting server..."
    echo "🌐 Server will run on: http://localhost:${PORT:-5000}"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    npm start
fi

