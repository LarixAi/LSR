#!/bin/bash

# Mobile build script for TransEntrix
# This script builds both driver and parent apps for mobile deployment

echo "🚀 Starting TransEntrix Mobile Build Process"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "🔍 Checking dependencies..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

if ! command_exists npx; then
    echo "❌ npx is not installed. Please install npx first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Build for driver mobile app
echo "🚗 Building driver mobile app..."
npm run build:driver
if [ $? -ne 0 ]; then
    echo "❌ Failed to build driver app"
    exit 1
fi

# Build for parent mobile app
echo "👨‍👩‍👧‍👦 Building parent mobile app..."
npm run build:parent
if [ $? -ne 0 ]; then
    echo "❌ Failed to build parent app"
    exit 1
fi

echo "✅ Mobile builds completed successfully!"
echo ""
echo "📱 Next steps:"
echo "1. Sync with Capacitor: npm run cap:sync:driver and npm run cap:sync:parent"
echo "2. Run on device:"
echo "   - iOS: npm run cap:run:driver:ios or npm run cap:run:parent:ios"
echo "   - Android: npm run cap:run:driver:android or npm run cap:run:parent:android"
echo ""
echo "📖 For more info, visit: https://lovable.dev/blogs/mobile-development"