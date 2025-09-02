#!/usr/bin/env node

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const certDir = path.join(__dirname, '..', '.cert');
const keyPath = path.join(certDir, 'dev.key');
const certPath = path.join(certDir, 'dev.crt');

console.log('🔍 Testing SSL Certificate Setup...\n');

// Test 1: Check if certificate files exist
console.log('📁 Checking certificate files...');
try {
  const keyStats = fs.statSync(keyPath);
  const certStats = fs.statSync(certPath);
  console.log('✅ Private key exists:', keyPath);
  console.log('✅ Certificate exists:', certPath);
  console.log('🔐 Key permissions:', (keyStats.mode & parseInt('777', 8)).toString(8));
  console.log('📜 Cert permissions:', (certStats.mode & parseInt('777', 8)).toString(8));
} catch (error) {
  console.log('❌ Certificate files missing:', error.message);
  process.exit(1);
}

// Test 2: Check if files can be read
console.log('\n📖 Testing file readability...');
try {
  const key = fs.readFileSync(keyPath, 'utf8');
  const cert = fs.readFileSync(certPath, 'utf8');
  
  if (key.includes('-----BEGIN PRIVATE KEY-----')) {
    console.log('✅ Private key format is correct');
  } else {
    console.log('❌ Private key format is invalid');
  }
  
  if (cert.includes('-----BEGIN CERTIFICATE-----')) {
    console.log('✅ Certificate format is correct');
  } else {
    console.log('❌ Certificate format is invalid');
  }
} catch (error) {
  console.log('❌ Cannot read certificate files:', error.message);
  process.exit(1);
}

// Test 3: Try to create HTTPS server
console.log('\n🚀 Testing HTTPS server creation...');
try {
  const key = fs.readFileSync(keyPath);
  const cert = fs.readFileSync(certPath);
  
  const server = https.createServer({ key, cert }, (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SSL Test Server Working!');
  });
  
  server.listen(3005, 'localhost', () => {
    console.log('✅ HTTPS server created successfully on port 3005');
    
    // Test the connection
    const options = {
      hostname: 'localhost',
      port: 3005,
      path: '/',
      method: 'GET',
      rejectUnauthorized: false // Accept self-signed certificates for testing
    };
    
    const req = https.request(options, (res) => {
      console.log('✅ HTTPS connection successful!');
      console.log('📊 Status code:', res.statusCode);
      server.close(() => {
        console.log('\n🎉 SSL Certificate Test PASSED!');
        console.log('🔥 Your certificates are working correctly!');
        console.log('\n📌 Next Steps:');
        console.log('1. Start your development server: npm run dev');
        console.log('2. Navigate to: https://localhost:3004');
        console.log('3. Accept the browser security warning (click Advanced > Proceed)');
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ HTTPS connection failed:', error.message);
      server.close();
      process.exit(1);
    });
    
    req.end();
  });
  
  server.on('error', (error) => {
    console.log('❌ HTTPS server failed to start:', error.message);
    process.exit(1);
  });
  
} catch (error) {
  console.log('❌ Failed to create HTTPS server:', error.message);
  process.exit(1);
}