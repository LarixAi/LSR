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

async function testNotificationQueries() {
  console.log('🧪 Testing Notification Queries');
  console.log('================================');
  
  try {
    // Test 1: Basic table access
    console.log('\n1️⃣ Testing basic table access...');
    const { data: basicData, error: basicError } = await supabase
      .from('notification_messages')
      .select('id')
      .limit(1);
    
    if (basicError) {
      console.error('❌ Basic table access failed:', basicError);
    } else {
      console.log('✅ Basic table access successful');
    }
    
    // Test 2: Unread notifications query (the failing one)
    console.log('\n2️⃣ Testing unread notifications query...');
    const { data: unreadData, error: unreadError } = await supabase
      .from('notification_messages')
      .select('id')
      .is('read_at', null)
      .limit(1);
    
    if (unreadError) {
      console.error('❌ Unread notifications query failed:', unreadError);
    } else {
      console.log('✅ Unread notifications query successful');
      console.log('📊 Unread count:', unreadData?.length || 0);
    }
    
    // Test 3: Count query
    console.log('\n3️⃣ Testing count query...');
    const { data: countData, error: countError } = await supabase
      .from('notification_messages')
      .select('id', { count: 'exact', head: true })
      .is('read_at', null);
    
    if (countError) {
      console.error('❌ Count query failed:', countError);
    } else {
      console.log('✅ Count query successful');
      console.log('📊 Total unread count:', countData?.length || 0);
    }
    
    // Test 4: Check if there are any notifications at all
    console.log('\n4️⃣ Testing total notifications...');
    const { data: totalData, error: totalError } = await supabase
      .from('notification_messages')
      .select('id')
      .limit(5);
    
    if (totalError) {
      console.error('❌ Total notifications query failed:', totalError);
    } else {
      console.log('✅ Total notifications query successful');
      console.log('📊 Total notifications:', totalData?.length || 0);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

async function main() {
  await testNotificationQueries();
}

main().catch(console.error);



