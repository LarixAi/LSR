#!/usr/bin/env node

/**
 * Create Placeholder LSR Logo
 * 
 * This script creates a simple placeholder logo for testing
 * the app icon generation process.
 */

const { execSync } = require('child_process');

function createPlaceholderLogo() {
  console.log('🎨 Creating placeholder LSR logo...');
  
  try {
    // Create a simple placeholder logo with LSR text
    execSync(`magick -size 1024x1024 xc:lightgray -gravity center -pointsize 120 -fill red -annotate +0-100 "LSR" -pointsize 40 -fill "#374151" -annotate +0+50 "Logistics Solutions Resources" -background transparent -alpha background "lsr-logo.png"`);
    
    console.log('✅ Placeholder LSR logo created as lsr-logo.png');
    console.log('📝 You can now replace this with your actual LSR logo file');
    
  } catch (error) {
    console.error('❌ Error creating placeholder logo:', error.message);
    console.log('📝 Please manually save your LSR logo as "lsr-logo.png" in the project root');
  }
}

if (require.main === module) {
  createPlaceholderLogo();
}

module.exports = { createPlaceholderLogo };
