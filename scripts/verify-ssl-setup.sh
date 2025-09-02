#!/bin/bash

# SSL Setup Verification Script
# Checks if SSL certificates are trusted and working properly

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_FILE="$PROJECT_ROOT/.cert/dev.crt"

echo "🔍 SSL Setup Verification"
echo "========================"

# Check if certificate exists
if [[ ! -f "$CERT_FILE" ]]; then
    echo "❌ Certificate not found. Run: npm run generate:certs"
    exit 1
fi

echo "✅ Certificate file exists"

# Check if certificate is in keychain
if security find-certificate -c "localhost" /Library/Keychains/System.keychain > /dev/null 2>&1; then
    echo "✅ Certificate found in System keychain"
    
    # Check if certificate is trusted
    if security verify-cert -c "$CERT_FILE" > /dev/null 2>&1; then
        echo "✅ Certificate is trusted"
    else
        echo "⚠️  Certificate found but may not be fully trusted"
        echo "   Try: npm run trust:cert"
    fi
else
    echo "⚠️  Certificate not found in System keychain"
    echo "   Run: npm run trust:cert"
fi

# Test if development server port is available
if lsof -i :3004 > /dev/null 2>&1; then
    echo "⚠️  Port 3004 is in use. You may need to stop existing server."
    echo "   Try: pkill -f vite"
else
    echo "✅ Port 3004 is available"
fi

echo ""
echo "📌 Next Steps:"
echo "1. If certificate is not trusted: npm run trust:cert"
echo "2. Start development server: npm run dev"
echo "3. Navigate to: https://localhost:3004"

# Check current date vs certificate validity
echo ""
echo "📅 Certificate Validity:"
openssl x509 -in "$CERT_FILE" -noout -dates