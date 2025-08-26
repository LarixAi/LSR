#!/usr/bin/env node

/**
 * Subscription System Test Script
 * 
 * This script tests the key components of the subscription system
 * to ensure everything is properly configured and working.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Subscription System Components...\n');

// Test 1: Check environment variables
console.log('1. Checking Environment Variables...');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables found');
  } else {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
  }
} else {
  console.log('❌ .env file not found');
}

// Test 2: Check Supabase functions
console.log('\n2. Checking Supabase Functions...');
const functionsPath = path.join(process.cwd(), 'supabase', 'functions');
const requiredFunctions = ['create-checkout', 'customer-portal'];

requiredFunctions.forEach(funcName => {
  const funcPath = path.join(functionsPath, funcName, 'index.ts');
  if (fs.existsSync(funcPath)) {
    console.log(`✅ ${funcName} function exists`);
  } else {
    console.log(`❌ ${funcName} function missing`);
  }
});

// Test 3: Check frontend components
console.log('\n3. Checking Frontend Components...');
const componentsPath = path.join(process.cwd(), 'src');
const requiredComponents = [
  'pages/Subscriptions.tsx',
  'hooks/useStripeCheckout.ts',
  'hooks/useStripeCustomerPortal.ts',
  'components/subscription/StripeSuccessHandler.tsx',
  'components/subscription/NoSubscriptionDialog.tsx'
];

requiredComponents.forEach(componentPath => {
  const fullPath = path.join(componentsPath, componentPath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${componentPath} exists`);
  } else {
    console.log(`❌ ${componentPath} missing`);
  }
});

// Test 4: Check routing
console.log('\n4. Checking Routing Configuration...');
const appPath = path.join(componentsPath, 'App.tsx');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  if (appContent.includes('/payment-result')) {
    console.log('✅ Payment result route configured');
  } else {
    console.log('❌ Payment result route missing');
  }
  
  if (appContent.includes('StripeSuccessHandler')) {
    console.log('✅ StripeSuccessHandler component imported');
  } else {
    console.log('❌ StripeSuccessHandler component not imported');
  }
} else {
  console.log('❌ App.tsx not found');
}

// Test 5: Check database migrations
console.log('\n5. Checking Database Migrations...');
const migrationsPath = path.join(process.cwd(), 'supabase', 'migrations');
if (fs.existsSync(migrationsPath)) {
  const migrations = fs.readdirSync(migrationsPath)
    .filter(file => file.endsWith('.sql'))
    .filter(file => file.includes('subscription'));
  
  if (migrations.length > 0) {
    console.log(`✅ Found ${migrations.length} subscription-related migrations`);
    migrations.forEach(migration => console.log(`   - ${migration}`));
  } else {
    console.log('❌ No subscription migrations found');
  }
} else {
  console.log('❌ Migrations directory not found');
}

console.log('\n📋 Manual Testing Checklist:');
console.log('1. Open browser and navigate to /subscriptions');
console.log('2. Check if plan cards display correctly');
console.log('3. Test monthly/yearly toggle');
console.log('4. Click "Choose Plan" on any plan');
console.log('5. Verify upgrade dialog opens');
console.log('6. Select a plan and click "Start Subscription"');
console.log('7. Check console for debugging logs');
console.log('8. Verify redirect to Stripe checkout');
console.log('9. Test with Stripe test card: 4242 4242 4242 4242');
console.log('10. Verify redirect to /payment-result after payment');

console.log('\n🔧 Troubleshooting Commands:');
console.log('- Deploy functions: supabase functions deploy create-checkout');
console.log('- Check logs: supabase functions logs create-checkout');
console.log('- Test function: curl -X POST https://your-project.supabase.co/functions/v1/create-checkout');

console.log('\n✅ Subscription System Test Complete!');


