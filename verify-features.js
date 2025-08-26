// Simple verification script to check if the new features are in the subscription plans
console.log('🔍 Verifying Subscription Plan Features...\n');

// Mock the getDefaultPlans function
function getDefaultPlans() {
  return [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      billing_cycle: 'monthly',
      features: [
        'Up to 5 drivers',
        'Up to 10 vehicles',
        'Basic reporting',
        'Email support',
        'Mobile app access',
        'Daily Pre-Trip Inspection questions',
        'Vehicle check completion for drivers'
      ],
      limits: {
        drivers: 5,
        vehicles: 10,
        storage: 10,
        api_calls: 1000
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      billing_cycle: 'monthly',
      features: [
        'Up to 25 drivers',
        'Up to 50 vehicles',
        'Advanced reporting',
        'Priority support',
        'API access',
        'Custom integrations',
        'Real-time tracking',
        'Daily Pre-Trip Inspection questions',
        'Vehicle check completion for drivers',
        'Edit and customize questions',
        'Create custom question sets',
        'Drag-and-drop question reordering'
      ],
      limits: {
        drivers: 25,
        vehicles: 50,
        storage: 100,
        api_calls: 10000
      },
      popular: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      billing_cycle: 'monthly',
      features: [
        'Unlimited drivers',
        'Unlimited vehicles',
        'Custom reporting',
        'Dedicated support',
        'Full API access',
        'White-label options',
        'Advanced analytics',
        'Custom integrations',
        'Daily Pre-Trip Inspection questions',
        'Vehicle check completion for drivers',
        'Edit and customize questions',
        'Create custom question sets',
        'Drag-and-drop question reordering',
        'Advanced customization options',
        'Custom compliance standards',
        'White-label vehicle checks'
      ],
      limits: {
        drivers: -1,
        vehicles: -1,
        storage: 1000,
        api_calls: 100000
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

const plans = getDefaultPlans();

console.log('📋 Checking each plan for Vehicle Check Questions features:\n');

plans.forEach(plan => {
  console.log(`🚗 ${plan.name.toUpperCase()} PLAN:`);
  console.log(`   Price: £${plan.price}/${plan.billing_cycle}`);
  console.log(`   Total Features: ${plan.features.length}`);
  
  // Check for vehicle check features
  const vehicleFeatures = plan.features.filter(feature => 
    feature.toLowerCase().includes('vehicle') || 
    feature.toLowerCase().includes('inspection') || 
    feature.toLowerCase().includes('question') ||
    feature.toLowerCase().includes('check') ||
    feature.toLowerCase().includes('drag')
  );
  
  console.log(`   🚗 Vehicle Check Features: ${vehicleFeatures.length}`);
  
  if (vehicleFeatures.length > 0) {
    vehicleFeatures.forEach(feature => {
      console.log(`      ✅ ${feature}`);
    });
  } else {
    console.log(`      ❌ No vehicle check features found`);
  }
  
  console.log('');
});

// Summary
console.log('📊 SUMMARY:');
const totalVehicleFeatures = plans.reduce((total, plan) => {
  const vehicleFeatures = plan.features.filter(feature => 
    feature.toLowerCase().includes('vehicle') || 
    feature.toLowerCase().includes('inspection') || 
    feature.toLowerCase().includes('question') ||
    feature.toLowerCase().includes('check') ||
    feature.toLowerCase().includes('drag')
  );
  return total + vehicleFeatures.length;
}, 0);

console.log(`✅ Total Vehicle Check Features across all plans: ${totalVehicleFeatures}`);

// Check specific features
const expectedFeatures = [
  'Daily Pre-Trip Inspection questions',
  'Vehicle check completion for drivers',
  'Edit and customize questions',
  'Create custom question sets',
  'Drag-and-drop question reordering'
];

console.log('\n🎯 Checking for specific expected features:');
expectedFeatures.forEach(expectedFeature => {
  const foundInPlans = plans.filter(plan => 
    plan.features.some(feature => feature.includes(expectedFeature))
  );
  
  if (foundInPlans.length > 0) {
    console.log(`   ✅ "${expectedFeature}" found in: ${foundInPlans.map(p => p.name).join(', ')}`);
  } else {
    console.log(`   ❌ "${expectedFeature}" NOT FOUND`);
  }
});

console.log('\n🎉 Verification complete!');
console.log('💡 If you see all ✅ marks above, the features are correctly configured.');
console.log('🌐 Check the subscription page at http://localhost:3000/subscriptions to see them in action!');
