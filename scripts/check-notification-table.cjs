const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env file manually
const envPath = require('path').join(__dirname, '../.env');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNotificationTable() {
  console.log('🔍 Checking if notification_messages table exists...');
  
  try {
    // Try to query the notification_messages table
    const { data, error } = await supabase
      .from('notification_messages')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log('❌ notification_messages table does not exist');
        console.log('📋 Applying notification system migration...');
        
        // Read and apply the migration
        const fs = require('fs');
        const path = require('path');
        
        const migrationPath = path.join(__dirname, '../supabase/migrations/20250820240000_create_advanced_notification_system.sql');
        
        if (fs.existsSync(migrationPath)) {
          const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
          console.log('📄 Migration file found, attempting to apply...');
          
          // Note: This would require service role key to execute
          console.log('⚠️  Migration requires service role key to execute');
          console.log('💡 Please run this migration manually in your Supabase dashboard');
          console.log('📁 Migration file location:', migrationPath);
        } else {
          console.log('❌ Migration file not found at:', migrationPath);
        }
        
        return false;
      } else {
        console.error('❌ Error checking notification_messages table:', error);
        return false;
      }
    }
    
    console.log('✅ notification_messages table exists');
    console.log('📊 Sample data count:', data?.length || 0);
    return true;
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

async function main() {
  console.log('🚀 Notification System Check');
  console.log('============================');
  
  const tableExists = await checkNotificationTable();
  
  if (tableExists) {
    console.log('\n✅ Notification system is ready');
  } else {
    console.log('\n❌ Notification system needs setup');
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the migration: 20250820240000_create_advanced_notification_system.sql');
    console.log('4. Restart your application');
  }
}

main().catch(console.error);
