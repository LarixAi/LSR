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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSampleNotifications() {
  console.log('📝 Adding Sample Notifications');
  console.log('==============================');
  
  try {
    // First, let's get a sample user ID (you'll need to replace this with a real user ID)
    console.log('\n1️⃣ Getting sample user...');
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, organization_id')
      .limit(1);
    
    if (userError) {
      console.error('❌ Error getting users:', userError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No users found in profiles table');
      return;
    }
    
    const sampleUser = users[0];
    console.log('✅ Found sample user:', sampleUser.id);
    
    // Add sample notifications
    console.log('\n2️⃣ Adding sample notifications...');
    
    const sampleNotifications = [
      {
        sender_id: sampleUser.id,
        sender_name: 'System Admin',
        sender_role: 'admin',
        recipient_id: sampleUser.id,
        title: 'Welcome to TMS!',
        body: 'Welcome to the Transport Management System. We hope you find it useful!',
        type: 'info',
        priority: 'normal',
        category: 'general',
        channels: ['in_app'],
        organization_id: sampleUser.organization_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        sender_id: sampleUser.id,
        sender_name: 'System Admin',
        sender_role: 'admin',
        recipient_id: sampleUser.id,
        title: 'Maintenance Reminder',
        body: 'Vehicle ABC123 is due for maintenance in 7 days.',
        type: 'warning',
        priority: 'high',
        category: 'maintenance',
        channels: ['in_app'],
        organization_id: sampleUser.organization_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        sender_id: sampleUser.id,
        sender_name: 'System Admin',
        sender_role: 'admin',
        recipient_id: sampleUser.id,
        title: 'Safety Alert',
        body: 'Please review the latest safety guidelines.',
        type: 'warning',
        priority: 'high',
        category: 'safety',
        channels: ['in_app'],
        organization_id: sampleUser.organization_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const { data: insertedData, error: insertError } = await supabase
      .from('notification_messages')
      .insert(sampleNotifications)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting notifications:', insertError);
    } else {
      console.log('✅ Successfully added', insertedData.length, 'sample notifications');
      console.log('📊 Notification IDs:', insertedData.map(n => n.id));
    }
    
    // Verify the notifications were added
    console.log('\n3️⃣ Verifying notifications...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('notification_messages')
      .select('id, title, read_at')
      .eq('recipient_id', sampleUser.id);
    
    if (verifyError) {
      console.error('❌ Error verifying notifications:', verifyError);
    } else {
      console.log('✅ Verification successful');
      console.log('📊 Total notifications for user:', verifyData.length);
      console.log('📊 Unread notifications:', verifyData.filter(n => !n.read_at).length);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

async function main() {
  await addSampleNotifications();
}

main().catch(console.error);


