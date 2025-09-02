#!/bin/bash

# macOS SSL Certificate Trust Setup Script
# This script helps you trust the development SSL certificate in macOS Keychain

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_FILE="$PROJECT_ROOT/.cert/dev.crt"

echo "🔐 macOS SSL Certificate Trust Setup"
echo "======================================"

# Check if certificate exists
if [[ ! -f "$CERT_FILE" ]]; then
    echo "❌ Certificate file not found: $CERT_FILE"
    echo "Run: npm run generate:certs"
    exit 1
fi

echo "📜 Certificate found: $CERT_FILE"
echo ""

echo "📌 MANUAL SETUP REQUIRED - Please follow these steps:"
echo ""
echo "METHOD 1: Using Keychain Access (GUI)"
echo "--------------------------------------"
echo "1. Open Keychain Access (Applications → Utilities → Keychain Access)"
echo "2. Go to File → Import Items..."
echo "3. Navigate to: $CERT_FILE"
echo "4. Select 'System' keychain"
echo "5. Click 'Add'"
echo "6. Find the certificate 'localhost' in System keychain"
echo "7. Double-click the certificate"
echo "8. Expand 'Trust' section"
echo "9. Set 'When using this certificate:' to 'Always Trust'"
echo "10. Close the window (enter your password when prompted)"
echo "11. Restart your browser"
echo ""

echo "METHOD 2: Using Terminal (requires password)"
echo "--------------------------------------------"
echo "Run this command and enter your password when prompted:"
echo ""
echo "sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain '$CERT_FILE'"
echo ""
echo "Then restart your browser."
echo ""

echo "METHOD 3: Quick Double-Click"
echo "-----------------------------"
echo "1. Double-click this file in Finder: $CERT_FILE"
echo "2. This opens Keychain Access automatically"
echo "3. Select 'System' keychain and click 'Add'"
echo "4. Find the certificate and set trust to 'Always Trust'"
echo ""

echo "🔄 After trusting the certificate:"
echo "1. Completely quit your browser (not just close tabs)"
echo "2. Restart the browser"
echo "3. Navigate to https://localhost:3004"
echo "4. You should no longer see certificate warnings!"
echo ""

echo "🧪 Test the setup:"
echo "npm run dev"
echo "Then open: https://localhost:3004"

# Offer to open the certificate file
echo ""
read -p "Would you like to open the certificate file now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔓 Opening certificate file..."
    open "$CERT_FILE"
fi