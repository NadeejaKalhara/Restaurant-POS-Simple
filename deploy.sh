#!/bin/bash

# Deployment Script for Restaurant POS System
# This script updates, builds, and deploys the application

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting deployment process..."
echo "📁 Working directory: $PWD"
echo ""

# Step 1: Update repository
echo "📥 Step 1/4: Updating repository..."
git fetch origin
git pull origin main

# Step 2: Install/update dependencies
echo "📦 Step 2/4: Installing dependencies..."
# Ensure devDependencies are installed (needed for vite build)
npm install --include=dev --legacy-peer-deps

# Ensure node_modules/.bin is in PATH for this script
export PATH="$PWD/node_modules/.bin:$PATH"

# Step 3: Build the application
echo "🏗️  Step 3/4: Building application..."
# Ensure vite is available - install if missing
if [ ! -f "node_modules/.bin/vite" ] && [ ! -f "node_modules/vite/bin/vite.js" ]; then
    echo "   vite not found, installing vite..."
    npm install vite@^5.0.8 --save-dev --legacy-peer-deps
fi

# Use npm run build which automatically handles PATH
# npm run automatically adds node_modules/.bin to PATH
npm run build

# Step 4: Restart backend server
echo "⚙️  Step 4/4: Restarting backend server..."

if command -v pm2 &> /dev/null; then
    # Use PM2 if available
    echo "   Using PM2 for process management..."
    
    # Check if process exists
    if pm2 list | grep -q "restaurant-pos"; then
        echo "   Restarting existing PM2 process..."
        pm2 restart restaurant-pos --update-env
    else
        echo "   Starting new PM2 process..."
        pm2 start server/index.js --name restaurant-pos
        pm2 save
    fi
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📊 PM2 Status:"
    pm2 status | grep restaurant-pos || pm2 status
else
    # Restart server directly if PM2 not available
    echo "   PM2 not available, restarting server directly..."
    
    # Find and kill existing server process
    SERVER_PID=$(ps aux | grep -E "[n]ode.*server/index\.js" | grep -v grep | awk '{print $2}' | head -1)
    
    if [ -n "$SERVER_PID" ]; then
        echo "   Stopping existing server (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        if kill -0 $SERVER_PID 2>/dev/null; then
            echo "   Force stopping server..."
            kill -9 $SERVER_PID 2>/dev/null || true
            sleep 1
        fi
    fi
    
    # Start server in background
    echo "   Starting server..."
    nohup node server/index.js > /tmp/restaurant-pos-server.log 2>&1 &
    NEW_PID=$!
    sleep 2
    
    # Verify server started
    if kill -0 $NEW_PID 2>/dev/null; then
        echo "   ✅ Server started successfully (PID: $NEW_PID)"
        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "📝 Server logs: tail -f /tmp/restaurant-pos-server.log"
        echo "💡 For better process management, install PM2: npm install -g pm2"
    else
        echo "   ⚠️  Server may not have started. Check logs: /tmp/restaurant-pos-server.log"
        echo ""
        echo "✅ Build complete! Server restart attempted."
    fi
fi

