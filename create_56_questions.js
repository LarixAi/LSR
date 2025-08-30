import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://gvbbxbjvwnacemanluhc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YmJ4Ymp2d25hY2VtYW5sdWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ5NzQsImV4cCI6MjA1MTA1MDk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function create56Questions() {
  try {
    console.log('🔍 Finding organization and admin user...');
    
    // First, get the first organization
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (orgError || !orgs || orgs.length === 0) {
      console.error('❌ No organizations found:', orgError);
      return;
    }
    
    const organizationId = orgs[0].id;
    console.log('✅ Found organization:', organizationId);
    
    // Get the first admin user
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('organization_id', organizationId)
      .in('role', ['admin', 'council'])
      .limit(1);
    
    if (userError || !users || users.length === 0) {
      console.error('❌ No admin users found:', userError);
      return;
    }
    
    const adminUserId = users[0].id;
    console.log('✅ Found admin user:', adminUserId);
    
    // Call the function to create 56 questions
    console.log('🚀 Creating 56 questions...');
    const { data, error } = await supabase.rpc('create_default_daily_pretrip_questions', {
      org_id: organizationId,
      creator_id: adminUserId
    });
    
    if (error) {
      console.error('❌ Error creating questions:', error);
      return;
    }
    
    console.log('✅ Successfully created 56 questions!');
    console.log('📊 Result:', data);
    
    // Verify the questions were created
    const { data: questionSets, error: verifyError } = await supabase
      .from('inspection_question_sets')
      .select(`
        id,
        name,
        is_default,
        is_active,
        questions:inspection_questions(count)
      `)
      .eq('organization_id', organizationId);
    
    if (verifyError) {
      console.error('❌ Error verifying questions:', verifyError);
      return;
    }
    
    console.log('📋 Question sets created:');
    questionSets.forEach(set => {
      console.log(`  - ${set.name}: ${set.questions[0]?.count || 0} questions`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

create56Questions();
