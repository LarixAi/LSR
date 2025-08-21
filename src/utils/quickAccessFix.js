// Quick Access Fix - Run this in browser console to fix access denied issues
// Copy and paste this entire script into your browser's developer console

(async function() {
  console.log('🔧 Quick Access Fix Starting...');
  
  try {
    // Get the current user's email
    const userEmail = 'laronelaing1@outlook.com'; // Replace with your email if different
    
    console.log('Target email:', userEmail);
    
    // Make a request to fix the access
    const response = await fetch('/api/fix-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userEmail })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Access fix result:', result);
      
      if (result.success) {
        alert('Access fixed successfully! The page will reload in 2 seconds.');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert('Failed to fix access: ' + result.message);
      }
    } else {
      console.error('❌ Failed to make request:', response.status);
      alert('Failed to make request. Please try the manual fix.');
    }
  } catch (error) {
    console.error('❌ Error in quick access fix:', error);
    alert('Error occurred. Please try the manual fix.');
  }
})();

// Alternative: Direct database fix (if you have access to Supabase)
// Run this in Supabase SQL editor:

/*
-- Quick fix for access denied
UPDATE public.profiles 
SET 
  role = 'admin',
  employment_status = 'active',
  onboarding_status = 'completed',
  is_active = true,
  updated_at = now()
WHERE email = 'laronelaing1@outlook.com';

-- Verify the fix
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  employment_status,
  onboarding_status
FROM public.profiles 
WHERE email = 'laronelaing1@outlook.com';
*/


