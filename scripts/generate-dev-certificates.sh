#!/bin/bash

# SSL Certificate Generation Script for TMS Development
# This script generates self-signed SSL certificates for localhost development

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="$PROJECT_ROOT/.cert"

echo "🔐 Generating SSL certificates for TMS development..."

# Create .cert directory if it doesn't exist
mkdir -p "$CERT_DIR"

# Generate private key and certificate with proper Subject Alternative Names
openssl req -x509 -newkey rsa:4096 \
    -keyout "$CERT_DIR/dev.key" \
    -out "$CERT_DIR/dev.crt" \
    -days 365 \
    -nodes \
    -subj "/C=US/ST=Development/L=Local/O=TMS Development/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:0.0.0.0,DNS:*.local"

# Set proper permissions
chmod 600 "$CERT_DIR/dev.key"
chmod 644 "$CERT_DIR/dev.crt"

echo "✅ SSL certificates generated successfully!"
echo "📍 Location: $CERT_DIR"
echo "🔑 Private Key: dev.key"
echo "📜 Certificate: dev.crt"
echo ""
echo "📌 Next Steps:"
echo "1. Start your development server: npm run dev"
echo "2. Navigate to https://localhost:3004"
echo "3. If you see a security warning, click 'Advanced' → 'Proceed to localhost (unsafe)'"
echo "4. Your browser will remember this choice for future sessions"
echo ""
echo "🔄 To regenerate certificates (if they expire), run this script again"
echo "📅 Current certificates valid for 365 days"