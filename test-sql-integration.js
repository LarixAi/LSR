import { createClient } from '@supabase/supabase-js';

// Test script to verify SQL integration is working
async function testSQLIntegration() {
  console.log('🔍 Testing SQL Integration...\n');

  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
    console.log('\n💡 Try running this from the browser console instead, or check your .env file');
    return;
  }

  console.log('✅ Environment variables found');

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Check if tables exist
    console.log('\n📋 Test 1: Checking if tables exist...');
    
    const { data: questionSets, error: setsError } = await supabase
      .from('inspection_question_sets')
      .select('count')
      .limit(1);

    if (setsError) {
      console.log('❌ inspection_question_sets table not found or accessible');
      console.log('Error:', setsError.message);
    } else {
      console.log('✅ inspection_question_sets table exists and accessible');
    }

    const { data: questions, error: questionsError } = await supabase
      .from('inspection_questions')
      .select('count')
      .limit(1);

    if (questionsError) {
      console.log('❌ inspection_questions table not found or accessible');
      console.log('Error:', questionsError.message);
    } else {
      console.log('✅ inspection_questions table exists and accessible');
    }

    // Test 2: Check if function exists
    console.log('\n🔧 Test 2: Checking if SQL function exists...');
    
    try {
      const { data: functionTest, error: functionError } = await supabase.rpc('create_default_daily_pretrip_questions', {
        org_id: 'test-org-id',
        creator_id: 'test-creator-id'
      });

      if (functionError) {
        if (functionError.message.includes('function') || functionError.message.includes('not found')) {
          console.log('❌ create_default_daily_pretrip_questions function not found');
          console.log('Error:', functionError.message);
        } else {
          console.log('✅ Function exists (expected error for test parameters)');
          console.log('Error (expected):', functionError.message);
        }
      } else {
        console.log('✅ Function exists and executed');
      }
    } catch (error) {
      console.log('❌ Function test failed:', error.message);
    }

    // Test 3: Check existing data
    console.log('\n📊 Test 3: Checking existing data...');
    
    const { data: existingSets, error: existingSetsError } = await supabase
      .from('inspection_question_sets')
      .select('*')
      .limit(5);

    if (existingSetsError) {
      console.log('❌ Could not fetch existing question sets');
      console.log('Error:', existingSetsError.message);
    } else {
      console.log(`✅ Found ${existingSets.length} existing question sets`);
      existingSets.forEach(set => {
        console.log(`   - ${set.name} (${set.is_default ? 'Default' : 'Custom'})`);
      });
    }

    const { data: existingQuestions, error: existingQuestionsError } = await supabase
      .from('inspection_questions')
      .select('*')
      .limit(5);

    if (existingQuestionsError) {
      console.log('❌ Could not fetch existing questions');
      console.log('Error:', existingQuestionsError.message);
    } else {
      console.log(`✅ Found ${existingQuestions.length} existing questions`);
      if (existingQuestions.length > 0) {
        console.log(`   Sample question: "${existingQuestions[0].question}"`);
      }
    }

    console.log('\n🎯 SQL Integration Test Summary:');
    console.log('=====================================');
    
    if (setsError || questionsError) {
      console.log('❌ Tables need to be created - Run the SQL script first');
      console.log('   Execute: sql/vehicle_check_questions_integration.sql');
    } else {
      console.log('✅ Database tables are accessible');
    }

    if (existingSets && existingSets.length > 0) {
      console.log('✅ Question sets exist in database');
    } else {
      console.log('⚠️  No question sets found - Use "Import Default Questions" in admin panel');
    }

    if (existingQuestions && existingQuestions.length > 0) {
      console.log('✅ Questions exist in database');
    } else {
      console.log('⚠️  No questions found - Use "Import Default Questions" in admin panel');
    }

    console.log('\n📝 Next Steps:');
    console.log('1. If tables missing: Run SQL script in Supabase SQL Editor');
    console.log('2. If no data: Use "Import Default Questions" button in admin panel');
    console.log('3. Test mobile integration: Check if drivers see admin-controlled questions');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testSQLIntegration().catch(console.error);
