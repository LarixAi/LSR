#!/bin/bash

echo "🔄 Restarting development server..."

# Kill any existing processes
echo "📋 Killing existing processes..."
pkill -f "vite\|node\|npm\|bun" || true

# Clear browser cache (optional - uncomment if needed)
# echo "🧹 Clearing browser cache..."
# rm -rf ~/.cache/bun || true

# Wait a moment
sleep 2

# Start the development server
echo "🚀 Starting development server..."
bun run dev

echo "✅ Development server restarted!"
