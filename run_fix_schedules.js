import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://dznbihypzmvcmradijqn.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk1NDU3NCwiZXhwIjoyMDcwNTMwNTc0fQ.1uw3IQ19133R_54MZFo6UFtkLJrsWBC0G3QZZkugbj0";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixSchedulesTable() {
  console.log('🔧 Fixing schedules table structure...\n');

  try {
    // Read the SQL fix script
    const fs = await import('fs');
    const sqlScript = fs.readFileSync('fix_schedules_table.sql', 'utf8');

    console.log('1️⃣ Running SQL fix script...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript });

    if (error) {
      console.error('❌ Error running SQL script:', error);
      
      // Try alternative approach - run individual commands
      console.log('\n2️⃣ Trying alternative approach...');
      await runIndividualFixes();
    } else {
      console.log('✅ SQL script executed successfully');
      console.log('Result:', data);
    }

    // Test the fix
    console.log('\n3️⃣ Testing the fix...');
    await testScheduleAccess();

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

async function runIndividualFixes() {
  try {
    // Check if job_type column exists
    console.log('Checking job_type column...');
    const { data: columns, error: columnsError } = await supabase
      .from('schedules')
      .select('job_type')
      .limit(1);

    if (columnsError && columnsError.message.includes('job_type')) {
      console.log('Adding job_type column...');
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.schedules ADD COLUMN job_type text NOT NULL DEFAULT \'school_run\';'
      });

      if (alterError) {
        console.error('❌ Failed to add job_type column:', alterError);
      } else {
        console.log('✅ Added job_type column');
      }
    } else {
      console.log('✅ job_type column already exists');
    }

    // Check if organization_id column exists
    console.log('Checking organization_id column...');
    const { data: orgTest, error: orgError } = await supabase
      .from('schedules')
      .select('organization_id')
      .limit(1);

    if (orgError && orgError.message.includes('organization_id')) {
      console.log('Adding organization_id column...');
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.schedules ADD COLUMN organization_id uuid NOT NULL REFERENCES public.organizations(id);'
      });

      if (alterError) {
        console.error('❌ Failed to add organization_id column:', alterError);
      } else {
        console.log('✅ Added organization_id column');
      }
    } else {
      console.log('✅ organization_id column already exists');
    }

  } catch (error) {
    console.error('❌ Individual fixes failed:', error);
  }
}

async function testScheduleAccess() {
  try {
    console.log('Testing schedule access...');
    
    // Test basic access
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('id, start_time, job_type, organization_id')
      .limit(5);

    if (error) {
      console.error('❌ Still cannot access schedules:', error);
    } else {
      console.log('✅ Schedules table is now accessible');
      console.log(`   Found ${schedules?.length || 0} schedule records`);
      
      if (schedules && schedules.length > 0) {
        console.log('   Sample schedule:', schedules[0]);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the fix
fixSchedulesTable();
