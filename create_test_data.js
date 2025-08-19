import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://dznbihypzmvcmradijqn.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk1NDU3NCwiZXhwIjoyMDcwNTMwNTc0fQ.1uw3IQ19133R_54MZFo6UFtkLJrsWBC0G3QZZkugbj0";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createTestData() {
  console.log('🔧 Creating Test Data for App...\n');

  try {
    // Step 1: Create a test organization
    console.log('1️⃣ Creating test organization...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: 'Test Transport Company',
        slug: 'test-transport-company',
        contact_email: 'admin@testtransport.com'
      })
      .select()
      .single();

    if (orgError) {
      console.error('❌ Error creating organization:', orgError);
      return;
    }
    console.log('✅ Created organization:', org.name);

    // Step 2: Create test users/profiles
    console.log('\n2️⃣ Creating test profiles...');
    
    const testProfiles = [
      {
        email: 'driver.test@lsr.com',
        first_name: 'Test',
        last_name: 'Driver',
        role: 'driver',
        organization_id: org.id,
        is_active: true
      },
      {
        email: 'admin.test@lsr.com',
        first_name: 'Test',
        last_name: 'Admin',
        role: 'admin',
        organization_id: org.id,
        is_active: true
      },
      {
        email: 'parent.test@lsr.com',
        first_name: 'Test',
        last_name: 'Parent',
        role: 'parent',
        organization_id: org.id,
        is_active: true
      }
    ];

    for (const profileData of testProfiles) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Error creating ${profileData.role} profile:`, profileError);
      } else {
        console.log(`✅ Created ${profileData.role} profile:`, profile.email);
      }
    }

    // Step 3: Create test vehicles
    console.log('\n3️⃣ Creating test vehicles...');
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .insert([
        {
          vehicle_number: 'TEST001',
          make: 'Ford',
          model: 'Transit',
          year: 2023,
          organization_id: org.id,
          status: 'active'
        },
        {
          vehicle_number: 'TEST002',
          make: 'Mercedes',
          model: 'Sprinter',
          year: 2022,
          organization_id: org.id,
          status: 'active'
        }
      ])
      .select();

    if (vehiclesError) {
      console.error('❌ Error creating vehicles:', vehiclesError);
    } else {
      console.log(`✅ Created ${vehicles.length} vehicles`);
    }

    // Step 4: Create test schedules
    console.log('\n4️⃣ Creating test schedules...');
    const { data: driverProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'driver.test@lsr.com')
      .single();

    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('vehicle_number', 'TEST001')
      .single();

    if (driverProfile && vehicle) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);

      const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .insert([
          {
            driver_id: driverProfile.id,
            vehicle_id: vehicle.id,
            start_time: tomorrow.toISOString(),
            end_time: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            status: 'scheduled',
            notes: 'Morning school run',
            organization_id: org.id
          },
          {
            driver_id: driverProfile.id,
            vehicle_id: vehicle.id,
            start_time: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(tomorrow.getTime() + 26 * 60 * 60 * 1000).toISOString(),
            status: 'scheduled',
            notes: 'Afternoon school run',
            organization_id: org.id
          }
        ])
        .select();

      if (schedulesError) {
        console.error('❌ Error creating schedules:', schedulesError);
      } else {
        console.log(`✅ Created ${schedules.length} schedules`);
      }
    }

    // Step 5: Create test time entries
    console.log('\n5️⃣ Creating test time entries...');
    const today = new Date();
    today.setHours(8, 0, 0, 0);

    if (driverProfile) {
      const { data: timeEntries, error: timeEntriesError } = await supabase
        .from('time_entries')
        .insert([
          {
            driver_id: driverProfile.id,
            date: today.toISOString().split('T')[0],
            start_time: today.toISOString(),
            end_time: new Date(today.getTime() + 6 * 60 * 60 * 1000).toISOString(),
            total_hours: 6.0,
            organization_id: org.id
          }
        ])
        .select();

      if (timeEntriesError) {
        console.error('❌ Error creating time entries:', timeEntriesError);
      } else {
        console.log(`✅ Created ${timeEntries.length} time entries`);
      }
    }

    // Step 6: Create test daily rest
    console.log('\n6️⃣ Creating test daily rest...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (driverProfile) {
      const { data: dailyRest, error: dailyRestError } = await supabase
        .from('daily_rest')
        .insert([
          {
            driver_id: driverProfile.id,
            rest_date: yesterday.toISOString().split('T')[0],
            duration_hours: 8.5,
            organization_id: org.id
          }
        ])
        .select();

      if (dailyRestError) {
        console.error('❌ Error creating daily rest:', dailyRestError);
      } else {
        console.log(`✅ Created ${dailyRest.length} daily rest records`);
      }
    }

    console.log('\n🎯 Test Data Creation Complete!');
    console.log('\n📋 Created:');
    console.log('- 1 organization');
    console.log('- 3 test profiles (driver, admin, parent)');
    console.log('- 2 vehicles');
    console.log('- 2 schedules');
    console.log('- 1 time entry');
    console.log('- 1 daily rest record');

    console.log('\n🔑 Test Login Credentials:');
    console.log('- Driver: driver.test@lsr.com');
    console.log('- Admin: admin.test@lsr.com');
    console.log('- Parent: parent.test@lsr.com');

  } catch (error) {
    console.error('❌ Test data creation failed:', error);
  }
}

// Run the test data creation
createTestData();
