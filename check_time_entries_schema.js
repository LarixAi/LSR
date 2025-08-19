import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://dznbihypzmvcmradijqn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQ1NzQsImV4cCI6MjA3MDUzMDU3NH0.dS4mQBL0q_JhsZQF14KKB0nL2f3H--2hPoxXzitPOgo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTimeEntriesSchema() {
  console.log('🔍 Checking time_entries table schema...\n');

  try {
    // Try to get all columns from time_entries
    console.log('1️⃣ Testing time_entries table access...');
    const { data: timeEntries, error: timeEntriesError } = await supabase
      .from('time_entries')
      .select('*')
      .limit(1);
    
    if (timeEntriesError) {
      console.error('❌ Error accessing time_entries:', timeEntriesError);
      
      // Try with just basic columns
      console.log('\n2️⃣ Trying with basic columns...');
      const { data: basicTest, error: basicError } = await supabase
        .from('time_entries')
        .select('id')
        .limit(1);
      
      if (basicError) {
        console.error('❌ Even basic access failed:', basicError);
      } else {
        console.log('✅ Basic access works, table exists');
      }
    } else {
      console.log('✅ time_entries table accessible');
      if (timeEntries && timeEntries.length > 0) {
        console.log('   Available columns:');
        Object.keys(timeEntries[0]).forEach(key => {
          console.log(`   - ${key}: ${typeof timeEntries[0][key]}`);
        });
      } else {
        console.log('   Table is empty');
      }
    }

    // Test specific columns that might exist
    console.log('\n3️⃣ Testing specific columns...');
    const columnsToTest = [
      'id', 'driver_id', 'date', 'start_time', 'end_time', 
      'total_hours', 'organization_id', 'created_at', 'updated_at'
    ];

    for (const column of columnsToTest) {
      try {
        const { data, error } = await supabase
          .from('time_entries')
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`❌ ${column}: ${error.message}`);
        } else {
          console.log(`✅ ${column}: accessible`);
        }
      } catch (err) {
        console.log(`❌ ${column}: ${err.message}`);
      }
    }

    // Check if we can insert a test record
    console.log('\n4️⃣ Testing insert capability...');
    const testData = {
      driver_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      date: new Date().toISOString().split('T')[0],
      total_hours: 8.0,
      organization_id: '00000000-0000-0000-0000-000000000000' // dummy UUID
    };

    const { data: insertTest, error: insertError } = await supabase
      .from('time_entries')
      .insert(testData)
      .select();

    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
      console.log('   This helps identify what columns are missing');
    } else {
      console.log('✅ Insert test successful');
      console.log('   Created test record:', insertTest[0]);
      
      // Clean up test record
      if (insertTest && insertTest[0]) {
        await supabase
          .from('time_entries')
          .delete()
          .eq('id', insertTest[0].id);
        console.log('   Test record cleaned up');
      }
    }

    console.log('\n🎯 Time Entries Schema Check Complete!');

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkTimeEntriesSchema();
