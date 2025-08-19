#!/bin/bash

# Android App Runner Script
echo "🚀 TransEntrix Driver App - Android Runner"
echo "=========================================="

# Set up environment variables
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH=$JAVA_HOME/bin:$PATH
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

# Check available devices
echo "📱 Checking available devices..."
adb devices

echo ""
echo "🎯 Choose deployment target:"
echo "1. Android Emulator (emulator-5554)"
echo "2. Physical Device (if available)"
echo "3. Build only (no deployment)"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🚀 Building and deploying to Android Emulator..."
        npm run build
        npx cap run android --target emulator-5554
        ;;
    2)
        echo "🚀 Building and deploying to Physical Device..."
        npm run build
        npx cap run android
        ;;
    3)
        echo "🔨 Building app only..."
        npm run build
        npx cap sync android
        echo "✅ Build complete! Use 'npx cap run android' to deploy."
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Android app deployment complete!"
echo "📱 Check your device/emulator for the TransEntrix Driver app"
