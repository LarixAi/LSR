#!/usr/bin/env node

/**
 * LSR App Icon Generator
 * 
 * This script helps generate app icons for both Android and iOS
 * from your LSR logo with the red glowing "LSR" text.
 * 
 * Prerequisites:
 * 1. Install ImageMagick: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)
 * 2. Place your LSR logo as "lsr-logo.png" in the project root
 * 
 * Usage:
 * node scripts/generate-app-icons.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LOGO_SOURCE = 'lsr-logo.png';
const ANDROID_ICONS = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

const IOS_ICONS = {
  'AppIcon-20@2x.png': 40,
  'AppIcon-20@3x.png': 60,
  'AppIcon-29@2x.png': 58,
  'AppIcon-29@3x.png': 87,
  'AppIcon-40@2x.png': 80,
  'AppIcon-40@3x.png': 120,
  'AppIcon-60@2x.png': 120,
  'AppIcon-60@3x.png': 180,
  'AppIcon-76.png': 76,
  'AppIcon-76@2x.png': 152,
  'AppIcon-83.5@2x.png': 167,
  'AppIcon-1024.png': 1024
};

function checkImageMagick() {
  try {
    execSync('magick --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function generateAndroidIcons() {
  console.log('🔄 Generating Android app icons...');
  
  const androidResPath = 'android/app/src/main/res';
  
  Object.entries(ANDROID_ICONS).forEach(([folder, size]) => {
    const folderPath = path.join(androidResPath, folder);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    // Generate ic_launcher.png
    const launcherPath = path.join(folderPath, 'ic_launcher.png');
    execSync(`magick "${LOGO_SOURCE}" -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} "${launcherPath}"`);
    
    // Generate ic_launcher_round.png (same as regular for now)
    const roundPath = path.join(folderPath, 'ic_launcher_round.png');
    execSync(`magick "${LOGO_SOURCE}" -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} "${roundPath}"`);
    
    // Generate ic_launcher_foreground.png (transparent background)
    const foregroundPath = path.join(folderPath, 'ic_launcher_foreground.png');
    execSync(`magick "${LOGO_SOURCE}" -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} "${foregroundPath}"`);
    
    console.log(`✅ Generated ${folder}/ic_launcher.png (${size}x${size})`);
  });
}

function generateIOSIcons() {
  console.log('🔄 Generating iOS app icons...');
  
  const iosIconPath = 'ios/App/App/Assets.xcassets/AppIcon.appiconset';
  
  // Create folder if it doesn't exist
  if (!fs.existsSync(iosIconPath)) {
    fs.mkdirSync(iosIconPath, { recursive: true });
  }
  
  Object.entries(IOS_ICONS).forEach(([filename, size]) => {
    const iconPath = path.join(iosIconPath, filename);
    execSync(`magick "${LOGO_SOURCE}" -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} "${iconPath}"`);
    console.log(`✅ Generated ${filename} (${size}x${size})`);
  });
  
  // Update Contents.json for iOS
  const contentsJson = {
    "images": [
      {
        "filename": "AppIcon-20@2x.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "20x20"
      },
      {
        "filename": "AppIcon-20@3x.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "20x20"
      },
      {
        "filename": "AppIcon-29@2x.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "29x29"
      },
      {
        "filename": "AppIcon-29@3x.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "29x29"
      },
      {
        "filename": "AppIcon-40@2x.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "40x40"
      },
      {
        "filename": "AppIcon-40@3x.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "40x40"
      },
      {
        "filename": "AppIcon-60@2x.png",
        "idiom": "iphone",
        "scale": "2x",
        "size": "60x60"
      },
      {
        "filename": "AppIcon-60@3x.png",
        "idiom": "iphone",
        "scale": "3x",
        "size": "60x60"
      },
      {
        "filename": "AppIcon-20.png",
        "idiom": "ipad",
        "scale": "1x",
        "size": "20x20"
      },
      {
        "filename": "AppIcon-20@2x.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "20x20"
      },
      {
        "filename": "AppIcon-29.png",
        "idiom": "ipad",
        "scale": "1x",
        "size": "29x29"
      },
      {
        "filename": "AppIcon-29@2x.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "29x29"
      },
      {
        "filename": "AppIcon-40.png",
        "idiom": "ipad",
        "scale": "1x",
        "size": "40x40"
      },
      {
        "filename": "AppIcon-40@2x.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "40x40"
      },
      {
        "filename": "AppIcon-76.png",
        "idiom": "ipad",
        "scale": "1x",
        "size": "76x76"
      },
      {
        "filename": "AppIcon-76@2x.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "76x76"
      },
      {
        "filename": "AppIcon-83.5@2x.png",
        "idiom": "ipad",
        "scale": "2x",
        "size": "83.5x83.5"
      },
      {
        "filename": "AppIcon-1024.png",
        "idiom": "ios-marketing",
        "scale": "1x",
        "size": "1024x1024"
      }
    ],
    "info": {
      "author": "xcode",
      "version": 1
    }
  };
  
  fs.writeFileSync(path.join(iosIconPath, 'Contents.json'), JSON.stringify(contentsJson, null, 2));
  console.log('✅ Updated iOS Contents.json');
}

function main() {
  console.log('🎨 LSR App Icon Generator');
  console.log('========================');
  
  // Check if logo exists
  if (!fs.existsSync(LOGO_SOURCE)) {
    console.error(`❌ Error: ${LOGO_SOURCE} not found in project root`);
    console.log('📝 Please place your LSR logo as "lsr-logo.png" in the project root directory');
    process.exit(1);
  }
  
  // Check ImageMagick
  if (!checkImageMagick()) {
    console.error('❌ Error: ImageMagick not found');
    console.log('📝 Please install ImageMagick:');
    console.log('   macOS: brew install imagemagick');
    console.log('   Linux: sudo apt-get install imagemagick');
    console.log('   Windows: Download from https://imagemagick.org/');
    process.exit(1);
  }
  
  try {
    generateAndroidIcons();
    generateIOSIcons();
    
    console.log('\n🎉 App icons generated successfully!');
    console.log('📱 Next steps:');
    console.log('   1. Build and sync your app: npm run cap:sync:driver');
    console.log('   2. Deploy to device: npx cap run android');
    console.log('   3. Your LSR logo will now appear as the app icon!');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateAndroidIcons, generateIOSIcons };
