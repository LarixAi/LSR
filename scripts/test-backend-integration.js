#!/usr/bin/env node

/**
 * LSR Transport Backend Integration Test Suite
 * Tests all backend connections and CRUD operations
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
};

function logTest(name, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    testResults.errors.push({ name, error });
    console.log(`❌ ${name}: ${error?.message || 'Unknown error'}`);
  }
}

async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from('organizations').select('count').limit(1);
    if (error) throw error;
    logTest('Database Connection', true);
    return true;
  } catch (error) {
    logTest('Database Connection', false, error);
    return false;
  }
}

async function testTableExistence() {
  const requiredTables = [
    'organizations',
    'profiles',
    'vehicles',
    'fuel_purchases',
    'invoices',
    'quotations',
    'vehicle_inspections',
    'tachograph_records',
    'compliance_violations',
    'work_orders',
    'defect_reports',
    'parts_inventory',
    'support_tickets',
    'customer_bookings',
    'customer_profiles',
    'vehicle_check_templates',
    'vehicle_check_questions',
    'rail_replacement_services'
  ];

  console.log('\n📋 Testing Table Existence...');
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === '42P01') {
        logTest(`Table: ${table}`, false, new Error('Table does not exist'));
      } else if (error) {
        logTest(`Table: ${table}`, false, error);
      } else {
        logTest(`Table: ${table}`, true);
      }
    } catch (error) {
      logTest(`Table: ${table}`, false, error);
    }
  }
}

async function testRLSPolicies() {
  console.log('\n🔒 Testing RLS Policies...');
  
  try {
    // Test that RLS is enabled on key tables
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error && error.message.includes('permission denied')) {
      logTest('RLS Policies Active', true);
    } else {
      logTest('RLS Policies Active', false, new Error('RLS may not be properly configured'));
    }
  } catch (error) {
    logTest('RLS Policies Active', false, error);
  }
}

async function testCRUDOperations() {
  console.log('\n🔄 Testing CRUD Operations...');
  
  // Test organization creation (if we have service role key)
  try {
    const testOrg = {
      name: 'Test Organization',
      slug: 'test-org-' + Date.now(),
      is_active: true
    };
    
    const { data: createdOrg, error: createError } = await supabase
      .from('organizations')
      .insert(testOrg)
      .select()
      .single();
    
    if (createError) {
      logTest('Create Operation', false, createError);
    } else {
      logTest('Create Operation', true);
      
      // Test read operation
      const { data: readOrg, error: readError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', createdOrg.id)
        .single();
      
      if (readError) {
        logTest('Read Operation', false, readError);
      } else {
        logTest('Read Operation', true);
        
        // Test update operation
        const { data: updatedOrg, error: updateError } = await supabase
          .from('organizations')
          .update({ name: 'Updated Test Organization' })
          .eq('id', createdOrg.id)
          .select()
          .single();
        
        if (updateError) {
          logTest('Update Operation', false, updateError);
        } else {
          logTest('Update Operation', true);
          
          // Test delete operation
          const { error: deleteError } = await supabase
            .from('organizations')
            .delete()
            .eq('id', createdOrg.id);
          
          if (deleteError) {
            logTest('Delete Operation', false, deleteError);
          } else {
            logTest('Delete Operation', true);
          }
        }
      }
    }
  } catch (error) {
    logTest('CRUD Operations', false, error);
  }
}

async function testDataIntegrity() {
  console.log('\n🔗 Testing Data Integrity...');
  
  try {
    // Test foreign key relationships
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(5);
    
    if (orgError) {
      logTest('Foreign Key Relationships', false, orgError);
      return;
    }
    
    if (orgs && orgs.length > 0) {
      const orgId = orgs[0].id;
      
      // Test that we can query related data
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, organization_id')
        .eq('organization_id', orgId)
        .limit(5);
      
      if (profileError) {
        logTest('Foreign Key Relationships', false, profileError);
      } else {
        logTest('Foreign Key Relationships', true);
      }
    } else {
      logTest('Foreign Key Relationships', true, null, 'No organizations found to test');
    }
  } catch (error) {
    logTest('Data Integrity', false, error);
  }
}

async function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  
  try {
    const startTime = Date.now();
    
    // Test query performance
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .limit(100);
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    if (error) {
      logTest('Query Performance', false, error);
    } else {
      if (queryTime < 1000) {
        logTest('Query Performance', true, null, `Query completed in ${queryTime}ms`);
      } else {
        logTest('Query Performance', false, new Error(`Query took too long: ${queryTime}ms`));
      }
    }
  } catch (error) {
    logTest('Performance', false, error);
  }
}

async function testSeedData() {
  console.log('\n🌱 Testing Seed Data...');
  
  try {
    // Check if we have sample data
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
    
    if (orgError) {
      logTest('Seed Data Check', false, orgError);
      return;
    }
    
    const { count } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true });
    
    if (count > 0) {
      logTest('Seed Data Check', true, null, `${count} organizations found`);
    } else {
      logTest('Seed Data Check', false, new Error('No seed data found'));
    }
  } catch (error) {
    logTest('Seed Data Check', false, error);
  }
}

async function runAllTests() {
  console.log('🚀 Starting LSR Transport Backend Integration Tests...\n');
  
  await testDatabaseConnection();
  await testTableExistence();
  await testRLSPolicies();
  await testCRUDOperations();
  await testDataIntegrity();
  await testPerformance();
  await testSeedData();
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error?.message || 'Unknown error'}`);
    });
  }
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Backend integration is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testResults
};
