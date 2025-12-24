#!/bin/bash

# Quick Update and Build Script for Restaurant POS System
# This script updates the repository and builds the system

set -e  # Exit on error

echo "🔄 Updating repository..."
git fetch origin
git pull origin main

echo "📦 Installing/updating dependencies..."
npm install

echo "🏗️  Building the system..."
npm run build

echo "✅ Update and build complete!"
echo ""
echo "To start the system:"
echo "  Development: npm run dev"
echo "  Production:  npm start"

