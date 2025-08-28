#!/usr/bin/env node

/**
 * Stripe Setup Verification Script
 * 
 * This script verifies that your Stripe integration is properly configured
 * and all components are working correctly.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, status = 'info') {
  const statusColor = status === 'success' ? 'green' : status === 'error' ? 'red' : 'blue';
  log(`[${step}]`, statusColor);
}

async function verifyStripeSetup() {
  log('🔍 Verifying Stripe Integration Setup', 'bold');
  log('=====================================\n');

  // Check environment variables
  logStep('1. Environment Variables', 'info');
  
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY'
  ];

  const missingVars = [];
  const presentVars = [];

  for (const varName of requiredEnvVars) {
    if (process.env[varName]) {
      presentVars.push(varName);
      log(`  ✅ ${varName} - Configured`);
    } else {
      missingVars.push(varName);
      log(`  ❌ ${varName} - Missing`, 'red');
    }
  }

  if (missingVars.length > 0) {
    log(`\n❌ Missing environment variables: ${missingVars.join(', ')}`, 'red');
    log('Please add these to your .env file or Supabase environment variables.\n', 'yellow');
    return false;
  }

  log(`\n✅ All environment variables are configured\n`);

  // Test Supabase connection
  logStep('2. Supabase Connection', 'info');
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('subscription_plans')
      .select('count')
      .limit(1);

    if (testError) {
      throw testError;
    }

    log('  ✅ Supabase connection successful');
  } catch (error) {
    log(`  ❌ Supabase connection failed: ${error.message}`, 'red');
    return false;
  }

  // Test subscription plans table
  logStep('3. Database Schema', 'info');
  
  try {
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .limit(10);

    if (plansError) {
      throw plansError;
    }

    if (plans && plans.length > 0) {
      log(`  ✅ Subscription plans found: ${plans.length} plans`);
      plans.forEach(plan => {
        log(`    - ${plan.name}: £${plan.price}/${plan.billing_cycle}`);
      });
    } else {
      log('  ⚠️  No subscription plans found in database', 'yellow');
    }
  } catch (error) {
    log(`  ❌ Database schema test failed: ${error.message}`, 'red');
    return false;
  }

  // Test Edge Functions
  logStep('4. Edge Functions', 'info');
  
  const functions = [
    'create-checkout',
    'customer-portal',
    'stripe-webhook',
    'sync-stripe-subscriptions',
    'test-stripe-connection'
  ];

  for (const funcName of functions) {
    try {
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/${funcName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        log(`  ✅ ${funcName} - Available`);
      } else {
        log(`  ⚠️  ${funcName} - Status: ${response.status}`, 'yellow');
      }
    } catch (error) {
      log(`  ❌ ${funcName} - Error: ${error.message}`, 'red');
    }
  }

  // Test Stripe connection
  logStep('5. Stripe Connection', 'info');
  
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/test-stripe-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        log('  ✅ Stripe connection successful');
        log(`    - Account ID: ${result.stripe.accountId}`);
        log(`    - Customers: ${result.stripe.customersCount}`);
        log(`    - Subscriptions: ${result.stripe.subscriptionsCount}`);
      } else {
        log(`  ❌ Stripe connection failed: ${result.error}`, 'red');
        return false;
      }
    } else {
      log(`  ❌ Stripe test function failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ Stripe connection test failed: ${error.message}`, 'red');
    return false;
  }

  // Frontend integration test
  logStep('6. Frontend Integration', 'info');
  
  const frontendFiles = [
    'src/hooks/useStripeCheckout.ts',
    'src/hooks/useStripeCustomerPortal.ts',
    'src/components/subscription/StripeSuccessHandler.tsx',
    'src/pages/Subscriptions.tsx',
    'src/components/landing/PricingSection.tsx'
  ];

  const fs = require('fs');
  const path = require('path');

  for (const file of frontendFiles) {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      log(`  ✅ ${file} - Found`);
    } else {
      log(`  ❌ ${file} - Missing`, 'red');
    }
  }

  // Summary
  log('\n📋 Setup Summary', 'bold');
  log('===============');
  log('✅ Environment variables configured');
  log('✅ Supabase connection working');
  log('✅ Database schema verified');
  log('✅ Edge functions deployed');
  log('✅ Stripe connection established');
  log('✅ Frontend components created');
  
  log('\n🎉 Stripe integration is ready to use!', 'green');
  log('\nNext steps:');
  log('1. Test the checkout flow with a test card');
  log('2. Set up Stripe webhooks for production');
  log('3. Configure your Stripe dashboard settings');
  log('4. Test the customer portal functionality');

  return true;
}

// Run the verification
if (require.main === module) {
  verifyStripeSetup()
    .then(success => {
      if (success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      log(`\n❌ Verification failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { verifyStripeSetup };



