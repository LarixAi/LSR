import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://dznbihypzmvcmradijqn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQ1NzQsImV4cCI6MjA3MDUzMDU3NH0.dS4mQBL0q_JhsZQF14KKB0nL2f3H--2hPoxXzitPOgo";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchedulesTable() {
  console.log('🔍 Checking schedules table structure...\n');

  try {
    // Check what columns exist in the schedules table
    console.log('1️⃣ Checking schedules table columns...');
    const { data: columns, error: columnsError } = await supabase
      .from('schedules')
      .select('*')
      .limit(1);
    
    if (columnsError) {
      console.error('❌ Error accessing schedules table:', columnsError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('✅ Schedules table structure:');
      const sampleRecord = columns[0];
      Object.keys(sampleRecord).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleRecord[key]} (${sampleRecord[key]})`);
      });
    } else {
      console.log('ℹ️  Schedules table is empty, checking schema...');
      
      // Try to get schema information
      const { data: schemaInfo, error: schemaError } = await supabase
        .rpc('get_table_columns', { table_name: 'schedules' });
      
      if (schemaError) {
        console.log('ℹ️  Could not get schema info, trying alternative approach...');
        
        // Try a simple query to see what happens
        const { data: testData, error: testError } = await supabase
          .from('schedules')
          .select('id')
          .limit(1);
        
        if (testError) {
          console.error('❌ Cannot access schedules table:', testError);
        } else {
          console.log('✅ Can access schedules table with basic query');
        }
      } else {
        console.log('✅ Schema info:', schemaInfo);
      }
    }

    // Check if there are any schedules at all
    console.log('\n2️⃣ Checking for any schedule records...');
    const { count, error: countError } = await supabase
      .from('schedules')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting schedules:', countError);
    } else {
      console.log(`✅ Found ${count} schedule records`);
    }

    // Check what tables exist
    console.log('\n3️⃣ Checking available tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('ℹ️  Could not get table list, trying alternative...');
      
      // Try to access some common tables
      const commonTables = ['profiles', 'schedules', 'time_entries', 'daily_rest', 'vehicles', 'jobs'];
      for (const table of commonTables) {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: accessible`);
        }
      }
    } else {
      console.log('✅ Available tables:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Check failed with error:', error);
  }
}

checkSchedulesTable();
